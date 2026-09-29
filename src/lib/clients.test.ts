import type { Client } from '@/db/schema';

import { clientFullName, clientInitials, matchesClientSearch, sortClients } from './clients';

function makeClient(overrides: Partial<Client>): Client {
  return {
    id: 'id',
    firstName: 'Имя',
    lastName: null,
    gender: null,
    birthDate: null,
    phone: null,
    email: null,
    messenger: null,
    goal: null,
    notes: null,
    photoUri: null,
    archived: false,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('clientFullName и clientInitials', () => {
  it('собирает имя и инициалы', () => {
    const anna = makeClient({ firstName: 'Анна', lastName: 'Петрова' });
    expect(clientFullName(anna)).toBe('Анна Петрова');
    expect(clientInitials(anna)).toBe('АП');
  });

  it('работает без фамилии', () => {
    const ivan = makeClient({ firstName: 'иван' });
    expect(clientFullName(ivan)).toBe('иван');
    expect(clientInitials(ivan)).toBe('И');
  });
});

describe('matchesClientSearch', () => {
  const client = makeClient({ firstName: 'Алёна', lastName: 'Смирнова', phone: '+7 (916) 123-45-67' });

  it('ищет по имени и фамилии без учёта регистра и «ё»', () => {
    expect(matchesClientSearch(client, 'алена')).toBe(true);
    expect(matchesClientSearch(client, 'СМИР')).toBe(true);
    expect(matchesClientSearch(client, 'смирнова алёна')).toBe(true);
    expect(matchesClientSearch(client, 'петрова')).toBe(false);
  });

  it('ищет по цифрам телефона', () => {
    expect(matchesClientSearch(client, '123-45')).toBe(true);
    expect(matchesClientSearch(client, '999')).toBe(false);
  });

  it('пустой запрос подходит всем', () => {
    expect(matchesClientSearch(client, '  ')).toBe(true);
  });
});

describe('sortClients', () => {
  it('сортирует по алфавиту', () => {
    const sorted = sortClients([
      makeClient({ id: '1', firstName: 'Юрий' }),
      makeClient({ id: '2', firstName: 'Анна', lastName: 'Яковлева' }),
      makeClient({ id: '3', firstName: 'Анна', lastName: 'Белова' }),
    ]);
    expect(sorted.map((c) => c.id)).toEqual(['3', '2', '1']);
  });
});
