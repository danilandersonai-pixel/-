import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ru } from '@/i18n/ru';
import { fonts, minTouchSize, radius, spacing, useTheme } from '@/theme';
import { fill } from '@/utils/format';

type ParqQuestionRowProps = {
  /** Номер вопроса, с 1 */
  number: number;
  question: string;
  hint?: string;
  /** true — «Да», false — «Нет», undefined — ещё без ответа */
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  divider?: boolean;
};

const t = ru.parq;

/** Вопрос анкеты с кнопками «Да» и «Нет» */
export function ParqQuestionRow({ number, question, hint, value, onChange, divider = false }: ParqQuestionRowProps) {
  const { colors } = useTheme();
  const options = [
    { answer: true, label: t.yes },
    { answer: false, label: t.no },
  ];
  return (
    <View style={[styles.row, divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
      <View style={styles.text}>
        <AppText variant="caption" color="textTertiary">
          {fill(t.questionLabel, { n: number })}
        </AppText>
        <AppText variant="body">{question}</AppText>
        {hint ? (
          <AppText variant="caption" color="textSecondary">
            {hint}
          </AppText>
        ) : null}
      </View>
      <View style={styles.buttons} accessibilityRole="radiogroup" accessibilityLabel={question}>
        {options.map(({ answer, label }) => {
          const selected = value === answer;
          return (
            <Pressable
              key={label}
              accessibilityRole="radio"
              accessibilityLabel={label}
              aria-checked={selected}
              onPress={() => onChange(answer)}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: selected ? colors.text : colors.surface,
                  borderColor: selected ? colors.text : colors.border,
                },
                pressed && styles.pressed,
              ]}>
              <AppText variant="headline" color={selected ? 'background' : 'textSecondary'} style={selected && styles.selected}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  text: {
    gap: spacing.xs,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: minTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  selected: {
    fontFamily: fonts.bodySemiBold,
  },
  pressed: {
    opacity: 0.7,
  },
});
