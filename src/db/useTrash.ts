import { listTrash, trashTables } from './trash';
import { useLiveData } from './useLiveData';

export function useTrash() {
  return useLiveData(trashTables, listTrash);
}
