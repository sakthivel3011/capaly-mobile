import React, { useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import {
  Mail, Phone, IdCard, Building2, Settings as SettingsIcon, LogOut, Camera, ChevronRight, Pencil, Briefcase,
  GitBranch, Sun, Moon, Smartphone, Palette, Bell,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccents } from '../../theme/accent';
import { useAuthStore, PORTAL } from '../../store/authStore';
import { profileApi } from '../../api/data.api';
import { apiError } from '../../api/client';
import { useToast } from '../../components/feedback/ToastProvider';
import { useConfirm } from '../../components/feedback/ConfirmProvider';
import AppHeader from '../../components/ui/AppHeader';
import { useAppUpdate } from '../../hooks/useAppUpdate';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { TextField } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { fullName, resolveImageUrl } from '../../utils/format';

export default function ProfileScreen({ navigation }) {
  const { colors, preference, setThemePreference } = useTheme();
  const { accent, accentDark } = useAccents();
  const { checking, checkAndInstallUpdate } = useAppUpdate();
  const toast = useToast();
  const confirm = useConfirm();
  const user = useAuthStore((s) => s.user);
  const portalType = useAuthStore((s) => s.portalType);
  const logout = useAuthStore((s) => s.logout);
  const refreshMe = useAuthStore((s) => s.refreshMe);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [image, setImage] = useState(null);

  const isEmployee = portalType === PORTAL.EMPLOYEE;

  // App version + build, read from the embedded app config so it updates
  // automatically whenever a new APK (with a bumped app.json) is installed (L).
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const appBuild = Constants.expoConfig?.android?.versionCode
    ?? Constants.expoConfig?.ios?.buildNumber
    ?? '—';
  const appVersionLabel = `CAPALY Beta v${appVersion} (Build ${appBuild})`;

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6, mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled) setImage(res.assets[0]);
  };

  const save = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append('firstName', firstName);
      form.append('lastName', lastName);
      form.append('phone', phone || '');
      // Field name must match the backend multer config (.single('profileImage')).
      // Sending the wrong field name made multer throw "Unexpected field", which is
      // why the upload errored and the image never appeared (G).
      //
      // Always send a filename that carries a real image extension. Android's
      // picker often returns a fileName with no/unknown extension, which the
      // backend's extension check rejected (G: upload error) — derive it from the
      // mime type so the name is always valid.
      if (image) {
        const mime = image.mimeType || 'image/jpeg';
        const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
        const hasGoodExt = image.fileName && /\.(jpg|jpeg|png|webp)$/i.test(image.fileName);
        const name = hasGoodExt ? image.fileName : `profile.${ext}`;
        form.append('profileImage', { uri: image.uri, name, type: mime });
      }
      if (isEmployee) await profileApi.employeeUpdate(form);
      else await profileApi.update(form);
      await refreshMe();
      toast.success('Profile updated');
      setEditing(false);
      setImage(null);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    const ok = await confirm({ title: 'Sign out?', message: 'You will need to sign in again to access CAPALY.', confirmText: 'Sign out', danger: true });
    if (ok) await logout();
  };

  const avatarUri = image?.uri || resolveImageUrl(user?.profileImageUrl || user?.avatarUrl);

  const MenuRow = ({ icon: Icon, label, onPress, danger, last, badge }) => (
    <Pressable onPress={onPress} style={[styles.menuRow, !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? colors.dangerBg : colors.surfaceAlt }]}>
        <Icon size={18} color={danger ? colors.danger : colors.text} />
      </View>
      <Text variant="body" color={danger ? 'danger' : 'text'} style={{ flex: 1 }}>{label}</Text>
      {badge > 0 ? (
        <View style={[styles.countBadge, { backgroundColor: colors.danger }]}>
          <Text variant="caption" color="#FFFFFF" style={styles.countBadgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
      {!danger ? <ChevronRight size={18} color={colors.textFaint} /> : null}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Profile"
        right={
          <Pressable onPress={() => setEditing((e) => !e)} hitSlop={10} style={[styles.editBtn, { backgroundColor: colors.surfaceAlt }]}>
            <Pencil size={16} color={colors.primary} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.headerCard}>
          <Pressable onPress={editing ? pickImage : undefined} style={styles.avatarWrap}>
            <Avatar uri={avatarUri} name={fullName(user)} size={72} />
            {editing ? (
              <View style={[styles.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.card }]}>
                <Camera size={14} color="#fff" />
              </View>
            ) : null}
          </Pressable>
          <Text variant="h3" style={{ marginTop: 10 }}>{fullName(user)}</Text>
          <View style={styles.badgeRow}>
            <Badge label={user?.primaryRole || 'User'} />
            {user?.employeeId ? (
              <View style={[styles.codeBadge, { backgroundColor: `${accent}1A` }]}>
                <IdCard size={12} color={accent} />
                <Text variant="caption" style={{ color: accent, fontWeight: '700' }}>{user.employeeId}</Text>
              </View>
            ) : null}
          </View>
        </Card>

        {editing ? (
          <Card style={styles.section}>
            <TextField label="First name" value={firstName} onChangeText={setFirstName} />
            <TextField label="Last name" value={lastName} onChangeText={setLastName} />
            <TextField
              label="Email (managed by admin)"
              value={user?.email || ''}
              editable={false}
              leftIcon={<Mail size={18} color={colors.textFaint} />}
            />
            <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad"
              leftIcon={<Phone size={18} color={colors.textMuted} />} />
            <Button title="Save changes" onPress={save} loading={saving} style={{ marginTop: 4 }} color={[accent, accentDark]} />
            <Button title="Cancel" variant="ghost" onPress={() => { setEditing(false); setImage(null); }} style={{ marginTop: 4 }} />
          </Card>
        ) : (
          <Card style={styles.section}>
            <InfoRow icon={Mail} label="Email" value={user?.email} colors={colors} />
            <InfoRow icon={Phone} label="Phone" value={user?.phone || '—'} colors={colors} />
            {user?.employeeId ? <InfoRow icon={IdCard} label="Employee code" value={user.employeeId} colors={colors} /> : null}
            {user?.department?.name ? <InfoRow icon={Briefcase} label="Department" value={user.department.name} colors={colors} /> : null}
            <InfoRow icon={Building2} label="Company" value={user?.company?.name || '—'} colors={colors} last />
          </Card>
        )}

        {/* Appearance / theme (K). Light / Dark / System; persisted globally by
            the ThemeProvider and applied app-wide. */}
        <Card style={styles.section}>
          <View style={styles.themeHeader}>
            <Palette size={18} color={colors.textMuted} />
            <Text variant="title" style={{ marginLeft: 8 }}>Appearance</Text>
          </View>
          <View style={styles.themeRow}>
            {[
              { key: 'light', label: 'Light', icon: Sun },
              { key: 'dark', label: 'Dark', icon: Moon },
              { key: 'system', label: 'System', icon: Smartphone },
            ].map((opt) => {
              const active = preference === opt.key;
              const Icon = opt.icon;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setThemePreference(opt.key)}
                  style={[
                    styles.themeOption,
                    {
                      borderColor: active ? accent : colors.border,
                      backgroundColor: active ? `${accent}14` : colors.surfaceAlt,
                    },
                  ]}
                >
                  <Icon size={18} color={active ? accent : colors.textMuted} />
                  <Text variant="caption" style={{ marginTop: 4, color: active ? accent : colors.textMuted, fontWeight: active ? '700' : '500' }}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.section} padded={false}>
          <View style={styles.menuPad}>
            <MenuRow icon={GitBranch} label="Company Workflow" onPress={() => navigation.navigate('Workflow')} />
            <MenuRow icon={Bell} label="Notifications" onPress={() => navigation.navigate('Notifications')} />
            <MenuRow icon={SettingsIcon} label="Settings" onPress={() => navigation.navigate('Settings')} last />
          </View>
        </Card>

        <Button
          title="Logout"
          icon={<LogOut size={18} color="#fff" />}
          onPress={onLogout}
          variant="danger"
          style={styles.section}
        />

        <Pressable
          onPress={checkAndInstallUpdate}
          disabled={checking}
          style={({ pressed }) => [
            styles.versionWrap,
            pressed && { opacity: 0.6 }
          ]}
        >
          <Text variant="caption" color="textFaint" style={styles.version}>{appVersionLabel}</Text>
          <Text variant="caption" style={[styles.version, { marginTop: 4, color: accent, fontWeight: '700' }]}>
            Check for Updates
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon: Icon, label, value, colors, last }) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Icon size={16} color={colors.textMuted} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text variant="caption" color="textMuted">{label}</Text>
        <Text variant="small" style={{ marginTop: 1 }} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  headerCard: { alignItems: 'center', paddingVertical: 16 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  codeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  avatarWrap: { position: 'relative' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  section: { marginTop: 16 },
  themeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeOption: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  menuPad: { paddingHorizontal: 16 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  menuIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  countBadge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  countBadgeText: { fontSize: 10, lineHeight: 13, fontWeight: '700' },
  editBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  versionWrap: { marginTop: 24 },
  version: { textAlign: 'center' },
});
