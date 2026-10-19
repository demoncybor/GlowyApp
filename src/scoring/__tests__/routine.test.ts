import { recommendFromRoutine } from '../routine';
import type { Product, RoutineItem, UserProfile } from '../types';

const user: UserProfile = {
  skinType: 'grasa',
  concerns: ['acne', 'poros'],
  budgetMax: 300,
  preferences: ['sin_fragancia'],
};

const base: Omit<Product, 'id' | 'category'> = {
  name: 'Producto',
  brand: 'Marca',
  price: 200,
  skinTypes: ['grasa'],
  targets: ['acne', 'poros'],
  attributes: ['sin_fragancia'],
};

const cleanser: Product = { ...base, id: 'c1', category: 'limpiador' }; // 100
const worseCleanser: Product = { ...base, id: 'c2', category: 'limpiador', skinTypes: ['seca'] }; // 65
const moisturizer: Product = { ...base, id: 'h1', category: 'hidratante' }; // 100
const sunscreen: Product = { ...base, id: 's1', category: 'protector_solar' }; // 100
const oldSunscreen: Product = { ...base, id: 's2', category: 'protector_solar', active: false };

const catalog = [cleanser, worseCleanser, moisturizer, sunscreen, oldSunscreen];

const routine: RoutineItem[] = [
  { id: 'r1', productId: 'c2', slot: 'manana', stepOrder: 0 },
  { id: 'r2', productId: 'h1', slot: 'manana', stepOrder: 1 },
  { id: 'r3', productId: null, customName: 'Mi limpiador', slot: 'noche', stepOrder: 0 },
];

const ids = (list: { product: Product }[]) => list.map((r) => r.product.id);

describe('recommendFromRoutine: huecos', () => {
  const { gaps } = recommendFromRoutine(routine, catalog, user);

  it('detecta las categorías básicas que faltan en cada momento del día', () => {
    expect(gaps.map((g) => `${g.slot}:${g.category}`)).toEqual([
      'manana:protector_solar',
      'noche:limpiador',
      'noche:hidratante',
    ]);
  });

  it('no sugiere productos dados de baja', () => {
    expect(ids(gaps[0].suggestions)).toEqual(['s1']);
  });

  it('los productos propios no llenan huecos (no se evalúan)', () => {
    expect(ids(gaps[1].suggestions)).toEqual(['c1', 'c2']);
  });

  it('sugiere para la noche un producto que ya se usa en la mañana', () => {
    expect(ids(gaps[2].suggestions)).toEqual(['h1']);
  });

  it('limita las sugerencias a tres por hueco', () => {
    const many = Array.from({ length: 5 }, (_, i): Product => ({ ...sunscreen, id: `s${i + 10}` }));
    const r = recommendFromRoutine([], many, user);
    expect(r.gaps.find((g) => g.slot === 'manana' && g.category === 'protector_solar')?.suggestions).toHaveLength(3);
  });
});

describe('recommendFromRoutine: mejoras', () => {
  it('sugiere un producto de la misma categoría con 10 puntos o más de mejora', () => {
    const { upgrades } = recommendFromRoutine(routine, catalog, user);
    expect(upgrades).toHaveLength(1);
    expect(upgrades[0].item.id).toBe('r1');
    expect(upgrades[0].better.product.id).toBe('c1');
    expect(upgrades[0].gain).toBe(35);
  });

  it('no sugiere mejoras de menos de 10 puntos', () => {
    // precio 330 con presupuesto 300 → 98 puntos; el mejor tiene 100
    const almost: Product = { ...cleanser, id: 'c3', price: 330 };
    const r = recommendFromRoutine(
      [{ id: 'r1', productId: 'c3', slot: 'manana', stepOrder: 0 }],
      [cleanser, almost],
      user,
    );
    expect(r.upgrades).toEqual([]);
  });

  it('con un perfil vacío no hay sugerencias ni mejoras', () => {
    const empty: UserProfile = { skinType: null, concerns: [], budgetMax: null, preferences: [] };
    const r = recommendFromRoutine(routine, catalog, empty);
    expect(r.upgrades).toEqual([]);
    expect(r.gaps.every((g) => g.suggestions.length === 0)).toBe(true);
  });
});
