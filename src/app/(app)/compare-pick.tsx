import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ProductThumb } from '@/components/product-card';
import { SearchBar } from '@/components/search-bar';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useCatalog } from '@/hooks/use-recommendations';
import { useTheme } from '@/hooks/use-theme';
import { EMPTY_FILTERS, filterCatalog } from '@/lib/catalog-filters';
import { label, money } from '@/scoring';

// Elegir el segundo producto: solo de la misma categoría, los más compatibles primero
export default function ComparePickScreen() {
  const theme = useTheme();
  const { a } = useLocalSearchParams<{ a: string }>();
  const catalog = useCatalog();
  const { data: profile } = useProfile();
  const [query, setQuery] = useState('');

  const first = catalog.data?.find((p) => p.id === a);
  const options = useMemo(
    () =>
      first
        ? filterCatalog(catalog.data ?? [], { ...EMPTY_FILTERS, category: first.category, query }, profile ?? null).filter(
            (i) => i.product.id !== first.id,
          )
        : [],
    [catalog.data, first, query, profile],
  );

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.list}
      data={options}
      keyExtractor={(i) => i.product.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          {first && (
            <ThemedText themeColor="textSecondary">
              {`Compara «${first.name}» con otro ${label(first.category)}.`}
            </ThemedText>
          )}
          <SearchBar value={query} onChange={setQuery} />
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace({ pathname: '/compare', params: { a, b: item.product.id } })}
          style={({ pressed }) => [styles.row, { backgroundColor: theme.backgroundElement }, pressed && styles.pressed]}>
          <ProductThumb product={item.product} size={48} />
          <View style={styles.info}>
            <ThemedText type="smallBold" numberOfLines={2}>
              {item.product.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {`${item.product.brand} · ${money(item.product.price)}`}
            </ThemedText>
          </View>
          {item.score != null && (
            <ThemedText type="smallBold" style={{ color: theme.primary }}>{`${item.score}%`}</ThemedText>
          )}
        </Pressable>
      )}
      ListEmptyComponent={
        <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
          No hay otros productos de esta categoría con esa búsqueda.
        </ThemedText>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two, padding: Spacing.three, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  header: { gap: Spacing.three, paddingBottom: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.two, borderRadius: Spacing.three },
  info: { flex: 1, gap: Spacing.half },
  pressed: { opacity: 0.7 },
  empty: { textAlign: 'center', paddingTop: Spacing.four },
});
