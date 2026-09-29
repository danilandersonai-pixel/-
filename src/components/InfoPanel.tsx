import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { radius, spacing, useTheme } from '@/theme';

type InfoPanelProps = {
  title: string;
  text: string;
  closeLabel: string;
  onClose: () => void;
};

/** Объяснение метода простыми словами — открывается по кнопке «?» */
export function InfoPanel({ title, text, closeLabel, onClose }: InfoPanelProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.panel, { backgroundColor: colors.primarySoft }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="summary">
      <AppText variant="headline">{title}</AppText>
      <AppText variant="callout">{text}</AppText>
      <Button title={closeLabel} variant="secondary" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
});
