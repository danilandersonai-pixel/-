import { parseThemePreference, resolveScheme } from './themePreferenceStore';

describe('выбор темы', () => {
  it('итоговая тема: выбор тренера, затем просмотрщик, затем телефон', () => {
    expect(resolveScheme('dark', 'light')).toBe('dark');
    expect(resolveScheme('light', 'dark', 'dark')).toBe('light');
    expect(resolveScheme('system', 'dark')).toBe('dark');
    expect(resolveScheme('system', 'light', 'dark')).toBe('dark');
    expect(resolveScheme('system', null)).toBe('light');
  });

  it('неизвестное значение — «авто»', () => {
    expect(parseThemePreference('dark')).toBe('dark');
    expect(parseThemePreference('мусор')).toBe('system');
    expect(parseThemePreference(null)).toBe('system');
  });
});
