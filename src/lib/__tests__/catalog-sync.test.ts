import type { Product } from '@/scoring';

import { mergeCatalog, type CatalogChange } from '../catalog-sync';

const product = (id: string, overrides: Partial<Product> = {}): Product => ({
  id,
  name: `Producto ${id}`,
  brand: 'Marca',
  category: 'serum',
  price: 10,
  skinTypes: [],
  targets: [],
  attributes: [],
  active: true,
  ...overrides,
});
const change = (p: Product, updatedAt: string): CatalogChange => ({ ...p, updatedAt });

describe('mergeCatalog', () => {
  it('la primera sincronización guarda todo y la marca más reciente', () => {
    const r = mergeCatalog(undefined, [change(product('a'), '2026-11-01T00:00:00Z'), change(product('b'), '2026-11-03T00:00:00Z')]);
    expect(r.products.map((p) => p.id)).toEqual(['a', 'b']);
    expect(r.syncedAt).toBe('2026-11-03T00:00:00Z');
  });

  it('actualiza productos cambiados, agrega nuevos y quita los dados de baja', () => {
    const cache = { products: [product('a'), product('b'), product('c')], syncedAt: '2026-11-03T00:00:00Z' };
    const r = mergeCatalog(cache, [
      change(product('a', { price: 99 }), '2026-11-04T00:00:00Z'),
      change(product('b', { active: false }), '2026-11-05T00:00:00Z'),
      change(product('d'), '2026-11-04T12:00:00Z'),
    ]);
    expect(r.products.map((p) => [p.id, p.price])).toEqual([
      ['a', 99],
      ['c', 10],
      ['d', 10],
    ]);
    expect(r.syncedAt).toBe('2026-11-05T00:00:00Z');
  });

  it('sin cambios conserva el catálogo y la marca', () => {
    const cache = { products: [product('a')], syncedAt: '2026-11-03T00:00:00Z' };
    expect(mergeCatalog(cache, [])).toEqual(cache);
  });
});
