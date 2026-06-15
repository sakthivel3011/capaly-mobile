import React from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccent } from '../../theme/accent';
import Text from './Text';

// Horizontally scrollable segmented control — used for workflow detail tabs and
// filter switches.
export default function SegmentedTabs({ tabs, active, onChange, style }) {
  const { colors, radius } = useTheme();
  const accent = useAccent();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, style]}
    >
      {tabs.map((tab) => {
        const key = typeof tab === 'string' ? tab : tab.key;
        const label = typeof tab === 'string' ? tab : tab.label;
        const isActive = key === active;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? accent : colors.surfaceAlt,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text variant="small" color={isActive ? '#FFFFFF' : 'textMuted'}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4, paddingRight: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 9 },
});
