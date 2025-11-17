// API Configuration
export const API_BASE_URL = import.meta.env.PROD
    ? 'https://wisanggeni.cloud/api'
    : 'http://localhost:5000/api';

// Helper function to build API URLs
export function buildApiUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
}

// Helper function for API requests
export async function apiRequest(
    method: string,
    path: string,
    data?: unknown | undefined,
): Promise<Response> {
    const url = buildApiUrl(path);

    console.log(`API Request: ${method} ${url}`, data ? { data } : '');

    const res = await fetch(url, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
    });

    if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        console.error(`API Error: ${res.status} - ${text}`);
        throw new Error(`${res.status}: ${text}`);
    }

    console.log(`API Response: ${res.status} ${url}`);
    return res;
}

// Generic fetch function for use with TanStack Query
export function getQueryFn<T>(options: {
    on401: "returnNull" | "throw";
}) {
    return async ({ queryKey }: { queryKey: readonly unknown[] }): Promise<T | null> => {
        const url = buildApiUrl(queryKey.map(String).join("/"));

        console.log(`Query Request: GET ${url}`);

        const res = await fetch(url, {
            credentials: "include",
        });

        if (options.on401 === "returnNull" && res.status === 401) {
            return null;
        }

        if (!res.ok) {
            const text = (await res.text()) || res.statusText;
            console.error(`Query Error: ${res.status} - ${text}`);
            throw new Error(`${res.status}: ${text}`);
        }

        const data = await res.json();
        console.log(`Query Response: ${url}`, data);
        return data;
    };
}
