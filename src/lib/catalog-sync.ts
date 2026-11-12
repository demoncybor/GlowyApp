import type { Product } from '@/scoring';

/** Catálogo guardado en el dispositivo y la marca updated_at más reciente que ya incluye */
export type CatalogCache = { products: Product[]; syncedAt: string | null };

export type CatalogChange = Product & { updatedAt: string };

/**
 * Aplica al catálogo guardado los productos nuevos o cambiados desde la última sincronización.
 * Los productos dados de baja (active = false) se quitan.
 */
export function mergeCatalog(cache: CatalogCache | undefined, changes: CatalogChange[]): CatalogCache {
  const byId = new Map((cache?.products ?? []).map((p) => [p.id, p]));
  let syncedAt = cache?.syncedAt ?? null;

  for (const { updatedAt, ...product } of changes) {
    if (product.active === false) byId.delete(product.id);
    else byId.set(product.id, product);
    if (!syncedAt || updatedAt > syncedAt) syncedAt = updatedAt;
  }
  return { products: [...byId.values()], syncedAt };
}
