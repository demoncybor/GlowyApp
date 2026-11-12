import type { Product, Ranked } from '@/scoring';

import {
  applyQualityFilters,
  countByCategory,
  filterRecommendations,
  NO_RECOMMENDATION_FILTERS,
} from '../recommendation-filters';

const item = (id: string, category: Product['category'], price: number, score: number): Ranked => ({
  product: { id, name: id, brand: 'M', category, price, skinTypes: [], targets: [], attributes: [] },
  score,
  factors: [],
});

const ranked = [
  item('a', 'serum', 20, 95),
  item('b', 'serum', 80, 85),
  item('c', 'limpiador', 15, 70),
  item('d', 'protector_solar', 40, 80),
];
const ids = (list: Ranked[]) => list.map((r) => r.product.id);

describe('filterRecommendations', () => {
  it('sin filtros devuelve todo en el mismo orden', () => {
    expect(ids(filterRecommendations(ranked, NO_RECOMMENDATION_FILTERS, 50))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('filtra por categoría', () => {
    expect(ids(filterRecommendations(ranked, { ...NO_RECOMMENDATION_FILTERS, category: 'serum' }, 50))).toEqual(['a', 'b']);
  });

  it('«dentro de mi presupuesto» incluye el precio exacto del presupuesto', () => {
    const f = { ...NO_RECOMMENDATION_FILTERS, withinBudget: true };
    expect(ids(filterRecommendations(ranked, f, 40))).toEqual(['a', 'c', 'd']);
  });

  it('«dentro de mi presupuesto» no filtra si el perfil no tiene presupuesto', () => {
    const f = { ...NO_RECOMMENDATION_FILTERS, withinBudget: true };
    expect(ids(filterRecommendations(ranked, f, null))).toEqual(['a', 'b', 'c', 'd']);
  });

  it('«compatibilidad alta» deja 80% o más', () => {
    const f = { ...NO_RECOMMENDATION_FILTERS, highOnly: true };
    expect(ids(filterRecommendations(ranked, f, null))).toEqual(['a', 'b', 'd']);
  });

  it('combina los tres filtros', () => {
    const f = { category: 'serum' as const, withinBudget: true, highOnly: true };
    expect(ids(filterRecommendations(ranked, f, 50))).toEqual(['a']);
  });
});

it('countByCategory cuenta lo que queda después de los demás filtros', () => {
  const rest = applyQualityFilters(ranked, { ...NO_RECOMMENDATION_FILTERS, highOnly: true }, null);
  expect(Object.fromEntries(countByCategory(rest))).toEqual({ serum: 2, protector_solar: 1 });
});
