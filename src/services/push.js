import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/data.api';

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
  if (status !== 'granted') {
    console.warn('Push permission denied — notifications will not be delivered.');
    return null;
  }

  // The backend delivers via Firebase Cloud Messaging, so prefer the NATIVE FCM
  // device token. (The Expo token is a different format FCM cannot deliver to.)
  // Requires the build to be Firebase-configured (google-services.json); if it
  // isn't, this throws and we fall back to the Expo token.
  try {
    const device = await Notifications.getDevicePushTokenAsync(); // { type, data }
    if (device?.data && typeof device.data === 'string') return device.data;
  } catch (e) {
    console.warn('No native (FCM) device push token — is Firebase configured in this build?', e?.message);
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (e) {
    console.warn('Failed to get Expo push token:', e?.message);
    return null;
  }
}

// Register for push AND persist the token against the logged-in user so the
// backend can deliver notifications to this device (F §1).
export async function registerAndSyncPushToken() {
  try {
    const token = await registerForPush();
    if (!token) return null;
    await userApi.saveFcmToken(token, Platform.OS);
    return token;
  } catch (e) {
    console.warn('Could not sync push token to backend:', e?.message);
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
    // Request permission + register the token with the backend after login (F §1).
    registerAndSyncPushToken().catch(() => {});

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
