import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Spacing } from '@/constants/theme';
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
  const toggle = (value: T) => {
    const isOn = selected.includes(value);
    if (!multiple) onChange(isOn ? [] : [value]);
    else onChange(isOn ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <View style={styles.wrap}>
      {options.map((value) => (
        <Chip
          key={value}
          label={capitalize(label(value))}
          selected={selected.includes(value)}
          onPress={() => toggle(value)}
          role={multiple ? 'checkbox' : 'radio'}
        />
      ))}
    </View>
  );
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
