import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Text from './Text';

// Label/value row for detail screens. `value` may be a string or a node.
export default function DetailRow({ label, value, last = false }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Text variant="small" color="textMuted" style={styles.label}>{label}</Text>
      <View style={styles.value}>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Text variant="body" style={styles.valueText}>{value || '—'}</Text>
        ) : (
          value || <Text variant="body">—</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingVertical: 12, alignItems: 'flex-start' },
  label: { width: 120, paddingTop: 1 },
  value: { flex: 1, alignItems: 'flex-end' },
  valueText: { textAlign: 'right' },
});
