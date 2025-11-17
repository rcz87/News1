import { QueryClient } from "@tanstack/react-query";
import { getQueryFn as getQueryFnFromApi, apiRequest } from "./api";

// Re-export API functions
export { apiRequest, getQueryFnFromApi as getQueryFn };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFnFromApi({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
      retry: 3, // Allow 3 retries instead of 0
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: 2, // Retry mutations 2 times
      retryDelay: 1000, // Wait 1 second between retries
    },
  },
});
