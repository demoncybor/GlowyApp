import * as Crypto from 'expo-crypto';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { supabase } from '@/lib/supabase';

const MAX_WIDTH = 1080;
const JPEG_QUALITY = 0.7;
const SIGNED_URL_SECONDS = 60 * 60;

/**
 * Reduce la foto, la vuelve a codificar como JPEG y la sube a la carpeta privada del usuario.
 * Volver a codificarla debería descartar los metadatos EXIF (incluida la ubicación); compruébalo
 * con una foto real antes de publicar (sección 7 del documento de diseño).
 * Devuelve la ruta para guardar en routine_items.photo_path.
 */
export async function uploadRoutinePhoto(userId: string, uri: string): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: MAX_WIDTH, height: null });
  const image = await context.renderAsync();
  const { uri: jpegUri } = await image.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });

  const body = await (await fetch(jpegUri)).arrayBuffer();
  const path = `${userId}/${Crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from('routine-photos')
    .upload(path, body, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return path;
}

export const removeRoutinePhoto = (path: string) => supabase.storage.from('routine-photos').remove([path]);

/** El bucket es privado: las fotos se muestran con URL firmadas que duran una hora */
export async function signedPhotoUrls(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const { data, error } = await supabase.storage.from('routine-photos').createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (error) throw error;
  return Object.fromEntries(data.flatMap((d) => (d.path && d.signedUrl ? [[d.path, d.signedUrl]] : [])));
}
