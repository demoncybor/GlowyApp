import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/category-icon';
import { CompatibilityBadge } from '@/components/compatibility-badge';
import { FavoriteButton } from '@/components/favorite-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { label, money, type Factor, type Product } from '@/scoring';
import { productImageUrl } from '@/services/products';

export type ProductCardItem = { product: Product; score: number | null; factors: Factor[] };

/** Resumen de un producto en listas; al tocarlo abre su detalle */
export function ProductCard({ item }: { item: ProductCardItem }) {
  const theme = useTheme();
  const { product, score, factors } = item;

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.row}>
        <Link href={{ pathname: '/product/[id]', params: { id: product.id } }} asChild>
          <Pressable accessibilityRole="link" style={({ pressed }) => [styles.main, pressed && styles.pressed]}>
            <ProductThumb product={product} />
            <View style={styles.info}>
              <ThemedText type="smallBold" numberOfLines={2}>
                {product.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {`${product.brand} · ${label(product.category)}`}
              </ThemedText>
              <ThemedText type="small">{money(product.price)}</ThemedText>
            </View>
          </Pressable>
        </Link>
        <FavoriteButton productId={product.id} />
      </View>
      {score != null && <CompatibilityBadge score={score} reasons={factors.map((f) => f.text)} />}
    </View>
  );
}

/** Foto del producto o, si no tiene, el ícono de su categoría */
export function ProductThumb({ product, size = 64 }: { product: Product; size?: number }) {
  return product.imagePath ? (
    <Image
      source={productImageUrl(product.imagePath)}
      style={{ width: size, height: size, borderRadius: Spacing.two }}
      contentFit="cover"
    />
  ) : (
    <CategoryIcon category={product.category} fallbackText={product.name} size={size} />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.one },
  main: { flex: 1, flexDirection: 'row', gap: Spacing.three },
  pressed: { opacity: 0.7 },
  info: { flex: 1, gap: Spacing.half },
});
