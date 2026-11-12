/** Convierte lo que escribe el usuario en un monto válido, o null si está vacío o no es positivo */
export const parseBudget = (text: string): number | null => {
  const n = Number(text.replace(',', '.').trim());
  return text.trim() !== '' && Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
};
