import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from './colors';
import { spacing, radius, typography, shadow, shadowSoft } from './tokens';
import { accentFor, accentDarkFor } from './accent';
import { useAuthStore } from '../store/authStore';

const STORAGE_KEY = 'capaly.theme.preference'; // 'light' | 'dark' | 'system'

const ThemeContext = createContext(null);

export function ThemeProvider({ children, forceLight = false }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setPreference(saved);
      } catch {}
      setReady(true);
    })();
  }, []);

  // `forceLight` pins the subtree to the light palette (used for the auth flow,
  // which is always shown light regardless of the saved theme).
  const isDark = forceLight ? false : (preference === 'system' ? system === 'dark' : preference === 'dark');
  const base = isDark ? darkColors : lightColors;

  // Brand the palette to the active portal so the whole app uses the portal
  // accent (Employee = blue, Department = green) instead of the default deep-red
  // primary. Falls back to the default blue accent before login.
  const portalType = useAuthStore((s) => s.portalType);
  const colors = useMemo(() => {
    const accent = accentFor(portalType);
    const accentDark = accentDarkFor(portalType);
    return {
      ...base,
      primary: accent,
      primaryDark: accentDark,
      primaryBg: `${accent}1A`,
    };
  }, [base, portalType]);

  const setThemePreference = useCallback(async (pref) => {
    setPreference(pref);
    try { await AsyncStorage.setItem(STORAGE_KEY, pref); } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreference(isDark ? 'light' : 'dark');
  }, [isDark, setThemePreference]);

  const value = useMemo(
    () => ({
      colors,
      isDark,
      preference,
      ready,
      spacing,
      radius,
      typography,
      shadow: () => shadow(colors.shadow),
      shadowSoft: () => shadowSoft(colors.shadow),
      setThemePreference,
      toggleTheme,
    }),
    [colors, isDark, preference, ready, setThemePreference, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
