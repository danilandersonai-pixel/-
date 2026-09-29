import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, icons, type IconName } from '@/components/Icon';
import { minTouchSize, radius, spacing, useTheme, type Palette } from '@/theme';

type TodayRowProps = {
  icon: IconName;
  /** Цвет иконки: тренировка, напоминание, праздник */
  tone: keyof Palette;
  title: string;
  subtitle: string;
  onPress: () => void;
  divider?: boolean;
};

/** Строка блока «Сегодня»: иконка, кто и что, стрелка */
export function TodayRow({ icon, tone, title, subtitle, onPress, divider = false }: TodayRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}>
      <View style={[styles.badge, { backgroundColor: colors.surfaceMuted }]}>
        <Icon name={icon} color={tone} size={20} />
      </View>
      <View style={styles.text}>
        <AppText variant="headline" numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="callout" color="textSecondary">
          {subtitle}
        </AppText>
      </View>
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
  badge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
