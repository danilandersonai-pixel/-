import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';

import type { ColorScheme } from './colors';

// В браузере тему можно выбрать явно атрибутом data-theme на <html>
// (так делает просмотрщик артефактов). Без атрибута — тема системы.
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
  if (forced === 'dark' || forced === 'light') {
    return forced;
  }
  return system === 'dark' ? 'dark' : 'light';
}
