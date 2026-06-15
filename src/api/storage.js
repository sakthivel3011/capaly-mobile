import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Secrets (tokens, refresh cookie) live in the OS keychain via SecureStore.
// Non-sensitive cache (last user, dashboard snapshot) lives in AsyncStorage.

const ACCESS_TOKEN = 'capaly_access_token';
const REFRESH_COOKIE = 'capaly_refresh_cookie';
const USER = 'capaly_user';
const REMEMBER = 'capaly_remember';

export const tokenStore = {
  async getAccessToken() {
    try { return await SecureStore.getItemAsync(ACCESS_TOKEN); } catch { return null; }
  },
  async setAccessToken(token) {
    try { token ? await SecureStore.setItemAsync(ACCESS_TOKEN, token) : await SecureStore.deleteItemAsync(ACCESS_TOKEN); } catch {}
  },
  // The httpOnly refresh cookie value (capaly_refresh_token=...) captured from the
  // login set-cookie header and replayed manually on the /auth/refresh call,
  // since React Native has no automatic cookie jar.
  async getRefreshCookie() {
    try { return await SecureStore.getItemAsync(REFRESH_COOKIE); } catch { return null; }
  },
  async setRefreshCookie(value) {
    try { value ? await SecureStore.setItemAsync(REFRESH_COOKIE, value) : await SecureStore.deleteItemAsync(REFRESH_COOKIE); } catch {}
  },
  async clear() {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(REFRESH_COOKIE);
    } catch {}
  },
};

export const cacheStore = {
  async getUser() {
    try { const v = await AsyncStorage.getItem(USER); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  async setUser(user) {
    try { user ? await AsyncStorage.setItem(USER, JSON.stringify(user)) : await AsyncStorage.removeItem(USER); } catch {}
  },
  async getRemember() {
    try { return (await AsyncStorage.getItem(REMEMBER)) === '1'; } catch { return false; }
  },
  async setRemember(on) {
    try { await AsyncStorage.setItem(REMEMBER, on ? '1' : '0'); } catch {}
  },
  // Generic JSON cache (dashboard, incidents) for offline support.
  async getJSON(key) {
    try { const v = await AsyncStorage.getItem(`cache:${key}`); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  async setJSON(key, value) {
    try { await AsyncStorage.setItem(`cache:${key}`, JSON.stringify({ value, at: Date.now() })); } catch {}
  },
};
