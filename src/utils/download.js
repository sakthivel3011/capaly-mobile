// SDK 54 (expo-file-system v19) exposes the classic downloadAsync/cacheDirectory
// API under the /legacy entry point.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_BASE } from '../api/client';
import { tokenStore } from '../api/storage';

// Download an authenticated report file and open the share sheet so the user can
// save / send it. `path` is relative to the API base (e.g. /reports/incidents/pdf).
export async function downloadAndShare(path, filename, params = {}) {
  const token = await tokenStore.getAccessToken();
  const qs = new URLSearchParams(params).toString();
  const url = `${API_BASE}${path}${qs ? `?${qs}` : ''}`;
  const dest = `${FileSystem.cacheDirectory}${filename}`;

  const res = await FileSystem.downloadAsync(url, dest, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status !== 200) throw new Error(`Download failed (${res.status})`);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(res.uri);
  }
  return res.uri;
}
