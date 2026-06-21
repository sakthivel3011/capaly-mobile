import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { KeyRound, Bell, Info, ChevronRight, Building2, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import AppHeader from '../../components/ui/AppHeader';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';

export default function SettingsScreen({ navigation }) {
  const { colors } = useTheme();
  const { checking, checkAndInstallUpdate } = useAppUpdate();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="small" color="textMuted" style={styles.sectionLabel}>ACCOUNT</Text>
        <Card padded={false}>
          <View style={styles.menuPad}>
            <MenuRow icon={KeyRound} label="Change Password" onPress={() => navigation.navigate('ChangePassword')} colors={colors} />
            <MenuRow icon={Bell} label="Notifications" onPress={() => navigation.navigate('Notifications')} colors={colors} last />
          </View>
        </Card>

        <Text variant="small" color="textMuted" style={styles.sectionLabel}>ABOUT</Text>
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
                  Safety • Compliance • CAPA • Inspections · v1.0.0
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeOption: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 14, borderWidth: 1.5 },
  menuPad: { paddingHorizontal: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  menuIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
});
