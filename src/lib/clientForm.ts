import type { Client, ClientFields, Gender } from '@/db/schema';
import { isoToRuDate, parseRuDate } from '@/utils/date';

/** Значения формы подопечного — всё строками, как их вводит тренер */
export type ClientFormValues = {
  firstName: string;
  lastName: string;
  gender: Gender | null;
  /** «ДД.ММ.ГГГГ» */
  birthDate: string;
  phone: string;
  goal: string;
};

export type ClientFormErrors = Partial<Record<'firstName' | 'birthDate', 'required' | 'invalid'>>;

export const emptyClientFormValues: ClientFormValues = {
  firstName: '',
  lastName: '',
  gender: null,
  birthDate: '',
  phone: '',
  goal: '',
};

export function clientToFormValues(client: Client): ClientFormValues {
  return {
    firstName: client.firstName,
    lastName: client.lastName ?? '',
    gender: client.gender,
    birthDate: client.birthDate ? isoToRuDate(client.birthDate) : '',
    phone: client.phone ?? '',
    goal: client.goal ?? '',
  };
}

function textOrNull(text: string): string | null {
  const trimmed = text.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Превращает форму в поля для сохранения.
 * Без имени сохранять нечего — fields = null. Неверную дату не сохраняем,
 * но остальные поля сохраняются, а прошлая дата остаётся в базе.
 */
export function formToClientFields(values: ClientFormValues): {
  fields: ClientFields | null;
  errors: ClientFormErrors;
} {
  const errors: ClientFormErrors = {};
  const firstName = values.firstName.trim();
  if (firstName === '') {
    errors.firstName = 'required';
  }

  const fields: ClientFields = {
    firstName,
    lastName: textOrNull(values.lastName),
    gender: values.gender,
    phone: textOrNull(values.phone),
    goal: textOrNull(values.goal),
  };

  if (values.birthDate.trim() === '') {
    fields.birthDate = null;
  } else {
    const iso = parseRuDate(values.birthDate);
    if (iso) {
      fields.birthDate = iso;
    } else {
      errors.birthDate = 'invalid';
    }
  }

  return { fields: errors.firstName ? null : fields, errors };
}
