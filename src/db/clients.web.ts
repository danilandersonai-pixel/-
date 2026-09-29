// Браузерная версия clients.ts для превью: те же функции, но данные в localStorage.

import { sortClients } from '@/lib/clients';

import { notifyChange } from './changes';
import type { Client, ClientFields } from './schema';
import { createWebTable, getBrowserStorage } from './webTable';

const table = createWebTable<Client>('clients', getBrowserStorage());

const api = {
  async listActiveClients(): Promise<Client[]> {
    return sortClients(table.all().filter((client) => !client.archived));
  },

  async listArchivedClients(): Promise<Client[]> {
    return sortClients(table.all().filter((client) => client.archived));
  },

  async setClientArchived(id: string, archived: boolean): Promise<void> {
    const existing = table.get(id);
    if (existing) {
      table.upsert({ ...existing, archived, updatedAt: Date.now() });
      notifyChange('clients');
    }
  },

  async getClient(id: string): Promise<Client | null> {
    return table.get(id);
  },

  async saveClient(id: string, fields: ClientFields): Promise<void> {
    const now = Date.now();
    const existing = table.get(id);
    table.upsert({
      lastName: null,
      gender: null,
      birthDate: null,
      phone: null,
      email: null,
      messenger: null,
      goal: null,
      notes: null,
      photoUri: null,
      ...existing,
      ...fields,
      id,
      archived: existing?.archived ?? false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    notifyChange('clients');
  },
} satisfies typeof import('./clients');

export const { listActiveClients, listArchivedClients, setClientArchived, getClient, saveClient } = api;
