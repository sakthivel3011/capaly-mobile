import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../theme/ThemeProvider';
import Text from './Text';

const ICON = require('../../../assets/icon.png');

// CAPALY lockup — real app icon + wordmark + tagline. `size` scales it.
export default function Brand({ size = 'md', showTagline = true, light = false }) {
  const { colors } = useTheme();
  const dims = { sm: 34, md: 44, lg: 56 }[size] || 44;
  const titleVariant = { sm: 'h3', md: 'h1', lg: 'display' }[size] || 'h1';
  const titleColor = light ? '#FFFFFF' : colors.text;
  const tagColor = light ? 'rgba(255,255,255,0.8)' : colors.textMuted;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Image
          source={ICON}
          style={{ width: dims, height: dims, borderRadius: dims * 0.24 }}
          contentFit="contain"
        />
        <Text variant={titleVariant} color={titleColor} style={styles.title}>
          CAPALY
        </Text>
      </View>
      {showTagline ? (
        <Text variant="caption" color={tagColor} style={styles.tagline}>
          Safety • Compliance • CAPA • Inspections
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { marginLeft: 12, letterSpacing: 1 },
  tagline: { marginTop: 8, letterSpacing: 0.5 },
});
