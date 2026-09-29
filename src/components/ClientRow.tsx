import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Icon, icons } from '@/components/Icon';
import type { Client } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { clientFullName, clientInitials } from '@/lib/clients';
import { minTouchSize, spacing, useTheme } from '@/theme';

type ClientRowProps = {
  client: Client;
  onPress: () => void;
  /** Разделитель над строкой (у всех строк, кроме первой) */
  divider?: boolean;
};

/** Строка списка подопечных: аватар, имя, цель */
export function ClientRow({ client, onPress, divider = false }: ClientRowProps) {
  const { colors } = useTheme();
  const name = clientFullName(client);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceMuted }]}>
      <Avatar initials={clientInitials(client)} />
      <View
        style={[
          styles.body,
          divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        ]}>
        <View style={styles.text}>
          <AppText variant="headline" numberOfLines={1}>
            {name}
          </AppText>
          <AppText variant="callout" color={client.goal ? 'textSecondary' : 'textTertiary'} numberOfLines={1}>
            {client.goal ?? ru.clients.noGoal}
          </AppText>
        </View>
        <Icon name={icons.chevronRight} color="textTertiary" size={18} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.lg,
  },
  body: {
    flex: 1,
    minHeight: minTouchSize + spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
