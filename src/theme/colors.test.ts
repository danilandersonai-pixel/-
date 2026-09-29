import { palettes, type Palette } from './colors';
import { contrastRatio } from './contrast';

/** Какой цвет на каком фоне встречается в интерфейсе и какой контраст ему нужен */
const pairs: [keyof Palette, keyof Palette, number][] = [
  ['text', 'background', 4.5],
  ['text', 'surface', 4.5],
  ['text', 'primarySoft', 4.5],
  ['textSecondary', 'background', 4.5],
  ['textSecondary', 'surface', 4.5],
  ['textSecondary', 'surfaceMuted', 4.5],
  ['textTertiary', 'background', 4.5],
  ['textTertiary', 'surface', 4.5],
  ['primary', 'background', 4.5],
  ['primary', 'surface', 4.5],
  ['primary', 'primarySoft', 4.5],
  ['onPrimary', 'primary', 4.5],
  ['onAccent', 'accent', 4.5],
  ['success', 'surface', 4.5],
  ['success', 'background', 4.5],
  ['danger', 'surface', 4.5],
  ['warning', 'surface', 4.5],
  ['chartLine', 'surface', 3],
  ['macroProtein', 'surface', 3],
  ['macroFat', 'surface', 3],
  ['macroCarbs', 'surface', 3],
];

describe('контраст цветов темы', () => {
  it('контрольные значения', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  for (const [scheme, palette] of Object.entries(palettes)) {
    it(`${scheme === 'dark' ? 'тёмная' : 'светлая'} тема: все пары читаются`, () => {
      const failing = pairs
        .map(([fg, bg, min]) => ({ pair: `${fg} на ${bg}`, ratio: contrastRatio(palette[fg], palette[bg]), min }))
        .filter(({ ratio, min }) => ratio < min)
        .map(({ pair, ratio }) => `${pair}: ${ratio.toFixed(2)}`);
      expect(failing).toEqual([]);
    });
  }
});
