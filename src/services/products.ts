import { supabase } from '@/lib/supabase';
import type { Product } from '@/scoring';

// Catálogo compacto: solo lo necesario para mostrar la lista y calcular la compatibilidad
const COMPACT = 'id, name, brand, category, price, skin_types, targets, attributes, image_path, active';

export async function listCatalog(): Promise<Product[]> {
  // TODO(fase 4): sincronización incremental con updated_at y caché persistente
  const { data, error } = await supabase.from('products').select(COMPACT).eq('active', true).limit(1000);
  if (error) throw error;
  return data.map((r) => ({
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
