import { Stack } from 'expo-router';

import { HealthForm } from '@/components/HealthForm';
import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import type { Health } from '@/db/schema';
import { useHealthEditor } from '@/hooks/useHealthEditor';
import { healthToFormValues } from '@/lib/healthForm';

type ClientHealthTabProps = {
  clientId: string;
  health: Health | null;
};

/** Вкладка «Здоровье» с автосохранением */
export function ClientHealthTab({ clientId, health }: ClientHealthTabProps) {
  const { values, setField, status } = useHealthEditor(clientId, healthToFormValues(health));
  return (
    <>
      <Stack.Screen options={{ headerRight: () => <SaveStatusLabel status={status} /> }} />
      <HealthForm values={values} onChange={setField} />
    </>
  );
}
