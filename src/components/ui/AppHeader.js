import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Text from './Text';

// Screen header with optional back button + right-side actions.
export default function AppHeader({ title, subtitle, onBack, right, transparent = false }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + 6,
          backgroundColor: transparent ? 'transparent' : colors.background,
          borderBottomColor: transparent ? 'transparent' : colors.border,
        },
      ]}
    >
      <View style={styles.side}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}>
            <ChevronLeft size={22} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.center}>
        <Text variant="h3" numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text variant="caption" color="textMuted" numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.rightSide]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: { width: 64, justifyContent: 'center' },
  rightSide: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
