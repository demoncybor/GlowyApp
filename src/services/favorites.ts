import { supabase } from '@/lib/supabase';

export type Favorite = { productId: string; createdAt: string };

/** Favoritos del usuario, del más reciente al más antiguo (RLS limita a los suyos) */
export async function listFavorites(): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('product_id, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((r) => ({ productId: r.product_id, createdAt: r.created_at }));
}

// Idempotente: si ya existe, no hace nada ni falla
export async function addFavorite(productId: string) {
  const { error } = await supabase
    .from('favorites')
    .upsert({ product_id: productId }, { onConflict: 'user_id,product_id', ignoreDuplicates: true });
  if (error) throw error;
}

// RLS limita el borrado a las filas del propio usuario
export async function removeFavorite(productId: string) {
  const { error } = await supabase.from('favorites').delete().eq('product_id', productId);
  if (error) throw error;
}
