import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PreferenceChips } from '@/components/preference-chips';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile, useSaveProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { parseBudget } from '@/lib/budget';
import { Constants } from '@/lib/database.types';
import type { Profile } from '@/services/profile';

// Editar las respuestas del onboarding en una sola pantalla, con los mismos selectores
export default function EditProfileScreen() {
  const { data: profile } = useProfile();
  return profile ? <EditForm profile={profile} /> : null;
}

function EditForm({ profile }: { profile: Profile }) {
  const theme = useTheme();
  const save = useSaveProfile();
  const [skinType, setSkinType] = useState(profile.skinType);
  const [concerns, setConcerns] = useState(profile.concerns);
  const [preferences, setPreferences] = useState(profile.preferences);
  const [budgetText, setBudgetText] = useState(profile.budgetMax != null ? String(profile.budgetMax) : '');

  const budgetMax = parseBudget(budgetText);
  const budgetInvalid = budgetText.trim() !== '' && budgetMax === null;
  const canSave = !!skinType && concerns.length > 0 && !budgetInvalid;

  const onSave = () =>
    save.mutate({ skinType, concerns, budgetMax, preferences }, { onSuccess: () => router.back() });

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Section title="Tipo de piel">
          <PreferenceChips
            options={Constants.public.Enums.skin_type}
            selected={skinType ? [skinType] : []}
            onChange={([value]) => setSkinType(value ?? null)}
          />
        </Section>
        <Section title="Objetivos" hint="Elige al menos uno.">
          <PreferenceChips multiple options={Constants.public.Enums.skin_concern} selected={concerns} onChange={setConcerns} />
        </Section>
        <Section title="Presupuesto máximo por producto" hint="Déjalo vacío si no quieres un límite.">
          <TextField
            label="Presupuesto máximo (USD)"
            value={budgetText}
            onChangeText={setBudgetText}
            keyboardType="decimal-pad"
            placeholder="Por ejemplo, 50"
          />
          {budgetInvalid && (
            <ThemedText type="small" style={{ color: theme.danger }}>
              Escribe un número mayor que cero.
            </ThemedText>
          )}
        </Section>
        <Section title="Preferencias" hint="Opcional.">
          <PreferenceChips
            multiple
            options={Constants.public.Enums.product_attribute}
            selected={preferences}
            onChange={setPreferences}
          />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { borderColor: theme.border }]}>
        {save.isError && (
          <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
            No se pudieron guardar los cambios. Revisa tu conexión e intenta de nuevo.
          </ThemedText>
        )}
        <Button title="Guardar cambios" onPress={onSave} disabled={!canSave} loading={save.isPending} />
      </View>
    </View>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {hint && (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: Spacing.four, padding: Spacing.four, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  section: { gap: Spacing.two },
  footer: { gap: Spacing.two, padding: Spacing.three, paddingBottom: Spacing.four, borderTopWidth: StyleSheet.hairlineWidth },
});
