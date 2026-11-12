import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { CatalogCache } from '@/lib/catalog-sync';
import { queryKeys } from '@/lib/query-client';
import { getProduct, type ProductDetail } from '@/services/products';

/** Producto completo; mientras llega, muestra lo que ya está en el catálogo del dispositivo */
export function useProduct(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => getProduct(id),
    placeholderData: (): ProductDetail | undefined => {
      const p = queryClient.getQueryData<CatalogCache>(queryKeys.catalog)?.products.find((c) => c.id === id);
      return p && { ...p, description: null, sizeLabel: null, keyIngredients: [] };
    },
  });
}
