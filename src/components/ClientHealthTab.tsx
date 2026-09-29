import { Stack } from 'expo-router';

import { HealthForm } from '@/components/HealthForm';
import { ParqCard } from '@/components/ParqCard';
import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import type { Health } from '@/db/schema';
import { useHealthEditor } from '@/hooks/useHealthEditor';
import { healthToFormValues } from '@/lib/healthForm';
import { toIsoDate } from '@/utils/date';

type ClientHealthTabProps = {
  clientId: string;
  health: Health | null;
};

/** Вкладка «Здоровье»: анкета PAR-Q и противопоказания с автосохранением */
export function ClientHealthTab({ clientId, health }: ClientHealthTabProps) {
  const { values, setField, status } = useHealthEditor(clientId, healthToFormValues(health));
  return (
    <>
      <Stack.Screen options={{ headerRight: () => <SaveStatusLabel status={status} /> }} />
      <ParqCard clientId={clientId} todayIso={toIsoDate(new Date())} />
      <HealthForm values={values} onChange={setField} />
    </>
  );
}
