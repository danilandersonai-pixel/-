import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useColorSchemeName } from '@/theme';
import { getNavigationTheme } from '@/theme/navigationTheme';

export default function RootLayout() {
  const scheme = useColorSchemeName();
  return (
    <ThemeProvider value={getNavigationTheme(scheme)}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
