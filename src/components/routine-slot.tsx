import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/category-icon';
import { ProductThumb } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { label, type Product } from '@/scoring';
import type { RoutineEntry } from '@/services/routine';

type RoutineSlotProps = {
  entries: RoutineEntry[];
  products: Map<string, Product>;
  photoUrls: Record<string, string>;
  onMove: (entry: RoutineEntry, delta: -1 | 1) => void;
  onRemove: (entry: RoutineEntry) => void;
};

/** Pasos de un momento del día, en orden, con controles para reordenar y quitar */
export function RoutineSlot({ entries, products, photoUrls, onMove, onRemove }: RoutineSlotProps) {
  const theme = useTheme();

  return (
    <View style={styles.list}>
      {entries.map((entry, i) => {
        const product = entry.productId ? products.get(entry.productId) : undefined;
        const name = product?.name ?? entry.customName ?? 'Producto';
        const photo = entry.photoPath ? photoUrls[entry.photoPath] : undefined;

        const info = (
          <View style={styles.info}>
            <ThemedText type="small" themeColor="textSecondary">{`Paso ${i + 1}`}</ThemedText>
            <ThemedText type="smallBold" numberOfLines={2}>
              {name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {product ? `${product.brand} · ${label(product.category)}` : 'Producto propio'}
            </ThemedText>
          </View>
        );

        return (
          <View key={entry.id} style={[styles.item, { backgroundColor: theme.backgroundElement }]}>
            {photo ? (
              <Image source={photo} style={styles.thumb} contentFit="cover" accessibilityLabel={`Foto de ${name}`} />
            ) : product ? (
              <ProductThumb product={product} size={56} />
            ) : (
              <CategoryIcon category={null} fallbackText={name} size={56} />
            )}
            {product ? (
              <Link href={{ pathname: '/product/[id]', params: { id: product.id } }} asChild>
                <Pressable accessibilityRole="link" style={styles.info}>
                  {info}
                </Pressable>
              </Link>
            ) : (
              info
            )}
            <View style={styles.controls}>
              <IconButton text="↑" label={`Subir ${name}`} disabled={i === 0} onPress={() => onMove(entry, -1)} />
              <IconButton
                text="↓"
                label={`Bajar ${name}`}
                disabled={i === entries.length - 1}
                onPress={() => onMove(entry, 1)}
              />
              <IconButton text="✕" label={`Quitar ${name} de la rutina`} onPress={() => onRemove(entry)} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function IconButton({ text, label, onPress, disabled }: { text: string; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.icon, (pressed || disabled) && styles.dimmed]}>
      <ThemedText type="smallBold">{text}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: Spacing.three, padding: Spacing.two },
  thumb: { width: 56, height: 56, borderRadius: Spacing.two },
  info: { flex: 1, gap: Spacing.half },
  controls: { flexDirection: 'row' },
  icon: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  dimmed: { opacity: 0.35 },
});
