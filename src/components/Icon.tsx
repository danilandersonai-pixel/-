import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { useTheme, type Palette } from '@/theme';

export type IconName = SymbolViewProps['name'];

type IconProps = {
  name: IconName;
  color?: keyof Palette;
  size?: number;
};

/** Иконка: SF Symbols на iPhone, Material Symbols на Android и в браузере */
export function Icon({ name, color = 'text', size = 24 }: IconProps) {
  const { colors } = useTheme();
  return <SymbolView name={name} tintColor={colors[color]} size={size} />;
}

/** Иконки приложения в одном месте, чтобы не искать имена по экранам */
export const icons = {
  add: { ios: 'plus', android: 'add', web: 'add' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  clients: { ios: 'person.2', android: 'group', web: 'group' },
  searchPerson: { ios: 'person.fill.questionmark', android: 'person_search', web: 'person_search' },
  warning: { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  lock: { ios: 'lock', android: 'lock', web: 'lock' },
  archive: { ios: 'archivebox', android: 'inventory_2', web: 'inventory_2' },
  health: { ios: 'heart.text.square', android: 'monitor_heart', web: 'monitor_heart' },
  measurements: { ios: 'ruler', android: 'straighten', web: 'straighten' },
  workouts: { ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' },
  nutrition: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
  consent: { ios: 'checkmark.seal', android: 'verified', web: 'verified' },
} satisfies Record<string, IconName>;
