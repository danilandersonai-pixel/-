import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { ru } from '@/i18n/ru';
import type { MeasurementField } from '@/lib/measurementForm';
import { radius, spacing, useTheme } from '@/theme';

type Mark = { kind: 'line'; x1: number; x2: number; y: number } | { kind: 'point'; x: number; y: number };

// Координаты на фигуре 120×240. Фигура стоит лицом к нам: её правая рука — слева.
const marks: Partial<Record<MeasurementField, Mark>> = {
  neck: { kind: 'line', x1: 51, x2: 69, y: 38 },
  chest: { kind: 'line', x1: 33, x2: 87, y: 62 },
  waist: { kind: 'line', x1: 33, x2: 87, y: 98 },
  hips: { kind: 'line', x1: 35, x2: 85, y: 124 },
  arm: { kind: 'line', x1: 17, x2: 36, y: 72 },
  thigh: { kind: 'line', x1: 37, x2: 61, y: 156 },
  calf: { kind: 'line', x1: 38, x2: 60, y: 198 },
  skinfoldChest: { kind: 'point', x: 48, y: 60 },
  skinfoldAbdomen: { kind: 'point', x: 53, y: 100 },
  skinfoldThigh: { kind: 'point', x: 49, y: 160 },
  skinfoldTriceps: { kind: 'point', x: 26, y: 74 },
  skinfoldSuprailiac: { kind: 'point', x: 40, y: 116 },
  skinfoldCalf: { kind: 'point', x: 54, y: 198 },
  restingHeartRate: { kind: 'point', x: 67, y: 64 },
};

/** Картинка-подсказка: фигура человека с отмеченным местом замера и описание, как мерить */
export function MeasureHint({ field }: { field: MeasurementField }) {
  const { colors } = useTheme();
  const mark = marks[field];
  const wholeBody = field === 'weight';
  const body = {
    fill: colors.surfaceMuted,
    stroke: wholeBody ? colors.primary : colors.border,
    strokeWidth: wholeBody ? 2 : 1,
  };

  return (
    <View style={[styles.box, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Svg width={84} height={168} viewBox="0 0 120 240" accessibilityElementsHidden importantForAccessibility="no">
        <Rect x={20} y={46} width={13} height={90} rx={6.5} {...body} />
        <Rect x={87} y={46} width={13} height={90} rx={6.5} {...body} />
        <Rect x={40} y={126} width={18} height={108} rx={9} {...body} />
        <Rect x={62} y={126} width={18} height={108} rx={9} {...body} />
        <Rect x={36} y={40} width={48} height={92} rx={18} {...body} />
        <Rect x={54} y={31} width={12} height={12} rx={4} {...body} />
        <Circle cx={60} cy={20} r={13} {...body} />
        <Circle cx={60} cy={100} r={1.5} fill={colors.textTertiary} />
        {field === 'height' ? (
          <>
            <Line x1={110} y1={6} x2={110} y2={234} stroke={colors.primary} strokeWidth={3} strokeLinecap="round" />
            <Line x1={104} y1={6} x2={116} y2={6} stroke={colors.primary} strokeWidth={3} strokeLinecap="round" />
            <Line x1={104} y1={234} x2={116} y2={234} stroke={colors.primary} strokeWidth={3} strokeLinecap="round" />
          </>
        ) : null}
        {mark?.kind === 'line' ? (
          <Line
            x1={mark.x1}
            y1={mark.y}
            x2={mark.x2}
            y2={mark.y}
            stroke={colors.primary}
            strokeWidth={4}
            strokeLinecap="round"
          />
        ) : null}
        {mark?.kind === 'point' ? (
          <>
            <Circle cx={mark.x} cy={mark.y} r={8} fill={colors.primarySoft} />
            <Circle cx={mark.x} cy={mark.y} r={4.5} fill={colors.primary} />
          </>
        ) : null}
      </Svg>
      <View style={styles.text}>
        <AppText variant="section" color="primary">
          {ru.measurement.whereToMeasure}
        </AppText>
        <AppText variant="headline">{ru.measurement.fields[field]}</AppText>
        <AppText variant="callout" color="textSecondary">
          {ru.measurement.where[field]}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
});
