import { palettes, type ColorScheme, type Palette } from './colors';
import { minTouchSize, radius, spacing } from './layout';
import { typography } from './typography';
import { useColorSchemeName } from './useColorSchemeName';

export { palettes, minTouchSize, radius, spacing, typography, useColorSchemeName };
export type { ColorScheme, Palette };
export type { TypographyVariant } from './typography';

/** Цвета и размеры для текущей темы. Экраны берут цвета только отсюда. */
export function useTheme() {
  const scheme = useColorSchemeName();
  return { scheme, colors: palettes[scheme], spacing, radius, typography };
}
