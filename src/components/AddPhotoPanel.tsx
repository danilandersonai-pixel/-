import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TextField } from '@/components/TextField';
import { storePhoto } from '@/db/photoFiles';
import { addPhoto } from '@/db/photos';
import type { PhotoAngle } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { radius, spacing, useTheme } from '@/theme';
import { isoToRuDate, maskDateInput, parseRuDate, toIsoDate } from '@/utils/date';

type AddPhotoPanelProps = {
  clientId: string;
  initialAngle: PhotoAngle;
  onAdded: (angle: PhotoAngle) => void;
  onCancel: () => void;
};

const t = ru.progress;

const angleOptions: readonly { value: PhotoAngle; label: string }[] = [
  { value: 'front', label: t.angles.front },
  { value: 'side', label: t.angles.side },
  { value: 'back', label: t.angles.back },
];

/** Добавление фото: ракурс, дата, камера или галерея */
export function AddPhotoPanel({ clientId, initialAngle, onAdded, onCancel }: AddPhotoPanelProps) {
  const { colors } = useTheme();
  const [angle, setAngle] = useState<PhotoAngle>(initialAngle);
  const [date, setDate] = useState(isoToRuDate(toIsoDate(new Date())));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isoDate = parseRuDate(date);

  const save = async (source: 'camera' | 'library') => {
    if (!isoDate) {
      return;
    }
    setError(null);
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError(t.cameraDenied);
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled || !result.assets[0]) {
        return;
      }
      setBusy(true);
      const uri = await storePhoto(result.assets[0].uri);
      await addPhoto(clientId, isoDate, angle, uri);
      onAdded(angle);
    } catch {
      setError(t.photoError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <SegmentedControl label={t.photoAngle} options={angleOptions} value={angle} onChange={setAngle} />
      <TextField
        label={t.photoDate}
        value={date}
        onChangeText={(text) => setDate(maskDateInput(text))}
        error={isoDate ? undefined : ru.measurement.errors.dateInvalid}
        keyboardType="number-pad"
        maxLength={10}
      />
      {error ? (
        <AppText variant="callout" color="danger">
          {error}
        </AppText>
      ) : null}
      {/* В браузере камера недоступна — только выбор файла */}
      {Platform.OS !== 'web' ? (
        <Button title={t.takePhoto} onPress={() => void save('camera')} disabled={!isoDate || busy} />
      ) : null}
      <Button
        title={t.pickPhoto}
        variant={Platform.OS === 'web' ? 'primary' : 'secondary'}
        onPress={() => void save('library')}
        disabled={!isoDate || busy}
      />
      <Button title={ru.card.cancel} variant="secondary" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
