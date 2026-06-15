import React from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';

// Base screen container. `scroll` wraps content in a ScrollView with optional
// pull-to-refresh; otherwise a plain padded View (use for FlashList screens).
export default function Screen({
  children,
  scroll = false,
  refreshing,
  onRefresh,
  padded = true,
  edges = ['top'],
  style,
  contentStyle,
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const pad = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
  };

  if (scroll) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }, pad, style]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[padded && styles.padded, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }, pad, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
});
