import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type AccessibilityActionEvent, type GestureResponderEvent } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, icons } from '@/components/Icon';
import { ru } from '@/i18n/ru';
import { radius, spacing, useTheme } from '@/theme';

type PhotoCompareSliderProps = {
  beforeUri: string;
  afterUri: string;
  /** «До · 01.09.2026» */
  beforeCaption: string;
  afterCaption: string;
};

const HANDLE = 44;

/** «Шторка»: фото «после» целиком, поверх него — «до», открытое до ползунка. Тянуть пальцем в любую сторону. */
export function PhotoCompareSlider({ beforeUri, afterUri, beforeCaption, afterCaption }: PhotoCompareSliderProps) {
  const { colors } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState(0.5);

  const moveTo = (event: GestureResponderEvent) => {
    if (size.width > 0) {
      setPosition(Math.min(1, Math.max(0, event.nativeEvent.locationX / size.width)));
    }
  };
  const onAction = (event: AccessibilityActionEvent) => {
    const step = event.nativeEvent.actionName === 'increment' ? 0.1 : -0.1;
    setPosition((current) => Math.min(1, Math.max(0, current + step)));
  };
  const split = size.width * position;

  return (
    <View
      style={[styles.frame, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
      onLayout={(event) => setSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}>
      <Image source={{ uri: afterUri }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={afterCaption} />
      <View style={[styles.clip, { width: split }]}>
        <Image
          source={{ uri: beforeUri }}
          style={{ width: size.width, height: size.height }}
          contentFit="cover"
          accessibilityLabel={beforeCaption}
        />
      </View>
      <View style={[styles.line, { left: split - 1, backgroundColor: colors.accent }]} />
      <View style={[styles.handle, { left: split - HANDLE / 2, backgroundColor: colors.accent }]}>
        <Icon name={icons.compare} color="onAccent" size={22} />
      </View>
      <View style={[styles.badge, styles.badgeLeft, { backgroundColor: colors.surface }]}>
        <AppText variant="caption">{beforeCaption}</AppText>
      </View>
      <View style={[styles.badge, styles.badgeRight, { backgroundColor: colors.surface }]}>
        <AppText variant="caption">{afterCaption}</AppText>
      </View>
      {/* Прозрачный слой сверху ловит касания: координата пальца считается от левого края фото */}
      <View
        style={StyleSheet.absoluteFill}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={ru.progress.sliderLabel}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(position * 100) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={onAction}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={moveTo}
        onResponderMove={moveTo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  clip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
  },
  handle: {
    position: 'absolute',
    top: '50%',
    marginTop: -HANDLE / 2,
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeLeft: {
    left: spacing.sm,
  },
  badgeRight: {
    right: spacing.sm,
  },
});
