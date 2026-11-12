import { useNetInfo } from '@react-native-community/netinfo';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Aviso sobre las pestañas cuando el teléfono no tiene conexión */
export function OfflineBanner() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetInfo();

  if (isConnected !== false) return null; // null = todavía no se sabe

  return (
    <View
      pointerEvents="none"
      accessibilityRole="alert"
      style={[styles.banner, { bottom: insets.bottom + BottomTabInset + Spacing.two, backgroundColor: theme.text }]}>
      <ThemedText type="small" style={{ color: theme.background }}>
        Sin conexión. Ves lo último guardado; tus favoritos se enviarán al volver la red.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
