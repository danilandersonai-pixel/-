import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TextField } from '@/components/TextField';
import type { Gender } from '@/db/schema';
import { ru } from '@/i18n/ru';
import type { ClientFormErrors, ClientFormValues } from '@/lib/clientForm';
import { maskDateInput } from '@/utils/date';
import { spacing } from '@/theme';

type ClientFormProps = {
  values: ClientFormValues;
  errors: ClientFormErrors;
  onChange: <K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) => void;
  /** Поставить курсор в поле «Имя» при открытии */
  autoFocus?: boolean;
  /** Полная форма профиля: ещё почта, мессенджер и заметки */
  extended?: boolean;
};

const t = ru.clientForm;

const genderOptions: readonly { value: Gender; label: string }[] = [
  { value: 'male', label: t.male },
  { value: 'female', label: t.female },
];

/** Форма профиля подопечного. Сама ничего не сохраняет — только сообщает об изменениях. */
export function ClientForm({ values, errors, onChange, autoFocus = false, extended = false }: ClientFormProps) {
  return (
    <>
      <View style={styles.section}>
        <AppText variant="section" color="textSecondary" style={styles.sectionTitle}>
          {t.sectionMain}
        </AppText>
        <TextField
          label={t.firstName}
          value={values.firstName}
          onChangeText={(text) => onChange('firstName', text)}
          placeholder={t.firstNamePlaceholder}
          error={errors.firstName ? t.firstNameRequired : undefined}
          autoFocus={autoFocus}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
        />
        <TextField
          label={t.lastName}
          value={values.lastName}
          onChangeText={(text) => onChange('lastName', text)}
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
        />
      </View>

      <View style={styles.section}>
        <AppText variant="section" color="textSecondary" style={styles.sectionTitle}>
          {t.sectionCalc}
        </AppText>
        <SegmentedControl
          label={t.gender}
          options={genderOptions}
          value={values.gender}
          onChange={(gender) => onChange('gender', gender)}
        />
        <TextField
          label={t.birthDate}
          value={values.birthDate}
          onChangeText={(text) => onChange('birthDate', maskDateInput(text))}
          placeholder={t.birthDatePlaceholder}
          error={errors.birthDate ? t.birthDateInvalid : undefined}
          keyboardType="number-pad"
          maxLength={10}
        />
        <AppText variant="caption" color="textTertiary">
          {t.calcHint}
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="section" color="textSecondary" style={styles.sectionTitle}>
          {t.sectionContacts}
        </AppText>
        <TextField
          label={t.phone}
          value={values.phone}
          onChangeText={(text) => onChange('phone', text)}
          placeholder={t.phonePlaceholder}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
        {extended ? (
          <>
            <TextField
              label={t.email}
              value={values.email}
              onChangeText={(text) => onChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <TextField
              label={t.messenger}
              value={values.messenger}
              onChangeText={(text) => onChange('messenger', text)}
              placeholder={t.messengerPlaceholder}
              autoCapitalize="none"
            />
          </>
        ) : null}
        <TextField
          label={t.goal}
          value={values.goal}
          onChangeText={(text) => onChange('goal', text)}
          placeholder={t.goalPlaceholder}
          autoCapitalize="sentences"
        />
        {extended ? (
          <TextField
            label={t.notes}
            value={values.notes}
            onChangeText={(text) => onChange('notes', text)}
            placeholder={t.notesPlaceholder}
            multiline
          />
        ) : null}
      </View>

      <AppText variant="caption" color="textTertiary" style={styles.footer}>
        {t.autosaveHint}
      </AppText>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    marginLeft: spacing.xs,
  },
  footer: {
    textAlign: 'center',
  },
});
