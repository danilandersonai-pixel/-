import { useColorScheme } from 'react-native';

import type { ColorScheme } from './colors';

/** Текущая тема телефона. Всё, что не «тёмная», считаем светлой. */
export function useColorSchemeName(): ColorScheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
