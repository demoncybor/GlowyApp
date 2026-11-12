import { label, money } from './format';
import type { Diff } from './types';

/** Convierte una diferencia de la comparativa en la frase que ve el usuario (tabla de la sección 5) */
export function describeDiff(d: Diff, as: 'ventaja' | 'desventaja'): string {
  const good = as === 'ventaja';
  switch (d.kind) {
    case 'score':
      return good ? `Más compatible contigo (+${d.delta} puntos)` : `Menos compatible contigo (−${d.delta} puntos)`;
    case 'price':
      return good ? `Cuesta ${money(d.delta)} menos` : `Cuesta ${money(d.delta)} más`;
    case 'targets':
      return `${good ? 'Además atiende' : 'No atiende'}: ${d.items.map(label).join(', ')}`;
    case 'attributes':
      return `${good ? 'Cuenta con' : 'No cuenta con'}: ${d.items.map(label).join(', ')}`;
  }
}
