import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mutationKeys, queryKeys } from '@/lib/query-client';
import { listFavorites, type Favorite } from '@/services/favorites';
import { useUserId } from '@/stores/session';

export function useFavorites() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.favorites(userId ?? ''),
    queryFn: listFavorites,
    enabled: !!userId,
  });
}

export function useIsFavorite(productId: string) {
  const { data } = useFavorites();
  return data?.some((f) => f.productId === productId) ?? false;
}

/**
 * Agrega o quita un favorito. El cambio se ve al instante y se revierte si el servidor falla.
 * Sin conexión queda en cola y se envía al volver la red (mutationFn en lib/query-client.ts).
 */
export function useToggleFavorite() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const key = queryKeys.favorites(userId ?? '');

  return useMutation<void, Error, { productId: string; favorite: boolean }, { previous?: Favorite[] }>({
    mutationKey: mutationKeys.toggleFavorite,
    onMutate: async ({ productId, favorite }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Favorite[]>(key);
      queryClient.setQueryData<Favorite[]>(key, (list = []) =>
        favorite
          ? [{ productId, createdAt: new Date().toISOString() }, ...list.filter((f) => f.productId !== productId)]
          : list.filter((f) => f.productId !== productId),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
