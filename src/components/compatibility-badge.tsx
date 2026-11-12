import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { levelFor } from '@/scoring';

type CompatibilityBadgeProps = {
  score: number;
  /** Una frase por factor; se despliegan al tocar el porcentaje */
  reasons: string[];
  /** Mostrar la explicación desde el inicio (pantalla de detalle) */
  defaultOpen?: boolean;
};

const LEVEL_TEXT = { alta: 'Compatibilidad alta', media: 'Compatibilidad media', baja: 'Compatibilidad baja' };

export function CompatibilityBadge({ score, reasons, defaultOpen = false }: CompatibilityBadgeProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const level = levelFor(score);
  const color = { alta: theme.levelHigh, media: theme.levelMedium, baja: theme.levelLow }[level];

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${LEVEL_TEXT[level]}: ${score}%. ${open ? 'Ocultar' : 'Ver'} por qué`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        hitSlop={8}
        style={styles.header}>
        <ThemedText type="subtitle" style={{ color }}>
          {`${score}%`}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {open ? 'Ocultar ▲' : '¿Por qué? ▼'}
        </ThemedText>
      </Pressable>
      {open && (
        <View style={styles.reasons}>
          {reasons.map((r) => (
            <ThemedText key={r} type="small">
              {`• ${r}`}
            </ThemedText>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  header: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  reasons: { gap: Spacing.one },
});
