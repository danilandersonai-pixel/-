import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ru } from '@/i18n/ru';
import { progressMetrics } from '@/lib/progress';
import type { TrashItem } from '@/lib/trash';
import { minTouchSize, radius, spacing, useTheme } from '@/theme';
import { isoToRuDate } from '@/utils/date';
import { fill, formatDate, formatMeasure } from '@/utils/format';
import { pluralRu } from '@/utils/plural';

type TrashRowProps = {
  item: TrashItem;
  onRestore: () => void;
  divider?: boolean;
};

const t = ru.trash;

/** «Замер · 65,2 кг», «Цель · Жир 20 %» — что это была за запись */
function itemTitle(item: TrashItem): string {
  const kind = t.kinds[item.kind];
  switch (item.kind) {
    case 'measurement':
      return `${kind} · ${formatMeasure(item.weight)} ${ru.progress.units.kg}`;
    case 'workout':
      return `${kind} · ${item.status === 'done' ? t.done : t.planned}${item.startTime ? `, ${item.startTime}` : ''}`;
    case 'photo':
      return `${kind} · ${ru.progress.angles[item.angle]}`;
    case 'goal': {
      const unit = ru.progress.units[progressMetrics.find((m) => m.id === item.metric)?.unit ?? 'none'];
      return `${kind} · ${ru.progress.metrics[item.metric]} ${formatMeasure(item.targetValue)}${unit ? ` ${unit}` : ''}`;
    }
    case 'membership':
      return `${kind} · ${item.total} ${pluralRu(item.total, ru.records.sessionForms)}`;
    case 'parq':
      return kind;
  }
}

/** Строка корзины: что удалено, у кого, когда — и кнопка «Вернуть» */
export function TrashRow({ item, onRestore, divider = false }: TrashRowProps) {
  const { colors } = useTheme();
  const title = itemTitle(item);
  return (
    <View style={[styles.row, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
      <View style={styles.text}>
        <AppText variant="headline">{title}</AppText>
        <AppText variant="callout" color="textSecondary" numberOfLines={1}>
          {`${item.clientName} · ${isoToRuDate(item.date)}`}
        </AppText>
        <AppText variant="caption" color="textTertiary">
          {fill(t.deleted, { date: formatDate(new Date(item.deletedAt)) })}
        </AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={fill(t.restoreLabel, { what: `${title}, ${item.clientName}` })}
        onPress={onRestore}
        style={({ pressed }) => [styles.button, { backgroundColor: colors.primarySoft }, pressed && styles.pressed]}>
        <AppText variant="headline" color="primary">
          {t.restore}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  button: {
    minHeight: minTouchSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.7,
  },
});
