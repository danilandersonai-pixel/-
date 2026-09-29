import { isTrainerProfile, trainerContacts } from './trainer';

describe('профиль тренера', () => {
  it('строка контактов без пустых частей', () => {
    expect(trainerContacts({ name: ' Иван Петров ', phone: '', messenger: '@ivan' })).toBe('Иван Петров · @ivan');
    expect(trainerContacts({ name: '', phone: ' ', messenger: '' })).toBeNull();
  });

  it('проверка сохранённого значения', () => {
    expect(isTrainerProfile({ name: 'А', phone: '', messenger: '' })).toBe(true);
    expect(isTrainerProfile({ name: 'А' })).toBe(false);
    expect(isTrainerProfile(null)).toBe(false);
  });
});
