import type { CatalogChange } from '@/lib/catalog-sync';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/scoring';

export type ProductDetail = Product & {
  description: string | null;
  sizeLabel: string | null;
  keyIngredients: string[];
};

// Catálogo compacto: solo lo necesario para mostrar la lista y calcular la compatibilidad
const COMPACT = 'id, name, brand, category, price, skin_types, targets, attributes, image_path, active, updated_at';

// Supabase devuelve como máximo 1000 filas por consulta (api.max_rows), así que se pide por páginas
const PAGE_SIZE = 1000;

/**
 * Sincronización incremental: sin `since` trae todo el catálogo activo; con `since` trae solo lo
 * creado o cambiado después de esa marca, incluidos los productos dados de baja (para quitarlos de la caché).
 */
export async function listCatalogChanges(since: string | null): Promise<CatalogChange[]> {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let q = supabase.from('products').select(COMPACT);
    q = since ? q.gt('updated_at', since) : q.eq('active', true);
    const { data, error } = await q.order('updated_at').order('id').range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return rows.map((r) => ({
    updatedAt: r.updated_at,
    id: r.id,
    name: r.name,
    brand: r.brand,
    category: r.category,
    price: r.price,
    skinTypes: r.skin_types,
    targets: r.targets,
    attributes: r.attributes,
    imagePath: r.image_path,
    active: r.active,
  }));
}

/** Producto completo, para la pantalla de detalle */
export async function getProduct(id: string): Promise<ProductDetail> {
  const { data: r, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return {
    id: r.id,
    name: r.name,
    brand: r.brand,
    category: r.category,
    price: r.price,
    skinTypes: r.skin_types,
    targets: r.targets,
    attributes: r.attributes,
    imagePath: r.image_path,
    active: r.active,
    description: r.description,
    sizeLabel: r.size_label,
    keyIngredients: r.key_ingredients,
  };
}

export const productImageUrl = (path: string) =>
  supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
