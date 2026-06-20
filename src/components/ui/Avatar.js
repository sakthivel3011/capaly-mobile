import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../theme/ThemeProvider';
import Text from './Text';

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

// Avatar with image or initials fallback.
// `variant="onAccent"` renders a white-on-translucent avatar for use on the
// coloured dashboard hero (B: top-bar avatar must read white, not blue).
export default function Avatar({ uri, name, size = 44, style, variant }) {
  const { colors } = useTheme();
  const onAccent = variant === 'onAccent';
  // If the remote image fails to load we fall back to the initials avatar so the
  // header never shows a broken image (G §6: fallback avatar if image fails).
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [uri]);

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
        contentFit="cover"
        transition={150}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: onAccent ? 'rgba(255,255,255,0.22)' : colors.primaryBg,
        },
        style,
      ]}
    >
      <Text
        variant="bodyStrong"
        color={onAccent ? '#FFFFFF' : 'primary'}
        style={{ fontSize: size * 0.36 }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
