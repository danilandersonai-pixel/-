import type { Health, HealthFields } from '@/db/schema';

import { textOrNull } from './clientForm';

export type HealthFormValues = {
  contraindications: string;
  injuries: string;
  limitations: string;
  notes: string;
};

export function healthToFormValues(health: Health | null): HealthFormValues {
  return {
    contraindications: health?.contraindications ?? '',
    injuries: health?.injuries ?? '',
    limitations: health?.limitations ?? '',
    notes: health?.notes ?? '',
  };
}

export function formToHealthFields(values: HealthFormValues): HealthFields {
  return {
    contraindications: textOrNull(values.contraindications),
    injuries: textOrNull(values.injuries),
    limitations: textOrNull(values.limitations),
    notes: textOrNull(values.notes),
  };
}
