import { useCallback } from 'react';

import { listPhotos } from './photos';
import { useLiveData } from './useLiveData';

export function usePhotos(clientId: string) {
  const load = useCallback(() => listPhotos(clientId), [clientId]);
  return useLiveData('photos', load);
}
