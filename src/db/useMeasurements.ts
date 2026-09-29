import { useCallback } from 'react';

import { getMeasurement, listAllMeasurements, listMeasurements } from './measurements';
import { useLiveData } from './useLiveData';

export function useMeasurements(clientId: string) {
  const load = useCallback(() => listMeasurements(clientId), [clientId]);
  return useLiveData('measurements', load);
}

export function useAllMeasurements() {
  return useLiveData('measurements', listAllMeasurements);
}

export function useMeasurement(id: string) {
  const load = useCallback(() => getMeasurement(id), [id]);
  return useLiveData('measurements', load);
}
