import React, { useState, useCallback } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { notificationApi } from '../../api/data.api';
import Text from '../ui/Text';

// Bell with live unread badge. Refreshes whenever the host screen regains focus.
export default function NotificationBell({ onPress, light = false }) {
  const { colors } = useTheme();
  const [count, setCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      notificationApi
        .unreadCount()
        .then((res) => { if (active) setCount(res?.count ?? res?.unread ?? 0); })
        .catch(() => {});
      return () => { active = false; };
    }, [])
  );

  const iconColor = light ? '#FFFFFF' : colors.text;
  const bg = light ? 'rgba(255,255,255,0.18)' : colors.surfaceAlt;

  return (
    <Pressable onPress={onPress} hitSlop={10} style={[styles.btn, { backgroundColor: bg }]}>
      <Bell size={20} color={iconColor} />
      {count > 0 ? (
        <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: light ? colors.primary : colors.background }]}>
          <Text variant="caption" color="#FFFFFF" style={styles.badgeText}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeText: { fontSize: 9, lineHeight: 12 },
});
