// Связь с подопечным из карточки: позвонить, WhatsApp, Telegram.
// Только ссылки для системных приложений — приложение само ничего никуда не отправляет.

export type ContactKind = 'call' | 'whatsapp' | 'telegram';
export type ContactAction = { kind: ContactKind; url: string };

/**
 * Телефон в международном виде, только цифры: «8 (900) 123-45-67» → «79001234567».
 * Российские номера с 8 или без кода страны приводим к 7. null — не похоже на телефон.
 */
export function internationalDigits(phone: string): string | null {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  } else if (digits.length === 10 && digits.startsWith('9')) {
    digits = `7${digits}`;
  }
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

/** Ник в Telegram из поля «Мессенджер»: «@anna_fit», «t.me/anna_fit», «https://t.me/anna_fit» */
export function telegramUsername(messenger: string): string | null {
  const text = messenger.trim();
  const match = /^(?:@|(?:https?:\/\/)?t(?:elegram)?\.me\/)?([A-Za-z][A-Za-z0-9_]{4,31})$/.exec(text);
  return match ? match[1] : null;
}

/** Какие кнопки связи показать: звонок и WhatsApp — по телефону, Telegram — по нику */
export function contactActions(client: { phone: string | null; messenger: string | null }): ContactAction[] {
  const actions: ContactAction[] = [];
  const digits = client.phone ? internationalDigits(client.phone) : null;
  if (digits) {
    actions.push({ kind: 'call', url: `tel:+${digits}` });
    actions.push({ kind: 'whatsapp', url: `https://wa.me/${digits}` });
  }
  const username = client.messenger ? telegramUsername(client.messenger) : null;
  if (username) {
    actions.push({ kind: 'telegram', url: `https://t.me/${username}` });
  }
  return actions;
}
