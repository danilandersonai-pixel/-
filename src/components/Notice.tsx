import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { radius, spacing, useTheme } from '@/theme';

type NoticeProps = {
  icon: IconName;
  title: string;
  text: string;
  /** warning — требует внимания, info — просто сообщает */
  tone?: 'warning' | 'info';
  action?: ReactNode;
};

/** Плашка с важным сообщением над содержимым экрана */
export function Notice({ icon, title, text, tone = 'info', action }: NoticeProps) {
  const { colors } = useTheme();
  const accent = tone === 'warning' ? 'warning' : 'primary';
  return (
    <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors[accent] }]}>
      <View style={styles.header}>
        <Icon name={icon} color={accent} size={22} />
        <AppText variant="headline" style={styles.title}>
          {title}
        </AppText>
      </View>
      <AppText variant="callout" color="textSecondary">
        {text}
      </AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
});
