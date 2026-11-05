/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  // En SDK 58 el esquema puede ser null; todo lo que no sea "dark" usa el tema claro
  const theme = scheme === 'dark' ? 'dark' : 'light';

  return Colors[theme];
}
