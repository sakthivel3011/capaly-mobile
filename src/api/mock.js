import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Demo / offline mock layer
// ---------------------------------------------------------------------------
// When demo mode is on (the "Explore demo" button) every API call is answered
// locally from the canned dataset below, so the beta APK is fully explorable
// with no backend, no account and no network. `resolveMock` is also used as a
// graceful fallback for read requests when the live API can't be reached.
//
// It returns a normal axios-shaped response ({ data, status, headers, config })
// or `null` when no handler matches (so the real request proceeds).

const DEMO_KEY = 'capaly_demo';

let DEMO = false;
let demoPortal = 'EMPLOYEE';

export const demoMode = {
  enabled: () => DEMO,
  portal: () => demoPortal,
  async set(on, portal) {
    DEMO = !!on;
    if (portal) demoPortal = portal;
    try {
      if (DEMO) await AsyncStorage.setItem(DEMO_KEY, JSON.stringify({ enabled: true, portal: demoPortal }));
      else await AsyncStorage.removeItem(DEMO_KEY);
    } catch {}
  },
  // Restore the demo flag on cold start (called before auth bootstrap).
  async restore() {
    try {
      const raw = await AsyncStorage.getItem(DEMO_KEY);
      if (!raw) return false;
      const v = JSON.parse(raw);
      DEMO = !!v?.enabled;
      if (v?.portal) demoPortal = v.portal;
      return DEMO;
    } catch {
      return false;
    }
  },
};

// ---- Time helpers ---------------------------------------------------------
const now = Date.now();
const days = (n) => new Date(now - n * 86400000).toISOString();
const hours = (n) => new Date(now - n * 3600000).toISOString();
const future = (n) => new Date(now + n * 86400000).toISOString();

// ---- Demo identities ------------------------------------------------------
const COMPANY = { name: 'Demo Manufacturing Co.', companyCode: 'DEMO', logoUrl: null };

const DEMO_COMPANIES = [
  { id: 'demo-co', name: 'Demo Manufacturing Co.', companyCode: 'DEMO', logoUrl: null },
  { id: 'demo-co-2', name: 'Demo Logistics Pvt Ltd', companyCode: 'DEMOLOG', logoUrl: null },
];

const EMPLOYEE_USER = {
  id: 'demo-emp',
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex.morgan@demo.co',
  phone: '+91 90000 11111',
  employeeId: 'EMP001',
  portalType: 'EMPLOYEE',
  role: 'EMPLOYEE',
  department: { id: 'd-prod', name: 'Production' },
  company: COMPANY,
  profileImageUrl: null,
};

const DEPARTMENT_USER = {
  id: 'demo-dept',
  firstName: 'Priya',
  lastName: 'Sharma',
  email: 'safety@demo.co',
  phone: '+91 90000 22222',
  employeeId: 'DEPT-SAFETY',
  portalType: 'DEPARTMENT',
  role: 'DEPARTMENT_HEAD',
  department: { id: 'd-safety', name: 'Safety & Compliance' },
  company: COMPANY,
  profileImageUrl: null,
};

const currentUser = () => (demoPortal === 'DEPARTMENT' ? DEPARTMENT_USER : EMPLOYEE_USER);

const reporter = { firstName: 'Alex', lastName: 'Morgan' };

