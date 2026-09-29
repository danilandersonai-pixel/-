/**
 * Русское склонение по числу: pluralRu(5, ['подопечный', 'подопечных', 'подопечных']) → «подопечных».
 * Формы: [для 1, для 2–4, для 5–20].
 */
export function pluralRu(count: number, forms: readonly [string, string, string]): string {
  const n = Math.abs(count) % 100;
  const lastDigit = n % 10;
  if (n > 10 && n < 20) {
    return forms[2];
  }
  if (lastDigit === 1) {
    return forms[0];
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return forms[1];
  }
  return forms[2];
}
