import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, useTheme } from '@/theme';

type AvatarProps = {
  initials: string;
  size?: number;
};

/** Кружок с инициалами (фото подопечного появится позже) */
export function Avatar({ initials, size = 44 }: AvatarProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.circle, { width: size, height: size, backgroundColor: colors.primarySoft }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <AppText variant="headline" color="primary" style={{ fontSize: size * 0.38 }}>
        {initials}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