// ---- Incidents ------------------------------------------------------------
const INCIDENTS = [
  {
    id: 'inc-1', incidentNo: 'INC-2025-001', title: 'Forklift near-miss at loading dock',
    description: 'A forklift reversed without a spotter and narrowly missed a pedestrian near Dock 3. No injuries, but a clear procedure gap was identified.',
    type: 'Near Miss', severity: 'High', status: 'In Progress', location: 'Warehouse · Dock 3',
    department: { name: 'Production' }, reportedBy: reporter,
    dateOccurred: days(2), reportedAt: days(2), createdAt: days(2),
  },
  {
    id: 'inc-2', incidentNo: 'INC-2025-002', title: 'Chemical spill in mixing area',
    description: 'Approx. 5L of cleaning solvent spilled during a drum transfer. Area was cordoned off and neutralised per the spill kit SOP.',
    type: 'Spill', severity: 'Critical', status: 'Open', location: 'Plant B · Mixing',
    department: { name: 'Maintenance' }, reportedBy: reporter,
    dateOccurred: days(1), reportedAt: days(1), createdAt: days(1),
  },
  {
    id: 'inc-3', incidentNo: 'INC-2025-003', title: 'Slip on wet floor near canteen',
    description: 'Employee slipped on an unmarked wet floor outside the canteen. Minor bruising, first aid administered.',
    type: 'Injury', severity: 'Medium', status: 'In Progress', location: 'Canteen Block',
    department: { name: 'Facilities' }, reportedBy: reporter,
    dateOccurred: days(5), reportedAt: days(5), createdAt: days(5),
  },
  {
    id: 'inc-4', incidentNo: 'INC-2025-004', title: 'Missing machine guard on lathe #4',
    description: 'Routine inspection found the safety guard on lathe #4 removed and not refitted after maintenance.',
    type: 'Hazard', severity: 'High', status: 'Closed', location: 'Machine Shop',
    department: { name: 'Maintenance' }, reportedBy: reporter,
    dateOccurred: days(12), reportedAt: days(12), createdAt: days(12),
  },
  {
    id: 'inc-5', incidentNo: 'INC-2025-005', title: 'Blocked fire exit in store room',
    description: 'Pallets stacked in front of the emergency exit in Store Room 2, blocking egress.',
    type: 'Hazard', severity: 'Medium', status: 'Closed', location: 'Store Room 2',
    department: { name: 'Logistics' }, reportedBy: reporter,
    dateOccurred: days(20), reportedAt: days(20), createdAt: days(20),
  },
  {
    id: 'inc-6', incidentNo: 'INC-2025-006', title: 'Overheating motor on conveyor line',
    description: 'Conveyor drive motor tripped on thermal overload twice in one shift. Logged for investigation.',
    type: 'Equipment', severity: 'Low', status: 'Open', location: 'Line 2',
    department: { name: 'Production' }, reportedBy: reporter,
    dateOccurred: hours(8), reportedAt: hours(8), createdAt: hours(8),
  },
];

const workflowSummary = (id) => {
  const incident = INCIDENTS.find((i) => i.id === id) || INCIDENTS[0];
  return {
    incident,
    workflowStages: [
      { key: 'incident', title: 'Incident Reported', status: 'Completed', completedAt: incident.createdAt, count: 1 },
      { key: 'investigation', title: 'Investigation', status: 'Completed', completedAt: days(1), count: 1 },
      { key: 'capa', title: 'CAPA', status: 'In Progress', completedAt: null, count: 1 },
      { key: 'inspection', title: 'Inspection', status: 'Open', completedAt: null, count: 0 },
      { key: 'final', title: 'Final Closure', status: 'Open', completedAt: null, count: 0 },
    ],
    investigation: {
      status: 'Completed',
      rootCause: 'Standard operating procedure for spotter-assisted reversing was not followed during peak loading.',
      findings: 'Spotter role unassigned on the late shift; dock visibility reduced by stacked pallets.',
      investigator: { firstName: 'Priya', lastName: 'Sharma' },
    },
    capa: [
      { id: 'capa-1', capaNo: 'CAPA-2025-014', title: 'Reinstate mandatory spotter for all dock reversing', status: 'In Progress', dueDate: future(6) },
      { id: 'capa-2', capaNo: 'CAPA-2025-015', title: 'Repaint pedestrian walkway lines at Dock 3', status: 'Open', dueDate: future(12) },
    ],
    actionPlanTasks: [
      { id: 'task-1', title: 'Toolbox talk on reversing safety', status: 'Completed', assignedDepartment: { name: 'Production' }, dueDate: days(1) },
      { id: 'task-2', title: 'Install convex mirror at Dock 3', status: 'In Progress', assignedDepartment: { name: 'Maintenance' }, dueDate: future(4) },
    ],
    activityHistory: [
      { title: 'Incident reported', user: 'Alex Morgan', date: incident.createdAt },
      { title: 'Investigation assigned', comments: 'Routed to Safety & Compliance', user: 'System', date: days(1) },
      { title: 'CAPA created', user: 'Priya Sharma', date: hours(20) },
    ],
    attachments: [],
  };
};

