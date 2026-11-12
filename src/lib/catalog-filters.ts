// Búsqueda, filtros y orden sobre el catálogo guardado en el dispositivo (pantalla Explorar)
import {
  scoreProduct,
  type Factor,
  type Product,
  type ProductAttribute,
  type ProductCategory,
  type UserProfile,
} from '@/scoring';

export type SortBy = 'compatibilidad' | 'precio' | 'nombre';

export type CatalogFilters = {
  query: string;
  category: ProductCategory | null;
  priceMax: number | null;
  /** El producto debe tenerlas todas */
  attributes: ProductAttribute[];
  sortBy: SortBy;
};

export const EMPTY_FILTERS: CatalogFilters = {
  query: '',
  category: null,
  priceMax: null,
  attributes: [],
  sortBy: 'compatibilidad',
};

/** Cuántos filtros hay activos (para el botón «Filtros (2)»); la búsqueda y el orden no cuentan */
export const activeFilterCount = (f: CatalogFilters) =>
  (f.category ? 1 : 0) + (f.priceMax != null ? 1 : 0) + f.attributes.length;

/** Minúsculas y sin acentos, para que «serum» encuentre «Sérum» */
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Producto con su compatibilidad (null si no hay perfil) y la explicación por factor */
export type CatalogItem = { product: Product; score: number | null; factors: Factor[] };

export function filterCatalog(products: Product[], f: CatalogFilters, profile: UserProfile | null): CatalogItem[] {
  const words = normalize(f.query).split(/\s+/).filter(Boolean);

  const items = products
    .filter((p) => p.active !== false)
    .filter((p) => !f.category || p.category === f.category)
    .filter((p) => f.priceMax == null || p.price <= f.priceMax)
    .filter((p) => f.attributes.every((a) => p.attributes.includes(a)))
    .filter((p) => {
      if (words.length === 0) return true;
      const haystack = normalize(`${p.name} ${p.brand}`);
      return words.every((w) => haystack.includes(w));
    })
    .map((product) => {
      const r = profile ? scoreProduct(product, profile) : null;
      return { product, score: r?.score ?? null, factors: r?.factors ?? [] };
    });

  const byName = (a: CatalogItem, b: CatalogItem) => a.product.name.localeCompare(b.product.name, 'es');
  const sorters: Record<SortBy, (a: CatalogItem, b: CatalogItem) => number> = {
    compatibilidad: (a, b) => (b.score ?? -1) - (a.score ?? -1) || a.product.price - b.product.price,
    precio: (a, b) => a.product.price - b.product.price || byName(a, b),
    nombre: byName,
  };
  return items.sort(sorters[f.sortBy]);
}
