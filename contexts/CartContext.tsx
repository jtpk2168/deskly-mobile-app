import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    normalizePricingMode,
    normalizePricingTiers as normalizeUiPricingTiers,
    resolveTieredMonthlyPrice,
    toMoney,
    type PricingTier,
} from '../lib/ui';

const CART_STORAGE_KEY = 'deskly_cart_v1';
const DEFAULT_CART_DURATION_MONTHS = 12;

export type CartItem = {
    id: string;
    productId: string;
    name: string;
    category: string | null;
    imageUrl: string | null;
    baseMonthlyPrice: number;
    pricingMode: 'fixed' | 'tiered';
    pricingTiers: PricingTier[];
    monthlyPrice: number;
    durationMonths: number;
    quantity: number;
};

export type AddToCartPayload = {
    productId: string;
    name: string;
    category?: string | null;
    imageUrl?: string | null;
    baseMonthlyPrice?: number;
    pricingMode?: 'fixed' | 'tiered';
    pricingTiers?: PricingTier[];
    monthlyPrice?: number;
    durationMonths?: number;
    quantity?: number;
};

type CartContextType = {
    items: CartItem[];
    itemCount: number;
    monthlyTotal: number;
    cartDurationMonths: number;
    addToCart: (payload: AddToCartPayload) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    setCartDuration: (durationMonths: number) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType>({
    items: [],
    itemCount: 0,
    monthlyTotal: 0,
    cartDurationMonths: DEFAULT_CART_DURATION_MONTHS,
    addToCart: () => undefined,
    removeFromCart: () => undefined,
    updateQuantity: () => undefined,
    setCartDuration: () => undefined,
    clearCart: () => undefined,
});

function normalizePositiveInteger(value: unknown, fallback: number) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isInteger(parsed) || parsed < 1) return fallback;
    return parsed;
}

function normalizeMoney(value: unknown) {
    const normalized = toMoney(value, 0);
    return normalized < 0 ? 0 : normalized;
}

function parsePricingTiers(value: unknown): PricingTier[] {
    if (!Array.isArray(value)) return [];

    const parsed = value
        .map((tier) => {
            if (typeof tier !== 'object' || tier == null) return null;
            const minMonths = normalizePositiveInteger((tier as { min_months?: unknown }).min_months, 0);
            const monthlyPrice = normalizeMoney((tier as { monthly_price?: unknown }).monthly_price);
            return { min_months: minMonths, monthly_price: monthlyPrice };
        })
        .filter((tier): tier is PricingTier => tier != null);

    return normalizeUiPricingTiers(parsed);
}

function resolveMonthlyPrice(
    baseMonthlyPrice: number,
    pricingMode: 'fixed' | 'tiered',
    pricingTiers: PricingTier[],
    durationMonths: number,
) {
    return normalizeMoney(
        resolveTieredMonthlyPrice(baseMonthlyPrice, pricingMode, pricingTiers, durationMonths),
    );
}

function makeItemId(productId: string) {
    return productId;
}

type RawCartItem = {
    id?: unknown;
    productId?: unknown;
    name?: unknown;
    category?: unknown;
    imageUrl?: unknown;
    baseMonthlyPrice?: unknown;
    pricingMode?: unknown;
    pricingTiers?: unknown;
    monthlyPrice?: unknown;
    durationMonths?: unknown;
    quantity?: unknown;
};

function parseStoredCartItems(value: unknown) {
    if (!Array.isArray(value)) return [] as CartItem[];

    return value
        .map((rawItem) => {
            if (typeof rawItem !== 'object' || rawItem == null) return null;
            const item = rawItem as RawCartItem;
            if (typeof item.productId !== 'string' || item.productId.trim().length === 0) {
                return null;
            }

            const productId = item.productId.trim();
            const baseMonthlyPrice = normalizeMoney(item.baseMonthlyPrice ?? item.monthlyPrice);
            const pricingMode = normalizePricingMode(item.pricingMode);
            const pricingTiers = parsePricingTiers(item.pricingTiers);
            const durationMonths = normalizePositiveInteger(item.durationMonths, DEFAULT_CART_DURATION_MONTHS);

            return {
                id: makeItemId(productId),
                productId,
                name: String(item.name ?? 'Furniture'),
                category: typeof item.category === 'string' ? item.category : null,
                imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : null,
                baseMonthlyPrice,
                pricingMode,
                pricingTiers,
                monthlyPrice: resolveMonthlyPrice(baseMonthlyPrice, pricingMode, pricingTiers, durationMonths),
                durationMonths,
                quantity: normalizePositiveInteger(item.quantity, 1),
            } satisfies CartItem;
        })
        .filter((item): item is CartItem => item != null);
}

function inferDurationFromItems(items: CartItem[]) {
    if (items.length === 0) return DEFAULT_CART_DURATION_MONTHS;
    return items.reduce(
        (maxDuration, item) => Math.max(maxDuration, normalizePositiveInteger(item.durationMonths, DEFAULT_CART_DURATION_MONTHS)),
        DEFAULT_CART_DURATION_MONTHS,
    );
}