// ---- Notifications --------------------------------------------------------
const NOTIFICATIONS = [
  { id: 'n1', title: 'Critical incident reported', message: 'INC-2025-002 (chemical spill) was reported in Plant B and needs immediate review.', level: 'CRITICAL', isRead: false, createdAt: hours(2), relatedModule: 'incident', relatedId: 'inc-2' },
  { id: 'n2', title: 'CAPA assigned to you', message: 'CAPA-2025-014 "Reinstate mandatory spotter" has been assigned and is due in 6 days.', level: 'HIGH', isRead: false, createdAt: hours(6), relatedModule: 'capa', relatedId: 'capa-1' },
  { id: 'n3', title: 'Action task due soon', message: 'Install convex mirror at Dock 3 is due in 4 days.', level: 'MEDIUM', isRead: false, createdAt: hours(20), relatedModule: 'task', relatedId: 'task-2' },
  { id: 'n4', title: 'Incident closed', message: 'INC-2025-004 (missing machine guard) has been verified and closed.', level: 'LOW', isRead: true, createdAt: days(2), relatedModule: 'incident', relatedId: 'inc-4' },
  { id: 'n5', title: 'Weekly safety summary', message: '3 incidents reported, 2 closed and 5 inspections completed this week.', level: 'INFO', isRead: true, createdAt: days(4), relatedModule: 'report', relatedId: null },
];

// ---- Action plans (department) -------------------------------------------
const ACTION_PLANS = [
  { id: 'ap-1', title: 'Reinstate spotter procedure at all docks', description: 'Update SOP and retrain dock operators on mandatory spotter-assisted reversing.', status: 'In Progress', priority: 'High', dueDate: future(6), assignedDepartment: { name: 'Production' }, incident: { incidentNo: 'INC-2025-001' } },
  { id: 'ap-2', title: 'Replenish spill kits across Plant B', description: 'Audit and restock all chemical spill kits; verify expiry of neutralising agents.', status: 'Pending', priority: 'Critical', dueDate: future(3), assignedDepartment: { name: 'Maintenance' }, incident: { incidentNo: 'INC-2025-002' } },
  { id: 'ap-3', title: 'Install anti-slip matting near canteen', description: 'Lay anti-slip matting and add wet-floor signage at the canteen entrance.', status: 'Completed', priority: 'Medium', dueDate: days(2), assignedDepartment: { name: 'Facilities' }, incident: { incidentNo: 'INC-2025-003' } },
  { id: 'ap-4', title: 'Monthly fire-exit clearance audit', description: 'Establish a recurring monthly audit of all emergency exits and egress routes.', status: 'Pending', priority: 'Medium', dueDate: future(10), assignedDepartment: { name: 'Logistics' }, incident: { incidentNo: 'INC-2025-005' } },
];

const actionPlanDetail = (id) => {
  const ap = ACTION_PLANS.find((a) => a.id === id) || ACTION_PLANS[0];
  return {
    ...ap,
    createdAt: days(3),
    createdBy: { firstName: 'Priya', lastName: 'Sharma' },
    activity: [
      { title: 'Action plan created', user: 'Priya Sharma', date: days(3) },
      { title: 'Status updated to In Progress', user: 'Priya Sharma', date: days(1) },
    ],
  };
};

