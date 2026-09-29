import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import type { IconName } from '@/components/Icon';
import { ru } from '@/i18n/ru';
import { radius, spacing, useTheme } from '@/theme';

type ConfirmButtonProps = {
  title: string;
  icon?: IconName;
  /** Вопрос, который появляется после первого нажатия */
  question: string;
  confirmTitle: string;
  onConfirm: () => void;
  /** danger — для удаления и отзыва, secondary — для безопасных действий вроде добавления примера */
  variant?: 'danger' | 'secondary';
};

/**
 * Кнопка для важных действий: после нажатия спрашивает подтверждение прямо на экране.
 * Системные диалоги в браузерном превью не работают, поэтому подтверждение — своё.
 */
export function ConfirmButton({ title, icon, question, confirmTitle, onConfirm, variant = 'danger' }: ConfirmButtonProps) {
  const { colors } = useTheme();
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return <Button title={title} icon={icon} variant={variant} onPress={() => setAsking(true)} />;
  }

  return (
    <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <AppText variant="callout" accessibilityLiveRegion="polite">
        {question}
      </AppText>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Button title={ru.card.cancel} variant="secondary" onPress={() => setAsking(false)} />
        </View>
        <View style={styles.flex}>
          <Button
            title={confirmTitle}
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onPress={() => {
              setAsking(false);
              onConfirm();
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
