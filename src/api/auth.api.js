import api, { captureRefreshCookie } from './client';

// Auth endpoints mirror capaly-backend /api/auth/*. Login responses set the
// refresh cookie which we capture for later manual refresh.

export const authApi = {
  async loginCompanies() {
    const { data } = await api.get('/auth/login-companies');
    return data;
  },

  async departmentLogin({ companyCode, identifier, password }) {
    const res = await api.post('/auth/department-login', { companyCode, identifier, password });
    await captureRefreshCookie(res);
    return res.data;
  },

  async employeeLogin({ companyCode, identifier, password }) {
    const res = await api.post('/auth/employee-login', { companyCode, identifier, password });
    await captureRefreshCookie(res);
    return res.data;
  },

  // Employee self-registration (public sign-up) — mirrors web /auth/employee-register.
  async employeeRegister({ companyCode, firstName, lastName, email, phone, password }) {
    const res = await api.post('/auth/employee-register', { companyCode, firstName, lastName, email, phone, password });
    await captureRefreshCookie(res);
    return res.data;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async logout() {
    try { await api.post('/auth/logout'); } catch {}
  },

  async forgotPassword(email) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword({ token, newPassword, confirmPassword }) {
    const { data } = await api.post('/auth/reset-password', { token, newPassword, confirmPassword });
    return data;
  },

  async changePassword({ currentPassword, newPassword, confirmNewPassword }) {
    const { data } = await api.post('/auth/change-password', { currentPassword, newPassword, confirmNewPassword });
    return data;
  },
};
