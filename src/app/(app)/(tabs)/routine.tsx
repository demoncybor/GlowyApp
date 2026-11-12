import { Link, router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoutineSlot } from '@/components/routine-slot';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useCatalog } from '@/hooks/use-recommendations';
import { useMoveInRoutine, usePhotoUrls, useRemoveFromRoutine, useRoutine } from '@/hooks/use-routine';
import { useTheme } from '@/hooks/use-theme';
import { label, recommendFromRoutine, type Ranked, type RoutineSlot as Slot } from '@/scoring';

const SLOTS: [Slot, string][] = [
  ['manana', 'Mañana'],
  ['noche', 'Noche'],
];

export default function RoutineScreen() {
  const theme = useTheme();
  const routine = useRoutine();
  const catalog = useCatalog();
  const { data: profile } = useProfile();
  const move = useMoveInRoutine();
  const remove = useRemoveFromRoutine();

  const entries = useMemo(() => routine.data ?? [], [routine.data]);
  const products = useMemo(() => new Map((catalog.data ?? []).map((p) => [p.id, p])), [catalog.data]);
  const photoPaths = useMemo(() => entries.flatMap((e) => (e.photoPath ? [e.photoPath] : [])), [entries]);
  const { data: photoUrls = {} } = usePhotoUrls(photoPaths);

  const { gaps, upgrades } = useMemo(
    () =>
      profile && catalog.data ? recommendFromRoutine(entries, catalog.data, profile) : { gaps: [], upgrades: [] },
    [entries, catalog.data, profile],
  );

  if (routine.isLoading || catalog.isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={routine.isRefetching} onRefresh={() => void routine.refetch()} tintColor={theme.primary} />
        }>
        <View style={styles.header}>
          <ThemedText type="subtitle">Mi rutina</ThemedText>
          <ThemedText themeColor="textSecondary">
            Agrega productos desde su detalle o registra uno propio.
          </ThemedText>
        </View>

        {routine.isError && (
          <View style={styles.section}>
            <ThemedText type="smallBold">No pudimos cargar tu rutina.</ThemedText>
            <Button title="Reintentar" onPress={() => routine.refetch()} />
          </View>
        )}

        {SLOTS.map(([slot, title]) => {
          const slotEntries = entries.filter((e) => e.slot === slot).sort((a, b) => a.stepOrder - b.stepOrder);
          const slotGaps = gaps.filter((g) => g.slot === slot);
          return (
            <View key={slot} style={styles.section}>
              <ThemedText type="smallBold" style={styles.slotTitle}>
                {title}
              </ThemedText>
              {slotEntries.length > 0 ? (
                <RoutineSlot
                  entries={slotEntries}
                  products={products}
                  photoUrls={photoUrls}
                  onMove={(entry, delta) => move.mutate({ item: entry, delta })}
                  onRemove={(entry) => remove.mutate(entry)}
                />
              ) : (
                <ThemedText type="small" themeColor="textSecondary">
                  {`Todavía no tienes pasos en tu rutina de ${slot === 'manana' ? 'la mañana' : 'la noche'}.`}
                </ThemedText>
              )}
              <Button
                title="Agregar producto propio"
                variant="secondary"
                onPress={() => router.push({ pathname: '/routine-add', params: { slot } })}
              />

              {slotGaps.map((gap) => (
                <View key={gap.category} style={[styles.tip, { backgroundColor: theme.primarySoft }]}>
                  <ThemedText type="smallBold">{`Te falta un ${label(gap.category)}`}</ThemedText>
                  {gap.suggestions.length > 0 ? (
                    <>
                      <ThemedText type="small" themeColor="textSecondary">
                        Los más compatibles contigo:
                      </ThemedText>
                      {gap.suggestions.map((s) => (
                        <SuggestionRow key={s.product.id} item={s} />
                      ))}
                    </>
                  ) : (
                    <ThemedText type="small" themeColor="textSecondary">
                      No hay sugerencias para esta categoría.
                    </ThemedText>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        {upgrades.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.slotTitle}>
              Podrías mejorar
            </ThemedText>
            {upgrades.map((u) => (
              <View key={u.item.id} style={[styles.tip, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small">
                  {`En lugar de «${u.current.name}», este es ${u.gain} puntos más compatible contigo:`}
                </ThemedText>
                <SuggestionRow item={u.better} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SuggestionRow({ item }: { item: Ranked }) {
  const theme = useTheme();
  return (
    <Link href={{ pathname: '/product/[id]', params: { id: item.product.id } }} asChild>
      <Pressable accessibilityRole="link" style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
        <ThemedText type="small" style={styles.flex} numberOfLines={1}>
          {`${item.product.name} · ${item.product.brand}`}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.primary }}>{`${item.score}%`}</ThemedText>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    gap: Spacing.five,
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: { gap: Spacing.two, paddingTop: Spacing.three },
  section: { gap: Spacing.two },
  slotTitle: { fontSize: 18, lineHeight: 24 },
  tip: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.one },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, minHeight: 36 },
  pressed: { opacity: 0.6 },
});
