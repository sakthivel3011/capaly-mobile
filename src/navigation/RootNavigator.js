import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { useTheme, ThemeProvider } from '../theme/ThemeProvider';
import { lightColors } from '../theme/colors';
import { useAuthStore, PORTAL } from '../store/authStore';
import { usePushNotifications } from '../services/push';
import { makeNavTheme } from './navTheme';
import Brand from '../components/ui/Brand';
import AuthNavigator from './AuthNavigator';
import DepartmentNavigator from './DepartmentNavigator';
import EmployeeNavigator from './EmployeeNavigator';

function SplashScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.splash, { backgroundColor: colors.background }]}>
      <Brand size="lg" />
      <ActivityIndicator color={colors.primary} style={{ marginTop: 28 }} />
    </View>
  );
}

const navigationRef = createNavigationContainerRef();

export default function RootNavigator() {
  const { colors, isDark, ready } = useTheme();
  const status = useAuthStore((s) => s.status);
  const portalType = useAuthStore((s) => s.portalType);

  // Register for push + handle notification taps once authenticated.
  usePushNotifications(navigationRef);

  // Auth flow is always shown in the light theme.
  const showingAuth = ready && status === 'unauthenticated';
  const theme = makeNavTheme(showingAuth ? lightColors : colors, showingAuth ? false : isDark);

  function renderApp() {
    if (!ready || status === 'loading') return <SplashScreen />;
    if (status === 'unauthenticated') {
      return (
        <ThemeProvider forceLight>
          <AuthNavigator />
        </ThemeProvider>
      );
    }
    // Mobile is Department + Employee only; admins use the web portal.
    if (portalType === PORTAL.DEPARTMENT) return <DepartmentNavigator />;
    return <EmployeeNavigator />;
  }

  return <NavigationContainer ref={navigationRef} theme={theme}>{renderApp()}</NavigationContainer>;
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
