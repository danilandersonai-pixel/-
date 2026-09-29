import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';

import type { ColorScheme } from './colors';
import { getThemePreference, subscribeThemePreference } from './themePreference';
import { resolveScheme } from './themePreferenceStore';

/** Текущая тема: выбор в настройках, а при «как в системе» — тема телефона */
export function useColorSchemeName(): ColorScheme {
  const system = useColorScheme();
  const preference = useSyncExternalStore(subscribeThemePreference, getThemePreference);
  return resolveScheme(preference, system);
}
