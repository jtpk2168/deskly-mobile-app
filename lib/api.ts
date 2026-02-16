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

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        };

        if (token) {
            (headers as any)['Authorization'] = `Bearer ${token}`;
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
            return {
                data: null,
                error: `Request failed (${response.status})`,
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
                : err instanceof Error
                    ? err.message
                    : 'Network request failed',
            meta: null,
        };
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}
