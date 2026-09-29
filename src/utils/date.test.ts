import { isoToRuDate, maskDateInput, parseRuDate } from './date';

describe('maskDateInput', () => {
  it('расставляет точки по мере ввода', () => {
    expect(maskDateInput('0')).toBe('0');
    expect(maskDateInput('01')).toBe('01');
    expect(maskDateInput('010')).toBe('01.0');
    expect(maskDateInput('0102')).toBe('01.02');
    expect(maskDateInput('01021990')).toBe('01.02.1990');
  });

  it('убирает лишние символы и обрезает до 8 цифр', () => {
    expect(maskDateInput('01.02.19905')).toBe('01.02.1990');
    expect(maskDateInput('01/02/1990')).toBe('01.02.1990');
  });

  it('при стирании точка исчезает вместе с цифрой', () => {
    expect(maskDateInput('01.')).toBe('01');
  });
});

describe('parseRuDate', () => {
  it('переводит дату в ГГГГ-ММ-ДД', () => {
    expect(parseRuDate('01.02.1990')).toBe('1990-02-01');
    expect(parseRuDate('29.02.2024')).toBe('2024-02-29');
  });

  it('не принимает несуществующие и неполные даты', () => {
    expect(parseRuDate('31.02.1990')).toBeNull();
    expect(parseRuDate('29.02.2023')).toBeNull();
    expect(parseRuDate('01.13.1990')).toBeNull();
    expect(parseRuDate('01.02.19')).toBeNull();
    expect(parseRuDate('01.02.1850')).toBeNull();
    expect(parseRuDate('')).toBeNull();
  });
});

describe('isoToRuDate', () => {
  it('переводит ГГГГ-ММ-ДД в ДД.ММ.ГГГГ', () => {
    expect(isoToRuDate('1990-02-01')).toBe('01.02.1990');
  });
});
