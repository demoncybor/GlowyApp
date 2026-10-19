// Tipos de dominio del motor de compatibilidad (camelCase).
// Los enums salen del esquema de la base para que perfil, producto y base usen los mismos valores.
import type { Database } from '../lib/database.types';

type Enums = Database['public']['Enums'];

export type SkinType = Enums['skin_type'];
export type SkinConcern = Enums['skin_concern'];
export type ProductCategory = Enums['product_category'];
export type ProductAttribute = Enums['product_attribute'];
export type RoutineSlot = Enums['routine_slot'];

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  skinTypes: SkinType[];
  targets: SkinConcern[];
  attributes: ProductAttribute[];
  imagePath?: string | null;
  /** false = dado de baja; no se recomienda */
  active?: boolean;
};

export type UserProfile = {
  skinType: SkinType | null;
  concerns: SkinConcern[];
  budgetMax: number | null;
  preferences: ProductAttribute[];
};

export type RoutineItem = {
  id: string;
  /** null si es un producto propio sin vincular al catálogo */
  productId: string | null;
  customName?: string | null;
  slot: RoutineSlot;
  stepOrder: number;
};

export type FactorKey = 'skin' | 'goals' | 'budget' | 'preferences';

export type Factor = {
  key: FactorKey;
  /** Entre 0 y 1 */
  value: number;
  /** Frase corta que ve el usuario */
  text: string;
};

export type CompatibilityResult = {
  /** Porcentaje 0–100, o null si el perfil no tiene ningún dato */
  score: number | null;
  factors: Factor[];
};

export type Diff =
  | { kind: 'score'; delta: number }
  | { kind: 'price'; delta: number }
  | { kind: 'targets'; items: SkinConcern[] }
  | { kind: 'attributes'; items: ProductAttribute[] };
