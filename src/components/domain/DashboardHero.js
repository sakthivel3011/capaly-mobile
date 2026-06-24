import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthStore } from '../../store/authStore';
import { useAccents } from '../../theme/accent';
import { useConfirm } from '../feedback/ConfirmProvider';
import Text from '../ui/Text';
import Avatar from '../ui/Avatar';
import NotificationBell from './NotificationBell';
import { fullName, resolveImageUrl } from '../../utils/format';

// Gradient hero: company name on top, user name + employee ID below, plus bell.
export default function DashboardHero({ user, subtitle, badge, role, onBellPress, onProfilePress }) {
  const { colors } = useTheme();
  const { accent: HERO_COLOR, accentDark: HERO_COLOR_DARK } = useAccents();
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();
  const logout = useAuthStore((s) => s.logout);

  const onSignOut = async () => {
    const ok = await confirm({
      title: 'Sign out?',
      message: 'You will need to sign in again to access CAPALY.',
      confirmText: 'Sign out',
      danger: true,
    });
    if (ok) await logout();
  };

  return (
    <LinearGradient
      colors={[HERO_COLOR, HERO_COLOR_DARK]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: insets.top + 14 }]}
    >


      <View style={styles.topRow}>
        {/* Tapping the user/avatar block opens the Profile page (mobile §1). */}
        <Pressable
          onPress={onProfilePress}
          disabled={!onProfilePress}
          hitSlop={6}
          style={({ pressed }) => [styles.userRow, pressed && onProfilePress && { opacity: 0.8 }]}
        >
          <View style={styles.avatarRing}>
            <Avatar uri={resolveImageUrl(user?.profileImageUrl || user?.avatarUrl)} name={fullName(user)} size={44} variant="onAccent" />
          </View>
          <View style={styles.userText}>
            {/* Company name on top, then the user's name + employee ID stacked
                below it (mobile §: employee top bar). */}

            <Text variant="h3" color="#FFFFFF" numberOfLines={1} style={styles.name}>{fullName(user) || 'there'}</Text>
            {badge ? (
              <Text variant="caption" color="rgba(255,255,255,0.8)" numberOfLines={1} style={styles.idLine}>{badge}</Text>
            ) : null}
          </View>
        </Pressable>
        <View style={styles.actions}>
          <NotificationBell light onPress={onBellPress} />
          <Pressable
            onPress={onSignOut}
            hitSlop={10}
            style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.7 }]}
          >
            <LogOut size={19} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {role || subtitle ? (
        <View style={styles.contextRow}>
          {role ? (
            <View style={styles.roleChip}>
              <Text variant="caption" numberOfLines={1} style={[styles.roleText, { color: HERO_COLOR }]}>{role}</Text>
            </View>
          ) : null}
          {subtitle ? (
            <View style={styles.contextChip}>
              <Text variant="caption" color="rgba(255,255,255,0.92)" numberOfLines={1}>{subtitle}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 26,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -70,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  signOut: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  userRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  avatarRing: {
    padding: 2,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  userText: { marginLeft: 12, flex: 1 },
  companyLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  companyTop: { flexShrink: 1, fontWeight: '600' },
  name: { flexShrink: 1 },
  idLine: { marginTop: 1, letterSpacing: 0.2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, letterSpacing: 0.3 },
  contextRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  companyChip: { maxWidth: '62%' },
  companyName: { flexShrink: 1 },
  chipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#7FE3A0' },
  roleChip: { backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  roleText: { fontWeight: '700' },
});
