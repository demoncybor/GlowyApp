import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useFavorites } from '@/hooks/use-favorites';
import { useProfile } from '@/hooks/use-profile';
import { useCatalog } from '@/hooks/use-recommendations';
import { useTheme } from '@/hooks/use-theme';
import { scoreProduct } from '@/scoring';

export default function FavoritesScreen() {
  const theme = useTheme();
  const favorites = useFavorites();
  const catalog = useCatalog();
  const { data: profile } = useProfile();

  // Los datos de cada producto salen del catálogo del dispositivo; los favoritos guardan solo el id
  const items = useMemo(() => {
    const byId = new Map((catalog.data ?? []).map((p) => [p.id, p]));
    return (favorites.data ?? []).flatMap((f) => {
      const product = byId.get(f.productId);
      if (!product) return []; // producto dado de baja
      const r = profile ? scoreProduct(product, profile) : null;
      return [{ product, score: r?.score ?? null, factors: r?.factors ?? [] }];
    });
  }, [favorites.data, catalog.data, profile]);

  const loading = favorites.isLoading || catalog.isLoading;

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <FlatList
        data={items}
        keyExtractor={(r) => r.product.id}
        renderItem={({ item }) => <ProductCard item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={favorites.isRefetching} onRefresh={() => void favorites.refetch()} tintColor={theme.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="subtitle">Favoritos</ThemedText>
            {items.length > 0 && (
              <ThemedText themeColor="textSecondary">{`${items.length} productos guardados`}</ThemedText>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={theme.primary} style={styles.state} />
          ) : (
            <View style={styles.state}>
              <ThemedText type="smallBold">Todavía no guardas productos.</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                Toca el corazón ♡ de un producto para tenerlo aquí.
              </ThemedText>
              <Button title="Explorar productos" onPress={() => router.navigate('/explore')} />
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
  state: { gap: Spacing.three, alignItems: 'center', paddingTop: Spacing.five },
  centerText: { textAlign: 'center' },
});
