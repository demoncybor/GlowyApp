import { rank, scoreProduct, type Ranked } from './compatibility';
import type { Product, ProductCategory, RoutineItem, RoutineSlot, UserProfile } from './types';

/** Categorías básicas que debería tener cada momento del día */
export const ESSENTIALS: Record<RoutineSlot, ProductCategory[]> = {
  manana: ['limpiador', 'hidratante', 'protector_solar'],
  noche: ['limpiador', 'hidratante'],
};

/** Puntos mínimos de mejora para sugerir un cambio */
export const UPGRADE_MIN_GAIN = 10;
const SUGGESTIONS_PER_GAP = 3;

export type RoutineGap = { slot: RoutineSlot; category: ProductCategory; suggestions: Ranked[] };
export type RoutineUpgrade = { item: RoutineItem; current: Product; better: Ranked; gain: number };

// Los productos propios (sin productId) no se evalúan: solo cuentan los del catálogo.
// Un producto ya usado en un momento del día sí puede sugerirse para el otro.
export function recommendFromRoutine(
  routine: RoutineItem[],
  catalog: Product[],
  u: UserProfile,
): { gaps: RoutineGap[]; upgrades: RoutineUpgrade[] } {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const ranked = rank(catalog, u);

  const usedIn = (slot: RoutineSlot) =>
    new Set(routine.flatMap((r) => (r.slot === slot && r.productId ? [r.productId] : [])));
  const used: Record<RoutineSlot, Set<string>> = { manana: usedIn('manana'), noche: usedIn('noche') };

  const gaps = (Object.keys(ESSENTIALS) as RoutineSlot[]).flatMap((slot) => {
    const have = new Set([...used[slot]].map((id) => byId.get(id)?.category));
    return ESSENTIALS[slot]
      .filter((category) => !have.has(category))
      .map((category) => ({
        slot,
        category,
        suggestions: ranked
          .filter((r) => r.product.category === category && !used[slot].has(r.product.id))
          .slice(0, SUGGESTIONS_PER_GAP),
      }));
  });

  const upgrades = routine.flatMap((item) => {
    const current = item.productId ? byId.get(item.productId) : undefined;
    if (!current) return [];
    const currentScore = scoreProduct(current, u).score;
    if (currentScore === null) return []; // perfil sin datos: no hay con qué comparar
    const better = ranked.find(
      (r) =>
        r.product.category === current.category &&
        !used[item.slot].has(r.product.id) &&
        r.score - currentScore >= UPGRADE_MIN_GAIN,
    );
    return better ? [{ item, current, better, gain: better.score - currentScore }] : [];
  });

  return { gaps, upgrades };
}
