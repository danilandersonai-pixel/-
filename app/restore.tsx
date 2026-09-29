import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { Notice } from '@/components/Notice';
import { RestorePreview } from '@/components/RestorePreview';
import { pickBackupFile, previewRestore, restoreBackup, type PickedBackup } from '@/db/backupFiles';
import { backupProblemText, countsText } from '@/i18n/backup';
import { ru } from '@/i18n/ru';
import { BackupError, type RestorePlan, type RestoreSummary } from '@/lib/backup';
import { spacing } from '@/theme';
import { fill } from '@/utils/format';
import { canShareFiles } from '@/utils/share';

const r = ru.restore;

type Step =
  | { kind: 'start'; error?: string }
  | { kind: 'reading' }
  | { kind: 'preview'; picked: PickedBackup; plan: RestorePlan; restoring: boolean; error?: string }
  | { kind: 'done'; summary: RestoreSummary };

function errorText(error: unknown): string {
  return backupProblemText(error instanceof BackupError ? error.problem : null);
}

export default function RestoreScreen() {
  const [step, setStep] = useState<Step>({ kind: 'start' });

  const pick = async () => {
    const previous = step;
    setStep({ kind: 'reading' });
    try {
      const picked = await pickBackupFile();
      if (!picked) {
        setStep(previous.kind === 'reading' ? { kind: 'start' } : previous);
        return;
      }
      setStep({ kind: 'preview', picked, plan: await previewRestore(picked), restoring: false });
    } catch (error) {
      setStep({ kind: 'start', error: errorText(error) });
    }
  };

  const restore = async (picked: PickedBackup, plan: RestorePlan) => {
    setStep({ kind: 'preview', picked, plan, restoring: true });
    try {
      setStep({ kind: 'done', summary: await restoreBackup(picked) });
    } catch (error) {
      setStep({ kind: 'preview', picked, plan, restoring: false, error: errorText(error) });
    }
  };

  return (
    <FormScreen>
      <Stack.Screen options={{ title: r.title }} />

      {step.kind === 'start' || step.kind === 'reading' ? (
        <>
          <Notice icon={icons.backup} title={r.introTitle} text={r.intro} />
          {step.kind === 'start' && step.error ? (
            <Notice icon={icons.warning} tone="warning" title={r.errorTitle} text={step.error} />
          ) : null}
          <View style={styles.actions}>
            <Button
              title={step.kind === 'reading' ? r.reading : r.pick}
              icon={icons.doc}
              onPress={() => void pick()}
              disabled={step.kind === 'reading'}
            />
            <AppText variant="caption" color="textSecondary">
              {r.safe}
            </AppText>
            {canShareFiles ? null : (
              <AppText variant="caption" color="textTertiary">
                {r.webNote}
              </AppText>
            )}
          </View>
        </>
      ) : null}

      {step.kind === 'preview' ? (
        <RestorePreview
          picked={step.picked}
          plan={step.plan}
          restoring={step.restoring}
          error={step.error}
          onRestore={() => void restore(step.picked, step.plan)}
          onPickAnother={() => void pick()}
        />
      ) : null}

      {step.kind === 'done' ? (
        <>
          <Notice
            icon={icons.consent}
            title={r.doneTitle}
            text={fill(r.doneText, { added: countsText(step.summary.added), updated: step.summary.updated })}
          />
          <Button title={r.close} onPress={() => router.back()} />
        </>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
});
