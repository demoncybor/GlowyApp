import * as ImagePicker from 'expo-image-picker';

export type PhotoSource = 'camera' | 'gallery';

export type PickResult = { uri: string } | { canceled: true } | { denied: true; canAskAgain: boolean };

/** Toma una foto o la elige de la galería. Pide permiso de cámara solo al usarla. */
export async function pickPhoto(source: PhotoSource): Promise<PickResult> {
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return { denied: true, canAskAgain: perm.canAskAgain };
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    return res.canceled ? { canceled: true } : { uri: res.assets[0].uri };
  }

  // El selector del sistema no necesita permiso de lectura de la galería
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });
  return res.canceled ? { canceled: true } : { uri: res.assets[0].uri };
}
