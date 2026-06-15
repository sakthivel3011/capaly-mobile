import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccent } from '../../theme/accent';
import Card from './Card';
import Text from './Text';

// Titled form section with an icon — used to group premium form fields.
export default function SectionCard({ icon: Icon, title, subtitle, children, style }) {
  const { colors } = useTheme();
  const accent = useAccent();
  return (
    <Card style={[styles.card, style]}>
      <View style={styles.header}>
        {Icon ? (
          <View style={styles.iconWrap}>
            <Icon size={22} color={accent} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text variant="title">{title}</Text>
          {subtitle ? <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.body}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconWrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  body: {},
});
