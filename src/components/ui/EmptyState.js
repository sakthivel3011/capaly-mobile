import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Text from './Text';
import Button from './Button';

// Friendly empty / error state with an optional action.
export default function EmptyState({ icon, title = 'Nothing here yet', message, actionTitle, onAction, style }) {
  const { colors } = useTheme();
  const Icon = icon || Inbox;
  return (
    <View style={[styles.wrap, style]}>
      {icon !== null ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
          <Icon size={30} color={colors.textMuted} />
        </View>
      ) : null}
      <Text variant="h3" style={styles.title}>{title}</Text>
      {message ? (
        <Text variant="body" color="textMuted" style={styles.message}>{message}</Text>
      ) : null}
      {actionTitle && onAction ? (
        <Button title={actionTitle} onPress={onAction} variant="outline" fullWidth={false} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 32 },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', marginTop: 6 },
  action: { marginTop: 18, paddingHorizontal: 28 },
});
