import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'deskly_cart_v1';

export type CartItem = {
    id: string;
    productId: string;
    name: string;
    category: string | null;
    imageUrl: string | null;
    baseMonthlyPrice: number;
    pricingMode: 'fixed' | 'tiered';
    pricingTiers: {
        min_months: number;
        monthly_price: number;
    }[];
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
    pricingTiers?: {
        min_months: number;
        monthly_price: number;
    }[];
    monthlyPrice?: number;
    durationMonths?: number;
    quantity?: number;
};

type CartContextType = {
    items: CartItem[];
    itemCount: number;
    monthlyTotal: number;
    addToCart: (payload: AddToCartPayload) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    updateDuration: (itemId: string, durationMonths: number) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType>({
    items: [],
    itemCount: 0,
    monthlyTotal: 0,
    addToCart: () => undefined,
    removeFromCart: () => undefined,
    updateQuantity: () => undefined,
    updateDuration: () => undefined,
    clearCart: () => undefined,
});

function normalizePositiveInteger(value: unknown, fallback: number) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isInteger(parsed) || parsed < 1) return fallback;
    return parsed;
}

function normalizeMoney(value: unknown) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Number(parsed.toFixed(2));
}

function normalizePricingMode(value: unknown): 'fixed' | 'tiered' {
    return value === 'tiered' ? 'tiered' : 'fixed';
}

function normalizePricingTiers(
    value: unknown
): { min_months: number; monthly_price: number }[] {
    if (!Array.isArray(value)) return [];

    return value
        .map((tier) => {
            if (typeof tier !== 'object' || tier == null) return null;
            const minMonths = normalizePositiveInteger((tier as { min_months?: unknown }).min_months, 0);
            const monthlyPrice = normalizeMoney((tier as { monthly_price?: unknown }).monthly_price);
            if (minMonths < 2 || monthlyPrice <= 0) return null;
            return { min_months: minMonths, monthly_price: monthlyPrice };
        })
        .filter((tier): tier is { min_months: number; monthly_price: number } => tier != null)
        .sort((a, b) => a.min_months - b.min_months);
}

function resolveMonthlyPrice(
    baseMonthlyPrice: number,
    pricingMode: 'fixed' | 'tiered',
    pricingTiers: { min_months: number; monthly_price: number }[],
    durationMonths: number
) {
    if (pricingMode !== 'tiered' || pricingTiers.length === 0) {
        return normalizeMoney(baseMonthlyPrice);
    }

    const matchingTier =
        [...pricingTiers]
            .sort((a, b) => b.min_months - a.min_months)
            .find((tier) => durationMonths >= tier.min_months) ?? null;

    return normalizeMoney(matchingTier?.monthly_price ?? baseMonthlyPrice);
}

