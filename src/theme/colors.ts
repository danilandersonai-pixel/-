// Оформление «Энергия» (вариант Б): графит и салатовый акцент.
// Тёмная тема — основная: так смотрится в зале. В светлой салатовый остаётся заливкой
// (кнопка «+», плашки), а текст и главные кнопки — почти чёрные: салатовый текст на белом не читается.
// Контраст всех пар «текст — фон» проверяет тест colors.test.ts.

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
  /** Главный цвет действий: кнопки, активная вкладка, ссылки. Годится и для текста. */
  primary: string;
  /** Текст и иконки поверх primary */
  onPrimary: string;
  /** Мягкая подложка: второстепенные кнопки, выбранные «таблетки» */
  primarySoft: string;
  /** Яркая заливка-акцент (салатовый в обеих темах): «+», ближайшая тренировка, главный показатель */
  accent: string;
  /** Текст и иконки поверх accent */
  onAccent: string;
  /** Улучшение показателя */
  success: string;
  /** Ухудшение показателя, удаление */
  danger: string;
  /** Предупреждения о точности расчёта */
  warning: string;
  /** Линия графиков */
  chartLine: string;
  /** Белки, жиры, углеводы — различаются и по оттенку, и по светлоте */
  macroProtein: string;
  macroFat: string;
  macroCarbs: string;
};

const lime = '#C6F24E';
const ink = '#0C0D0F';

const light: Palette = {
  background: '#F1F2EE',
  surface: '#FFFFFF',
  surfaceMuted: '#E7E9E3',
  border: '#D9DCD4',
  text: ink,
  textSecondary: '#50565F',
  textTertiary: '#686E77',
  primary: ink,
  onPrimary: lime,
  primarySoft: '#E6F4BF',
  accent: lime,
  onAccent: ink,
  success: '#3F6212',
  danger: '#C62828',
  warning: '#A15C07',
  chartLine: '#4D7C0F',
  macroProtein: '#4D7C0F',
  macroFat: '#D97706',
  macroCarbs: '#1D4ED8',
};

const dark: Palette = {
  background: ink,
  surface: '#16181C',
  surfaceMuted: '#1F2227',
  border: '#2A2E35',
  text: '#F2F3F5',
  textSecondary: '#A6ACB6',
  textTertiary: '#8B919B',
  primary: lime,
  onPrimary: ink,
  primarySoft: '#242B14',
  accent: lime,
  onAccent: ink,
  success: lime,
  danger: '#FF6B5B',
  warning: '#FFB547',
  chartLine: lime,
  macroProtein: lime,
  macroFat: '#FF8A3D',
  macroCarbs: '#5AA9FF',
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };
