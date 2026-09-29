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
