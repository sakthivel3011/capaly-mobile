import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

// Soft, premium surface card. Pass `onPress` to make it pressable with a subtle
// press-in scale handled by the consumer (see PressableCard for animated press).
export default function Card({ children, style, onPress, padded = true, ...rest }) {
  const { colors, radius, shadowSoft } = useTheme();
  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
        },
        shadowSoft(),
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
        {...rest}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
  padded: { padding: 16 },
});
