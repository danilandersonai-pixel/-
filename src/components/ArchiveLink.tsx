import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, icons } from '@/components/Icon';
import { ru } from '@/i18n/ru';
import { minTouchSize, radius, spacing, useTheme } from '@/theme';

type ArchiveLinkProps = {
  count: number;
  onPress: () => void;
};

/** Ссылка «Архив · 3» под списком подопечных */
export function ArchiveLink({ count, onPress }: ArchiveLinkProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.surfaceMuted : colors.surface }]}>
      <Icon name={icons.archive} color="textSecondary" size={22} />
      <AppText variant="body" style={styles.label}>
        {ru.clients.archiveLink}
      </AppText>
      <AppText variant="body" color="textSecondary">
        {count}
      </AppText>
      <Icon name={icons.chevronRight} color="textTertiary" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouchSize + spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
  },
  label: {
    flex: 1,
  },
});
