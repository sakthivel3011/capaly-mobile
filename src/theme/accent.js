import { useAuthStore, PORTAL } from '../store/authStore';

// Per-portal brand accent. Employee = blue, Department = teal-green.
// Used by shared UI (hero, tabs, fields, buttons) so each portal is themed
// without duplicating components.
export const PORTAL_ACCENT = {
  [PORTAL.EMPLOYEE]: '#0d419d',
  [PORTAL.DEPARTMENT]: '#008062',
};
export const PORTAL_ACCENT_DARK = {
  [PORTAL.EMPLOYEE]: '#0a3179',
  [PORTAL.DEPARTMENT]: '#00674e',
};

export const DEFAULT_ACCENT = '#0d419d';
export const DEFAULT_ACCENT_DARK = '#0a3179';

export const accentFor = (portalType) => PORTAL_ACCENT[portalType] || DEFAULT_ACCENT;
export const accentDarkFor = (portalType) => PORTAL_ACCENT_DARK[portalType] || DEFAULT_ACCENT_DARK;

// Translucent accent tint (e.g. for icon backgrounds / pills).
export const accentTint = (portalType, alpha = '1A') => `${accentFor(portalType)}${alpha}`;

// Hook: current portal accent (+ dark shade for gradients).
export function useAccent() {
  const portalType = useAuthStore((s) => s.portalType);
  return accentFor(portalType);
}
export function useAccents() {
  const portalType = useAuthStore((s) => s.portalType);
  return { accent: accentFor(portalType), accentDark: accentDarkFor(portalType) };
}
