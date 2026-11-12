import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { CompatibilityBadge } from '@/components/compatibility-badge';
import { FavoriteButton } from '@/components/favorite-button';
import { capitalize } from '@/components/preference-chips';
import { ProductThumb } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useProduct } from '@/hooks/use-product';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { label, money, scoreProduct } from '@/scoring';

export default function ProductDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isError, refetch } = useProduct(id);
  const { data: profile } = useProfile();

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        {isError ? (
          <>
            <ThemedText type="smallBold">No pudimos cargar este producto.</ThemedText>
            <Button title="Reintentar" onPress={() => refetch()} />
          </>
        ) : (
          <ActivityIndicator color={theme.primary} />
        )}
      </View>
    );
  }

  const result = profile ? scoreProduct(product, profile) : null;
  const list = (values: Parameters<typeof label>[0][]) => values.map((v) => capitalize(label(v))).join(' · ');

  const details: [string, string][] = [
    ['Para piel', product.skinTypes.length ? list(product.skinTypes) : 'No lo indica'],
    ['Objetivos que atiende', product.targets.length ? list(product.targets) : 'No lo indica'],
    ['Características', product.attributes.length ? list(product.attributes) : 'No lo indica'],
    ...(product.keyIngredients.length ? [['Ingredientes clave', product.keyIngredients.join(' · ')] as [string, string]] : []),
  ];

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: label(product.category) }} />

      <View style={styles.hero}>
        <ProductThumb product={product} size={96} />
        <View style={styles.heroText}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {product.brand}
          </ThemedText>
          <ThemedText style={styles.name}>{product.name}</ThemedText>
          <ThemedText>
            {money(product.price)}
            {product.sizeLabel ? ` · ${product.sizeLabel}` : ''}
          </ThemedText>
        </View>
        <FavoriteButton productId={product.id} />
      </View>

      {result?.score != null && (
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Compatibilidad contigo
          </ThemedText>
          <CompatibilityBadge score={result.score} reasons={result.factors.map((f) => f.text)} defaultOpen />
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Agregar a mi rutina"
          onPress={() => router.push({ pathname: '/routine-add', params: { productId: product.id } })}
        />
        <Button
          title="Comparar con otro"
          variant="secondary"
          onPress={() => router.push({ pathname: '/compare-pick', params: { a: product.id } })}
        />
      </View>

      <View style={styles.details}>
        {details.map(([title, value]) => (
          <View key={title} style={styles.detail}>
            <ThemedText type="small" themeColor="textSecondary">
              {title}
            </ThemedText>
            <ThemedText>{value}</ThemedText>
          </View>
        ))}
        {product.description && <ThemedText>{product.description}</ThemedText>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
  content: { gap: Spacing.four, padding: Spacing.four, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  hero: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  heroText: { flex: 1, gap: Spacing.one },
  name: { fontSize: 22, lineHeight: 28, fontWeight: 600 },
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.one },
  actions: { gap: Spacing.two },
  details: { gap: Spacing.three },
  detail: { gap: Spacing.half },
});
