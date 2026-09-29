import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, icons } from '@/components/Icon';
import type { Palette } from '@/theme';
import { formatNumber } from '@/utils/format';

type DeltaBadgeProps = {
  delta: number | null;
  /** Что считается улучшением: down — уменьшение, up — рост, neutral — без оценки */
  direction: 'up' | 'down' | 'neutral';
  unit?: string;
  digits?: number;
  /** Подпись после числа, например «к 01.09.2026» */
  suffix?: string;
};

/** Изменение к прошлому замеру: стрелка и число, зелёное — улучшение, красное — ухудшение */
export function DeltaBadge({ delta, direction, unit = '', digits = 1, suffix }: DeltaBadgeProps) {
  if (delta === null) {
    return null;
  }
  const rounded = Number(delta.toFixed(digits));
  let color: keyof Palette = 'textSecondary';
  if (rounded !== 0 && direction !== 'neutral') {
    const better = direction === 'down' ? rounded < 0 : rounded > 0;
    color = better ? 'success' : 'danger';
  }
  const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : '';
  const text = `${sign}${formatNumber(Math.abs(rounded), digits)}${unit ? ` ${unit}` : ''}`;
  return (
    <View style={styles.row}>
      {rounded !== 0 ? <Icon name={rounded < 0 ? icons.arrowDown : icons.arrowUp} color={color} size={14} /> : null}
      <AppText variant="caption" color={color}>
        {suffix ? `${text} ${suffix}` : text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
