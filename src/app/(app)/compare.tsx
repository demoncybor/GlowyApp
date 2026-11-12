import { Link, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ProductThumb } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useCatalog } from '@/hooks/use-recommendations';
import { useTheme } from '@/hooks/use-theme';
import { compareProducts, describeDiff, levelFor, money, type CompareSide } from '@/scoring';

// Comparativa de dos productos de la misma categoría (?a=<id>&b=<id>)
export default function CompareScreen() {
  const theme = useTheme();
  const { a, b } = useLocalSearchParams<{ a: string; b: string }>();
  const catalog = useCatalog();
  const { data: profile } = useProfile();

  const pa = catalog.data?.find((p) => p.id === a);
  const pb = catalog.data?.find((p) => p.id === b);

  if (!pa || !pb || !profile) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        {catalog.isLoading ? (
          <ActivityIndicator color={theme.primary} />
        ) : (
          <ThemedText type="smallBold">No encontramos alguno de los productos.</ThemedText>
        )}
      </View>
    );
  }

  if (pa.category !== pb.category) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ThemedText type="smallBold">Solo se pueden comparar productos de la misma categoría.</ThemedText>
      </View>
    );
  }

  const result = compareProducts(pa, pb, profile);

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <View style={styles.columns}>
        <Column side={result.a} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Column side={result.b} />
      </View>
    </ScrollView>
  );
}

function Column({ side }: { side: CompareSide }) {
  const theme = useTheme();
  const { product, score, advantages, disadvantages } = side;
  const color = score == null ? theme.text : { alta: theme.levelHigh, media: theme.levelMedium, baja: theme.levelLow }[levelFor(score)];

  return (
    <View style={styles.column}>
      <Link href={{ pathname: '/product/[id]', params: { id: product.id } }} asChild>
        <Pressable accessibilityRole="link" style={styles.top}>
          <ProductThumb product={product} size={72} />
          <ThemedText type="smallBold" numberOfLines={3}>
            {product.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {product.brand}
          </ThemedText>
        </Pressable>
      </Link>
      <ThemedText>{money(product.price)}</ThemedText>
      {score != null && (
        <ThemedText type="subtitle" style={{ color }}>
          {`${score}%`}
        </ThemedText>
      )}

      <DiffList title="Ventajas" items={advantages.map((d) => describeDiff(d, 'ventaja'))} />
      <DiffList title="Desventajas" items={disadvantages.map((d) => describeDiff(d, 'desventaja'))} />
    </View>
  );
}

function DiffList({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.diff}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {items.length > 0 ? (
        items.map((t) => <ThemedText key={t} type="small">{`• ${t}`}</ThemedText>)
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          Ninguna
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  content: { padding: Spacing.three, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  columns: { flexDirection: 'row', gap: Spacing.three },
  divider: { width: StyleSheet.hairlineWidth },
  column: { flex: 1, minWidth: 0, gap: Spacing.three },
  top: { gap: Spacing.one },
  diff: { gap: Spacing.one },
});
