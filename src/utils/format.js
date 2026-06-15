import { API_BASE } from '../api/client';

// API host without the trailing /api — used to resolve relative upload paths.
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

// Resolve an upload reference to a loadable URL. Backend stores either absolute
// Google Drive links, a drive fileId, or a relative /uploads path.
export function resolveImageUrl(ref) {
  if (!ref) return null;
  if (typeof ref === 'object') ref = ref.url || ref.fileUrl || ref.driveUrl || ref.path;
  if (!ref) return null;
  
  if (typeof ref === 'string') {
    ref = ref.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/, API_ORIGIN);
  }

  if (/^https?:\/\//.test(ref)) return ref;
  if (ref.startsWith('/')) return `${API_ORIGIN}${ref}`;
  // Bare drive fileId -> proxy endpoint.
  return `${API_ORIGIN}/api/uploads/drive/${ref}`;
}

export function fullName(user) {
  if (!user) return '';
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.name || user.email || '';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d)) return '—';
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return `${formatDate(value)} · ${hh}:${m} ${ampm}`;
}

// Relative "time ago" for notifications and activity feeds.
export function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return formatDate(value);
}

// Unwrap list responses — backend variously returns arrays or { data, total }.
export function asArray(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}
