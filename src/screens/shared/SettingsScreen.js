import React, { useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { Bell, BellRing, Info, ChevronRight, Building2, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import { notificationApi } from '../../api/data.api';
import { registerAndSyncPushToken } from '../../services/push';
import { apiError } from '../../api/client';
import { useToast } from '../../components/feedback/ToastProvider';
import AppHeader from '../../components/ui/AppHeader';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';

export default function SettingsScreen({ navigation }) {
  const { colors } = useTheme();
  const { checkAndInstallUpdate } = useAppUpdate();
  const toast = useToast();
  const [testing, setTesting] = useState(false);

  // App version, read from the embedded app config (app.json) so it updates
  // automatically whenever a new build with a bumped version is installed (§6).
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  // Test notification (§7): register/refresh this device's push token first, then
  // ask the backend to push a test notification back to it. Registering first is
  // what makes the test reliable — it (re)requests permission and stores a fresh
  // FCM token before the push is attempted.
  const sendTestNotification = async () => {
    if (testing) return;
    setTesting(true);
    try {
      const token = await registerAndSyncPushToken();
      if (!token) {
        toast.error('Allow notifications for CAPALY in your phone settings, then try again.');
        return;
      }
      await notificationApi.selfTestPush();
      toast.success('Test notification sent. Check your notification tray.');
    } catch (err) {
      toast.error(apiError(err, 'Could not send test notification. Allow notifications and try again.'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="small" color="textMuted" style={styles.sectionLabel}>ACCOUNT</Text>
        <Card padded={false}>
          <View style={styles.menuPad}>
            <MenuRow icon={Bell} label="Notifications" onPress={() => navigation.navigate('Notifications')} colors={colors} last />
          </View>
        </Card>

        <Text variant="small" color="textMuted" style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <Card padded={false}>
          <View style={styles.menuPad}>
            <MenuRow
              icon={BellRing}
              label={testing ? 'Sending test…' : 'Send Test Notification'}
              onPress={sendTestNotification}
              colors={colors}
              last
            />
          </View>
        </Card>

        <Text variant="small" color="textMuted" style={styles.sectionLabel}>ABOUT CAPALY</Text>
        <Card padded={false}>
          <View style={styles.menuPad}>
            <MenuRow icon={Building2} label="About Company" onPress={() => navigation.navigate('CompanyAbout')} colors={colors} />
            <MenuRow icon={RefreshCw} label="Check for Updates" onPress={checkAndInstallUpdate} colors={colors} />
            <Pressable style={styles.aboutRow}>
              <View style={[styles.menuIcon, { backgroundColor: colors.surfaceAlt }]}>
                <Info size={18} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body">CAPALY Mobile</Text>
                <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>
                  Safety • Compliance • CAPA • Inspections · v{appVersion}
                </Text>
              </View>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

function MenuRow({ icon: Icon, label, onPress, colors, last }) {
  return (
    <Pressable onPress={onPress} style={[styles.menuRow, !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={[styles.menuIcon, { backgroundColor: colors.surfaceAlt }]}>
        <Icon size={18} color={colors.text} />
      </View>
      <Text variant="body" style={{ flex: 1 }}>{label}</Text>
      <ChevronRight size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  sectionLabel: { marginTop: 20, marginBottom: 10, marginLeft: 4, letterSpacing: 1 },
  menuPad: { paddingHorizontal: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  menuIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
});
