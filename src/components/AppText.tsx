import { Text, type TextProps } from 'react-native';

import { useTheme, type Palette, type TypographyVariant } from '@/theme';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: keyof Palette;
};

/** Текст с размером из темы и цветом из текущей палитры */
export function AppText({ variant = 'body', color = 'text', style, ...rest }: AppTextProps) {
  const { colors, typography } = useTheme();
  return <Text style={[typography[variant], { color: colors[color] }, style]} {...rest} />;
}
