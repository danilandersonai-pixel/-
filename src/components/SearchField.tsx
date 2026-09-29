import { StyleSheet, TextInput, View } from 'react-native';

import { Icon, icons } from '@/components/Icon';
import { minTouchSize, radius, spacing, typography, useTheme } from '@/theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

/** Поле поиска с лупой */
export function SearchField({ value, onChangeText, placeholder }: SearchFieldProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrapper, { backgroundColor: colors.surfaceMuted }]}>
      <Icon name={icons.search} color="textTertiary" size={20} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        selectionColor={colors.primary}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={[styles.input, { color: colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: minTouchSize,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  input: {
    ...typography.body,
    flex: 1,
    paddingVertical: spacing.sm,
    outlineWidth: 0,
  },
});
