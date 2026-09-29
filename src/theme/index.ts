import { useColorScheme } from 'react-native';

import { palettes, type ColorScheme, type Palette } from './colors';
import { minTouchSize, radius, spacing } from './layout';
import { typography } from './typography';

export { palettes, minTouchSize, radius, spacing, typography };
export type { ColorScheme, Palette };
export type { TypographyVariant } from './typography';

/** Текущая тема телефона. Всё, что не «тёмная», считаем светлой. */
export function useColorSchemeName(): ColorScheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

/** Цвета и размеры для текущей темы. Экраны берут цвета только отсюда. */
export function useTheme() {
  const scheme = useColorSchemeName();
  return { scheme, colors: palettes[scheme], spacing, radius, typography };
}
