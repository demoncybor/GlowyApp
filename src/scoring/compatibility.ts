import { label, money } from './format';
import type { CompatibilityResult, Factor, FactorKey, Product, UserProfile } from './types';

// Pesos propuestos en la sección 5; si los cambias, actualiza las pruebas
export const WEIGHTS: Record<FactorKey, number> = {
  skin: 0.35,
  goals: 0.3,
  budget: 0.2,
  preferences: 0.15,
};

export type CompatibilityLevel = 'alta' | 'media' | 'baja';

/** Rango para el color del badge: 80+ alta, 60–79 media, menos de 60 baja */
export const levelFor = (score: number): CompatibilityLevel =>
  score >= 80 ? 'alta' : score >= 60 ? 'media' : 'baja';

const overlap = <T,>(wanted: T[], have: T[]) => wanted.filter((w) => have.includes(w));

export function scoreProduct(p: Product, u: UserProfile): CompatibilityResult {
  const factors: Factor[] = [];

  if (u.skinType) {
    const known = p.skinTypes.length > 0;
    const fits = p.skinTypes.includes(u.skinType);
    factors.push({
      key: 'skin',
      value: !known ? 0.5 : fits ? 1 : 0,
      text: !known
        ? 'No indica para qué tipo de piel es.'
        : fits
          ? `Es apto para piel ${label(u.skinType)}.`
          : `No está indicado para piel ${label(u.skinType)}.`,
    });
  }

  if (u.concerns.length > 0) {
    const hits = overlap(u.concerns, p.targets);
    factors.push({
      key: 'goals',
      value: hits.length / u.concerns.length,
      text: hits.length
        ? `Atiende ${hits.length} de tus ${u.concerns.length} objetivos: ${hits.map(label).join(', ')}.`
        : 'No atiende ninguno de tus objetivos.',
    });
  }

  if (u.budgetMax != null && u.budgetMax > 0) {
    // 1 dentro del presupuesto; baja lineal hasta 0 cuando cuesta el doble
    const over = Math.max(0, p.price - u.budgetMax);
    factors.push({
      key: 'budget',
      value: Math.max(0, 1 - over / u.budgetMax),
      text: over === 0 ? 'Está dentro de tu presupuesto.' : `Supera tu presupuesto por ${money(over)}.`,
    });
  }

  if (u.preferences.length > 0) {
    const hits = overlap(u.preferences, p.attributes);
    factors.push({
      key: 'preferences',
      value: hits.length / u.preferences.length,
      text: hits.length
        ? `Cumple ${hits.length} de tus ${u.preferences.length} preferencias: ${hits.map(label).join(', ')}.`
        : 'No cumple ninguna de tus preferencias.',
    });
  }

  const totalWeight = factors.reduce((s, f) => s + WEIGHTS[f.key], 0);
  if (totalWeight === 0) return { score: null, factors }; // perfil sin datos: no se puntúa

  const weighted = factors.reduce((s, f) => s + WEIGHTS[f.key] * f.value, 0);
  return { score: Math.round((100 * weighted) / totalWeight), factors };
}

export type Ranked = { product: Product; score: number; factors: Factor[] };

/** Ordena por compatibilidad (desempate: precio menor). Omite productos dados de baja. */
export const rank = (products: Product[], u: UserProfile): Ranked[] =>
  products
    .filter((p) => p.active !== false)
    .flatMap((product) => {
      const r = scoreProduct(product, u);
      return r.score === null ? [] : [{ product, score: r.score, factors: r.factors }];
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);
