import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const DEBOUNCE_MS = 250;

type SearchBarProps = {
  value: string;
  /** Se llama cuando el usuario deja de escribir, no en cada tecla */
  onChange: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder = 'Buscar por nombre o marca' }: SearchBarProps) {
  const theme = useTheme();
  const [text, setText] = useState(value);

  useEffect(() => {
    if (text === value) return;
    const t = setTimeout(() => onChange(text), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [text, value, onChange]);

  return (
    <View style={[styles.box, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <TextInput
        accessibilityLabel="Buscar productos"
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.input, { color: theme.text }]}
      />
      {text.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda"
          hitSlop={10}
          onPress={() => {
            setText('');
            onChange('');
          }}>
          <ThemedText themeColor="textSecondary">✕</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  input: { flex: 1, fontSize: 16, minHeight: 44 },
});
