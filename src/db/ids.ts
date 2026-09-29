import { randomUUID } from 'expo-crypto';

/** Новый уникальный id записи (UUID) */
export function newId(): string {
  return randomUUID();
}
