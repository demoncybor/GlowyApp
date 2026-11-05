import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { queryKeys } from '@/lib/query-client';
import { rank } from '@/scoring';
import { listCatalog } from '@/services/products';

import { useProfile } from './use-profile';

export function useCatalog() {
  return useQuery({ queryKey: queryKeys.catalog, queryFn: listCatalog });
}

/** Catálogo ordenado por compatibilidad con el perfil; se calcula en el dispositivo */
export function useRecommendations() {
  const profile = useProfile();
  const catalog = useCatalog();

  const ranked = useMemo(
    () => (profile.data && catalog.data ? rank(catalog.data, profile.data) : []),
    [profile.data, catalog.data],
  );

  return {
    ranked,
    isLoading: profile.isLoading || catalog.isLoading,
    error: profile.error ?? catalog.error,
    refetch: async () => {
      await Promise.all([profile.refetch(), catalog.refetch()]);
    },
    isRefetching: profile.isRefetching || catalog.isRefetching,
  };
}
