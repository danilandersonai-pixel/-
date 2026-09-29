import { router, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/Button';
import { ConfirmButton } from '@/components/ConfirmButton';
import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import { TextField } from '@/components/TextField';
import { deleteMembership, saveMembership } from '@/db/memberships';
import type { Membership, MembershipFields } from '@/db/schema';
import { useAutosave } from '@/hooks/useAutosave';
import { ru } from '@/i18n/ru';
import { membershipFormToFields, type MembershipFormValues } from '@/lib/memberships';
import { isoToRuDate, maskDateInput } from '@/utils/date';

type MembershipEditorProps = {
  clientId: string;
  membershipId: string;
  existing: Membership | null;
  todayIso: string;
};

const t = ru.membership;

/** Абонемент: сколько тренировок и срок. Сохраняется сам. */
export function MembershipEditor({ clientId, membershipId, existing, todayIso }: MembershipEditorProps) {
  const [values, setValues] = useState<MembershipFormValues>(() => ({
    total: existing ? String(existing.total) : '',
    startDate: isoToRuDate(existing?.startDate ?? todayIso),
    endDate: existing?.endDate ? isoToRuDate(existing.endDate) : '',
    notes: existing?.notes ?? '',
  }));
  const [dirty, setDirty] = useState(false);
  const change = (patch: Partial<MembershipFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
    setDirty(true);
  };
  const { fields, errors } = useMemo(() => membershipFormToFields(values), [values]);
  const save = useCallback((toSave: MembershipFields) => saveMembership(membershipId, clientId, toSave), [membershipId, clientId]);
  const { status, flush } = useAutosave(dirty ? fields : null, save);

  const done = async () => {
    await flush();
    router.back();
  };
  const dateError = (error: string | undefined) =>
    error === 'order' ? t.errors.order : error ? ru.measurement.errors.dateInvalid : undefined;

  return (
    <>
      <Stack.Screen options={{ title: t.title, headerRight: () => <SaveStatusLabel status={status} /> }} />
      <TextField
        label={t.total}
        value={values.total}
        onChangeText={(text) => change({ total: text })}
        keyboardType="number-pad"
        placeholder="12"
        error={dirty && errors.total ? (errors.total === 'required' ? t.errors.required : t.errors.totalInvalid) : undefined}
      />
      <TextField
        label={t.startDate}
        value={values.startDate}
        onChangeText={(text) => change({ startDate: maskDateInput(text) })}
        keyboardType="number-pad"
        maxLength={10}
        error={dateError(errors.startDate)}
      />
      <TextField
        label={t.endDate}
        value={values.endDate}
        onChangeText={(text) => change({ endDate: maskDateInput(text) })}
        keyboardType="number-pad"
        maxLength={10}
        placeholder="ДД.ММ.ГГГГ"
        helper={t.endDateHelper}
        error={dateError(errors.endDate)}
      />
      <TextField
        label={t.notes}
        value={values.notes}
        onChangeText={(text) => change({ notes: text })}
        placeholder={t.notesPlaceholder}
        multiline
      />
      <Button title={t.done} onPress={() => void done()} disabled={fields === null} />
      {existing ? (
        <ConfirmButton
          title={t.delete}
          question={t.deleteConfirm}
          confirmTitle={t.deleteButton}
          onConfirm={() => {
            void deleteMembership(existing.id).then(() => router.back());
          }}
        />
      ) : null}
    </>
  );
}
