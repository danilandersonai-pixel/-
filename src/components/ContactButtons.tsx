import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, icons, type IconName } from '@/components/Icon';
import type { Client } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { contactActions, type ContactKind } from '@/lib/contacts';
import { minTouchSize, radius, spacing, useTheme } from '@/theme';

const kinds: Record<ContactKind, { icon: IconName; label: string }> = {
  call: { icon: icons.call, label: ru.contact.call },
  whatsapp: { icon: icons.chat, label: ru.contact.whatsapp },
  telegram: { icon: icons.send, label: ru.contact.telegram },
};

/** Позвонить или написать подопечному: открывает телефон, WhatsApp или Telegram на этом устройстве */
export function ContactButtons({ client }: { client: Pick<Client, 'phone' | 'messenger'> }) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const actions = contactActions(client);
  if (actions.length === 0) {
    return null;
  }
  const open = (url: string) => {
    setFailed(false);
    Linking.openURL(url).catch(() => setFailed(true));
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {actions.map(({ kind, url }) => (
          <Pressable
            key={kind}
            accessibilityRole="button"
            accessibilityLabel={kinds[kind].label}
            onPress={() => open(url)}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}>
            <Icon name={kinds[kind].icon} color="primary" size={20} />
            <AppText variant="callout" numberOfLines={1}>
              {kinds[kind].label}
            </AppText>
          </Pressable>
        ))}
      </View>
      {failed ? (
        <AppText variant="caption" color="danger">
          {ru.contact.error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: minTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
