import { OnboardingStep } from '@/components/onboarding-step';
import { PreferenceChips } from '@/components/preference-chips';
import { useCompleteOnboarding } from '@/hooks/use-profile';
import { Constants } from '@/lib/database.types';
import { useOnboardingDraft } from '@/stores/onboarding-draft';

export default function PreferencesStep() {
  const draft = useOnboardingDraft();
  const complete = useCompleteOnboarding();

  const onFinish = () => {
    const { skinType, concerns, budgetMax, preferences } = draft;
    complete.mutate(
      { skinType, concerns, budgetMax, preferences },
      // al guardar, el layout raíz lleva a la app con onboarding_completed = true
      { onSuccess: () => draft.reset() },
    );
  };

  return (
    <OnboardingStep
      step={4}
      title="¿Algo que prefieras?"
      subtitle="Opcional. Daremos más puntos a los productos que lo cumplan."
      nextLabel="Ver mis recomendaciones"
      loading={complete.isPending}
      error={complete.isError ? 'No se pudo guardar tu perfil. Revisa tu conexión e intenta de nuevo.' : null}
      onNext={onFinish}>
      <PreferenceChips
        multiple
        options={Constants.public.Enums.product_attribute}
        selected={draft.preferences}
        onChange={(next) => draft.set({ preferences: next })}
      />
    </OnboardingStep>
  );
}
