import { supabase } from '@/lib/supabase';
import type { Product } from '@/scoring';

// Catálogo compacto: solo lo necesario para mostrar la lista y calcular la compatibilidad
const COMPACT = 'id, name, brand, category, price, skin_types, targets, attributes, image_path, active';

// Supabase devuelve como máximo 1000 filas por consulta (api.max_rows), así que se pide por páginas
const PAGE_SIZE = 1000;

export async function listCatalog(): Promise<Product[]> {
  // TODO(fase 4): sincronización incremental con updated_at y caché persistente
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('products')
      .select(COMPACT)
      .eq('active', true)
      .order('id')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return rows.map((r) => ({
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

export const productImageUrl = (path: string) =>
  supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
