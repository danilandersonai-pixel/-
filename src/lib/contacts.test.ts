import { contactActions, internationalDigits, telegramUsername } from './contacts';

describe('связь с подопечным', () => {
  it('телефон в международный вид', () => {
    expect(internationalDigits('+7 900 123-45-67')).toBe('79001234567');
    expect(internationalDigits('8 (900) 123-45-67')).toBe('79001234567');
    expect(internationalDigits('900 123 45 67')).toBe('79001234567');
    expect(internationalDigits('+375 29 123-45-67')).toBe('375291234567');
    expect(internationalDigits('123')).toBeNull();
  });

  it('ник в Telegram', () => {
    expect(telegramUsername('@anna_fit')).toBe('anna_fit');
    expect(telegramUsername('anna_fit')).toBe('anna_fit');
    expect(telegramUsername('https://t.me/anna_fit')).toBe('anna_fit');
    expect(telegramUsername('t.me/anna_fit')).toBe('anna_fit');
    expect(telegramUsername('@ann')).toBeNull();
    expect(telegramUsername('Анна в WhatsApp')).toBeNull();
  });

  it('кнопки: только то, что можно открыть', () => {
    expect(contactActions({ phone: '+7 900 123-45-67', messenger: '@anna_fit' })).toEqual([
      { kind: 'call', url: 'tel:+79001234567' },
      { kind: 'whatsapp', url: 'https://wa.me/79001234567' },
      { kind: 'telegram', url: 'https://t.me/anna_fit' },
    ]);
    expect(contactActions({ phone: null, messenger: null })).toEqual([]);
    expect(contactActions({ phone: 'нет', messenger: '@anna_fit' }).map((a) => a.kind)).toEqual(['telegram']);
  });
});
