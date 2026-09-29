// Анкета готовности к физическим нагрузкам — по общим вопросам PAR-Q+ (2023).
// Итог не храним: он считается из ответов, как и все расчёты в приложении.

import { daysBetween } from '@/utils/date';

/** Версия текста вопросов. Если вопросы поменяются — новая версия, старые анкеты останутся понятными. */
export const PARQ_VERSION = 'parq-plus-2023-ru-1';

/** Анкету советуют проходить заново раз в год и после любых изменений здоровья */
export const PARQ_VALID_DAYS = 365;

export const parqQuestions = ['heart', 'chestPain', 'dizziness', 'chronic', 'medication', 'joints', 'supervised'] as const;

export type ParqQuestion = (typeof parqQuestions)[number];

/** Ответ «Да» — true, «Нет» — false; нет ключа — вопрос ещё без ответа */
export type ParqAnswers = Partial<Record<ParqQuestion, boolean>>;

export type ParqResult = {
  /** ready — все «Нет»; doctor — есть «Да»; incomplete — ответы не на все вопросы */
  kind: 'ready' | 'doctor' | 'incomplete';
  answered: number;
  total: number;
  /** Вопросы с ответом «Да», в порядке анкеты */
  yes: ParqQuestion[];
};

export function parqResult(answers: ParqAnswers): ParqResult {
  const answered = parqQuestions.filter((q) => typeof answers[q] === 'boolean').length;
  const yes = parqQuestions.filter((q) => answers[q] === true);
  const kind = yes.length > 0 ? 'doctor' : answered < parqQuestions.length ? 'incomplete' : 'ready';
  return { kind, answered, total: parqQuestions.length, yes };
}

/** Ответы для хранения в базе: JSON в порядке вопросов */
export function serializeParqAnswers(answers: ParqAnswers): string {
  return JSON.stringify(Object.fromEntries(parqQuestions.filter((q) => typeof answers[q] === 'boolean').map((q) => [q, answers[q]])));
}

/** Ответы из базы или копии. Всё непонятное отбрасывается — вопрос считается пропущенным. */
export function parseParqAnswers(text: string): ParqAnswers {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {};
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {};
  }
  const source = parsed as Record<string, unknown>;
  const answers: ParqAnswers = {};
  for (const q of parqQuestions) {
    const value = source[q];
    if (typeof value === 'boolean') {
      answers[q] = value;
    }
  }
  return answers;
}

/** Анкете больше года — стоит пройти заново */
export function parqIsStale(dateIso: string, todayIso: string): boolean {
  return daysBetween(dateIso, todayIso) > PARQ_VALID_DAYS;
}
