import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, icons } from '@/components/Icon';
import { ru } from '@/i18n/ru';
import { recordSummary } from '@/i18n/records';
import type { ExerciseRecord } from '@/lib/records';
import { minTouchSize, spacing, useTheme } from '@/theme';
import { pluralRu } from '@/utils/plural';

type ExerciseRecordRowProps = {
  record: ExerciseRecord;
  onPress: () => void;
  divider?: boolean;
};

/** Строка упражнения в «Личных рекордах»: название, лучший подход, сколько раз делали */
export function ExerciseRecordRow({ record, onPress, divider = false }: ExerciseRecordRowProps) {
  const { colors } = useTheme();
  const count = record.sessions.length;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${record.name}. ${recordSummary(record)}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}>
      <View style={styles.text}>
        <AppText variant="headline" numberOfLines={1}>
          {record.name}
        </AppText>
        <AppText variant="callout" color="textSecondary">
          {recordSummary(record)}
        </AppText>
      </View>
      <AppText variant="caption" color="textTertiary">
        {`${count} ${pluralRu(count, ru.records.sessionForms)}`}
      </AppText>
      <Icon name={icons.chevronRight} color="textTertiary" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouchSize + spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
