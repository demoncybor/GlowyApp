import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { queryClient } from '@/lib/query-client';
import { label, money } from '@/scoring';
import { deleteAccount, signOut } from '@/services/auth';
import { useSessionStore } from '@/stores/session';

const list = (values: Parameters<typeof label>[0][]) => (values.length ? values.map(label).join(', ') : 'Ninguna');

export default function ProfileScreen() {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const email = useSessionStore((s) => s.session?.user.email);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  async function onSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      queryClient.clear(); // no dejar datos de esta cuenta en el dispositivo
    } finally {
      setSigningOut(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      '¿Borrar tu cuenta?',
      'Se borran para siempre tu perfil, tus favoritos, tu rutina y tus fotos. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar cuenta', style: 'destructive', onPress: onDelete },
      ],
    );
  }

  async function onDelete() {
    setDeleteError(false);
    setDeleting(true);
    try {
      await deleteAccount();
      queryClient.clear();
    } catch {
      setDeleteError(true);
    } finally {
      setDeleting(false);
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

        <Button title="Editar preferencias" onPress={() => router.push('/edit-profile')} />
        <Button title="Cerrar sesión" variant="secondary" onPress={onSignOut} loading={signingOut} />

        <View style={[styles.danger, { borderColor: theme.border }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Borrar tu cuenta elimina todos tus datos y fotos de Glowy.
          </ThemedText>
          {deleteError && (
            <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
              No se pudo borrar la cuenta. Revisa tu conexión e intenta de nuevo.
            </ThemedText>
          )}
          <Button title="Borrar mi cuenta" variant="secondary" onPress={confirmDelete} loading={deleting} />
        </View>
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
  danger: { gap: Spacing.two, paddingTop: Spacing.four, borderTopWidth: StyleSheet.hairlineWidth },
});
