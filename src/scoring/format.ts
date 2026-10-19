import type { ProductAttribute, ProductCategory, SkinConcern, SkinType } from './types';

type EnumValue = SkinType | SkinConcern | ProductCategory | ProductAttribute;

const LABELS: Record<EnumValue, string> = {
  // tipos de piel
  seca: 'seca',
  grasa: 'grasa',
  mixta: 'mixta',
  normal: 'normal',
  sensible: 'sensible',
  // objetivos
  acne: 'acné',
  manchas: 'manchas',
  antiedad: 'antiedad',
  hidratacion: 'hidratación',
  poros: 'poros',
  enrojecimiento: 'enrojecimiento',
  luminosidad: 'luminosidad',
  // categorías
  limpiador: 'limpiador',
  tonico: 'tónico',
  serum: 'sérum',
  hidratante: 'hidratante',
  protector_solar: 'protector solar',
  mascarilla: 'mascarilla',
  exfoliante: 'exfoliante',
  contorno_ojos: 'contorno de ojos',
  // características
  vegano: 'vegano',
  cruelty_free: 'cruelty free',
  sin_fragancia: 'sin fragancia',
  sin_alcohol: 'sin alcohol',
  no_comedogenico: 'no comedogénico',
  hipoalergenico: 'hipoalergénico',
};

/** Texto legible de un valor de enum, para mostrar al usuario */
export const label = (value: EnumValue): string => LABELS[value] ?? value;

/** Una sola moneda en el catálogo (supuesto del documento de diseño) */
export const money = (amount: number): string =>
  `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
