import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ru } from '@/i18n/ru';

export default function CalendarScreen() {
  return (
    <Screen title={ru.calendar.title}>
      <EmptyState
        icon={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
        title={ru.calendar.emptyTitle}
        hint={ru.calendar.emptyHint}
      />
    </Screen>
  );
}
