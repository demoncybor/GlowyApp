import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import type { UserProfile } from '@/scoring';
import { completeOnboarding, getProfile, saveProfile } from '@/services/profile';
import { useUserId } from '@/stores/session';

export function useProfile() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.profile(userId ?? ''),
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
  });
}

export function useCompleteOnboarding() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserProfile) => completeOnboarding(userId!, data),
    onSuccess: (profile) => queryClient.setQueryData(queryKeys.profile(profile.id), profile),
  });
}

/** Guarda cambios de preferencias desde Perfil; las recomendaciones se recalculan solas */
export function useSaveProfile() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserProfile) =>
      saveProfile(userId!, {
        skin_type: data.skinType,
        concerns: data.concerns,
        budget_max: data.budgetMax,
        preferences: data.preferences,
      }),
    onSuccess: (profile) => queryClient.setQueryData(queryKeys.profile(profile.id), profile),
  });
}