// ---- Workflow modules -----------------------------------------------------
const INVESTIGATIONS = [
  { id: 'invg-1', incidentNo: 'INC-2025-001', title: 'Forklift near-miss investigation', status: 'Completed', rootCause: 'Spotter procedure not followed', investigator: reporter, incident: { id: 'inc-1', incidentNo: 'INC-2025-001', title: 'Forklift near-miss' }, createdAt: days(2) },
  { id: 'invg-2', incidentNo: 'INC-2025-002', title: 'Chemical spill investigation', status: 'In Progress', rootCause: 'Drum transfer without secondary containment', investigator: reporter, incident: { id: 'inc-2', incidentNo: 'INC-2025-002', title: 'Chemical spill' }, createdAt: days(1) },
];

const CAPAS = [
  { id: 'capa-1', capaNo: 'CAPA-2025-014', title: 'Reinstate mandatory spotter for dock reversing', status: 'In Progress', actionType: 'Corrective', dueDate: future(6), assignedTo: reporter, incident: { id: 'inc-1', incidentNo: 'INC-2025-001' }, createdAt: days(1) },
  { id: 'capa-2', capaNo: 'CAPA-2025-015', title: 'Repaint pedestrian walkway lines at Dock 3', status: 'Open', actionType: 'Preventive', dueDate: future(12), assignedTo: reporter, incident: { id: 'inc-1', incidentNo: 'INC-2025-001' }, createdAt: days(1) },
  { id: 'capa-3', capaNo: 'CAPA-2025-016', title: 'Add secondary containment to drum transfer station', status: 'Open', actionType: 'Corrective', dueDate: future(8), assignedTo: reporter, incident: { id: 'inc-2', incidentNo: 'INC-2025-002' }, createdAt: hours(20) },
];

const INSPECTIONS = [
  { id: 'insp-1', inspectionNo: 'INS-2025-031', title: 'Monthly fire safety inspection', status: 'Completed', location: 'Plant A', inspector: reporter, scheduledDate: days(3), createdAt: days(3) },
  { id: 'insp-2', inspectionNo: 'INS-2025-032', title: 'Dock 3 walkway re-inspection', status: 'Scheduled', location: 'Warehouse · Dock 3', inspector: reporter, scheduledDate: future(2), createdAt: hours(10) },
  { id: 'insp-3', inspectionNo: 'INS-2025-033', title: 'Spill kit readiness audit', status: 'In Progress', location: 'Plant B', inspector: reporter, scheduledDate: future(1), createdAt: hours(20) },
];

const TASKS = [
  { id: 'task-1', title: 'Toolbox talk on reversing safety', status: 'Completed', priority: 'High', dueDate: days(1), incident: { incidentNo: 'INC-2025-001' } },
  { id: 'task-2', title: 'Install convex mirror at Dock 3', status: 'In Progress', priority: 'Medium', dueDate: future(4), incident: { incidentNo: 'INC-2025-001' } },
  { id: 'task-3', title: 'Restock spill kit — Plant B', status: 'Pending', priority: 'Critical', dueDate: future(2), incident: { incidentNo: 'INC-2025-002' } },
];

// ---- Dashboards -----------------------------------------------------------
const TREND = [
  { label: 'Jan', count: 4 }, { label: 'Feb', count: 6 }, { label: 'Mar', count: 3 },
  { label: 'Apr', count: 7 }, { label: 'May', count: 5 }, { label: 'Jun', count: 6 },
];

const recentActivity = [
  { id: 'a1', action: 'INCIDENT_REPORTED', entity: 'INC-2025-006', user: reporter, createdAt: hours(8) },
  { id: 'a2', action: 'CAPA_CREATED', entity: 'CAPA-2025-016', user: { firstName: 'Priya', lastName: 'Sharma' }, createdAt: hours(20) },
  { id: 'a3', action: 'INSPECTION_COMPLETED', entity: 'INS-2025-031', user: reporter, createdAt: days(3) },
  { id: 'a4', action: 'INCIDENT_CLOSED', entity: 'INC-2025-004', user: { firstName: 'Priya', lastName: 'Sharma' }, createdAt: days(2) },
];

const employeeDashboard = {
  stats: { myIncidents: 6, openReports: 3, capaAssigned: 2, actionTasks: 3 },
  recent: { incidents: INCIDENTS.slice(0, 4) },
  monthlyTrend: TREND,
  recentActivity,
};

