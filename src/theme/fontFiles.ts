import { GolosText_400Regular } from '@expo-google-fonts/golos-text/400Regular';
import { GolosText_500Medium } from '@expo-google-fonts/golos-text/500Medium';
import { GolosText_600SemiBold } from '@expo-google-fonts/golos-text/600SemiBold';
import { GolosText_700Bold } from '@expo-google-fonts/golos-text/700Bold';
import { Oswald_500Medium } from '@expo-google-fonts/oswald/500Medium';
import { Oswald_600SemiBold } from '@expo-google-fonts/oswald/600SemiBold';
import { Oswald_700Bold } from '@expo-google-fonts/oswald/700Bold';

import { fonts } from './fonts';

/** Файлы шрифтов для useFonts — только нужные начертания, чтобы приложение не разрасталось */
export const fontFiles = {
  [fonts.displayMedium]: Oswald_500Medium,
  [fonts.display]: Oswald_600SemiBold,
  [fonts.displayBold]: Oswald_700Bold,
  [fonts.body]: GolosText_400Regular,
  [fonts.bodyMedium]: GolosText_500Medium,
  [fonts.bodySemiBold]: GolosText_600SemiBold,
  [fonts.bodyBold]: GolosText_700Bold,
};
