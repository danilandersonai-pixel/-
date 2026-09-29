import { createPreferenceStore, resolveScheme } from './themePreferenceStore';

describe('выбор темы', () => {
  it('итоговая тема: выбор тренера, затем просмотрщик, затем телефон', () => {
    expect(resolveScheme('dark', 'light')).toBe('dark');
    expect(resolveScheme('light', 'dark', 'dark')).toBe('light');
    expect(resolveScheme('system', 'dark')).toBe('dark');
    expect(resolveScheme('system', 'light', 'dark')).toBe('dark');
    expect(resolveScheme('system', null)).toBe('light');
  });

  it('сохраняет выбор, сообщает подписчикам, переживает сломанное хранилище', () => {
    let saved: string | null = 'мусор';
    const store = createPreferenceStore({ read: () => saved, write: (v) => (saved = v) });
    expect(store.getThemePreference()).toBe('system');
    const seen: string[] = [];
    const unsubscribe = store.subscribeThemePreference(() => seen.push(store.getThemePreference()));
    store.setThemePreference('dark');
    unsubscribe();
    store.setThemePreference('light');
    expect(seen).toEqual(['dark']);
    expect(saved).toBe('light');

    const broken = createPreferenceStore({
      read: () => {
        throw new Error('нет доступа');
      },
      write: () => {
        throw new Error('нет доступа');
      },
    });
    expect(broken.getThemePreference()).toBe('system');
    broken.setThemePreference('dark');
    expect(broken.getThemePreference()).toBe('dark');
  });
});
