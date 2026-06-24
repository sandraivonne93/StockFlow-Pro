import { QueryClient } from '@tanstack/react-query';

/** Cliente global de React Query con valores por defecto sensatos. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min
      gcTime: 1000 * 60 * 5, // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
