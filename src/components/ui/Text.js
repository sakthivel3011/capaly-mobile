import React from 'react';
import { Text as RNText } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

// Themed text. `variant` maps to the typography scale; `color` accepts a theme
// color key (text, textMuted, primary, danger, ...) or a raw hex string.
export default function Text({ variant = 'body', color = 'text', style, children, ...rest }) {
  const { colors, typography } = useTheme();
  const base = typography[variant] || typography.body;
  const resolved = colors[color] || color;
  return (
    <RNText style={[base, { color: resolved }, style]} {...rest}>
      {children}
    </RNText>
  );
}
