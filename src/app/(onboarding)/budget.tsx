import { router } from 'expo-router';
import { useState } from 'react';

import { OnboardingStep } from '@/components/onboarding-step';
import { ThemedText } from '@/components/themed-text';
import { TextField } from '@/components/ui/text-field';
import { parseBudget } from '@/lib/budget';
import { useOnboardingDraft } from '@/stores/onboarding-draft';

export default function BudgetStep() {
  const budgetMax = useOnboardingDraft((s) => s.budgetMax);
  const set = useOnboardingDraft((s) => s.set);
  const [text, setText] = useState(budgetMax != null ? String(budgetMax) : '');

  const value = parseBudget(text);
  const invalid = text.trim() !== '' && value === null;

  return (
    <OnboardingStep
      step={3}
      title="¿Cuánto quieres gastar?"
      subtitle="Precio máximo por producto. Si lo dejas vacío, no lo tomamos en cuenta."
      nextLabel={value === null ? 'Sin límite, continuar' : 'Continuar'}
      nextDisabled={invalid}
      onNext={() => {
        set({ budgetMax: value });
        router.push('/preferences');
      }}>
      <TextField
        label="Presupuesto máximo (USD)"
        value={text}
        onChangeText={setText}
        keyboardType="decimal-pad"
        placeholder="Por ejemplo, 50"
      />
      {invalid && (
        <ThemedText type="small" themeColor="textSecondary">
          Escribe un número mayor que cero.
        </ThemedText>
      )}
    </OnboardingStep>
  );
}
