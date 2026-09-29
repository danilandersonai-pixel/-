import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius, spacing, useTheme } from '@/theme';

type PhotoFrameProps = {
  uri: string | null;
  /** «До · 01.09.2026» */
  caption: string;
  /** Текст, если фото нет */
  emptyText?: string;
};

/** Фото в рамке 3:4 с подписью — для сравнения «до/после» */
export function PhotoFrame({ uri, caption, emptyText }: PhotoFrameProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      <View style={[styles.frame, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} contentFit="cover" accessibilityLabel={caption} />
        ) : (
          <AppText variant="caption" color="textTertiary" style={styles.empty}>
            {emptyText}
          </AppText>
        )}
      </View>
      <AppText variant="caption" color="textSecondary" style={styles.caption}>
        {caption}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    gap: spacing.xs,
  },
  frame: {
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  empty: {
    textAlign: 'center',
    padding: spacing.md,
  },
  caption: {
    textAlign: 'center',
  },
});
