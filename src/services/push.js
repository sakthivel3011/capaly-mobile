import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuthStore } from '../store/authStore';

// Foreground presentation: show banners + badge while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register the device for push and create the Android channel. Returns the Expo
// push token (which can later be forwarded to the backend when an endpoint
// exists to persist device tokens). Safe to call on simulators (no-ops).
export async function registerForPush() {
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'CAPALY Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#233DFF',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return null;

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

// Hook: register for push once authenticated and listen for taps so a pushed
// incident alert can deep-link into the relevant screen.
export function usePushNotifications(navigationRef) {
  const status = useAuthStore((s) => s.status);
  const responseListener = useRef();

  useEffect(() => {
    if (status !== 'authenticated') return;
    registerForPush().catch(() => {});

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response?.notification?.request?.content?.data || {};
      if (data.relatedModule === 'incident' && data.relatedId && navigationRef?.current) {
        navigationRef.current.navigate('IncidentsTab', { screen: 'IncidentDetail', params: { id: data.relatedId } });
      }
    });

    return () => {
      responseListener.current?.remove();
    };
  }, [status]);
}
