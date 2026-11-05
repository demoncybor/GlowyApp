import { create } from 'zustand';

import type { UserProfile } from '@/scoring';

type DraftState = UserProfile & {
  set: (patch: Partial<UserProfile>) => void;
  reset: () => void;
};

const EMPTY: UserProfile = { skinType: null, concerns: [], budgetMax: null, preferences: [] };

/** Respuestas del onboarding mientras el usuario avanza por los pasos */
export const useOnboardingDraft = create<DraftState>((set) => ({
  ...EMPTY,
  set: (patch) => set(patch),
  reset: () => set(EMPTY),
}));
