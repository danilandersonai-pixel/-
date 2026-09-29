import type { TextStyle } from 'react-native';

import { fonts } from './fonts';

// У своих шрифтов начертание задаётся семейством, а не fontWeight: на Android иначе подставится системный шрифт.

export const typography = {
  /** Заголовок экрана: крупно, заглавными, как на табло */
  largeTitle: { fontFamily: fonts.displayBold, fontSize: 36, lineHeight: 44, letterSpacing: 0.5, textTransform: 'uppercase' },
  /** Заголовки разделов и значения в плитках */
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32 },
  /** Подписи над карточками: «СЕГОДНЯ», «ЛИЧНЫЕ РЕКОРДЫ» */
  section: { fontFamily: fonts.displayMedium, fontSize: 15, lineHeight: 20, letterSpacing: 1.2, textTransform: 'uppercase' },
  headline: { fontFamily: fonts.bodySemiBold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 17, lineHeight: 24 },
  callout: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  /** Крупные цифры результатов замера */
  number: {
    fontFamily: fonts.displayBold,
    fontSize: 72,
    lineHeight: 78,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
