import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';

import type { ColorScheme } from './colors';
import { getThemePreference, subscribeThemePreference } from './themePreference';
import { resolveScheme } from './themePreferenceStore';

// В браузере тему можно выбрать явно атрибутом data-theme на <html>
// (так делает просмотрщик артефактов). Выбор в настройках приложения важнее.
function readForcedScheme(): string | null {
  return document.documentElement.getAttribute('data-theme');
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

export function useColorSchemeName(): ColorScheme {
  const system = useColorScheme();
  const forced = useSyncExternalStore(subscribe, readForcedScheme, () => null);
  const preference = useSyncExternalStore(subscribeThemePreference, getThemePreference);
  return resolveScheme(preference, system, forced);
}
