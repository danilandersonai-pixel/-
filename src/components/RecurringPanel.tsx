import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chips } from '@/components/Chips';
import { icons } from '@/components/Icon';
import { WeekdayPicker } from '@/components/WeekdayPicker';
import { useWorkouts } from '@/db/useWorkouts';
import { planWorkouts } from '@/db/workouts';
import { ru } from '@/i18n/ru';
import { recurringDates, weekdayIndex } from '@/lib/workouts';
import { spacing } from '@/theme';
import { isoToRuDate } from '@/utils/date';
import { fill } from '@/utils/format';

type RecurringPanelProps = {
  clientId: string;
  /** Дата этой тренировки, ГГГГ-ММ-ДД; null — ещё не введена */
  dateIso: string | null;
  startTime: string | null;
  durationMin: number | null;
};

const t = ru.series;
const weekOptions = [2, 4, 8, 12].map((n) => ({ value: String(n), label: fill(t.weeksOption, { n }) }));

/** «Повторять каждую неделю»: из одной запланированной тренировки — серия в выбранные дни */
export function RecurringPanel({ clientId, dateIso, startTime, durationMin }: RecurringPanelProps) {
  const { data: workouts } = useWorkouts(clientId);
  const [weekdays, setWeekdays] = useState<number[] | null>(null);
  const [weeks, setWeeks] = useState('4');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  if (!dateIso) {
    return (
      <Card title={t.title}>
        <AppText variant="callout" color="textSecondary" style={styles.padded}>
          {t.dateFirst}
        </AppText>
      </Card>
    );
  }

  const days = weekdays ?? [weekdayIndex(dateIso)];
  const taken = new Set((workouts ?? []).map((w) => w.date));
  const dates = recurringDates(dateIso, days, Number(weeks), taken);
  const allDates = recurringDates(dateIso, days, Number(weeks), new Set());

  const create = async () => {
    setBusy(true);
    try {
      setDone(await planWorkouts(clientId, dates, { startTime, durationMin }));
    } finally {
      setBusy(false);
    }
  };

  let preview: string;
  if (days.length === 0) {
    preview = t.none;
  } else if (dates.length === 0) {
    preview = t.nothing;
  } else {
    preview = fill(t.preview, { count: dates.length, date: isoToRuDate(dates[dates.length - 1]) });
  }

  return (
    <Card title={t.title} footer={t.hint}>
      <View style={styles.body}>
        <AppText variant="caption" color="textSecondary">
          {t.weekdays}
        </AppText>
        <WeekdayPicker
          label={t.weekdays}
          value={days}
          onChange={(value) => {
            setWeekdays(value);
            setDone(null);
          }}
        />
        <AppText variant="caption" color="textSecondary">
          {t.weeks}
        </AppText>
        <Chips
          label={t.weeks}
          options={weekOptions}
          value={weeks}
          onChange={(value) => {
            setWeeks(value);
            setDone(null);
          }}
        />
        {done !== null ? (
          <AppText variant="headline" color="success">
            {fill(t.done, { count: done })}
          </AppText>
        ) : (
          <>
            <AppText variant="callout" color="textSecondary">
              {preview}
            </AppText>
            {dates.length < allDates.length && dates.length > 0 ? (
              <AppText variant="caption" color="textTertiary">
                {t.skipped}
              </AppText>
            ) : null}
            <Button
              title={busy ? t.creating : fill(t.create, { count: dates.length })}
              icon={icons.upcoming}
              variant="secondary"
              onPress={() => void create()}
              disabled={busy || dates.length === 0}
            />
          </>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  padded: {
    padding: spacing.lg,
  },
});
