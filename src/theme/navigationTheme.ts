import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

import { palettes, type ColorScheme } from './colors';

/** Тема для навигации (фон экранов, заголовки, панель вкладок) из наших цветов */
export function getNavigationTheme(scheme: ColorScheme): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = palettes[scheme];
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };
}
