/**
 * API base URL — points to the Next.js web server.
 *
 * Priority:
 * 1) EXPO_PUBLIC_API_BASE_URL (if set)
 * 2) In dev, infer host from Expo URL and use port 3000
 * 3) Fallback localhost in dev
 * 4) Production fallback URL
 */
import * as Linking from 'expo-linking';
import { toErrorMessage } from './ui/text';

const EXPLICIT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const REQUEST_TIMEOUT_MS = 12000;

function inferDevApiUrl() {
    const appUrl = Linking.createURL('/');
    const match = appUrl.match(/^[a-z][a-z0-9+\-.]*:\/\/([^/:?#]+)/i);
    const host = match?.[1];
    return host ? `http://${host}:3000` : 'http://localhost:3000';
}

const DEV_API_URL = EXPLICIT_API_BASE_URL || inferDevApiUrl();
const PROD_API_URL = 'https://your-app.vercel.app'; // TODO: replace with real URL

export const API_BASE_URL = __DEV__ ? DEV_API_URL : EXPLICIT_API_BASE_URL || PROD_API_URL;

type ApiResponse<T> = {
    data: T | null;
    error: string | null;
    meta: { page?: number; limit?: number; total?: number } | null;
};

function toHeaderRecord(headers?: HeadersInit) {
    const headerRecord: Record<string, string> = {};
    if (!headers) return headerRecord;
    const normalizedHeaders = new Headers(headers);
    normalizedHeaders.forEach((value, key) => {
        headerRecord[key] = value;
    });
    return headerRecord;
}

function resolveErrorMessage(status: number, rawBody: string) {
    const fallback = `Request failed (${status})`;
    if (!rawBody) return fallback;

    try {
        const parsed = JSON.parse(rawBody) as {
            error?: unknown;
            message?: unknown;
            meta?: { errors?: unknown };
        };

        if (typeof parsed.error === 'string' && parsed.error.trim()) {
            return parsed.error;
        }

        if (typeof parsed.message === 'string' && parsed.message.trim()) {
            return parsed.message;
        }

        if (Array.isArray(parsed.meta?.errors)) {
            const messages = parsed.meta.errors.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
            if (messages.length > 0) return messages.join(', ');
        }
    } catch {
        const trimmed = rawBody.trim();
        if (trimmed) return trimmed;
    }

    return fallback;
}

/**
 * Generic fetch wrapper for calling the Next.js API.
 */
export async function fetchApi<T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
        // Get the current session to extract the access token
        const { data: { session } } = await import('./supabase').then(m => m.supabase.auth.getSession());
        const token = session?.access_token;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...toHeaderRecord(options?.headers),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const url = `${API_BASE_URL}${endpoint}`;
        const controller = options?.signal ? undefined : new AbortController();
        if (controller) {
            timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        }

        const response = await fetch(url, {
            ...options,
            headers,
            signal: options?.signal || controller?.signal,
        });

        if (!response.ok) {
            const rawBody = await response.text();
            return {
                data: null,
                error: resolveErrorMessage(response.status, rawBody),
                meta: null,
            };
        }

        const json: ApiResponse<T> = await response.json();
        return json;
    } catch (err) {
        const timeoutMessage = `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. Check API server and phone network access.`;
        return {
            data: null,
            error: err instanceof Error && err.name === 'AbortError'
                ? timeoutMessage
                    : toErrorMessage(err, 'Network request failed'),
            meta: null,
        };
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}
