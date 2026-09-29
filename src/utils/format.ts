/** Число с запятой: formatNumber(17.708, 1) → «17,7» */
export function formatNumber(value: number, fractionDigits = 1): string {
  const fixed = value.toFixed(fractionDigits);
  // «-0,0» выглядит странно — показываем «0,0»
  const normalized = Number(fixed) === 0 ? fixed.replace('-', '') : fixed;
  return normalized.replace('.', ',');
}

/** Дата в формате ДД.ММ.ГГГГ */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

/**
 * Число из поля ввода. Понимает и запятую, и точку: «72,5» и «72.5» → 72.5.
 * Пустая строка или мусор → null.
 */
export function parseDecimal(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }
  return Number(normalized);
}
