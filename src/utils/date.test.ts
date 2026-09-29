import { addDays, ageOn, isoToRuDate, maskDateInput, maskTimeInput, parseRuDate, parseTime, toIsoDate } from './date';

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

describe('toIsoDate', () => {
  it('берёт местную дату', () => {
    expect(toIsoDate(new Date(2026, 8, 5, 23, 59))).toBe('2026-09-05');
  });
});

describe('ageOn', () => {
  it('считает полные годы на дату', () => {
    expect(ageOn('1990-02-01', '2026-09-29')).toBe(36);
    expect(ageOn('1990-10-01', '2026-09-29')).toBe(35);
    expect(ageOn('1990-09-29', '2026-09-29')).toBe(36);
    expect(ageOn('1990-09-30', '2026-09-29')).toBe(35);
  });

  it('родившиеся 29 февраля взрослеют 1 марта в невисокосный год', () => {
    expect(ageOn('2000-02-29', '2025-02-28')).toBe(24);
    expect(ageOn('2000-02-29', '2025-03-01')).toBe(25);
  });
});

describe('время', () => {
  it('маска и разбор времени', () => {
    expect(maskTimeInput('18')).toBe('18');
    expect(maskTimeInput('183')).toBe('18:3');
    expect(maskTimeInput('18305')).toBe('18:30');
    expect(parseTime('18:30')).toBe('18:30');
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('18:3')).toBeNull();
  });

  it('сдвиг даты через месяц', () => {
    expect(addDays('2026-09-29', 3)).toBe('2026-10-02');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});
