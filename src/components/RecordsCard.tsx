import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ExerciseRecordRow } from '@/components/ExerciseRecordRow';
import { ru } from '@/i18n/ru';
import type { ExerciseRecord } from '@/lib/records';
import { minTouchSize, spacing, useTheme } from '@/theme';
import { fill } from '@/utils/format';

/** Сколько упражнений видно сразу — остальные по кнопке «Показать все» */
const COLLAPSED = 3;

type RecordsCardProps = {
  records: ExerciseRecord[];
  onOpen: (record: ExerciseRecord) => void;
};

/** «Личные рекорды»: упражнения, которые делали чаще, с лучшим подходом и расчётным максимумом */
export function RecordsCard({ records, onOpen }: RecordsCardProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  if (records.length === 0) {
    return null;
  }
  const visible = expanded ? records : records.slice(0, COLLAPSED);
  return (
    <Card title={ru.records.title}>
      {visible.map((record, index) => (
        <ExerciseRecordRow key={record.key} record={record} divider={index > 0} onPress={() => onOpen(record)} />
      ))}
      {records.length > COLLAPSED ? (
        <Pressable
          accessibilityRole="button"
          aria-expanded={expanded}
          onPress={() => setExpanded((value) => !value)}
          style={({ pressed }) => [
            styles.toggle,
            { borderTopColor: colors.border },
            pressed && { backgroundColor: colors.surfaceMuted },
          ]}>
          <AppText variant="headline" color="primary">
            {expanded ? ru.records.showLess : fill(ru.records.showAll, { count: records.length })}
          </AppText>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  toggle: {
    minHeight: minTouchSize + spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
