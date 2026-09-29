/** Число с запятой: formatNumber(17.708, 1) → «17,7» */
export function formatNumber(value: number, fractionDigits = 1): string {
  const fixed = value.toFixed(fractionDigits);
  // «-0,0» выглядит странно — показываем «0,0»
  const normalized = Number(fixed) === 0 ? fixed.replace('-', '') : fixed;
  return normalized.replace('.', ',');
}

/** Значение замера: до одного знака, без лишнего «,0» — 71 → «71», 72.46 → «72,5» */
export function formatMeasure(value: number): string {
  return formatNumber(value, 1).replace(/,0$/, '');
}

/** Целое с пробелами между тысячами: 2100 → «2 100» (узкий неразрывный пробел) */
export function formatInteger(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '−' : '';
  return sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
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

/** Подставляет значения в шаблон: fill('Шаг {step} из {total}', { step: 1, total: 3 }) → «Шаг 1 из 3» */
export function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match));
}
