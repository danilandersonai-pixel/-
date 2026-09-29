import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, icons } from '@/components/Icon';
import { ru } from '@/i18n/ru';
import { minTouchSize, radius, spacing, useTheme } from '@/theme';
import { monthGrid, monthTitle, weekdayShort, type MonthRef } from '@/utils/calendar';

type MonthCalendarProps = {
  month: MonthRef;
  onMonthChange: (delta: number) => void;
  selected: string;
  onSelect: (iso: string) => void;
  today: string;
  /** Сколько тренировок в каждый день (ГГГГ-ММ-ДД → число) */
  counts: Map<string, number>;
};

/** Календарь месяца: точки в дни с тренировками, выбранный день залит, сегодня обведён */
export function MonthCalendar({ month, onMonthChange, selected, onSelect, today, counts }: MonthCalendarProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ru.calendar.prevMonth}
          onPress={() => onMonthChange(-1)}
          style={styles.arrow}>
          <Icon name={icons.chevronLeft} color="primary" />
        </Pressable>
        <AppText variant="headline" style={styles.title} accessibilityRole="header">
          {monthTitle(month)}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ru.calendar.nextMonth}
          onPress={() => onMonthChange(1)}
          style={styles.arrow}>
          <Icon name={icons.chevronRight} color="primary" />
        </Pressable>
      </View>
      <View style={styles.week}>
        {weekdayShort.map((day) => (
          <AppText key={day} variant="caption" color="textTertiary" style={styles.weekday}>
            {day}
          </AppText>
        ))}
      </View>
      {monthGrid(month).map((week, index) => (
        <View key={index} style={styles.week}>
          {week.map((iso, dayIndex) => {
            if (!iso) {
              return <View key={`empty-${dayIndex}`} style={styles.day} />;
            }
            const isSelected = iso === selected;
            const count = counts.get(iso) ?? 0;
            return (
              <Pressable
                key={iso}
                accessibilityRole="button"
                aria-selected={isSelected}
                accessibilityLabel={`${Number(iso.slice(8))}${count > 0 ? `, ${count}` : ''}`}
                onPress={() => onSelect(iso)}
                style={styles.day}>
                <View
                  style={[
                    styles.dayCircle,
                    isSelected && { backgroundColor: colors.primary },
                    !isSelected && iso === today && { borderColor: colors.primary, borderWidth: 1.5 },
                  ]}>
                  <AppText variant="callout" color={isSelected ? 'onPrimary' : 'text'}>
                    {Number(iso.slice(8))}
                  </AppText>
                </View>
                <View
                  style={[styles.dot, { backgroundColor: count > 0 ? colors.chartLine : colors.surface }]}
                />
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  arrow: {
    width: minTouchSize,
    height: minTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
  },
  day: {
    flex: 1,
    alignItems: 'center',
    minHeight: minTouchSize + 4,
    gap: 2,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
});
