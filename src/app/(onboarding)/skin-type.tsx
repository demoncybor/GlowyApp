import { router } from 'expo-router';

import { OnboardingStep } from '@/components/onboarding-step';
import { PreferenceChips } from '@/components/preference-chips';
import { Constants } from '@/lib/database.types';
import { useOnboardingDraft } from '@/stores/onboarding-draft';

export default function SkinTypeStep() {
  const skinType = useOnboardingDraft((s) => s.skinType);
  const set = useOnboardingDraft((s) => s.set);

  return (
    <OnboardingStep
      step={1}
      title="¿Cómo es tu piel?"
      subtitle="Elige la opción que más se parezca; no tiene que ser exacta."
      nextDisabled={!skinType}
      onNext={() => router.push('/goals')}>
      <PreferenceChips
        options={Constants.public.Enums.skin_type}
        selected={skinType ? [skinType] : []}
        onChange={([value]) => set({ skinType: value ?? null })}
      />
    </OnboardingStep>
  );
}