function makeItemId(productId: string, durationMonths: number) {
    return `${productId}:${durationMonths}`;
}

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;

        AsyncStorage.getItem(CART_STORAGE_KEY)
            .then((value) => {
                if (!mounted || !value) return;
                const parsed = JSON.parse(value) as CartItem[];
                if (!Array.isArray(parsed)) return;
                setItems(
                    parsed
                        .filter((item) => typeof item?.id === 'string' && typeof item?.productId === 'string')
                        .map((item) => ({
                            id: String(item.id),
                            productId: String(item.productId),
                            name: String(item.name ?? 'Furniture'),
                            category: item.category ?? null,
                            imageUrl: item.imageUrl ?? null,
                            baseMonthlyPrice: normalizeMoney(
                                (item as { baseMonthlyPrice?: unknown }).baseMonthlyPrice ?? item.monthlyPrice
                            ),
                            pricingMode: normalizePricingMode((item as { pricingMode?: unknown }).pricingMode),
                            pricingTiers: normalizePricingTiers((item as { pricingTiers?: unknown }).pricingTiers),
                            durationMonths: normalizePositiveInteger(item.durationMonths, 12),
                            quantity: normalizePositiveInteger(item.quantity, 1),
                            monthlyPrice: 0,
                        }))
                        .map((item) => ({
                            ...item,
                            monthlyPrice: resolveMonthlyPrice(
                                item.baseMonthlyPrice,
                                item.pricingMode,
                                item.pricingTiers,
                                item.durationMonths
                            ),
                        }))
                );
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
        AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(() => undefined);
    }, [items, loaded]);

    const addToCart = useCallback((payload: AddToCartPayload) => {
        const durationMonths = normalizePositiveInteger(payload.durationMonths, 12);
        const quantity = normalizePositiveInteger(payload.quantity, 1);
        const baseMonthlyPrice = normalizeMoney(payload.baseMonthlyPrice ?? payload.monthlyPrice);
        const pricingMode = normalizePricingMode(payload.pricingMode);
        const pricingTiers = normalizePricingTiers(payload.pricingTiers);
        const monthlyPrice = resolveMonthlyPrice(baseMonthlyPrice, pricingMode, pricingTiers, durationMonths);
        const itemId = makeItemId(payload.productId, durationMonths);

        setItems((previous) => {
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
                    durationMonths,
                    quantity,
                },
            ];
        });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setItems((previous) => previous.filter((item) => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        const normalized = normalizePositiveInteger(quantity, 1);
        setItems((previous) =>
            previous.map((item) => (item.id === itemId ? { ...item, quantity: normalized } : item))
        );
    }, []);

    const updateDuration = useCallback((itemId: string, durationMonths: number) => {
        const normalizedDuration = normalizePositiveInteger(durationMonths, 12);

        setItems((previous) => {
            const sourceIndex = previous.findIndex((item) => item.id === itemId);
            if (sourceIndex < 0) return previous;

            const sourceItem = previous[sourceIndex];
            const nextId = makeItemId(sourceItem.productId, normalizedDuration);
            const nextMonthlyPrice = resolveMonthlyPrice(
                sourceItem.baseMonthlyPrice,
                sourceItem.pricingMode,
                sourceItem.pricingTiers,
                normalizedDuration
            );

            if (nextId === itemId) {
                const next = [...previous];
                next[sourceIndex] = {
                    ...sourceItem,
                    durationMonths: normalizedDuration,
                    monthlyPrice: nextMonthlyPrice,
                };
                return next;
            }

            const targetIndex = previous.findIndex((item) => item.id === nextId);
            if (targetIndex >= 0) {
                const targetItem = previous[targetIndex];
                const mergedItem: CartItem = {
                    ...targetItem,
                    id: nextId,
                    durationMonths: normalizedDuration,
                    baseMonthlyPrice: sourceItem.baseMonthlyPrice,
                    pricingMode: sourceItem.pricingMode,
                    pricingTiers: sourceItem.pricingTiers,
                    monthlyPrice: nextMonthlyPrice,
                    quantity: targetItem.quantity + sourceItem.quantity,
                };

                return previous.filter((_, index) => index !== sourceIndex && index !== targetIndex).concat(mergedItem);
            }

            const next = [...previous];
            next[sourceIndex] = {
                ...sourceItem,
                id: nextId,
                durationMonths: normalizedDuration,
                monthlyPrice: nextMonthlyPrice,
            };
            return next;
        });
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const itemCount = useMemo(
        () => items.reduce((total, item) => total + normalizePositiveInteger(item.quantity, 1), 0),
        [items]
    );

    const monthlyTotal = useMemo(
        () =>
            Number(
                items
                    .reduce((total, item) => total + normalizeMoney(item.monthlyPrice) * normalizePositiveInteger(item.quantity, 1), 0)
                    .toFixed(2)
            ),
        [items]
    );

    const value = useMemo<CartContextType>(
        () => ({
            items,
            itemCount,
            monthlyTotal,
            addToCart,
            removeFromCart,
            updateQuantity,
            updateDuration,
            clearCart,
        }),
        [addToCart, clearCart, itemCount, items, monthlyTotal, removeFromCart, updateDuration, updateQuantity]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
