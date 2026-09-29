import { router, Stack } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmButton } from '@/components/ConfirmButton';
import { InfoButton } from '@/components/InfoButton';
import { InfoPanel } from '@/components/InfoPanel';
import { ParqQuestionRow } from '@/components/ParqQuestionRow';
import { ParqSummary } from '@/components/ParqSummary';
import { SaveStatusLabel } from '@/components/SaveStatusLabel';
import { TextField } from '@/components/TextField';
import { deleteParq, saveParq } from '@/db/parq';
import type { ParqForm, ParqFormFields } from '@/db/schema';
import { useAutosave } from '@/hooks/useAutosave';
import { ru } from '@/i18n/ru';
import { PARQ_VERSION, parqQuestions, parseParqAnswers, serializeParqAnswers, type ParqAnswers, type ParqQuestion } from '@/lib/parq';
import { spacing } from '@/theme';
import { isoToRuDate, maskDateInput, parseRuDate } from '@/utils/date';

type ParqEditorProps = {
  clientId: string;
  formId: string;
  existing: ParqForm | null;
  todayIso: string;
};

const t = ru.parq;
const questions: Record<ParqQuestion, string> = t.questions;
const hints: Partial<Record<ParqQuestion, string>> = t.hints;

/** Анкета PAR-Q: семь вопросов «Да/Нет», итог сразу под ними. Сохраняется сама после первого ответа. */
export function ParqEditor({ clientId, formId, existing, todayIso }: ParqEditorProps) {
  const [answers, setAnswers] = useState<ParqAnswers>(() => (existing ? parseParqAnswers(existing.answers) : {}));
  const [date, setDate] = useState(() => isoToRuDate(existing?.date ?? todayIso));
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [dirty, setDirty] = useState(false);
  const [info, setInfo] = useState(false);

  const dateIso = parseRuDate(date);
  const fields = useMemo<ParqFormFields | null>(
    () =>
      dateIso
        ? {
            date: dateIso,
            version: existing?.version ?? PARQ_VERSION,
            answers: serializeParqAnswers(answers),
            notes: notes.trim() === '' ? null : notes.trim(),
          }
        : null,
    [dateIso, existing?.version, answers, notes],
  );
  const save = useCallback((toSave: ParqFormFields) => saveParq(formId, clientId, toSave), [formId, clientId]);
  const { status, flush } = useAutosave(dirty ? fields : null, save);

  const answer = (question: ParqQuestion, value: boolean) => {
    setAnswers((current) => ({ ...current, [question]: value }));
    setDirty(true);
  };
  const done = async () => {
    await flush();
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: t.title, headerRight: () => <SaveStatusLabel status={status} /> }} />
      <View style={styles.intro}>
        <AppText variant="callout" color="textSecondary" style={styles.introText}>
          {t.intro}
        </AppText>
        <InfoButton label={t.infoLabel} active={info} onPress={() => setInfo((open) => !open)} />
      </View>
      {info ? <InfoPanel title={t.infoTitle} text={t.info} closeLabel={ru.measurement.closeInfo} onClose={() => setInfo(false)} /> : null}
      <TextField
        label={t.date}
        value={date}
        onChangeText={(text) => {
          setDate(maskDateInput(text));
          setDirty(true);
        }}
        keyboardType="number-pad"
        maxLength={10}
        error={dateIso ? undefined : ru.measurement.errors.dateInvalid}
      />
      <Card footer={t.source}>
        {parqQuestions.map((question, index) => (
          <ParqQuestionRow
            key={question}
            number={index + 1}
            question={questions[question]}
            hint={hints[question]}
            value={answers[question]}
            onChange={(value) => answer(question, value)}
            divider={index > 0}
          />
        ))}
      </Card>
      <ParqSummary answers={answers} />
      <TextField
        label={t.comment}
        value={notes}
        onChangeText={(text) => {
          setNotes(text);
          setDirty(true);
        }}
        placeholder={t.commentPlaceholder}
        multiline
      />
      <Button title={t.done} onPress={() => void done()} disabled={fields === null} />
      {existing ? (
        <ConfirmButton
          title={t.delete}
          question={t.deleteConfirm}
          confirmTitle={t.deleteButton}
          onConfirm={() => {
            void deleteParq(existing.id).then(() => router.back());
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  intro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  introText: {
    flex: 1,
  },
});
