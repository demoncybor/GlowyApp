import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const ONBOARDING_STEPS = 4;

type OnboardingStepProps = {
  step: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  error?: string | null;
};

export function OnboardingStep({
  step,
  title,
  subtitle,
  children,
  onNext,
  nextLabel = 'Continuar',
  nextDisabled,
  loading,
  error,
}: OnboardingStepProps) {
  const theme = useTheme();
  return (
    <Screen
      title={title}
      subtitle={subtitle}
      footer={
        <>
          {error && (
            <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
              {error}
            </ThemedText>
          )}
          <Button title={nextLabel} onPress={onNext} disabled={nextDisabled} loading={loading} />
          {step > 1 && <Button title="Atrás" variant="secondary" onPress={() => router.back()} />}
        </>
      }>
      <View style={styles.progress} accessibilityLabel={`Paso ${step} de ${ONBOARDING_STEPS}`}>
        {Array.from({ length: ONBOARDING_STEPS }, (_, i) => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i < step ? theme.primary : theme.backgroundSelected }]}
          />
        ))}
      </View>
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: Spacing.one },
  bar: { flex: 1, height: 4, borderRadius: 2 },
});
