import React from 'react';
import { Platform } from 'react-native';

// Shared bottom-tab styling for all portals — premium floating tab bar.
export function tabScreenOptions(colors, insets, accent = '#0d419d') {
  return ({ route, navigation }) => ({
    headerShown: false,
    tabBarActiveTintColor: accent,
    tabBarInactiveTintColor: colors.textFaint,
    tabBarHideOnKeyboard: true,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 0.5,
      height: 58 + (insets?.bottom || 0),
      paddingBottom: (insets?.bottom || 0) + 6,
      paddingTop: 6,
      elevation: 8,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -2 },
    },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  });
}

// Helper to build a tab icon renderer from a lucide icon component.
export function tabIcon(Icon) {
  return ({ color, focused }) => <Icon size={focused ? 23 : 21} color={color} strokeWidth={focused ? 2.4 : 2} />;
}
