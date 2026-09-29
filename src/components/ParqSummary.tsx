import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ru } from '@/i18n/ru';
import { parqResult, type ParqAnswers, type ParqQuestion } from '@/lib/parq';
import { spacing } from '@/theme';
import { fill } from '@/utils/format';

const t = ru.parq;
const shortNames: Record<ParqQuestion, string> = t.short;

/** Итог анкеты: можно начинать, нужен врач или анкета не закончена */
export function ParqSummary({ answers }: { answers: ParqAnswers }) {
  const result = parqResult(answers);
  if (result.kind === 'incomplete') {
    return (
      <AppText variant="headline" color="textSecondary">
        {fill(t.incomplete, { answered: result.answered, total: result.total })}
      </AppText>
    );
  }
  const doctor = result.kind === 'doctor';
  return (
    <View style={styles.box} accessibilityLiveRegion="polite">
      <AppText variant="headline" color={doctor ? 'warning' : 'success'}>
        {doctor ? t.doctor : t.ready}
      </AppText>
      <AppText variant="callout" color="textSecondary">
        {doctor ? fill(t.doctorHint, { list: result.yes.map((q) => shortNames[q]).join(', ') }) : t.readyHint}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: spacing.xs,
  },
});
