import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { mergeCatalog, type CatalogCache } from '@/lib/catalog-sync';
import { queryKeys } from '@/lib/query-client';
import { rank } from '@/scoring';
import { listCatalogChanges } from '@/services/products';

import { useProfile } from './use-profile';

/**
 * Catálogo compacto guardado en el dispositivo. La primera vez se descarga completo; después solo
 * se piden los productos que cambiaron desde la última sincronización.
 */
export function useCatalog() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.catalog,
    queryFn: async (): Promise<CatalogCache> => {
      const cache = queryClient.getQueryData<CatalogCache>(queryKeys.catalog);
      return mergeCatalog(cache, await listCatalogChanges(cache?.syncedAt ?? null));
    },
    select: (cache) => cache.products,
  });
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