function normalizeItemsForDuration(items: CartItem[], durationMonths: number) {
    const normalizedDuration = normalizePositiveInteger(durationMonths, DEFAULT_CART_DURATION_MONTHS);
    const mergedByProduct = new Map<string, CartItem>();

    for (const item of items) {
        const key = makeItemId(item.productId);
        const monthlyPrice = resolveMonthlyPrice(
            item.baseMonthlyPrice,
            item.pricingMode,
            item.pricingTiers,
            normalizedDuration,
        );

        const existing = mergedByProduct.get(key);
        if (existing) {
            mergedByProduct.set(key, {
                ...existing,
                baseMonthlyPrice: item.baseMonthlyPrice,
                pricingMode: item.pricingMode,
                pricingTiers: item.pricingTiers,
                monthlyPrice,
                durationMonths: normalizedDuration,
                quantity:
                    normalizePositiveInteger(existing.quantity, 1)
                    + normalizePositiveInteger(item.quantity, 1),
            });
            continue;
        }

        mergedByProduct.set(key, {
            ...item,
            id: key,
            durationMonths: normalizedDuration,
            monthlyPrice,
            quantity: normalizePositiveInteger(item.quantity, 1),
        });
    }

    return Array.from(mergedByProduct.values());
}

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [cartDurationMonths, setCartDurationMonths] = useState(DEFAULT_CART_DURATION_MONTHS);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;

        AsyncStorage.getItem(CART_STORAGE_KEY)
            .then((value) => {
                if (!mounted || !value) return;

                const parsed = JSON.parse(value) as unknown;
                const parsedItems = Array.isArray(parsed)
                    ? parseStoredCartItems(parsed)
                    : parseStoredCartItems((parsed as { items?: unknown })?.items);

                const parsedDuration = Array.isArray(parsed)
                    ? null
                    : normalizePositiveInteger(
                        (parsed as { cartDurationMonths?: unknown })?.cartDurationMonths,
                        inferDurationFromItems(parsedItems),
                    );

                const resolvedDuration = parsedDuration ?? inferDurationFromItems(parsedItems);
                const normalizedItems = normalizeItemsForDuration(parsedItems, resolvedDuration);

                setCartDurationMonths(resolvedDuration);
                setItems(normalizedItems);
            })
            .catch(() => undefined)
            .finally(() => {
                if (mounted) setLoaded(true);
            });

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!loaded) return;
        AsyncStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify({ items, cartDurationMonths }),
        ).catch(() => undefined);
    }, [items, cartDurationMonths, loaded]);

    const addToCart = useCallback((payload: AddToCartPayload) => {
        const quantity = normalizePositiveInteger(payload.quantity, 1);
        const baseMonthlyPrice = normalizeMoney(payload.baseMonthlyPrice ?? payload.monthlyPrice);
        const pricingMode = normalizePricingMode(payload.pricingMode);
        const pricingTiers = parsePricingTiers(payload.pricingTiers);

        setItems((previous) => {
            const monthlyPrice = resolveMonthlyPrice(baseMonthlyPrice, pricingMode, pricingTiers, cartDurationMonths);
            const itemId = makeItemId(payload.productId);
            const index = previous.findIndex((item) => item.id === itemId);
            if (index >= 0) {
                const next = [...previous];
                const existing = next[index];
                next[index] = {
                    ...existing,
                    quantity: existing.quantity + quantity,
                    baseMonthlyPrice,
                    pricingMode,
                    pricingTiers,
                    monthlyPrice,
                    durationMonths: cartDurationMonths,
                };
                return next;
            }

            return [
                ...previous,
                {
                    id: itemId,
                    productId: payload.productId,
                    name: payload.name,
                    category: payload.category ?? null,
                    imageUrl: payload.imageUrl ?? null,
                    baseMonthlyPrice,
                    pricingMode,
                    pricingTiers,
                    monthlyPrice,
                    durationMonths: cartDurationMonths,
                    quantity,
                },
            ];
        });
    }, [cartDurationMonths]);

    const removeFromCart = useCallback((itemId: string) => {
        setItems((previous) => previous.filter((item) => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        const normalized = normalizePositiveInteger(quantity, 1);
        setItems((previous) =>
            previous.map((item) => (item.id === itemId ? { ...item, quantity: normalized } : item)),
        );
    }, []);

    const setCartDuration = useCallback((durationMonths: number) => {
        const normalizedDuration = normalizePositiveInteger(durationMonths, DEFAULT_CART_DURATION_MONTHS);
        setCartDurationMonths(normalizedDuration);
        setItems((previous) => normalizeItemsForDuration(previous, normalizedDuration));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const itemCount = useMemo(
        () => items.reduce((total, item) => total + normalizePositiveInteger(item.quantity, 1), 0),
        [items],
    );

    const monthlyTotal = useMemo(
        () => toMoney(
            items.reduce(
                (total, item) => (
                    total
                    + normalizeMoney(item.monthlyPrice)
                    * normalizePositiveInteger(item.quantity, 1)
                ),
                0,
            ),
        ),
        [items],
    );

    const value = useMemo<CartContextType>(
        () => ({
            items,
            itemCount,
            monthlyTotal,
            cartDurationMonths,
            addToCart,
            removeFromCart,
            updateQuantity,
            setCartDuration,
            clearCart,
        }),
        [
            addToCart,
            cartDurationMonths,
            clearCart,
            itemCount,
            items,
            monthlyTotal,
            removeFromCart,
            setCartDuration,
            updateQuantity,
        ],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
