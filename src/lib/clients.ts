import type { Client } from '@/db/schema';

type NamedClient = Pick<Client, 'firstName' | 'lastName'>;

export function clientFullName(client: NamedClient): string {
  return [client.firstName, client.lastName].filter(Boolean).join(' ').trim();
}

/** Инициалы для аватарки: «Анна Петрова» → «АП», «Анна» → «А» */
export function clientInitials(client: NamedClient): string {
  return [client.firstName, client.lastName]
    .map((part) => part?.trim().charAt(0) ?? '')
    .join('')
    .toLocaleUpperCase('ru');
}

function normalize(text: string): string {
  return text.toLocaleLowerCase('ru').replace(/ё/g, 'е');
}

/** Поиск по имени, фамилии и телефону. Каждое слово запроса должно найтись. */
export function matchesClientSearch(client: Client, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return true;
  }
  const haystack = normalize(clientFullName(client));
  const phoneDigits = (client.phone ?? '').replace(/\D/g, '');
  return words.every((word) => {
    const wordDigits = word.replace(/\D/g, '');
    const isPhoneQuery = wordDigits.length >= 3 && wordDigits.length === word.replace(/[\s()+-]/g, '').length;
    return haystack.includes(word) || (isPhoneQuery && phoneDigits.includes(wordDigits));
  });
}

/** По алфавиту: сначала имя, потом фамилия */
export function sortClients(clients: Client[]): Client[] {
  return [...clients].sort((a, b) => clientFullName(a).localeCompare(clientFullName(b), 'ru'));
}
