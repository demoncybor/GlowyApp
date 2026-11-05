import { router } from 'expo-router';

import { OnboardingStep } from '@/components/onboarding-step';
import { PreferenceChips } from '@/components/preference-chips';
import { Constants } from '@/lib/database.types';
import { useOnboardingDraft } from '@/stores/onboarding-draft';

export default function GoalsStep() {
  const concerns = useOnboardingDraft((s) => s.concerns);
  const set = useOnboardingDraft((s) => s.set);

  return (
    <OnboardingStep
      step={2}
      title="¿Qué quieres mejorar?"
      subtitle="Puedes elegir varios objetivos."
      nextDisabled={concerns.length === 0}
      onNext={() => router.push('/budget')}>
      <PreferenceChips
        multiple
        options={Constants.public.Enums.skin_concern}
        selected={concerns}
        onChange={(next) => set({ concerns: next })}
      />
    </OnboardingStep>
  );
}
