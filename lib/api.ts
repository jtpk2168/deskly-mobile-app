/**
 * API base URL — points to the Next.js web server.
 *
 * DEV:  Use your machine's local network IP (shown by `npm run dev` in web/).
 *       Your phone must be on the same WiFi network.
 * PROD: Replace with your deployed Vercel URL.
 */
const DEV_API_URL = 'http://192.168.100.162:3000';
const PROD_API_URL = 'https://your-app.vercel.app'; // TODO: replace with real URL

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

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
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const json: ApiResponse<T> = await response.json();
        return json;
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err.message : 'Network request failed',
            meta: null,
        };
    }
}
