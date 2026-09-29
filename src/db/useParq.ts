import { useCallback } from 'react';

import { getLatestParq } from './parq';
import { useLiveData } from './useLiveData';

export function useParq(clientId: string) {
  const load = useCallback(() => getLatestParq(clientId), [clientId]);
  return useLiveData('parq', load);
}
