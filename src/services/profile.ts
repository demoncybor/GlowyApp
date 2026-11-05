import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/scoring';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfilePatch = Database['public']['Tables']['profiles']['Update'];

export type Profile = UserProfile & {
  id: string;
  displayName: string;
  onboardingCompleted: boolean;
};

// La base usa snake_case; el dominio, camelCase
const toProfile = (r: ProfileRow): Profile => ({
  id: r.id,
  displayName: r.display_name,
  skinType: r.skin_type,
  concerns: r.concerns,
  budgetMax: r.budget_max,
  preferences: r.preferences,
  onboardingCompleted: r.onboarding_completed,
});

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return toProfile(data);
}

export async function saveProfile(userId: string, patch: ProfilePatch): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', userId).select().single();
  if (error) throw error;
  return toProfile(data);
}

export const completeOnboarding = (userId: string, data: UserProfile) =>
  saveProfile(userId, {
    skin_type: data.skinType,
    concerns: data.concerns,
    budget_max: data.budgetMax,
    preferences: data.preferences,
    onboarding_completed: true,
  });
