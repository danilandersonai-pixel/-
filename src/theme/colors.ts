export type ColorScheme = 'light' | 'dark';

export type Palette = {
  /** Фон экрана */
  background: string;
  /** Карточки, панели, нижняя панель вкладок */
  surface: string;
  /** Приглушённый фон: подложки иконок, поля ввода */
  surfaceMuted: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  /** Акцентный цвет: кнопки, активная вкладка */
  primary: string;
  /** Текст и иконки поверх акцентного цвета */
  onPrimary: string;
  /** Мягкая подложка акцентного цвета */
  primarySoft: string;
  /** Улучшение показателя */
  success: string;
  /** Ухудшение показателя, удаление */
  danger: string;
  /** Предупреждения о точности расчёта */
  warning: string;
  /** Линия графиков (проверена на контраст и различимость для обеих тем) */
  chartLine: string;
  /** Белки, жиры, углеводы — проверены на различимость, в том числе при нарушениях цветовосприятия */
  macroProtein: string;
  macroFat: string;
  macroCarbs: string;
};

const light: Palette = {
  background: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceMuted: '#ECEEF2',
  border: '#E1E4EA',
  text: '#0F1115',
  textSecondary: '#5B6270',
  textTertiary: '#8C93A0',
  primary: '#4F46E5',
  onPrimary: '#FFFFFF',
  primarySoft: '#ECEBFF',
  success: '#15803D',
  danger: '#DC2626',
  warning: '#B45309',
  chartLine: '#4F46E5',
  macroProtein: '#4F46E5',
  macroFat: '#D97706',
  macroCarbs: '#0D9488',
};

const dark: Palette = {
  background: '#0B0D10',
  surface: '#16191E',
  surfaceMuted: '#20242B',
  border: '#2A2F37',
  text: '#F2F4F7',
  textSecondary: '#A3AAB6',
  textTertiary: '#6E7684',
  primary: '#8B87FF',
  onPrimary: '#0E0D1F',
  primarySoft: '#25234A',
  success: '#4ADE80',
  danger: '#F87171',
  warning: '#FBBF24',
  chartLine: '#8580FA',
  macroProtein: '#8580FA',
  macroFat: '#C07A08',
  macroCarbs: '#0F9E8E',
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };
