import React from 'react';
import { Pressable, ActivityIndicator, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import Text from './Text';

// Premium button with variants + loading state. Primary uses a brand gradient.
export default function Button({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  size = 'md', // sm | md | lg
  loading = false,
  disabled = false,
  icon = null, // a lucide icon element
  fullWidth = true,
  style,
  color,
}) {
  const { colors, radius } = useTheme();
  const isDisabled = disabled || loading;

  const heights = { sm: 40, md: 50, lg: 56 };
  const height = heights[size] || heights.md;

  const textColorFor = {
    primary: '#FFFFFF',
    danger: '#FFFFFF',
    secondary: colors.text,
    outline: colors.primary,
    ghost: colors.primary,
  };

  const inner = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={textColorFor[variant] || '#fff'} />
      ) : (
        <>
          {icon}
          <Text variant="bodyStrong" color={textColorFor[variant]} style={icon ? { marginLeft: 8 } : null}>
            {title}
          </Text>
        </>
      )}
    </View>
  );

  const baseStyle = [
    styles.btn,
    { height, borderRadius: radius.md, opacity: isDisabled ? 0.6 : 1, width: fullWidth ? '100%' : undefined },
    style,
  ];

  if (variant === 'primary' || variant === 'danger') {
    const grad = variant === 'danger'
      ? ['#EF4444', '#DC2626']
      : color
        ? (Array.isArray(color) ? color : [color, color])
        : [colors.primary, colors.accent];
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
        <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={baseStyle}>
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  const variantStyle = {
    secondary: { backgroundColor: colors.surfaceAlt },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    ghost: { backgroundColor: 'transparent' },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [...baseStyle, variantStyle, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
