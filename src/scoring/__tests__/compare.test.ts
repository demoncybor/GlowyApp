import { compareProducts } from '../compare';
import type { Product, UserProfile } from '../types';

const user: UserProfile = {
  skinType: 'grasa',
  concerns: ['acne', 'poros'],
  budgetMax: 300,
  preferences: ['sin_fragancia'],
};

// a: 100 puntos; b: 50 puntos (piel no apta y 1 de 2 objetivos)
const a: Product = {
  id: 'a',
  name: 'Gel A',
  brand: 'Marca',
  category: 'limpiador',
  price: 200,
  skinTypes: ['grasa'],
  targets: ['acne', 'poros'],
  attributes: ['sin_fragancia', 'vegano'],
};
const b: Product = {
  ...a,
  id: 'b',
  name: 'Gel B',
  price: 150,
  skinTypes: ['seca'],
  targets: ['acne', 'hidratacion'],
  attributes: ['sin_fragancia'],
};

describe('compareProducts', () => {
  const result = compareProducts(a, b, user);

  it('calcula la compatibilidad de cada producto', () => {
    expect(result.a.score).toBe(100);
    expect(result.b.score).toBe(50);
  });

  it('lista las ventajas y desventajas de cada lado', () => {
    expect(result.a.advantages).toEqual([
      { kind: 'score', delta: 50 },
      { kind: 'targets', items: ['poros'] },
      { kind: 'attributes', items: ['vegano'] },
    ]);
    expect(result.a.disadvantages).toEqual([
      { kind: 'price', delta: 50 },
      { kind: 'targets', items: ['hidratacion'] },
    ]);
  });

  it('las ventajas de uno son las desventajas del otro', () => {
    expect(result.b.advantages).toEqual(result.a.disadvantages);
    expect(result.b.disadvantages).toEqual(result.a.advantages);
  });

  it('no muestra diferencias de compatibilidad menores a 5 puntos', () => {
    // precio 310 → 99 puntos contra 100
    const r = compareProducts(a, { ...a, id: 'c', price: 310 }, user);
    expect(r.a.advantages.some((d) => d.kind === 'score')).toBe(false);
  });

  it('redondea la diferencia de precio a centavos', () => {
    const r = compareProducts({ ...a, price: 0.3 }, { ...a, id: 'c', price: 0.1 + 0.2 + 0.1 }, user);
    expect(r.a.advantages).toContainEqual({ kind: 'price', delta: 0.1 });
  });

  it('rechaza productos de distinta categoría', () => {
    expect(() => compareProducts(a, { ...b, category: 'serum' }, user)).toThrow('different_category');
  });
});
