import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { SEVERITY } from '../../theme/colors';
import Text from './Text';

// Hex -> soft translucent background for pill badges.
function tint(hex, alpha = '22') {
  return `${hex}${alpha}`;
}

// Generic pill badge.
export function Badge({ label, color, bg, style }) {
  const { colors, radius } = useTheme();
  const fg = color || colors.primary;
  return (
    <View style={[styles.badge, { backgroundColor: bg || tint(fg), borderRadius: radius.pill }, style]}>
      <Text variant="caption" color={fg}>
        {label}
      </Text>
    </View>
  );
}

// Severity / priority badge — Critical/High/Medium/Low/Info.
export function SeverityBadge({ value, style }) {
  const color = SEVERITY[value] || SEVERITY.Info;
  return <Badge label={value || 'Info'} color={color} style={style} />;
}

// Status badge — maps common workflow statuses to colors.
const STATUS_COLORS = {
  Open: '#2563EB',
  'Under Investigation': '#7C3AED',
  'CAPA Assigned': '#0891B2',
  'In Progress': '#F59E0B',
  Pending: '#F59E0B',
  Assigned: '#0891B2',
  Resolved: '#16A34A',
  Closed: '#16A34A',
  Completed: '#16A34A',
  Rejected: '#DC2626',
  Overdue: '#DC2626',
};

export function StatusBadge({ value, style }) {
  const { colors } = useTheme();
  const color = STATUS_COLORS[value] || colors.textMuted;
  return <Badge label={value || '—'} color={color} style={style} />;
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
});
