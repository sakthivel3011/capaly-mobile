import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Cookie } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Text from '../ui/Text';
import Button from '../ui/Button';

// Small consent banner shown on login screens (PLAN.md §4). Local-only ack.
export default function CookieNotice() {
  const { colors, radius } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderRadius: radius.md }]}>
      <Cookie size={18} color={colors.textMuted} style={{ marginTop: 1 }} />
      <View style={styles.body}>
        <Text variant="caption" color="textMuted">
          CAPALY uses secure cookies to keep your login session active until you sign out.
        </Text>
        <View style={styles.actions}>
          <Button title="Accept" size="sm" fullWidth={false} onPress={() => setDismissed(true)} style={styles.btn} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', padding: 12, borderWidth: StyleSheet.hairlineWidth, marginTop: 8 },
  body: { flex: 1, marginLeft: 10 },
  actions: { flexDirection: 'row', marginTop: 10 },
  btn: { paddingHorizontal: 22 },
});
