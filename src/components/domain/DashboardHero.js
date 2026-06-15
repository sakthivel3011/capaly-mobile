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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Gradient hero with greeting, user, company/department context + bell.
export default function DashboardHero({ user, subtitle, badge, role, onBellPress }) {
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
      {/* Decorative glow circles for depth */}
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />

      <View style={styles.topRow}>
        <View style={styles.userRow}>
          <View style={styles.avatarRing}>
            <Avatar uri={resolveImageUrl(user?.profileImageUrl || user?.avatarUrl)} name={fullName(user)} size={44} />
          </View>
          <View style={styles.userText}>
            <Text variant="caption" color="rgba(255,255,255,0.78)">{greeting()},</Text>
            <View style={styles.nameRow}>
              <Text variant="h3" color="#FFFFFF" numberOfLines={1} style={styles.name}>{fullName(user) || 'there'}</Text>
              {badge ? (
                <View style={styles.badge}>
                  <Text variant="caption" color="#FFFFFF" numberOfLines={1} style={styles.badgeText}>{badge}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
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

      <View style={styles.contextRow}>
        <View style={styles.contextChip}>
          <View style={styles.chipDot} />
          <Text variant="caption" color="#FFFFFF" numberOfLines={1}>
            {user?.company?.name || 'CAPALY'}
          </Text>
        </View>
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1 },
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
  chipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#7FE3A0' },
  roleChip: { backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  roleText: { fontWeight: '700' },
});
