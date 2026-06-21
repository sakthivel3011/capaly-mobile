import axios from 'axios';
import Constants from 'expo-constants';
import { tokenStore } from './storage';
import { resolveMock, demoMode } from './mock';

// Resolve the API base URL. Production builds inject EXPO_PUBLIC_API_URL via
// eas.json; app.json -> expo.extra.apiUrl is the bundled default. Both point at
// the live backend, and the final literal is the production API as a safety net.
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;
const isLocal = rawApiUrl && (
  rawApiUrl.includes('localhost') || 
  rawApiUrl.includes('127.0.0.1') || 
  rawApiUrl.includes('10.') || 
  rawApiUrl.includes('192.168.') || 
  rawApiUrl.startsWith('http://')
);

export const API_BASE =
  (rawApiUrl && (!isLocal || __DEV__))
    ? rawApiUrl
    : (Constants.expoConfig?.extra?.apiUrl || 'https://api.capaly.in/api');

const api = axios.create({ baseURL: API_BASE, timeout: 20000 });

// Demo / offline mock adapter. When demo mode is explicitly on, every request is
// served locally from the canned dataset (no backend, no account needed). The
// real network adapter is used otherwise.
const httpAdapter = axios.getAdapter(axios.defaults.adapter);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
api.defaults.adapter = async (config) => {
  if (demoMode.enabled()) {
    const mock = resolveMock(config);
    if (mock) {
      await sleep(220); // a touch of latency so the UI feels real
      return mock;
    }
  }
  return httpAdapter(config);
};

// Pull the capaly_refresh_token cookie value out of a set-cookie header so we can
// replay it on refresh (RN has no automatic cookie jar). Header may be a string
// or an array depending on the platform.
export function extractRefreshCookie(setCookieHeader) {
  if (!setCookieHeader) return null;
  const parts = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  for (const part of parts) {
    const match = /capaly_refresh_token=([^;]+)/.exec(part);
    if (match) return `capaly_refresh_token=${match[1]}`;
  }
  return null;
}

// Capture and persist the refresh cookie after any auth response that sets it.
export async function captureRefreshCookie(response) {
  const cookie = extractRefreshCookie(response?.headers?.['set-cookie']);
  if (cookie) await tokenStore.setRefreshCookie(cookie);
}

// Attach the bearer access token to every request.
api.interceptors.request.use(async (config) => {
  const token = await tokenStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// onForceLogout is wired up by the auth store so a failed refresh tears the
// session down and bounces back to the login flow.
let onForceLogout = null;
export function setForceLogoutHandler(fn) { onForceLogout = fn; }

let refreshPromise = null;

async function refreshAccessToken() {
  // Single-flight: concurrent 401s share one refresh request.
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const cookie = await tokenStore.getRefreshCookie();
    if (!cookie) throw new Error('No refresh cookie');
    const { data, headers } = await axios.post(
      `${API_BASE}/auth/refresh`,
      {},
      { headers: { Cookie: cookie } }
    );
    await tokenStore.setAccessToken(data.accessToken);
    const rotated = extractRefreshCookie(headers?.['set-cookie']);
    if (rotated) await tokenStore.setRefreshCookie(rotated);
    return data.accessToken;
  })();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// On 401: refresh once, retry the original request, otherwise force logout.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isRefreshCall = original?.url?.includes('/auth/refresh');
    if (error.response?.status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshErr) {
        await tokenStore.clear();
        if (onForceLogout) onForceLogout();
        return Promise.reject(refreshErr);
      }
    }
    // Graceful offline fallback: if the API is unreachable, serve demo data for
    // read-only requests so the app never shows a blank/broken screen.
    const isNetworkFail = !error.response; // timeout / DNS / connection refused
    const method = (original?.method || 'get').toLowerCase();
    if (isNetworkFail && method === 'get') {
      const mock = resolveMock(original);
      if (mock) return Promise.resolve(mock);
    }
    return Promise.reject(error);
  }
);

// Normalize an axios error into a user-facing message.
export function apiError(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message === 'Network Error') return 'No connection. Check your network and try again.';
  return fallback;
}

export default api;
