import type { Product, UserProfile } from '@/scoring';

import { activeFilterCount, EMPTY_FILTERS, filterCatalog } from '../catalog-filters';

const base: Omit<Product, 'id' | 'name' | 'brand' | 'category' | 'price'> = {
  skinTypes: ['grasa'],
  targets: ['acne'],
  attributes: ['vegano', 'sin_fragancia'],
};

const catalog: Product[] = [
  { ...base, id: 'a', name: 'Sérum de Niacinamida', brand: 'The Ordinary', category: 'serum', price: 12 },
  { ...base, id: 'b', name: 'Gel limpiador', brand: 'CeraVe', category: 'limpiador', price: 18, attributes: ['vegano'] },
  { ...base, id: 'c', name: 'Crema de noche', brand: 'Dermia', category: 'hidratante', price: 65, skinTypes: ['seca'] },
  { ...base, id: 'd', name: 'Serum retirado', brand: 'X', category: 'serum', price: 5, active: false },
];

const user: UserProfile = { skinType: 'grasa', concerns: ['acne'], budgetMax: null, preferences: [] };
const ids = (items: { product: Product }[]) => items.map((i) => i.product.id);

describe('filterCatalog', () => {
  it('sin filtros muestra todo lo activo, ordenado por compatibilidad', () => {
    expect(ids(filterCatalog(catalog, EMPTY_FILTERS, user))).toEqual(['a', 'b', 'c']);
  });

  it('busca por nombre o marca, sin importar acentos ni mayúsculas', () => {
    expect(ids(filterCatalog(catalog, { ...EMPTY_FILTERS, query: 'serum' }, user))).toEqual(['a']);
    expect(ids(filterCatalog(catalog, { ...EMPTY_FILTERS, query: 'cerave' }, user))).toEqual(['b']);
    expect(ids(filterCatalog(catalog, { ...EMPTY_FILTERS, query: 'gel cerave' }, user))).toEqual(['b']);
  });

  it('filtra por categoría, precio máximo y características (todas)', () => {
    expect(ids(filterCatalog(catalog, { ...EMPTY_FILTERS, category: 'limpiador' }, user))).toEqual(['b']);
    expect(ids(filterCatalog(catalog, { ...EMPTY_FILTERS, priceMax: 20 }, user))).toEqual(['a', 'b']);
    expect(ids(filterCatalog(catalog, { ...EMPTY_FILTERS, attributes: ['vegano', 'sin_fragancia'] }, user))).toEqual([
      'a',
      'c',
    ]);
  });

  it('ordena por precio o por nombre', () => {
    expect(ids(filterCatalog(catalog, { ...EMPTY_FILTERS, sortBy: 'precio' }, user))).toEqual(['a', 'b', 'c']);
    expect(ids(filterCatalog(catalog, { ...EMPTY_FILTERS, sortBy: 'nombre' }, user))).toEqual(['c', 'b', 'a']);
  });

  it('calcula la compatibilidad de cada resultado', () => {
    const [first] = filterCatalog(catalog, EMPTY_FILTERS, user);
    expect(first.score).toBe(100);
  });
});

it('activeFilterCount no cuenta la búsqueda ni el orden', () => {
  expect(activeFilterCount({ ...EMPTY_FILTERS, query: 'x', sortBy: 'precio' })).toBe(0);
  expect(activeFilterCount({ ...EMPTY_FILTERS, category: 'serum', priceMax: 30, attributes: ['vegano'] })).toBe(3);
});
