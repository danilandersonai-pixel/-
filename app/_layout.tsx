import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { icons } from '@/components/Icon';
import { useDatabaseReady } from '@/db/database';
import { ru } from '@/i18n/ru';
import { typography, useTheme } from '@/theme';
import { getNavigationTheme } from '@/theme/navigationTheme';

export default function RootLayout() {
  const { scheme, colors } = useTheme();
  const { ready, error } = useDatabaseReady();

  let content;
  if (error) {
    content = (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState icon={icons.warning} title={ru.database.errorTitle} hint={error.message} />
      </View>
    );
  } else if (!ready) {
    // Миграции применяются за доли секунды — показываем пустой фон
    content = <View style={{ flex: 1, backgroundColor: colors.background }} />;
  } else {
    content = (
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { ...typography.headline, color: colors.text },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerBackTitle: ru.common.back,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <ThemeProvider value={getNavigationTheme(scheme)}>
      {content}
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
