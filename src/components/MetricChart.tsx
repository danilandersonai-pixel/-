import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { AppText } from '@/components/AppText';
import { niceScale, type ProgressPoint } from '@/lib/progress';
import { radius, spacing, useTheme } from '@/theme';
import { isoToRuDate } from '@/utils/date';
import { formatMeasure } from '@/utils/format';

type MetricChartProps = {
  points: ProgressPoint[];
  unit: string;
  /** Подпись для экранного диктора */
  label: string;
  /** Только целые деления шкалы (повторы) */
  integer?: boolean;
};

const CHART_HEIGHT = 180;
const Y_AXIS_WIDTH = 44;
/** На сколько последняя дата может выступать правее своей точки, не упираясь в край графика */
const LAST_LABEL_OVERHANG = 4;
/** Ширина подписи последней даты — «29.09» помещается целиком */
const LAST_LABEL_WIDTH = 40;

/** ДД.ММ — полная дата видна в подсказке и в таблице под графиком */
function shortDate(iso: string): string {
  return isoToRuDate(iso).slice(0, 5);
}

/** Линейный график одного показателя: тонкая линия, лёгкая заливка. Последнее значение — в заголовке над графиком. */
export function MetricChart({ points, unit, label, integer = false }: MetricChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const scale = niceScale(points.map((p) => p.value), 4, integer);
  // Подписи шкалы считаем сами: библиотека округляет деления вроде 0,25 до одного знака и сдвигает подпись
  const yLabels = Array.from({ length: scale.sections + 1 }, (_, i) => formatMeasure(scale.min + i * scale.step));
  const labelEvery = Math.max(1, Math.ceil(points.length / 5));
  const withUnit = (value: number) => `${formatMeasure(value)}${unit ? ` ${unit}` : ''}`;

  const chartWidth = width - Y_AXIS_WIDTH - spacing.lg;
  // Шаг между точками — так же, как его считает библиотека при adjustToWidth
  const pointSpacing = (chartWidth - spacing.lg) / Math.max(points.length - 1, 1);
  const data = points.map((point, index) => {
    const isLast = index === points.length - 1;
    // Подпись прямо перед последней не ставим, если она ближе шага подписей — иначе даты слипаются
    const farFromLast = points.length - 1 - index >= labelEvery;
    const showLabel = index === 0 || isLast || (index % labelEvery === 0 && farFromLast);
    return {
      // График считает от нуля — сдвигаем точки к началу нашей шкалы
      value: point.value - scale.min,
      label: showLabel && !isLast ? shortDate(point.date) : '',
      // Последнюю дату выравниваем по правому краю точки, иначе она обрезается краем графика
      labelComponent: isLast
        ? () => (
            <AppText
              style={[
                styles.lastLabel,
                { color: colors.textTertiary, marginLeft: pointSpacing / 2 + LAST_LABEL_OVERHANG - LAST_LABEL_WIDTH },
              ]}
              numberOfLines={1}>
              {shortDate(point.date)}
            </AppText>
          )
        : undefined,
    };
  });

  return (
    <View
      style={styles.wrapper}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessibilityRole="image"
      accessibilityLabel={`${label}: ${points.map((p) => `${isoToRuDate(p.date)} — ${withUnit(p.value)}`).join('; ')}`}>
      {width > 0 ? (
        <LineChart
          data={data}
          width={chartWidth}
          height={CHART_HEIGHT}
          adjustToWidth
          disableScroll
          initialSpacing={spacing.lg}
          endSpacing={spacing.xxl + spacing.sm}
          thickness={2}
          color={colors.chartLine}
          dataPointsColor={colors.chartLine}
          dataPointsRadius={4}
          areaChart
          startFillColor={colors.chartLine}
          endFillColor={colors.chartLine}
          startOpacity={0.12}
          endOpacity={0.01}
          maxValue={scale.step * scale.sections}
          stepValue={scale.step}
          noOfSections={scale.sections}
          yAxisLabelWidth={Y_AXIS_WIDTH}
          yAxisLabelTexts={yLabels}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.textTertiary, fontSize: 12 }}
          xAxisColor={colors.border}
          xAxisThickness={1}
          xAxisLabelTextStyle={{ color: colors.textTertiary, fontSize: 11 }}
          rulesColor={colors.border}
          rulesType="solid"
          pointerConfig={{
            pointerStripColor: colors.textTertiary,
            pointerStripWidth: 1,
            pointerColor: colors.chartLine,
            radius: 6,
            pointerLabelWidth: 120,
            pointerLabelHeight: 52,
            autoAdjustPointerLabelPosition: true,
            // Третий аргумент — номер точки под пальцем
            pointerLabelComponent: (_items: unknown, _secondary: unknown, pointerIndex: number) => {
              const point = points[pointerIndex] ?? points[points.length - 1];
              return (
                <View style={[styles.tooltip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <AppText variant="caption" color="textSecondary">
                    {isoToRuDate(point.date)}
                  </AppText>
                  <AppText variant="headline">{withUnit(point.value)}</AppText>
                </View>
              );
            },
          }}
        />
      ) : (
        <View style={{ height: CHART_HEIGHT + 30 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginLeft: -spacing.sm,
  },
  // Ячейка подписи начинается за полшага до точки: сдвигаем текст так, чтобы его правый край был у точки,
  // иначе последняя дата обрезается краем графика
  lastLabel: {
    width: LAST_LABEL_WIDTH,
    marginTop: -6,
    fontSize: 11,
    textAlign: 'right',
  },
  tooltip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
