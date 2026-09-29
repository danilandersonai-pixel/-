import { useCallback } from 'react';

import { useLiveData } from './useLiveData';
import { getWorkoutDetails, listPlannedFrom, listWorkouts, listWorkoutsBetween } from './workouts';

export function useWorkouts(clientId: string) {
  const load = useCallback(() => listWorkouts(clientId), [clientId]);
  return useLiveData('workouts', load);
}

export function useWorkoutsBetween(fromIso: string, toIso: string) {
  const load = useCallback(() => listWorkoutsBetween(fromIso, toIso), [fromIso, toIso]);
  return useLiveData('workouts', load);
}

export function usePlannedWorkouts(fromIso: string) {
  const load = useCallback(() => listPlannedFrom(fromIso), [fromIso]);
  return useLiveData('workouts', load);
}

export function useWorkoutDetails(id: string) {
  const load = useCallback(() => getWorkoutDetails(id), [id]);
  return useLiveData('workouts', load);
}
