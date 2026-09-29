import { useCallback } from 'react';

import { getGoal } from './goals';
import { useLiveData } from './useLiveData';

export function useGoal(clientId: string) {
  const load = useCallback(() => getGoal(clientId), [clientId]);
  return useLiveData('goals', load);
}
