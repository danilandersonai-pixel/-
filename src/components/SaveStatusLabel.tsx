import { Platform, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import type { SaveStatus } from '@/hooks/useAutosave';
import { ru } from '@/i18n/ru';
import { spacing } from '@/theme';

/** Подпись в заголовке: «Сохраняю…» / «Сохранено» — видно, что данные не потеряются */
export function SaveStatusLabel({ status }: { status: SaveStatus }) {
  if (status === 'idle') {
    return null;
  }
  return (
    <AppText
      variant="caption"
      color={status === 'error' ? 'danger' : status === 'saved' ? 'success' : 'textSecondary'}
      accessibilityLiveRegion="polite"
      style={styles.label}>
      {ru.saveStatus[status]}
    </AppText>
  );
}

const styles = StyleSheet.create({
  // На iOS и Android отступ в заголовке добавляет система, в браузере — нет
  label: Platform.select({ web: { marginRight: spacing.lg }, default: {} }),
});
