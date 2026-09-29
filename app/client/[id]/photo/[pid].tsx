import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ConfirmButton } from '@/components/ConfirmButton';
import { EmptyState } from '@/components/EmptyState';
import { FormScreen } from '@/components/FormScreen';
import { icons } from '@/components/Icon';
import { deletePhoto } from '@/db/photos';
import { usePhotos } from '@/db/usePhotos';
import { ru } from '@/i18n/ru';
import { radius, useTheme } from '@/theme';
import { isoToRuDate } from '@/utils/date';

export default function PhotoScreen() {
  const { id, pid } = useLocalSearchParams<{ id: string; pid: string }>();
  const { data: photos } = usePhotos(id);
  const { colors } = useTheme();

  if (!photos) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }
  const photo = photos.find((p) => p.id === pid);
  if (!photo) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState icon={icons.photo} title={ru.progress.photoNotFound} hint={ru.measurement.notFoundHint} />
      </View>
    );
  }

  return (
    <FormScreen>
      <Stack.Screen options={{ title: ru.progress.photoTitle }} />
      <View style={[styles.frame, { backgroundColor: colors.surfaceMuted }]}>
        <Image source={{ uri: photo.uri }} style={styles.image} contentFit="contain" />
      </View>
      <AppText variant="headline">{`${ru.progress.angles[photo.angle]} · ${isoToRuDate(photo.date)}`}</AppText>
      <ConfirmButton
        title={ru.progress.deletePhoto}
        question={ru.progress.deletePhotoConfirm}
        confirmTitle={ru.progress.deletePhotoButton}
        onConfirm={() => {
          void deletePhoto(photo.id).then(() => router.back());
        }}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  frame: {
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
