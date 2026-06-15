import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Text from './Text';

// Compact KPI tile for dashboards. `tone` selects an accent color; `delta` shows
// an optional sublabel (e.g. "8 open").
export default function KpiCard({ label, value, icon, tone = 'primary', delta, style }) {
  const { colors, radius, shadowSoft } = useTheme();
  const toneColor = colors[tone] || colors.primary;
  const Icon = icon;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg },
        shadowSoft(),
        style,
      ]}
    >
      <View style={styles.iconWrap}>
        {Icon ? <Icon size={24} color={toneColor} /> : null}
      </View>
      <Text variant="display" style={styles.value} numberOfLines={1}>
        {value ?? 0}
      </Text>
      <Text variant="small" color="textMuted" numberOfLines={1}>
        {label}
      </Text>
      {delta ? (
        <Text variant="caption" color={toneColor} style={styles.delta}>
          {delta}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderWidth: StyleSheet.hairlineWidth, padding: 16, minHeight: 120, justifyContent: 'flex-start' },
  iconWrap: { width: 28, height: 28, alignItems: 'flex-start', justifyContent: 'center', marginBottom: 12 },
  value: { marginBottom: 2 },
  delta: { marginTop: 6 },
});
