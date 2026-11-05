import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { CompatibilityBadge } from '@/components/compatibility-badge';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { label, money, type Ranked } from '@/scoring';
import { productImageUrl } from '@/services/products';

export function ProductCard({ item }: { item: Ranked }) {
  const theme = useTheme();
  const { product, score, factors } = item;

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.row}>
        {product.imagePath ? (
          <Image source={productImageUrl(product.imagePath)} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder, { backgroundColor: theme.primarySoft }]}>
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              {product.name.charAt(0)}
            </ThemedText>
          </View>
        )}
        <View style={styles.info}>
          <ThemedText type="smallBold" numberOfLines={2}>
            {product.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {`${product.brand} · ${label(product.category)}`}
          </ThemedText>
          <ThemedText type="small">{money(product.price)}</ThemedText>
        </View>
      </View>
      <CompatibilityBadge score={score} reasons={factors.map((f) => f.text)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three },
  image: { width: 64, height: 64, borderRadius: Spacing.two },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: Spacing.half },
});
