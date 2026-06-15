import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { ToastProvider } from './src/components/feedback/ToastProvider';
import { ConfirmProvider } from './src/components/feedback/ConfirmProvider';
import RootNavigator from './src/navigation/RootNavigator';
import OfflineBanner from './src/components/ui/OfflineBanner';
import SplashScreen from './src/screens/SplashScreen';
import { useAuthStore } from './src/store/authStore';
import { useFonts } from 'expo-font';

function Shell() {
  const { isDark } = useTheme();
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // StatusBar stays dark during the white splash, then follows the theme.
  return (
    <>
      <StatusBar style={!splashDone ? 'dark' : isDark ? 'light' : 'dark'} />
      <RootNavigator />
      <OfflineBanner />
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Mileast-Regular': require('./assets/fonts/Mileast-Regular.otf'),
    'Mileast-Italic': require('./assets/fonts/Mileast-Italic.otf'),
  });

  console.log('Fonts status:', { fontsLoaded, fontError });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <ConfirmProvider>
              <Shell />
            </ConfirmProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

