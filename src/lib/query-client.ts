import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  catalog: ['catalog'] as const,
};
