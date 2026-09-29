import { useCallback } from 'react';

import { getMembership } from './memberships';
import { useLiveData } from './useLiveData';

export function useMembership(clientId: string) {
  const load = useCallback(() => getMembership(clientId), [clientId]);
  return useLiveData('memberships', load);
}
