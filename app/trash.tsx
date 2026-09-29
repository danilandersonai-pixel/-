import { Stack } from 'expo-router';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { TrashRow } from '@/components/TrashRow';
import { restoreFromTrash } from '@/db/trash';
import { useTrash } from '@/db/useTrash';
import { ru } from '@/i18n/ru';

/** Корзина: всё удалённое, с возвратом одной кнопкой */
export default function TrashScreen() {
  const { data: items } = useTrash();
  return (
    <FormScreen>
      <Stack.Screen options={{ title: ru.trash.title }} />
      {items === undefined ? null : items.length === 0 ? (
        <EmptyState icon={icons.trash} title={ru.trash.emptyTitle} hint={ru.trash.emptyHint} />
      ) : (
        <>
          <AppText variant="callout" color="textSecondary">
            {ru.trash.hint}
          </AppText>
          <Card>
            {items.map((item, index) => (
              <TrashRow
                key={`${item.kind}:${item.id}`}
                item={item}
                divider={index > 0}
                onRestore={() => void restoreFromTrash(item.kind, item.id)}
              />
            ))}
          </Card>
        </>
      )}
    </FormScreen>
  );
}
