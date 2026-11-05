import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { label } from '@/scoring';

type Option = Parameters<typeof label>[0];

type PreferenceChipsProps<T extends Option> = {
  options: readonly T[];
  selected: readonly T[];
  onChange: (next: T[]) => void;
  /** Selección única (tipo de piel) o múltiple (objetivos, preferencias) */
  multiple?: boolean;
};

export function PreferenceChips<T extends Option>({ options, selected, onChange, multiple = false }: PreferenceChipsProps<T>) {
  const theme = useTheme();

  const toggle = (value: T) => {
    const isOn = selected.includes(value);
    if (!multiple) onChange(isOn ? [] : [value]);
    else onChange(isOn ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <View style={styles.wrap}>
      {options.map((value) => {
        const isOn = selected.includes(value);
        return (
          <Pressable
            key={value}
            accessibilityRole={multiple ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: isOn }}
            onPress={() => toggle(value)}
            style={({ pressed }) => [
              styles.chip,
              {
                borderColor: isOn ? theme.primary : theme.border,
                backgroundColor: isOn ? theme.primarySoft : theme.backgroundElement,
              },
              pressed && styles.pressed,
            ]}>
            <ThemedText type={isOn ? 'smallBold' : 'small'} style={isOn && { color: theme.primary }}>
              {capitalize(label(value))}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    borderWidth: 1,
  },
  pressed: { opacity: 0.7 },
});
