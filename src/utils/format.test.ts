import { formatDate, formatNumber, parseDecimal } from './format';

describe('formatNumber', () => {
  it('ставит запятую вместо точки', () => {
    expect(formatNumber(17.708, 1)).toBe('17,7');
    expect(formatNumber(57.61, 2)).toBe('57,61');
  });

  it('округляет до нужного числа знаков', () => {
    expect(formatNumber(22.857)).toBe('22,9');
    expect(formatNumber(70, 0)).toBe('70');
  });

  it('не показывает «-0»', () => {
    expect(formatNumber(-0.01, 1)).toBe('0,0');
  });
});

describe('formatDate', () => {
  it('форматирует как ДД.ММ.ГГГГ', () => {
    expect(formatDate(new Date(2026, 8, 5))).toBe('05.09.2026');
    expect(formatDate(new Date(2025, 11, 31))).toBe('31.12.2025');
  });
});

describe('parseDecimal', () => {
  it('понимает запятую и точку', () => {
    expect(parseDecimal('72,5')).toBe(72.5);
    expect(parseDecimal('72.5')).toBe(72.5);
    expect(parseDecimal(' 80 ')).toBe(80);
  });

  it('возвращает null для пустого и неверного ввода', () => {
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('7,2,5')).toBeNull();
  });
});
