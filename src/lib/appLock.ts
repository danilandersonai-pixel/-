// Вход по Face ID / отпечатку / коду телефона: когда закрывать приложение снова.

/** Свернули меньше чем на минуту (ответить на сообщение, включить музыку) — не спрашиваем снова */
export const RELOCK_AFTER_MS = 60_000;

/** backgroundAt — когда приложение ушло в фон, мс; null — не уходило */
export function shouldRelock(backgroundAt: number | null, now: number): boolean {
  return backgroundAt !== null && now - backgroundAt >= RELOCK_AFTER_MS;
}

/** Включено/выключено в хранилище настроек */
export function parseFlag(raw: string | null): boolean {
  return raw === '1';
}
