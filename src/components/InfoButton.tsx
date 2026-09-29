import { Pressable, StyleSheet } from 'react-native';

import { Icon, icons } from '@/components/Icon';

type InfoButtonProps = {
  /** Подпись для экранного диктора: «Как считается жировая масса» */
  label: string;
  onPress: () => void;
  active?: boolean;
};

/** Кнопка «?» у расчёта — открывает объяснение метода и погрешности */
export function InfoButton({ label, onPress, active = false }: InfoButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-expanded={active}
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Icon name={icons.help} color={active ? 'primary' : 'textTertiary'} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
