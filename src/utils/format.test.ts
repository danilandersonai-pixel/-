import { fill, formatDate, formatDateTime, formatInteger, formatMeasure, formatNumber, lowerFirst, parseDecimal } from './format';

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

  it('с временем', () => {
    expect(formatDateTime(new Date(2026, 8, 29, 9, 5))).toBe('29.09.2026, 09:05');
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

describe('fill', () => {
  it('подставляет значения, неизвестные ключи оставляет', () => {
    expect(fill('Шаг {step} из {total}', { step: 1, total: 3 })).toBe('Шаг 1 из 3');
    expect(fill('{a} и {b}', { a: 'x' })).toBe('x и {b}');
  });
});

describe('formatMeasure', () => {
  it('убирает лишний ноль после запятой', () => {
    expect(formatMeasure(71)).toBe('71');
    expect(formatMeasure(72.46)).toBe('72,5');
    expect(formatMeasure(71.04)).toBe('71');
  });
});

describe('formatInteger', () => {
  it('разделяет тысячи', () => {
    expect(formatInteger(2100)).toBe('2\u202F100');
    expect(formatInteger(950.6)).toBe('951');
    expect(formatInteger(1234567)).toBe('1\u202F234\u202F567');
    expect(formatInteger(-70)).toBe('−70');
  });
});

describe('lowerFirst', () => {
  it('делает первую букву строчной', () => {
    expect(lowerFirst('По складкам (Jackson–Pollock)')).toBe('по складкам (Jackson–Pollock)');
  });
});
