import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BodyFatHero } from '@/components/BodyFatHero';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmButton } from '@/components/ConfirmButton';
import { InfoPanel } from '@/components/InfoPanel';
import { InfoRow } from '@/components/InfoRow';
import { MetricTile } from '@/components/MetricTile';
import { deleteMeasurement } from '@/db/measurements';
import type { Client, Measurement } from '@/db/schema';
import { explanation, problemText } from '@/i18n/calc';
import { ru } from '@/i18n/ru';
import { compositionDelta, metricDelta, metricDirection, type CompositionMetric } from '@/lib/calc/composition';
import { ok, type CalcOutput } from '@/lib/calc/types';
import { measurementFields } from '@/lib/measurementForm';
import { fieldUnit } from '@/lib/measurementSteps';
import { compositionFor } from '@/lib/measurements';
import { spacing } from '@/theme';
import { isoToRuDate } from '@/utils/date';
import { fill, formatMeasure } from '@/utils/format';

type MeasurementResultProps = {
  client: Client;
  measurement: Measurement;
  previous: Measurement | null;
};

type Tile = { metric: CompositionMetric; unit: string };

const tiles: readonly Tile[] = [
  { metric: 'weight', unit: ru.measurement.units.kg },
  { metric: 'fatMass', unit: ru.measurement.units.kg },
  { metric: 'leanMass', unit: ru.measurement.units.kg },
  { metric: 'skeletalMuscle', unit: ru.measurement.units.kg },
  { metric: 'bmi', unit: '' },
  { metric: 'ffmiNormalized', unit: '' },
];

/** Результат замера: крупные цифры, методы, погрешности, сравнение с прошлым */
export function MeasurementResult({ client, measurement, previous }: MeasurementResultProps) {
  const [info, setInfo] = useState<CompositionMetric | null>(null);
  const composition = compositionFor(measurement, client);
  const previousComposition = previous ? compositionFor(previous, client) : undefined;
  const missingProfile = !client.gender || !client.birthDate;

  const outputOf = (metric: CompositionMetric, source: typeof composition, m: Measurement): CalcOutput =>
    metric === 'weight' ? ok('bmi', m.weight, null) : source[metric];

  const toggleInfo = (metric: CompositionMetric) => setInfo((current) => (current === metric ? null : metric));
  const infoPanel = info ? (
    <InfoPanel
      title={ru.metrics[info]}
      text={explanation(info, composition)}
      closeLabel={ru.measurement.closeInfo}
      onClose={() => setInfo(null)}
    />
  ) : null;

  return (
    <View style={styles.result}>
      <BodyFatHero
        composition={composition}
        previous={previousComposition}
        previousDate={previous ? isoToRuDate(previous.date) : null}
        infoOpen={info === 'bodyFat'}
        onInfo={() => toggleInfo('bodyFat')}
      />
      {info === 'bodyFat' ? infoPanel : null}

      {missingProfile ? (
        <Button
          title={ru.measurement.fixProfile}
          variant="secondary"
          onPress={() => router.push({ pathname: '/client/[id]', params: { id: client.id, tab: 'profile' } })}
        />
      ) : null}

      <View style={styles.grid}>
        {tiles.map(({ metric, unit }) => {
          const output = outputOf(metric, composition, measurement);
          const delta =
            metric === 'weight'
              ? metricDelta(output, previous ? outputOf('weight', composition, previous) : undefined)
              : compositionDelta(metric, composition, previousComposition);
          return (
            <MetricTile
              key={metric}
              label={ru.metrics[metric]}
              value={output.value}
              unit={unit}
              errorMargin={output.value === null ? null : output.errorMargin}
              delta={delta}
              direction={metricDirection[metric]}
              problem={problemText(output)}
              infoLabel={fill(ru.measurement.howCalculated, { metric: ru.metrics[metric] })}
              infoOpen={info === metric}
              onInfo={() => toggleInfo(metric)}
            />
          );
        })}
      </View>
      {info && info !== 'bodyFat' ? infoPanel : null}

      <Card title={ru.measurement.entered}>
        {measurementFields
          .filter((field) => measurement[field] !== null)
          .map((field, index) => (
            <InfoRow
              key={field}
              label={ru.measurement.fields[field]}
              value={`${formatMeasure(measurement[field] ?? 0)} ${ru.measurement.units[fieldUnit(field)]}`}
              divider={index > 0}
            />
          ))}
      </Card>

      <Button
        title={ru.measurement.edit}
        variant="secondary"
        onPress={() => router.push({ pathname: '/client/[id]/measure', params: { id: client.id, mid: measurement.id } })}
      />
      <ConfirmButton
        title={ru.measurement.delete}
        question={ru.measurement.deleteConfirm}
        confirmTitle={ru.measurement.deleteConfirmButton}
        onConfirm={() => {
          void deleteMeasurement(measurement.id).then(() => router.back());
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  result: {
    gap: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
