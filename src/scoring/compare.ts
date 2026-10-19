import { scoreProduct } from './compatibility';
import type { Diff, Product, UserProfile } from './types';

/** Diferencia mínima de compatibilidad para mostrarla como ventaja */
export const MIN_SCORE_GAP = 5;

const roundMoney = (n: number) => Math.round(n * 100) / 100;

// Lo que x tiene mejor que y
function betterThan(x: Product, y: Product, sx: number | null, sy: number | null): Diff[] {
  const out: Diff[] = [];
  if (sx !== null && sy !== null && sx - sy >= MIN_SCORE_GAP) out.push({ kind: 'score', delta: sx - sy });
  if (x.price < y.price) out.push({ kind: 'price', delta: roundMoney(y.price - x.price) });
  const targets = x.targets.filter((t) => !y.targets.includes(t));
  if (targets.length) out.push({ kind: 'targets', items: targets });
  const attributes = x.attributes.filter((a) => !y.attributes.includes(a));
  if (attributes.length) out.push({ kind: 'attributes', items: attributes });
  return out;
}

export type CompareSide = {
  product: Product;
  score: number | null;
  advantages: Diff[];
  disadvantages: Diff[];
};

/** Solo compara productos de la misma categoría («dos productos similares») */
export function compareProducts(a: Product, b: Product, u: UserProfile): { a: CompareSide; b: CompareSide } {
  if (a.category !== b.category) throw new Error('different_category');
  const sa = scoreProduct(a, u).score;
  const sb = scoreProduct(b, u).score;
  return {
    a: { product: a, score: sa, advantages: betterThan(a, b, sa, sb), disadvantages: betterThan(b, a, sb, sa) },
    b: { product: b, score: sb, advantages: betterThan(b, a, sb, sa), disadvantages: betterThan(a, b, sa, sb) },
  };
}