const departmentDashboard = {
  stats: { totalReports: 6, openIncidents: 3, pendingTasks: 2, completed: 1 },
  recent: { incidents: INCIDENTS.slice(0, 4) },
  monthlyTrend: TREND,
  recentActivity,
};

// ---- Reports --------------------------------------------------------------
const reportPreview = (type) => {
  switch (type) {
    case 'incidents': return INCIDENTS;
    case 'investigation': return INVESTIGATIONS;
    case 'capa': return CAPAS;
    case 'inspections': return INSPECTIONS;
    case 'final-completion': return INCIDENTS.filter((i) => i.status === 'Closed');
    default: return INCIDENTS;
  }
};

// ---- Router ---------------------------------------------------------------
const ok = (data) => ({ data });
const COOKIE = { 'set-cookie': ['capaly_refresh_token=demo-refresh; Path=/; HttpOnly'] };

// Returns { data, headers? } or undefined. `m` = method (lowercase), `url` path.
function route(m, url, body, params) {
  const id = (re) => (url.match(re) || [])[1];

  // ---- Auth ----
  if (url.endsWith('/auth/login-companies')) return ok(DEMO_COMPANIES);
  if (url.endsWith('/auth/department-login')) {
    demoPortal = 'DEPARTMENT';
    return { data: { accessToken: 'demo-access', portalType: 'DEPARTMENT', user: DEPARTMENT_USER }, headers: COOKIE };
  }
  if (url.endsWith('/auth/employee-login') || url.endsWith('/auth/employee-register')) {
    demoPortal = 'EMPLOYEE';
    return { data: { accessToken: 'demo-access', portalType: 'EMPLOYEE', user: EMPLOYEE_USER }, headers: COOKIE };
  }
  if (url.endsWith('/auth/me')) return ok(currentUser());
  if (url.endsWith('/auth/refresh')) return { data: { accessToken: 'demo-access' }, headers: COOKIE };
  if (url.endsWith('/auth/logout')) return ok({ message: 'Signed out' });
  if (url.endsWith('/auth/forgot-password')) return ok({ message: 'If the email exists, a reset link has been sent.' });
  if (url.endsWith('/auth/reset-password')) return ok({ message: 'Password reset successfully.' });
  if (url.endsWith('/auth/change-password')) return ok({ message: 'Password changed successfully.' });

  // ---- Dashboards ----
  if (url.endsWith('/employee/dashboard')) return ok(employeeDashboard);
  if (url.endsWith('/department/dashboard') || url.endsWith('/dashboard')) return ok(departmentDashboard);

  // ---- Incident detail / workflow ----
  let mId = id(/\/incidents\/([^/]+)\/workflow-summary/);
  if (mId) return ok(workflowSummary(mId));
  mId = id(/\/(?:employee|department)\/incidents\/([^/]+)$/) || id(/\/incidents\/([^/]+)$/);
  if (mId && m === 'get') return ok(INCIDENTS.find((i) => i.id === mId) || INCIDENTS[0]);

  // ---- Incident lists / create ----
  if (url.endsWith('/employee/incidents') || url.endsWith('/department/incidents') || url.endsWith('/incidents')) {
    if (m === 'post') {
      const created = { id: `inc-${Date.now()}`, incidentNo: `INC-2025-${100 + INCIDENTS.length}`, title: 'New reported incident', severity: 'Medium', status: 'Open', createdAt: new Date().toISOString(), department: { name: 'Production' }, reportedBy: reporter };
      return ok(created);
    }
    let list = INCIDENTS;
    if (params?.status) list = list.filter((i) => i.status.toLowerCase() === String(params.status).toLowerCase());
    return ok(list);
  }

  // ---- Investigations ----
  if (url.includes('/investigations')) {
    if (m === 'post') return ok({ id: `invg-${Date.now()}`, status: 'Open' });
    return ok(INVESTIGATIONS);
  }

  // ---- CAPA ----
  if (url.match(/\/capas?(\/|$)/) || url.endsWith('/employee/capa') || url.endsWith('/department/capa')) {
    mId = id(/\/capas\/([^/]+)$/);
    if (mId && m === 'get') return ok(CAPAS.find((c) => c.id === mId) || CAPAS[0]);
    if (m === 'post') return ok({ id: `capa-${Date.now()}`, capaNo: `CAPA-2025-${100 + CAPAS.length}`, status: 'Open' });
    return ok(CAPAS);
  }

  // ---- Inspections ----
  if (url.includes('/inspections')) {
    mId = id(/\/inspections\/([^/]+)$/);
    if (mId && m === 'get') return ok(INSPECTIONS.find((i) => i.id === mId) || INSPECTIONS[0]);
    if (m === 'post') return ok({ id: `insp-${Date.now()}`, inspectionNo: `INS-2025-${100 + INSPECTIONS.length}`, status: 'Scheduled' });
    return ok(INSPECTIONS);
  }

  // ---- Action plans ----
  mId = id(/\/action-plan\/([^/]+)\/status/);
  if (mId) return ok({ id: mId, status: body?.status || 'In Progress' });
  mId = id(/\/action-plan\/([^/]+)$/);
  if (mId && m === 'get') return ok(actionPlanDetail(mId));
  if (url.endsWith('/department/action-plan') || url.endsWith('/employee/action-plan')) {
    if (m === 'post') return ok({ id: `ap-${Date.now()}`, ...body, status: 'Pending' });
    return ok(ACTION_PLANS);
  }
  if (url.endsWith('/employee/tasks')) return ok(TASKS);
  mId = id(/\/tasks\/([^/]+)\/status/);
  if (mId) return ok({ id: mId, status: body?.status || 'In Progress' });

  // ---- Search (CreateActionPlan) ----
  if (url.includes('/search/incidents')) return ok(INCIDENTS.map((i) => ({ id: i.id, incidentNo: i.incidentNo, title: i.title, location: i.location, status: i.status })));
  if (url.includes('/search/users')) return ok([EMPLOYEE_USER, { id: 'u2', firstName: 'Sam', lastName: 'Lee', email: 'sam.lee@demo.co' }]);
  if (url.includes('/search/departments')) return ok([{ id: 'd-prod', name: 'Production' }, { id: 'd-maint', name: 'Maintenance' }, { id: 'd-fac', name: 'Facilities' }]);

  // ---- Notifications ----
  if (url.endsWith('/notifications/unread-count')) return ok({ count: NOTIFICATIONS.filter((n) => !n.isRead).length });
  if (url.endsWith('/notifications/sidebar-counts')) return ok({ incidents: 2, actionPlans: 2, notifications: NOTIFICATIONS.filter((n) => !n.isRead).length });
  if (url.endsWith('/notifications/mark-all-read')) return ok({ success: true });
  if (url.match(/\/notifications\/[^/]+\/read$/)) return ok({ success: true });
  if (url.match(/\/notifications\/[^/]+$/) && m === 'delete') return ok({ success: true });
  if (url.endsWith('/notifications')) return ok(NOTIFICATIONS);

  // ---- Reports ----
  mId = id(/\/reports\/([^/]+)$/);
  if (mId) return ok(reportPreview(mId));

  // ---- Profile ----
  if (url.endsWith('/profile') || url.endsWith('/employee/profile')) return ok({ ...currentUser(), message: 'Profile updated' });

  return undefined;
}

// Public: resolve a mock response for an axios request config, or null.
export function resolveMock(config = {}) {
  const m = (config.method || 'get').toLowerCase();
  let url = config.url || '';
  // Strip any baseURL / origin so matching is path-based.
  url = url.replace(/^https?:\/\/[^/]+/, '');
  let body = config.data;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch {} }

  let hit;
  try {
    hit = route(m, url, body, config.params);
  } catch {
    hit = undefined;
  }
  if (!hit) return null;

  return {
    data: hit.data,
    status: 200,
    statusText: 'OK',
    headers: hit.headers || {},
    config,
    request: {},
  };
}
