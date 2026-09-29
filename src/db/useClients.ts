import { useCallback } from 'react';

import { getClient, listActiveClients } from './clients';
import { useLiveData } from './useLiveData';

export function useActiveClients() {
  return useLiveData('clients', listActiveClients);
}

export function useClient(id: string) {
  const load = useCallback(() => getClient(id), [id]);
  return useLiveData('clients', load);
}
