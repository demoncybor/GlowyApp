import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PhotoPicker } from '@/components/photo-picker';
import { ProductThumb } from '@/components/product-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useCatalog } from '@/hooks/use-recommendations';
import { useAddToRoutine } from '@/hooks/use-routine';
import { useTheme } from '@/hooks/use-theme';
import type { RoutineSlot } from '@/scoring';
import { isDuplicateRoutineItem } from '@/services/routine';

const SLOTS: [RoutineSlot, string][] = [
  ['manana', 'Mañana'],
  ['noche', 'Noche'],
];

// Modal para agregar a la rutina un producto del catálogo (?productId=) o uno propio (sin parámetro)
export default function RoutineAddModal() {
  const theme = useTheme();
  const { productId, slot: initialSlot } = useLocalSearchParams<{ productId?: string; slot?: RoutineSlot }>();
  const product = useCatalog().data?.find((p) => p.id === productId);
  const add = useAddToRoutine();

  const [slot, setSlot] = useState<RoutineSlot>(initialSlot === 'noche' ? 'noche' : 'manana');
  const [customName, setCustomName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const isCustom = !productId;
  const canSave = isCustom ? customName.trim().length > 0 : !!product;
  const slotText = slot === 'manana' ? 'la mañana' : 'la noche';

  const error = add.error
    ? isDuplicateRoutineItem(add.error)
      ? `Este producto ya está en tu rutina de ${slotText}.`
      : 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.'
    : null;

  const onSave = () =>
    add.mutate(
      { productId: productId ?? null, customName: isCustom ? customName.trim() : null, slot, photoUri },
      { onSuccess: () => router.back() },
    );

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {product ? (
          <View style={styles.product}>
            <ProductThumb product={product} size={56} />
            <View style={styles.flex}>
              <ThemedText type="smallBold">{product.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {product.brand}
              </ThemedText>
            </View>
          </View>
        ) : (
          <TextField
            label="Nombre del producto"
            value={customName}
            onChangeText={setCustomName}
            placeholder="Por ejemplo, mi crema de noche"
            maxLength={120}
          />
        )}

        <View style={styles.section}>
          <ThemedText type="smallBold">¿Cuándo lo usas?</ThemedText>
          <View style={styles.row}>
            {SLOTS.map(([value, text]) => (
              <Chip key={value} label={text} selected={slot === value} onPress={() => setSlot(value)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold">Foto (opcional)</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Solo tú puedes verla.
          </ThemedText>
          <PhotoPicker uri={photoUri} onChange={setPhotoUri} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderColor: theme.border }]}>
        {error && (
          <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
            {error}
          </ThemedText>
        )}
        <Button title={`Agregar a ${slotText}`} onPress={onSave} disabled={!canSave} loading={add.isPending} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: Spacing.four, padding: Spacing.four },
  product: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  section: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  footer: { gap: Spacing.two, padding: Spacing.three, paddingBottom: Spacing.four, borderTopWidth: StyleSheet.hairlineWidth },
});
