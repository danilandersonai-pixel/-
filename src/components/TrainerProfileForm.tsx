import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { TextField } from '@/components/TextField';
import { trainerProfile } from '@/db/settings';
import { useSetting } from '@/db/useSetting';
import { ru } from '@/i18n/ru';
import type { TrainerProfile } from '@/lib/trainer';
import { spacing } from '@/theme';

const t = ru.trainer;

/** Имя и контакты тренера — сохраняются сразу при вводе */
export function TrainerProfileForm() {
  const profile = useSetting(trainerProfile);
  const change = (field: keyof TrainerProfile, value: string) => trainerProfile.set({ ...profile, [field]: value });

  return (
    <View style={styles.section}>
      <AppText variant="section" color="textSecondary" style={styles.title}>
        {t.section}
      </AppText>
      <TextField
        label={t.name}
        value={profile.name}
        onChangeText={(text) => change('name', text)}
        placeholder={t.namePlaceholder}
        autoCapitalize="words"
        textContentType="name"
      />
      <TextField
        label={t.phone}
        value={profile.phone}
        onChangeText={(text) => change('phone', text)}
        placeholder={t.phonePlaceholder}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
      />
      <TextField
        label={t.messenger}
        value={profile.messenger}
        onChangeText={(text) => change('messenger', text)}
        placeholder={t.messengerPlaceholder}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <AppText variant="caption" color="textTertiary">
        {t.hint}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  title: {
    marginLeft: spacing.lg,
  },
});
