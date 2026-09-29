import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, useTheme } from '@/theme';

type AvatarProps = {
  initials: string;
  size?: number;
};

/** Квадратик с инициалами (фото подопечного появится позже) */
export function Avatar({ initials, size = 44 }: AvatarProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.circle, { width: size, height: size, backgroundColor: colors.surfaceMuted }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <AppText variant="title" style={{ fontSize: size * 0.4, lineHeight: size * 0.5 }}>
        {initials}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
