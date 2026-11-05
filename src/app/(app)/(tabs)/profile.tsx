import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { queryClient } from '@/lib/query-client';
import { label, money } from '@/scoring';
import { signOut } from '@/services/auth';
import { useSessionStore } from '@/stores/session';

const list = (values: Parameters<typeof label>[0][]) => (values.length ? values.map(label).join(', ') : 'Ninguna');

export default function ProfileScreen() {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const email = useSessionStore((s) => s.session?.user.email);
  const [signingOut, setSigningOut] = useState(false);

  async function onSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      queryClient.clear(); // no dejar datos de esta cuenta en el dispositivo
    } finally {
      setSigningOut(false);
    }
  }

  if (!profile) return null;

  const rows: [string, string][] = [
    ['Tipo de piel', profile.skinType ? label(profile.skinType) : 'Sin indicar'],
    ['Objetivos', list(profile.concerns)],
    ['Presupuesto máximo', profile.budgetMax != null ? money(profile.budgetMax) : 'Sin límite'],
    ['Preferencias', list(profile.preferences)],
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="subtitle">{profile.displayName || 'Tu perfil'}</ThemedText>
          {email && <ThemedText themeColor="textSecondary">{email}</ThemedText>}
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          {rows.map(([title, value]) => (
            <View key={title} style={styles.row}>
              <ThemedText type="small" themeColor="textSecondary">
                {title}
              </ThemedText>
              <ThemedText>{value}</ThemedText>
            </View>
          ))}
        </View>

        <ThemedText type="small" themeColor="textSecondary">
          Pronto podrás editar tus preferencias desde aquí.
        </ThemedText>

        <Button title="Cerrar sesión" variant="secondary" onPress={onSignOut} loading={signingOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    gap: Spacing.four,
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: { gap: Spacing.one, paddingTop: Spacing.three },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.three },
  row: { gap: Spacing.half },
});
