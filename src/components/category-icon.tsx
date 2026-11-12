import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ProductCategory } from '@/scoring';

type SymbolName = SymbolViewProps['name'];

/** Ícono de cada categoría: SF Symbols en iPhone y Material Symbols en Android */
const ICONS: Record<ProductCategory, SymbolName> = {
  limpiador: { ios: 'bubbles.and.sparkles', android: 'soap', web: 'soap' },
  tonico: { ios: 'humidity', android: 'humidity_percentage', web: 'humidity_percentage' },
  serum: { ios: 'eyedropper', android: 'colorize', web: 'colorize' },
  hidratante: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  protector_solar: { ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' },
  mascarilla: { ios: 'face.smiling', android: 'face', web: 'face' },
  exfoliante: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  contorno_ojos: { ios: 'eye', android: 'visibility', web: 'visibility' },
};

/** Para productos propios de la rutina, que no tienen categoría */
const CUSTOM_ICON: SymbolName = { ios: 'heart.text.square', android: 'spa', web: 'spa' };

type CategoryIconProps = {
  /** null = producto propio */
  category: ProductCategory | null;
  /** Texto de respaldo si el sistema no puede dibujar el ícono */
  fallbackText: string;
  size?: number;
};

/** Cuadro con el ícono de la categoría; se usa cuando el producto no tiene foto */
export function CategoryIcon({ category, fallbackText, size = 64 }: CategoryIconProps) {
  const theme = useTheme();
  return (
    <View
      style={[styles.box, { width: size, height: size, backgroundColor: theme.primarySoft }]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden>
      <SymbolView
        name={category ? ICONS[category] : CUSTOM_ICON}
        size={Math.round(size * 0.5)}
        tintColor={theme.primary}
        fallback={
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            {fallbackText.charAt(0)}
          </ThemedText>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: Spacing.two, alignItems: 'center', justifyContent: 'center' },
});
