import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { InfoRow } from '@/components/InfoRow';
import { Notice } from '@/components/Notice';
import { ReportPreview } from '@/components/ReportPreview';
import { useClient } from '@/db/useClients';
import { useMeasurements } from '@/db/useMeasurements';
import { useNutritionPlans } from '@/db/useNutrition';
import { usePhotos } from '@/db/usePhotos';
import { useWorkouts } from '@/db/useWorkouts';
import { ru } from '@/i18n/ru';
import {
  buildReportData,
  reportBody,
  reportDocument,
  reportFileName,
  reportPeriod,
  type ReportPeriodPreset,
} from '@/lib/report';
import { spacing, useTheme } from '@/theme';
import { isoToRuDate, toIsoDate } from '@/utils/date';
import { formatMeasure } from '@/utils/format';
import { canShareFiles, imageAsDataUri, sharePdf } from '@/utils/share';

const t = ru.report;
const presets: readonly ReportPeriodPreset[] = ['month', 'quarter', 'all'];

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { data: client } = useClient(id);
  const { data: measurements } = useMeasurements(id);
  const { data: workouts } = useWorkouts(id);
  const { data: plans } = useNutritionPlans(id);
  const { data: photos } = usePhotos(id);
  const [preset, setPreset] = useState<ReportPeriodPreset>('month');
  const [withPhotos, setWithPhotos] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!client || !measurements || !workouts || !plans || !photos) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const today = toIsoDate(new Date());
  const earliest = [...measurements.map((m) => m.date), ...workouts.map((w) => w.date)].sort()[0] ?? null;
  const { from, to } = reportPeriod(preset, today, earliest);
  const data = buildReportData({ client, measurements, workouts, plans, photos, from, to });
  const includePhotos = withPhotos && data.photos !== null;
  const previewBody = reportBody(
    data,
    includePhotos && data.photos ? { before: data.photos.before.uri, after: data.photos.after.uri } : null,
  );
  const isEmpty = data.rows.length === 0 && data.workouts.done === 0;

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const sources =
        includePhotos && data.photos
          ? { before: await imageAsDataUri(data.photos.before.uri), after: await imageAsDataUri(data.photos.after.uri) }
          : null;
      await sharePdf(reportDocument(reportBody(data, sources)), reportFileName(data.clientName, today));
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormScreen>
      <Stack.Screen options={{ title: t.screenTitle }} />
      <View style={styles.section}>
        <AppText variant="caption" color="textSecondary">
          {t.periodLabel}
        </AppText>
        <Chips
          label={t.periodLabel}
          options={presets.map((value) => ({ value, label: t.presets[value] }))}
          value={preset}
          onChange={setPreset}
        />
        <AppText variant="callout" color="textSecondary">
          {`${isoToRuDate(from)} — ${isoToRuDate(to)}`}
        </AppText>
      </View>
      {data.photos ? (
        <View style={styles.switchRow}>
          <AppText variant="body" style={styles.flex}>
            {t.includePhotos}
          </AppText>
          <Switch
            value={withPhotos}
            onValueChange={setWithPhotos}
            trackColor={{ true: colors.primary, false: colors.surfaceMuted }}
            accessibilityLabel={t.includePhotos}
          />
        </View>
      ) : null}
      {isEmpty ? <Notice icon={icons.warning} tone="warning" title={t.title} text={t.empty} /> : null}

      {canShareFiles ? (
        <>
          <Card title={t.bodyTitle}>
            {data.rows.map((row, index) => (
              <InfoRow
                key={row.metric}
                label={ru.progress.metrics[row.metric]}
                value={`${formatMeasure(row.start)} → ${formatMeasure(row.end)}${row.unit ? ` ${row.unit}` : ''}`}
                divider={index > 0}
              />
            ))}
            <InfoRow
              label={t.workoutsDone}
              value={String(data.workouts.done)}
              divider={data.rows.length > 0}
            />
          </Card>
          {error ? (
            <AppText variant="callout" color="danger">
              {error}
            </AppText>
          ) : null}
          <Button title={busy ? t.creating : t.create} icon={icons.doc} onPress={() => void create()} disabled={busy} />
        </>
      ) : (
        <>
          <Notice icon={icons.doc} title={t.screenTitle} text={t.webNote} />
          <ReportPreview body={previewBody} />
        </>
      )}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
