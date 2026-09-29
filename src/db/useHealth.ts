import { useCallback } from 'react';

import { getHealth } from './health';
import { useLiveData } from './useLiveData';

export function useHealth(clientId: string) {
  const load = useCallback(() => getHealth(clientId), [clientId]);
  return useLiveData('health', load);
}
