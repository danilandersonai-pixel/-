import { useCallback } from 'react';

import { listNutritionPlans } from './nutrition';
import { useLiveData } from './useLiveData';

export function useNutritionPlans(clientId: string) {
  const load = useCallback(() => listNutritionPlans(clientId), [clientId]);
  return useLiveData('nutrition', load);
}
