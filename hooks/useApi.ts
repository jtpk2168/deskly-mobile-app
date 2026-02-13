import { useCallback, useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';

// ─── Types ────────────────────────────────────────────────

export type Product = {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    monthly_price: number;
    image_url: string | null;
    stock_quantity: number;
    is_active: boolean;
    created_at: string;
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

export type Reel = {
    id: string;
    title: string;
    description: string | null;
    video_url: string;
    thumbnail_url: string | null;
    duration_seconds: number | null;
    associated_bundle_id: string | null;
    product_ids: string[];
    is_featured: boolean;
    is_active: boolean;
    views_count: number;
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
        industry: string | null;
        team_size: string | null;
        rental_duration_preference: string | null;
    } | null;
};

export type Subscription = {
    id: string;
    user_id: string;
    status: string;
    bundle_id: string | null;
    start_date: string | null;
    end_date: string | null;
    monthly_total: number | null;
    created_at: string;
    bundles: Bundle | null;
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

export function useReels(page = 1, limit = 10, featured?: boolean) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (featured) params.set('featured', 'true');
    return useApiQuery<Reel[]>(`/api/reels?${params.toString()}`);
}

export function useProfile(userId?: string) {
    return useApiQuery<Profile>(`/api/profile?user_id=${userId}`, !!userId);
}

export function useSubscriptions(userId?: string) {
    return useApiQuery<Subscription[]>(`/api/subscriptions?user_id=${userId}`, !!userId);
}
