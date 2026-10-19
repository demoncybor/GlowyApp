import { levelFor, rank, scoreProduct } from '../compatibility';
import { label, money } from '../format';
import type { Product, UserProfile } from '../types';

const user: UserProfile = {
  skinType: 'grasa',
  concerns: ['acne', 'poros'],
  budgetMax: 300,
  preferences: ['sin_fragancia'],
};

const product: Product = {
  id: 'p1',
  name: 'Gel limpiador',
  brand: 'Marca',
  category: 'limpiador',
  price: 200,
  skinTypes: ['grasa'],
  targets: ['acne', 'poros'],
  attributes: ['sin_fragancia'],
};

describe('scoreProduct', () => {
  it('da 100 cuando cumple todos los factores', () => {
    expect(scoreProduct(product, user).score).toBe(100);
  });

  it('da 65 si el tipo de piel no coincide (pierde el peso 0.35)', () => {
    expect(scoreProduct({ ...product, skinTypes: ['seca'] }, user).score).toBe(65);
  });

  it('baja el factor de presupuesto de forma lineal al superarlo', () => {
    // precio 450 con presupuesto 300: factor 0.5 → 100 × (0.35 + 0.30 + 0.20×0.5 + 0.15) = 90
    expect(scoreProduct({ ...product, price: 450 }, user).score).toBe(90);
  });

  it('el factor de presupuesto llega a 0 cuando cuesta el doble o más', () => {
    // 100 × (0.35 + 0.30 + 0 + 0.15) = 80
    expect(scoreProduct({ ...product, price: 600 }, user).score).toBe(80);
    expect(scoreProduct({ ...product, price: 900 }, user).score).toBe(80);
  });

  it('un precio igual al presupuesto cuenta como dentro', () => {
    const r = scoreProduct({ ...product, price: 300 }, user);
    expect(r.score).toBe(100);
    expect(r.factors.find((f) => f.key === 'budget')?.text).toBe('Está dentro de tu presupuesto.');
  });

  it('cuenta objetivos y preferencias de forma parcial', () => {
    // objetivos 1/2 → 100 × (0.35 + 0.30×0.5 + 0.20 + 0.15) = 85
    expect(scoreProduct({ ...product, targets: ['acne'] }, user).score).toBe(85);
    // preferencias 0/1 → 100 × (0.35 + 0.30 + 0.20 + 0) = 85
    expect(scoreProduct({ ...product, attributes: [] }, user).score).toBe(85);
  });

  it('reparte los pesos entre los factores que sí tienen datos', () => {
    const onlySkin: UserProfile = { skinType: 'grasa', concerns: [], budgetMax: null, preferences: [] };
    expect(scoreProduct(product, onlySkin).score).toBe(100);
    expect(scoreProduct({ ...product, skinTypes: [] }, onlySkin).score).toBe(50); // producto sin dato
  });

  it('devuelve null con un perfil vacío', () => {
    const empty: UserProfile = { skinType: null, concerns: [], budgetMax: null, preferences: [] };
    expect(scoreProduct(product, empty).score).toBeNull();
  });

  it('incluye una explicación por factor aplicable', () => {
    expect(scoreProduct(product, user).factors).toHaveLength(4);
  });

  it('explica cada factor en lenguaje simple', () => {
    const texts = scoreProduct({ ...product, price: 350, targets: ['acne'] }, user).factors.map((f) => f.text);
    expect(texts).toEqual([
      'Es apto para piel grasa.',
      'Atiende 1 de tus 2 objetivos: acné.',
      'Supera tu presupuesto por $50.',
      'Cumple 1 de tus 1 preferencias: sin fragancia.',
    ]);
  });
});

describe('rank', () => {
  it('ordena por puntaje y desempata por precio menor', () => {
    const cheap = { ...product, id: 'cheap', price: 100 };
    const worse = { ...product, id: 'worse', skinTypes: ['seca'] as Product['skinTypes'] };
    expect(rank([worse, product, cheap], user).map((r) => r.product.id)).toEqual(['cheap', 'p1', 'worse']);
  });

  it('omite los productos dados de baja', () => {
    const inactive = { ...product, id: 'off', active: false };
    expect(rank([inactive, product], user).map((r) => r.product.id)).toEqual(['p1']);
  });

  it('devuelve una lista vacía con un perfil vacío', () => {
    const empty: UserProfile = { skinType: null, concerns: [], budgetMax: null, preferences: [] };
    expect(rank([product], empty)).toEqual([]);
  });
});

describe('levelFor', () => {
  it('usa los rangos del badge', () => {
    expect([100, 80, 79, 60, 59, 0].map(levelFor)).toEqual(['alta', 'alta', 'media', 'media', 'baja', 'baja']);
  });
});

describe('format', () => {
  it('muestra etiquetas legibles y precios', () => {
    expect(label('protector_solar')).toBe('protector solar');
    expect(label('acne')).toBe('acné');
    expect(money(50)).toBe('$50');
    expect(money(12.5)).toBe('$12.50');
  });
});
