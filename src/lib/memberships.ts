// Абонемент: сколько тренировок осталось. Считается из проведённых тренировок — в базе не храним.

import type { Membership, MembershipFields } from '@/db/schema';
import { daysBetween, parseRuDate } from '@/utils/date';

/** Сколько тренировок в остатке считать «заканчивается» */
export const ENDING_THRESHOLD = 2;

export type MembershipStatus = {
  used: number;
  remaining: number;
  /** Срок вышел */
  expired: boolean;
  /** Все тренировки использованы */
  exhausted: boolean;
  /** Осталось мало — пора предложить продление */
  ending: boolean;
  /** Дней до конца срока; null — срока нет */
  daysLeft: number | null;
};

/** doneDates — даты проведённых тренировок подопечного (ГГГГ-ММ-ДД) */
export function membershipStatus(
  membership: Pick<Membership, 'total' | 'startDate' | 'endDate'>,
  doneDates: string[],
  todayIso: string,
): MembershipStatus {
  const used = doneDates.filter(
    (date) => date >= membership.startDate && (membership.endDate === null || date <= membership.endDate),
  ).length;
  const remaining = Math.max(0, membership.total - used);
  const expired = membership.endDate !== null && todayIso > membership.endDate;
  const exhausted = remaining === 0;
  return {
    used,
    remaining,
    expired,
    exhausted,
    ending: !expired && !exhausted && remaining <= ENDING_THRESHOLD,
    daysLeft: membership.endDate === null ? null : daysBetween(todayIso, membership.endDate),
  };
}

export type MembershipFormValues = { total: string; startDate: string; endDate: string; notes: string };
export type MembershipFormErrors = Partial<Record<'total' | 'startDate' | 'endDate', 'required' | 'invalid' | 'order'>>;

export function membershipFormToFields(values: MembershipFormValues): {
  fields: MembershipFields | null;
  errors: MembershipFormErrors;
} {
  const errors: MembershipFormErrors = {};
  const totalText = values.total.trim();
  const total = /^\d+$/.test(totalText) ? Number(totalText) : null;
  if (totalText === '') {
    errors.total = 'required';
  } else if (total === null || total < 1 || total > 500) {
    errors.total = 'invalid';
  }
  const startDate = parseRuDate(values.startDate);
  if (!startDate) {
    errors.startDate = values.startDate.trim() === '' ? 'required' : 'invalid';
  }
  const endText = values.endDate.trim();
  const endDate = endText === '' ? null : parseRuDate(endText);
  if (endText !== '' && !endDate) {
    errors.endDate = 'invalid';
  } else if (endDate && startDate && endDate < startDate) {
    errors.endDate = 'order';
  }
  if (Object.keys(errors).length > 0 || total === null || !startDate) {
    return { fields: null, errors };
  }
  return { fields: { total, startDate, endDate, notes: values.notes.trim() === '' ? null : values.notes.trim() }, errors };
}
