import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { AppLock } from '@/components/AppLock';
import { EmptyState } from '@/components/EmptyState';
import { icons } from '@/components/Icon';
import { WorkoutReminderSync } from '@/components/WorkoutReminderSync';
import { useDatabaseReady } from '@/db/database';
import { ru } from '@/i18n/ru';
import { typography, useTheme } from '@/theme';
import { fontFiles } from '@/theme/fontFiles';
import { getNavigationTheme } from '@/theme/navigationTheme';

export default function RootLayout() {
  const { scheme, colors } = useTheme();
  const { ready, error } = useDatabaseReady();
  // Шрифты лежат внутри приложения и грузятся мгновенно. Если что-то пошло не так — работаем на системном.
  const [fontsLoaded, fontError] = useFonts(fontFiles);
  const fontsReady = fontsLoaded || fontError !== null;

  let content;
  if (error) {
    content = (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState icon={icons.warning} title={ru.database.errorTitle} hint={error.message} />
      </View>
    );
  } else if (!ready || !fontsReady) {
    // Миграции и шрифты готовы за доли секунды — показываем пустой фон
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
      <AppLock>{content}</AppLock>
      {ready && !error ? <WorkoutReminderSync /> : null}
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
