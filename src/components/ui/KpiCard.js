import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Text from './Text';

// Compact KPI tile for dashboards. `tone` selects an accent color; `delta` shows
// an optional sublabel (e.g. "8 open"). When `onPress` is provided the tile
// becomes tappable (e.g. the employee "Action Tasks" tile opens the action plan).
export default function KpiCard({ label, value, icon, tone = 'primary', delta, style, onPress }) {
  const { colors, radius, shadowSoft } = useTheme();
  const toneColor = colors[tone] || colors.primary;
  const Icon = icon;

  const baseStyle = [
    styles.card,
    { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg },
    shadowSoft(),
    style,
  ];

  const content = (
    <>
      <View style={styles.iconWrap}>
        {Icon ? <Icon size={20} color={toneColor} /> : null}
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
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [baseStyle, pressed && { opacity: 0.85 }]}>
        {content}
      </Pressable>
    );
  }

  return <View style={baseStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: { flex: 1, borderWidth: StyleSheet.hairlineWidth, padding: 13, minHeight: 92, justifyContent: 'flex-start' },
  iconWrap: { width: 22, height: 22, alignItems: 'flex-start', justifyContent: 'center', marginBottom: 8 },
  value: { fontSize: 22, marginBottom: 1 },
  delta: { marginTop: 5 },
});
