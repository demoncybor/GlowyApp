import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useIsFavorite, useToggleFavorite } from '@/hooks/use-favorites';
import { useTheme } from '@/hooks/use-theme';

/** Corazón para guardar o quitar de favoritos; responde al instante */
export function FavoriteButton({ productId }: { productId: string }) {
  const theme = useTheme();
  const favorite = useIsFavorite(productId);
  const toggle = useToggleFavorite();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      accessibilityState={{ selected: favorite }}
      hitSlop={10}
      onPress={() => toggle.mutate({ productId, favorite: !favorite })}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <ThemedText style={[styles.heart, { color: favorite ? theme.primary : theme.textSecondary }]}>
        {favorite ? '♥' : '♡'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  heart: { fontSize: 26, lineHeight: 30 },
  pressed: { opacity: 0.6 },
});
