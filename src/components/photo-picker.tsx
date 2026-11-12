import { Image } from 'expo-image';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { pickPhoto, type PhotoSource } from '@/lib/pick-photo';

type PhotoPickerProps = {
  /** Foto elegida (archivo local) o null */
  uri: string | null;
  onChange: (uri: string | null) => void;
};

/** Botones «Cámara» y «Galería» con vista previa de la foto elegida */
export function PhotoPicker({ uri, onChange }: PhotoPickerProps) {
  const theme = useTheme();
  const [denied, setDenied] = useState<{ canAskAgain: boolean } | null>(null);

  async function choose(source: PhotoSource) {
    setDenied(null);
    const result = await pickPhoto(source);
    if ('uri' in result) onChange(result.uri);
    else if ('denied' in result) setDenied({ canAskAgain: result.canAskAgain });
  }

  return (
    <View style={styles.container}>
      {uri ? (
        <View style={styles.previewRow}>
          <Image source={uri} style={styles.preview} contentFit="cover" accessibilityLabel="Foto elegida" />
          <Button title="Quitar foto" variant="secondary" onPress={() => onChange(null)} />
        </View>
      ) : (
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button title="Cámara" variant="secondary" onPress={() => choose('camera')} />
          </View>
          <View style={styles.flex}>
            <Button title="Galería" variant="secondary" onPress={() => choose('gallery')} />
          </View>
        </View>
      )}
      {denied && (
        <View style={styles.denied}>
          <ThemedText type="small" style={{ color: theme.danger }}>
            Necesitamos permiso de cámara para tomar la foto. También puedes elegirla de tu galería.
          </ThemedText>
          {!denied.canAskAgain && (
            <Button title="Abrir ajustes" variant="secondary" onPress={() => Linking.openSettings()} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  preview: { width: 96, height: 96, borderRadius: Spacing.two },
  denied: { gap: Spacing.two },
});
