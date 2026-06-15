import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// Bridge the CAPALY theme palette into a React Navigation theme.
export function makeNavTheme(colors, isDark) {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };
}
