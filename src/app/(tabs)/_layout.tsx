import { Tabs } from 'expo-router/js-tabs';

import { TabBarIcon } from '@/components/TabBarIcon';
import { ru } from '@/i18n/ru';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: ru.tabs.clients,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name={{ ios: 'person.2.fill', android: 'group', web: 'group' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: ru.tabs.calendar,
          tabBarIcon: ({ color }) => (
            <TabBarIcon
              name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: ru.tabs.settings,
          tabBarIcon: ({ color }) => (
            <TabBarIcon
              name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
