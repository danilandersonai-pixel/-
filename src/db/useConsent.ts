import { useCallback } from 'react';

import { getActiveConsent } from './consents';
import { useLiveData } from './useLiveData';

export function useActiveConsent(clientId: string) {
  const load = useCallback(() => getActiveConsent(clientId), [clientId]);
  return useLiveData('consents', load);
}
