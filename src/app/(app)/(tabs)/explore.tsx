import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product-card';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useCatalog } from '@/hooks/use-recommendations';
import { useTheme } from '@/hooks/use-theme';
import { activeFilterCount, filterCatalog, type SortBy } from '@/lib/catalog-filters';
import { useFilters } from '@/stores/filters';

const SORT_OPTIONS: [SortBy, string][] = [
  ['compatibilidad', 'Más compatibles'],
  ['precio', 'Menor precio'],
  ['nombre', 'Nombre'],
];

export default function ExploreScreen() {
  const theme = useTheme();
  const catalog = useCatalog();
  const { data: profile } = useProfile();
  const filters = useFilters();
  const { query, category, priceMax, attributes, sortBy, set, clear } = filters;

  const results = useMemo(
    () => filterCatalog(catalog.data ?? [], { query, category, priceMax, attributes, sortBy }, profile ?? null),
    [catalog.data, query, category, priceMax, attributes, sortBy, profile],
  );
  const filterCount = activeFilterCount(filters);

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <FlatList
        data={results}
        keyExtractor={(r) => r.product.id}
        renderItem={({ item }) => <ProductCard item={item} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={8}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="subtitle">Explorar</ThemedText>
            <SearchBar value={query} onChange={(q) => set({ query: q })} />
            <View style={styles.row}>
              {SORT_OPTIONS.map(([value, text]) => (
                <Chip key={value} label={text} selected={sortBy === value} onPress={() => set({ sortBy: value })} />
              ))}
            </View>
            <View style={styles.summary}>
              <ThemedText type="small" themeColor="textSecondary">
                {catalog.data ? `${results.length} productos` : ' '}
              </ThemedText>
              <View style={styles.row}>
                {filterCount > 0 && <Button title="Quitar filtros" variant="secondary" onPress={clear} />}
                <Button
                  title={filterCount > 0 ? `Filtros (${filterCount})` : 'Filtros'}
                  variant={filterCount > 0 ? 'primary' : 'secondary'}
                  onPress={() => router.push('/filters')}
                />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          catalog.isLoading ? (
            <ActivityIndicator color={theme.primary} style={styles.state} />
          ) : catalog.error ? (
            <View style={styles.state}>
              <ThemedText type="smallBold">No pudimos cargar el catálogo.</ThemedText>
              <Button title="Reintentar" onPress={() => catalog.refetch()} />
            </View>
          ) : (
            <View style={styles.state}>
              <ThemedText type="smallBold">No encontramos productos.</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Prueba con otra palabra o quita algún filtro.
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
  header: { gap: Spacing.three, paddingTop: Spacing.three },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  summary: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  state: { gap: Spacing.three, alignItems: 'center', paddingTop: Spacing.five },
});
