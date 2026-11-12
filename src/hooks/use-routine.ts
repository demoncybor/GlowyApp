import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import type { RoutineSlot } from '@/scoring';
import { removeRoutinePhoto, signedPhotoUrls, uploadRoutinePhoto } from '@/services/photos';
import {
  addRoutineItem,
  listRoutine,
  removeRoutineItem,
  reorderRoutine,
  type RoutineEntry,
} from '@/services/routine';
import { useUserId } from '@/stores/session';

export function useRoutine() {
  const userId = useUserId();
  return useQuery({ queryKey: queryKeys.routine(userId ?? ''), queryFn: listRoutine, enabled: !!userId });
}

export type AddToRoutine = {
  productId?: string | null;
  customName?: string | null;
  slot: RoutineSlot;
  /** Foto local (archivo del teléfono); se sube antes de guardar */
  photoUri?: string | null;
};

export function useAddToRoutine() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const key = queryKeys.routine(userId ?? '');

  return useMutation({
    mutationFn: async ({ photoUri, ...item }: AddToRoutine) => {
      const current = queryClient.getQueryData<RoutineEntry[]>(key) ?? (await listRoutine());
      const stepOrder = current.filter((r) => r.slot === item.slot).length;
      const photoPath = photoUri ? await uploadRoutinePhoto(userId!, photoUri) : null;
      try {
        return await addRoutineItem({ ...item, stepOrder, photoPath });
      } catch (e) {
        if (photoPath) await removeRoutinePhoto(photoPath); // no dejar fotos huérfanas
        throw e;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useRemoveFromRoutine() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const key = queryKeys.routine(userId ?? '');

  return useMutation({
    mutationFn: (item: RoutineEntry) => removeRoutineItem(item),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<RoutineEntry[]>(key);
      queryClient.setQueryData<RoutineEntry[]>(key, (list = []) => list.filter((r) => r.id !== item.id));
      return { previous };
    },
    onError: (_e, _item, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** Mueve un paso hacia arriba (-1) o hacia abajo (+1) y renumera los pasos de ese momento del día */
export function useMoveInRoutine() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const key = queryKeys.routine(userId ?? '');

  const reorder = (list: RoutineEntry[], item: RoutineEntry, delta: -1 | 1) => {
    const slot = list.filter((r) => r.slot === item.slot).sort((a, b) => a.stepOrder - b.stepOrder);
    const from = slot.findIndex((r) => r.id === item.id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= slot.length) return null;
    [slot[from], slot[to]] = [slot[to], slot[from]];
    return slot.map((r, i) => ({ ...r, stepOrder: i }));
  };

  return useMutation({
    mutationFn: async ({ item, delta }: { item: RoutineEntry; delta: -1 | 1 }) => {
      const renumbered = reorder(queryClient.getQueryData<RoutineEntry[]>(key) ?? [], item, delta);
      if (renumbered) await reorderRoutine(renumbered);
    },
    onMutate: async ({ item, delta }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<RoutineEntry[]>(key);
      const renumbered = previous && reorder(previous, item, delta);
      if (previous && renumbered) {
        const byId = new Map(renumbered.map((r) => [r.id, r]));
        queryClient.setQueryData<RoutineEntry[]>(
          key,
          previous.map((r) => byId.get(r.id) ?? r),
        );
      }
      return { previous };
    },
    onError: (_e, _vars, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** URL firmadas de las fotos de la rutina (se renuevan antes de que venzan) */
export function usePhotoUrls(paths: string[]) {
  return useQuery({
    queryKey: queryKeys.photoUrls(paths),
    queryFn: () => signedPhotoUrls(paths),
    enabled: paths.length > 0,
    staleTime: 50 * 60 * 1000,
  });
}
