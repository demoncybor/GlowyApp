import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useRecommendations } from '@/hooks/use-recommendations';
import { useTheme } from '@/hooks/use-theme';

export default function ForYouScreen() {
  const theme = useTheme();
  const profile = useProfile();
  const { ranked, isLoading, error, refetch, isRefetching } = useRecommendations();
  const name = profile.data?.displayName;

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <FlatList
        data={ranked}
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
  state: { gap: Spacing.three, alignItems: 'center', paddingTop: Spacing.five },
});
