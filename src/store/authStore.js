import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import { tokenStore, cacheStore } from '../api/storage';
import { setForceLogoutHandler } from '../api/client';
import { demoMode } from '../api/mock';

// The mobile app is for field users only: DEPARTMENT and EMPLOYEE portals.
// Admins (SUPER_ADMIN / COMPANY_ADMIN) use the web portal and are rejected here.
export const PORTAL = {
  DEPARTMENT: 'DEPARTMENT',
  EMPLOYEE: 'EMPLOYEE',
};

const MOBILE_PORTALS = [PORTAL.DEPARTMENT, PORTAL.EMPLOYEE];
const isMobilePortal = (p) => MOBILE_PORTALS.includes(p);

export const useAuthStore = create((set, get) => ({
  status: 'loading', // loading | unauthenticated | authenticated
  user: null,
  portalType: null,
  mustChangePassword: false,
  error: null,

  // Restore a saved session on app launch. We have a valid session if an access
  // token (or refresh cookie) exists and /auth/me succeeds.
  async bootstrap() {
    setForceLogoutHandler(() => get().forceLogout());
    // Restore demo mode (if the user previously chose "Explore demo") before any
    // request fires, so the mock adapter is active for the /auth/me check.
    await demoMode.restore();
    const token = await tokenStore.getAccessToken();
    const cookie = await tokenStore.getRefreshCookie();
    if (!token && !cookie) {
      set({ status: 'unauthenticated' });
      return;
    }
    try {
      const me = await authApi.me();
      if (!isMobilePortal(me.portalType)) {
        // Admin session — not allowed on mobile. Clear and require login.
        await tokenStore.clear();
        await cacheStore.setUser(null);
        set({ status: 'unauthenticated' });
        return;
      }
      await cacheStore.setUser(me);
      set({ status: 'authenticated', user: me, portalType: me.portalType });
    } catch {
      // Fall back to cached user for offline launch; client interceptor will
      // refresh or force logout on the next live request.
      const cached = await cacheStore.getUser();
      if (cached && isMobilePortal(cached.portalType)) {
        set({ status: 'authenticated', user: cached, portalType: cached.portalType });
      } else {
        await tokenStore.clear();
        set({ status: 'unauthenticated' });
      }
    }
  },

  // Apply a login response (department/employee share this shape).
  async _applyLogin(res, { remember }) {
    const portalType = res.portalType || res.user.portalType;
    if (!isMobilePortal(portalType)) {
      const err = new Error('This account uses the CAPALY web portal. Please sign in there.');
      err.code = 'PORTAL_NOT_ALLOWED';
      throw err;
    }
    await tokenStore.setAccessToken(res.accessToken);
    await cacheStore.setUser(res.user);
    await cacheStore.setRemember(!!remember);
    set({
      status: 'authenticated',
      user: res.user,
      portalType,
      mustChangePassword: !!res.mustChangePassword,
      error: null,
    });
    return res.user;
  },

  // Drop any stale token before a fresh sign-in attempt so a failed login can
  // never leave a previous session active (B: login validation).
  async _clearStaleSession() {
    await tokenStore.clear();
  },

  async departmentLogin(payload, remember = true) {
    await get()._clearStaleSession();
    const res = await authApi.departmentLogin(payload);
    return get()._applyLogin(res, { remember });
  },
  async employeeLogin(payload, remember = true) {
    await get()._clearStaleSession();
    const res = await authApi.employeeLogin(payload);
    return get()._applyLogin(res, { remember });
  },
  async employeeRegister(payload, remember = true) {
    const res = await authApi.employeeRegister(payload);
    return get()._applyLogin(res, { remember });
  },

  async refreshMe() {
    try {
      const me = await authApi.me();
      await cacheStore.setUser(me);
      set({ user: me, portalType: me.portalType });
      return me;
    } catch { return get().user; }
  },

  clearMustChange() {
    set({ mustChangePassword: false });
  },

  // Start a no-backend demo session for the chosen portal ('EMPLOYEE' | 'DEPARTMENT').
  async startDemo(portal = 'EMPLOYEE') {
    await demoMode.set(true, portal);
    const payload = { companyCode: 'DEMO', identifier: 'demo', password: 'demo' };
    if (portal === 'DEPARTMENT') return get().departmentLogin(payload, true);
    return get().employeeLogin(payload, true);
  },

  async logout() {
    await authApi.logout();
    await tokenStore.clear();
    await cacheStore.setUser(null);
    await demoMode.set(false);
    set({ status: 'unauthenticated', user: null, portalType: null, mustChangePassword: false });
  },

  // Hard logout triggered by a failed token refresh (interceptor).
  forceLogout() {
    cacheStore.setUser(null);
    set({ status: 'unauthenticated', user: null, portalType: null });
  },
}));
