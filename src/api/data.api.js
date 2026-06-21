import api from './client';

// Domain endpoints used across portals. Each portal calls the slice it is
// permitted to (the backend enforces scoping per token/role).

// ---- Dashboards -----------------------------------------------------------
export const dashboardApi = {
  company: () => api.get('/dashboard').then((r) => r.data),
  department: () => api.get('/department/dashboard').then((r) => r.data),
  employee: () => api.get('/employee/dashboard').then((r) => r.data),
};

// ---- Incidents ------------------------------------------------------------
export const incidentApi = {
  // Company admin scope
  list: (params) => api.get('/incidents', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/incidents/${id}`).then((r) => r.data),
  workflowSummary: (id) => api.get(`/incidents/${id}/workflow-summary`).then((r) => r.data),
  create: (body) => api.post('/incidents', body).then((r) => r.data),

  // Department scope
  deptList: (params) => api.get('/department/incidents', { params }).then((r) => r.data),
  deptDetail: (id) => api.get(`/department/incidents/${id}`).then((r) => r.data),

  // Employee scope
  empList: (params) => api.get('/employee/incidents', { params }).then((r) => r.data),
  // All incidents in the employee's company (read-only) — for the related-incident
  // picker so reports can target older company incidents, not just their own.
  empCompanyList: (params) => api.get('/employee/company-incidents', { params }).then((r) => r.data),
  empDetail: (id) => api.get(`/employee/incidents/${id}`).then((r) => r.data),
  // Employee report (multipart). `form` is a FormData instance.
  empReport: (form) =>
    api.post('/employee/incidents', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
};

// ---- Workflow modules -----------------------------------------------------
export const investigationApi = {
  list: (params) => api.get('/investigations', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/investigations/${id}`).then((r) => r.data),
  employeeSubmit: (body) => api.post('/employee/investigations', body).then((r) => r.data),
  employeeList: () => api.get('/employee/investigations').then((r) => r.data),
  deptList: () => api.get('/department/investigations').then((r) => r.data),
};

export const capaApi = {
  list: (params) => api.get('/capas', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/capas/${id}`).then((r) => r.data),
  create: (body) => api.post('/capas', body).then((r) => r.data),
  employeeList: () => api.get('/employee/capa').then((r) => r.data),
  deptList: () => api.get('/department/capa').then((r) => r.data),
};

export const inspectionApi = {
  list: (params) => api.get('/inspections', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/inspections/${id}`).then((r) => r.data),
  create: (body) => api.post('/inspections', body).then((r) => r.data),
  employeeList: () => api.get('/employee/inspections').then((r) => r.data),
  deptList: () => api.get('/department/inspections').then((r) => r.data),
};

// ---- Department portal (forwarding / mapping) -----------------------------
export const departmentApi = {
  // Sibling departments in the same company — forward targets (M §2).
  departments: () => api.get('/department/departments').then((r) => r.data),
  // Forward / pass an incident to another department (M §5).
  forward: (incidentId, body) =>
    api.post(`/department/incidents/${incidentId}/forward`, body).then((r) => r.data),
};

// ---- Company workflows ----------------------------------------------------
export const workflowApi = {
  // Company-scoped workflows for the logged-in user (employee/department too).
  myCompany: () => api.get('/workflows/my-company').then((r) => r.data),
};

// ---- Company-wide incident options (for linking Investigation/CAPA/Inspection)
export const companyApi = {
  incidentSelectOptions: () => api.get('/company/incidents/select-options').then((r) => r.data),
};

// ---- Action plans / tasks -------------------------------------------------
export const actionPlanApi = {
  deptList: (params) => api.get('/department/action-plan', { params }).then((r) => r.data),
  deptGetOne: (id) => api.get(`/department/action-plan/${id}`).then((r) => r.data),
  deptCreate: (body) => api.post('/department/action-plan', body).then((r) => r.data),
  deptUpdateStatus: (id, status) => api.patch(`/department/action-plan/${id}/status`, { status }).then((r) => r.data),
  searchIncidents: (q) => api.get('/department/search/incidents', { params: { q } }).then((r) => r.data),
  searchUsers: (q) => api.get('/department/search/users', { params: { q } }).then((r) => r.data),
  searchDepartments: (q) => api.get('/department/search/departments', { params: { q } }).then((r) => r.data),
  // Employee assigned tasks
  employeeList: () => api.get('/employee/action-plan').then((r) => r.data),
  employeeTasks: () => api.get('/employee/tasks').then((r) => r.data),
  employeeTaskStatus: (taskId, status) => api.patch(`/employee/tasks/${taskId}/status`, { status }).then((r) => r.data),
};

// ---- Notifications --------------------------------------------------------
export const notificationApi = {
  list: (params) => api.get('/notifications', { params }).then((r) => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then((r) => r.data),
  sidebarCounts: () => api.get('/notifications/sidebar-counts').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/mark-all-read').then((r) => r.data),
  remove: (id) => api.delete(`/notifications/${id}`).then((r) => r.data),
  // Push a test notification to the logged-in user's own device.
  selfTestPush: () => api.post('/notifications/test-push/self').then((r) => r.data),
};

// ---- Push tokens ----------------------------------------------------------
export const userApi = {
  saveFcmToken: (fcmToken, devicePlatform) =>
    api.post('/users/fcm-token', { fcmToken, devicePlatform }).then((r) => r.data),
};

// ---- Reports --------------------------------------------------------------
export const reportApi = {
  preview: (type, params) => api.get(`/reports/${type}`, { params }).then((r) => r.data),
  // PDF/Excel are downloaded as blobs by the reports screen via expo-file-system.
};

// ---- Profile --------------------------------------------------------------
export const profileApi = {
  // Self-service profile update (name, phone, image). `form` is FormData.
  update: (form) =>
    api.put('/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  employeeUpdate: (form) =>
    api.put('/employee/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  submitFeedback: (body) =>
    api.post('/profile/feedback', body).then((r) => r.data),
};
