import Constants from 'expo-constants';

import { Card } from '@/components/Card';
import { InfoRow } from '@/components/InfoRow';
import { Screen } from '@/components/Screen';
import { ru } from '@/i18n/ru';

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '—';
  return (
    <Screen title={ru.settings.title}>
      <Card title={ru.settings.dataSection} footer={ru.settings.dataHint}>
        <InfoRow label={ru.settings.dataStorage} value={ru.settings.dataStorageValue} />
      </Card>

      <Card title={ru.settings.aboutSection}>
        <InfoRow label={ru.settings.theme} value={ru.settings.themeSystem} />
        <InfoRow label={ru.settings.version} value={version} divider />
      </Card>
    </Screen>
  );
}
