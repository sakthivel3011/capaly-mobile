import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';

// Shimmering skeleton block for loading states.
export function Skeleton({ width = '100%', height = 16, radius = 8, style }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.surfaceAlt }, animated, style]}
    />
  );
}

// A card-shaped skeleton used by list screens.
export function SkeletonCard() {
  const { colors, radius } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}>
      <View style={styles.row}>
        <Skeleton width={44} height={44} radius={22} />
        <View style={styles.col}>
          <Skeleton width="70%" height={14} />
          <Skeleton width="40%" height={11} style={{ marginTop: 8 }} />
        </View>
      </View>
      <Skeleton width="100%" height={11} style={{ marginTop: 14 }} />
      <Skeleton width="85%" height={11} style={{ marginTop: 8 }} />
    </View>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  col: { flex: 1, marginLeft: 12 },
});
