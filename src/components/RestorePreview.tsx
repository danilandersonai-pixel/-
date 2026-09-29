import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { icons } from '@/components/Icon';
import { InfoRow } from '@/components/InfoRow';
import { Notice } from '@/components/Notice';
import type { PickedBackup } from '@/db/backupFiles';
import { countsText } from '@/i18n/backup';
import { ru } from '@/i18n/ru';
import { backupCounts, planHasChanges, type RestorePlan } from '@/lib/backup';
import { spacing } from '@/theme';
import { fill, formatDateTime } from '@/utils/format';

const r = ru.restore;

type RestorePreviewProps = {
  picked: PickedBackup;
  plan: RestorePlan;
  restoring: boolean;
  error?: string;
  onRestore: () => void;
  onPickAnother: () => void;
};

function exportedAtText(iso: string): string {
  const date = new Date(iso);
  return iso === '' || Number.isNaN(date.getTime()) ? '—' : formatDateTime(date);
}

/** Что лежит в выбранной копии и что изменится на телефоне — до подтверждения */
export function RestorePreview({ picked, plan, restoring, error, onRestore, onPickAnother }: RestorePreviewProps) {
  const { summary } = plan;
  const hasChanges = planHasChanges(plan);
  const warnings = [
    picked.data.version < 2 ? r.oldFormat : null,
    summary.missingPhotos > 0 ? fill(r.missingPhotos, { count: summary.missingPhotos }) : null,
    summary.skipped > 0 ? fill(r.skipped, { count: summary.skipped }) : null,
  ].filter((text): text is string => text !== null);

  return (
    <>
      <Card title={r.inBackup}>
        <InfoRow label={r.file} value={picked.fileName} />
        <InfoRow label={r.date} value={exportedAtText(picked.data.exportedAt)} divider />
        <InfoRow label={r.inBackup} value={countsText(backupCounts(picked.data))} divider />
      </Card>
      {hasChanges ? (
        <Card title={r.changesTitle} footer={r.safe}>
          <InfoRow label={r.willAdd} value={countsText(summary.added)} />
          <InfoRow label={r.willUpdate} value={String(summary.updated)} divider />
          <InfoRow label={r.alreadyHere} value={String(summary.unchanged)} divider />
        </Card>
      ) : (
        <Notice icon={icons.consent} title={r.upToDateTitle} text={r.upToDateText} />
      )}
      {warnings.length > 0 ? (
        <Notice icon={icons.warning} tone="warning" title={r.warningTitle} text={warnings.join('\n')} />
      ) : null}
      {error ? <Notice icon={icons.warning} tone="warning" title={r.errorTitle} text={error} /> : null}
      <View style={styles.actions}>
        {hasChanges ? (
          <Button title={restoring ? r.restoring : r.confirm} icon={icons.repeat} onPress={onRestore} disabled={restoring} />
        ) : null}
        <Button title={r.pickAnother} variant="secondary" onPress={onPickAnother} disabled={restoring} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
});
