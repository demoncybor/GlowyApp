import { describeDiff } from '../compare-text';

describe('describeDiff', () => {
  it('escribe cada diferencia como ventaja o desventaja', () => {
    expect(describeDiff({ kind: 'score', delta: 12 }, 'ventaja')).toBe('Más compatible contigo (+12 puntos)');
    expect(describeDiff({ kind: 'score', delta: 12 }, 'desventaja')).toBe('Menos compatible contigo (−12 puntos)');
    expect(describeDiff({ kind: 'price', delta: 8.5 }, 'ventaja')).toBe('Cuesta $8.50 menos');
    expect(describeDiff({ kind: 'price', delta: 8.5 }, 'desventaja')).toBe('Cuesta $8.50 más');
    expect(describeDiff({ kind: 'targets', items: ['acne', 'poros'] }, 'ventaja')).toBe('Además atiende: acné, poros');
    expect(describeDiff({ kind: 'targets', items: ['acne'] }, 'desventaja')).toBe('No atiende: acné');
    expect(describeDiff({ kind: 'attributes', items: ['sin_fragancia'] }, 'ventaja')).toBe('Cuenta con: sin fragancia');
    expect(describeDiff({ kind: 'attributes', items: ['vegano'] }, 'desventaja')).toBe('No cuenta con: vegano');
  });
});
