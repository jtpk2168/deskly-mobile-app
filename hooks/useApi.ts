import { useCallback, useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';

// ─── Types ────────────────────────────────────────────────

export type Product = {
    id: string;
    product_code: string;
    name: string;
    description: string | null;
    category: string | null;
    monthly_price: number;
    pricing_mode: "fixed" | "tiered";
    pricing_tiers: {
        min_months: number;
        monthly_price: number;
    }[];
    image_url: string | null;
    video_url: string | null;
    stock_quantity: number;
    status: 'draft' | 'active' | 'inactive';
    is_active: boolean;
    created_at: string;
    updated_at: string;
    published_at: string | null;
};

export type Bundle = {
    id: string;
    name: string;
    description: string | null;
    monthly_price: number;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
};

export type Profile = {
    id: string;
    full_name: string | null;
    job_title: string | null;
    phone_number: string | null;
    marketing_consent: boolean;
    role: string;
    created_at: string;
    updated_at: string;
    company: {
        id: string;
        company_name: string;
        registration_number: string | null;
        address: string | null;
        office_city: string | null;
        office_zip_postal: string | null;
        delivery_address: string | null;
        delivery_city: string | null;
        delivery_zip_postal: string | null;
        industry: string | null;
        team_size: string | null;
    } | null;
};

export type Subscription = {
    id: string;
    user_id: string;
    status: 'active' | 'pending' | 'pending_payment' | 'payment_failed' | 'incomplete' | 'cancelled' | 'completed' | string;
    bundle_id: string | null;
    start_date: string | null;
    end_date: string | null;
    monthly_total: number | null;
    subtotal_amount?: number | null;
    tax_amount?: number | null;
    minimum_term_months?: number | null;
    billing_currency?: string | null;
    created_at: string;
    bundles: Bundle | null;
    subscription_items?: {
        product_name: string;
        category: string | null;
        monthly_price: number | null;
        duration_months: number | null;
        quantity: number;
        image_url?: string | null;
    }[];
};

export type CreateSubscriptionPayload = {
    user_id: string;
    bundle_id?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    monthly_total?: number | null;
    items?: {
        product_id?: string | null;
        product_name: string;
        category?: string | null;
        monthly_price?: number | null;
        duration_months?: number | null;
        quantity: number;
    }[];
    product_name?: string;
    currency?: string;
    minimum_term_months?: number;
    success_url?: string;
    cancel_url?: string;
};

export type BillingCheckoutResult = {
    subscription: Subscription;
    checkout_url: string | null;
    checkout_session_id: string | null;
    billing_provider: 'mock' | 'stripe' | string;
    tax_quote: {
        subtotal: number;
        sst_rate: number;
        sst_amount: number;
        total: number;
        currency: string;
    };
};

export type UpsertProfilePayload = {
    user_id: string;
    full_name?: string | null;
    job_title?: string | null;
    phone_number?: string | null;
    marketing_consent?: boolean;
    company?: {
        company_name: string;
        registration_number?: string | null;
        address?: string | null;
        office_city?: string | null;
        office_zip_postal?: string | null;
        delivery_address?: string | null;
        delivery_city?: string | null;
        delivery_zip_postal?: string | null;
        industry?: string | null;
        team_size?: string | null;
    } | null;
};

// ─── Generic hook ─────────────────────────────────────────

function useApiQuery<T>(endpoint: string, enabled = true) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await fetchApi<T>(endpoint);
        if (result.error) {
            setData(null);
            setError(result.error);
        } else {
            setData(result.data);
        }
        setLoading(false);
    }, [endpoint]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        } else {
            setData(null);
            setError(null);
            setLoading(false);
        }
    }, [fetchData, enabled]);

    return { data, loading, error, refetch: fetchData };
}

// ─── Resource hooks ───────────────────────────────────────

export function useProducts(category?: string, search?: string) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    const query = params.toString();
    const endpoint = `/api/products${query ? `?${query}` : ''}`;
    return useApiQuery<Product[]>(endpoint);
}

export function useProduct(id?: string) {
    return useApiQuery<Product>(`/api/products/${id}`, !!id);
}

export function useProfile(userId?: string) {
    const queryUserId = userId ? encodeURIComponent(userId) : '';
    return useApiQuery<Profile>(`/api/profile?user_id=${queryUserId}`, !!userId);
}

export function useSubscriptions(userId?: string) {
    const queryUserId = userId ? encodeURIComponent(userId) : '';
    return useApiQuery<Subscription[]>(`/api/subscriptions?user_id=${queryUserId}`, !!userId);
}

export function useSubscription(id?: string) {
    return useApiQuery<Subscription>(`/api/subscriptions/${id}`, !!id);
}

export async function createSubscription(payload: CreateSubscriptionPayload) {
    const result = await fetchApi<Subscription>('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to create subscription');
    }

    return result.data;
}

export async function startBillingCheckout(payload: CreateSubscriptionPayload) {
    const result = await fetchApi<BillingCheckoutResult>('/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to start billing checkout');
    }

    return result.data;
}

export async function upsertProfile(payload: UpsertProfilePayload) {
    const result = await fetchApi<Profile>('/api/profile', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to save profile');
    }

    return result.data;
}
