import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { capitalize } from '@/components/preference-chips';
import { ProductCard } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useRecommendations } from '@/hooks/use-recommendations';
import { useTheme } from '@/hooks/use-theme';
import { Constants } from '@/lib/database.types';
import {
  applyQualityFilters,
  countByCategory,
  filterRecommendations,
  HIGH_SCORE,
  NO_RECOMMENDATION_FILTERS,
  type RecommendationFilters,
} from '@/lib/recommendation-filters';
import { label, money } from '@/scoring';

export default function ForYouScreen() {
  const theme = useTheme();
  const profile = useProfile();
  const { ranked, isLoading, error, refetch, isRefetching } = useRecommendations();
  const name = profile.data?.displayName;
  const budgetMax = profile.data?.budgetMax ?? null;
  const [filters, setFilters] = useState<RecommendationFilters>(NO_RECOMMENDATION_FILTERS);
  const set = (patch: Partial<RecommendationFilters>) => setFilters((f) => ({ ...f, ...patch }));

  // Los números de cada categoría ya toman en cuenta presupuesto y compatibilidad alta
  const rest = useMemo(() => applyQualityFilters(ranked, filters, budgetMax), [ranked, filters, budgetMax]);
  const counts = useMemo(() => countByCategory(rest), [rest]);
  const visible = useMemo(() => filterRecommendations(ranked, filters, budgetMax), [ranked, filters, budgetMax]);
  const anyFilter = filters.category != null || filters.withinBudget || filters.highOnly;

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <FlatList
        data={visible}
        keyExtractor={(r) => r.product.id}
        renderItem={({ item }) => <ProductCard item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="subtitle">{name ? `Hola, ${name}` : 'Para ti'}</ThemedText>
            <ThemedText themeColor="textSecondary">
              Productos ordenados según tu perfil. Toca el porcentaje para ver por qué.
            </ThemedText>
            {ranked.length > 0 && (
              <>
                <View style={styles.toggles}>
                  {budgetMax != null && (
                    <Chip
                      role="checkbox"
                      label={`Hasta ${money(budgetMax)}`}
                      selected={filters.withinBudget}
                      onPress={() => set({ withinBudget: !filters.withinBudget })}
                    />
                  )}
                  <Chip
                    role="checkbox"
                    label={`Compatibilidad alta (${HIGH_SCORE}%+)`}
                    selected={filters.highOnly}
                    onPress={() => set({ highOnly: !filters.highOnly })}
                  />
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chips}
                  accessibilityLabel="Filtrar por categoría">
                  <Chip
                    label={`Todos (${rest.length})`}
                    selected={!filters.category}
                    onPress={() => set({ category: null })}
                  />
                  {Constants.public.Enums.product_category
                    .filter((c) => counts.has(c) || filters.category === c)
                    .map((c) => (
                      <Chip
                        key={c}
                        label={`${capitalize(label(c))} (${counts.get(c) ?? 0})`}
                        selected={filters.category === c}
                        onPress={() => set({ category: filters.category === c ? null : c })}
                      />
                    ))}
                </ScrollView>
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={theme.primary} style={styles.state} />
          ) : error ? (
            <View style={styles.state}>
              <ThemedText type="smallBold">No pudimos cargar el catálogo.</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Revisa tu conexión e intenta de nuevo.
              </ThemedText>
              <Button title="Reintentar" onPress={refetch} />
            </View>
          ) : anyFilter ? (
            <View style={styles.state}>
              <ThemedText type="smallBold">Ningún producto cumple estos filtros.</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                Prueba con otra categoría o quita algún filtro.
              </ThemedText>
              <Button title="Quitar filtros" variant="secondary" onPress={() => setFilters(NO_RECOMMENDATION_FILTERS)} />
            </View>
          ) : (
            <View style={styles.state}>
              <ThemedText type="small" themeColor="textSecondary">
                Todavía no hay productos en el catálogo.
              </ThemedText>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    gap: Spacing.three,
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: { gap: Spacing.two, paddingVertical: Spacing.three },
  toggles: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, paddingTop: Spacing.two },
  chips: { gap: Spacing.two },
  state: { gap: Spacing.three, alignItems: 'center', paddingTop: Spacing.five },
  centerText: { textAlign: 'center' },
});
