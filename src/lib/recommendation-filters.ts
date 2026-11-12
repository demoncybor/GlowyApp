// Filtros de la pestaña Para ti, sobre la lista ya ordenada por compatibilidad
import type { ProductCategory, Ranked } from '@/scoring';

/** Desde este porcentaje la compatibilidad es «alta» (mismo umbral que el color del badge) */
export const HIGH_SCORE = 80;

export type RecommendationFilters = {
  category: ProductCategory | null;
  /** Ocultar lo que cuesta más que el presupuesto máximo del perfil */
  withinBudget: boolean;
  /** Solo productos con compatibilidad alta */
  highOnly: boolean;
};

export const NO_RECOMMENDATION_FILTERS: RecommendationFilters = {
  category: null,
  withinBudget: false,
  highOnly: false,
};

/** Aplica presupuesto y compatibilidad alta (sin categoría); sirve para contar por categoría */
export function applyQualityFilters(ranked: Ranked[], f: RecommendationFilters, budgetMax: number | null): Ranked[] {
  return ranked
    .filter((r) => !f.withinBudget || budgetMax == null || r.product.price <= budgetMax)
    .filter((r) => !f.highOnly || r.score >= HIGH_SCORE);
}

/** Cuántos productos quedan en cada categoría con los demás filtros aplicados */
export function countByCategory(ranked: Ranked[]): Map<ProductCategory, number> {
  const counts = new Map<ProductCategory, number>();
  for (const r of ranked) counts.set(r.product.category, (counts.get(r.product.category) ?? 0) + 1);
  return counts;
}

export function filterRecommendations(ranked: Ranked[], f: RecommendationFilters, budgetMax: number | null): Ranked[] {
  const rest = applyQualityFilters(ranked, f, budgetMax);
  return f.category ? rest.filter((r) => r.product.category === f.category) : rest;
}
