import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AddPhotoPanel } from '@/components/AddPhotoPanel';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { EmptyState } from '@/components/EmptyState';
import { icons } from '@/components/Icon';
import { PhotoFrame } from '@/components/PhotoFrame';
import type { Photo, PhotoAngle } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { radius, spacing, useTheme } from '@/theme';
import { isoToRuDate } from '@/utils/date';

type PhotoSectionProps = {
  clientId: string;
  /** Фото, старые сначала */
  photos: Photo[];
};

const t = ru.progress;
const angles: readonly PhotoAngle[] = ['front', 'side', 'back'];

/** Фото «до/после»: два снимка одного ракурса рядом, выбор дат и все снимки */
export function PhotoSection({ clientId, photos }: PhotoSectionProps) {
  const { colors } = useTheme();
  const [angle, setAngle] = useState<PhotoAngle>(photos[0]?.angle ?? 'front');
  const [adding, setAdding] = useState(false);
  const [choice, setChoice] = useState<{ before?: string; after?: string }>({});

  const ofAngle = photos.filter((photo) => photo.angle === angle);
  // По умолчанию — самое первое и самое последнее фото ракурса
  const before = ofAngle.find((p) => p.id === choice.before) ?? ofAngle[0] ?? null;
  const after = ofAngle.find((p) => p.id === choice.after) ?? (ofAngle.length > 1 ? ofAngle[ofAngle.length - 1] : null);

  const changeAngle = (next: PhotoAngle) => {
    setAngle(next);
    setChoice({});
  };

  const addPanel = adding ? (
    <AddPhotoPanel
      clientId={clientId}
      initialAngle={angle}
      onAdded={(addedAngle) => {
        setAdding(false);
        changeAngle(addedAngle);
      }}
      onCancel={() => setAdding(false)}
    />
  ) : (
    <Button title={t.addPhoto} icon={icons.add} variant="secondary" onPress={() => setAdding(true)} />
  );

  if (photos.length === 0) {
    return (
      <View style={styles.section}>
        <EmptyState icon={icons.photo} title={t.photosEmptyTitle} hint={t.photosEmptyHint} />
        {addPanel}
      </View>
    );
  }

  const dateOptions = ofAngle.map((photo) => ({ value: photo.id, label: isoToRuDate(photo.date) }));

  return (
    <View style={styles.section}>
      <Chips
        label={t.photoAngle}
        options={angles.map((value) => ({ value, label: t.angles[value] }))}
        value={angle}
        onChange={changeAngle}
      />
      <View style={styles.compare}>
        <PhotoFrame
          uri={before?.uri ?? null}
          caption={before ? `${t.before} · ${isoToRuDate(before.date)}` : t.before}
          emptyText={t.noAngle}
        />
        <PhotoFrame
          uri={after?.uri ?? null}
          caption={after ? `${t.after} · ${isoToRuDate(after.date)}` : t.after}
          emptyText={ofAngle.length === 1 ? t.onePhoto : t.noAngle}
        />
      </View>
      {ofAngle.length > 2 ? (
        <>
          <AppText variant="caption" color="textSecondary">
            {t.before}
          </AppText>
          <Chips
            label={t.before}
            options={dateOptions}
            value={before?.id ?? null}
            onChange={(id) => setChoice((current) => ({ ...current, before: id }))}
          />
          <AppText variant="caption" color="textSecondary">
            {t.after}
          </AppText>
          <Chips
            label={t.after}
            options={dateOptions}
            value={after?.id ?? null}
            onChange={(id) => setChoice((current) => ({ ...current, after: id }))}
          />
        </>
      ) : null}
      {addPanel}
      <AppText variant="section" color="textSecondary">
        {t.allPhotos}
      </AppText>
      <View style={styles.grid}>
        {[...photos].reverse().map((photo) => (
          <Pressable
            key={photo.id}
            accessibilityRole="button"
            accessibilityLabel={`${t.angles[photo.angle]}, ${isoToRuDate(photo.date)}`}
            onPress={() => router.push({ pathname: '/client/[id]/photo/[pid]', params: { id: clientId, pid: photo.id } })}
            style={({ pressed }) => [styles.thumb, pressed && styles.pressed]}>
            <View style={[styles.thumbFrame, { backgroundColor: colors.surfaceMuted }]}>
              <Image source={{ uri: photo.uri }} style={styles.image} contentFit="cover" />
            </View>
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {isoToRuDate(photo.date)}
            </AppText>
            <AppText variant="caption" color="textTertiary" numberOfLines={1}>
              {t.angles[photo.angle]}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  compare: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  thumb: {
    width: '31%',
    gap: 2,
  },
  thumbFrame: {
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.7,
  },
});
