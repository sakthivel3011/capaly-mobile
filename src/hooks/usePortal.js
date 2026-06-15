import { useAuthStore, PORTAL } from '../store/authStore';
import { dashboardApi, incidentApi } from '../api/data.api';

// Resolve portal-specific data sources + labels so shared screens (dashboard,
// incidents, detail) work across Department / Employee with one render path.
// Mobile has no admin portal — Employee is the default.
export function usePortal() {
  const portalType = useAuthStore((s) => s.portalType);
  const user = useAuthStore((s) => s.user);

  const isDept = portalType === PORTAL.DEPARTMENT;
  const isEmployee = !isDept; // EMPLOYEE is the default field portal

  const config = {
    portalType,
    user,
    isDept,
    isEmployee,
    label: isDept ? 'Department' : 'Employee',
    // Dashboard fetcher
    fetchDashboard: isDept ? dashboardApi.department : dashboardApi.employee,
    // Incident list fetcher
    fetchIncidents: isDept ? incidentApi.deptList : incidentApi.empList,
    // Incident detail fetcher
    fetchIncidentDetail: isDept ? incidentApi.deptDetail : incidentApi.empDetail,
    // Employees can create incident reports
    canReport: isEmployee,
  };

  return config;
}
