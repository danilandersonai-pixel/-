/**
 * Маска ввода даты: оставляет цифры и расставляет точки — «01021990» → «01.02.1990».
 * Точка появляется только перед следующей цифрой, поэтому стирание работает как обычно.
 */
export function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join('.');
}

/** «ДД.ММ.ГГГГ» → «ГГГГ-ММ-ДД». Несуществующая дата (31.02) или неполный ввод → null. */
export function parseRuDate(text: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text.trim());
  if (!match) {
    return null;
  }
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (year < 1900 || year > 2100) {
    return null;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

/** «ГГГГ-ММ-ДД» → «ДД.ММ.ГГГГ» */
export function isoToRuDate(iso: string): string {
  const [yyyy, mm, dd] = iso.split('-');
  return `${dd}.${mm}.${yyyy}`;
}

/** Дата как «ГГГГ-ММ-ДД» по местному времени телефона */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Полных лет на дату `onIso` (обе даты — «ГГГГ-ММ-ДД»).
 * Для формул возраст считаем на дату замера, а не на сегодня.
 */
export function ageOn(birthIso: string, onIso: string): number {
  const [by, bm, bd] = birthIso.split('-').map(Number);
  const [y, m, d] = onIso.split('-').map(Number);
  const hadBirthday = m > bm || (m === bm && d >= bd);
  return y - by - (hadBirthday ? 0 : 1);
}

/** Маска времени: «1830» → «18:30» */
export function maskTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

/** «18:30» → «18:30», неверное время → null */
export function parseTime(text: string): string | null {
  const match = /^(\d{2}):(\d{2})$/.exec(text.trim());
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
    return null;
  }
  return `${match[1]}:${match[2]}`;
}

/** Сдвиг даты «ГГГГ-ММ-ДД» на n дней */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
}
