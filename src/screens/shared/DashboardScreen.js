import React, { useMemo } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import {
  AlertTriangle, ClipboardCheck, ShieldCheck, CheckCircle2, ListTodo, FileWarning, Activity,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { usePortal } from '../../hooks/usePortal';
import { useAsync } from '../../hooks/useAsync';
import { useAuthStore } from '../../store/authStore';
import DashboardHero from '../../components/domain/DashboardHero';
import TrendChart from '../../components/domain/TrendChart';
import KpiCard from '../../components/ui/KpiCard';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import IncidentCard from '../../components/domain/IncidentCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAccent } from '../../theme/accent';
import { fullName, timeAgo, asArray } from '../../utils/format';

// Build the KPI tiles + recent list for each portal from its dashboard payload.
function normalize(portal, data) {
  if (!data) return { kpis: [], recentIncidents: [], trend: [], activity: [] };
  const s = data.stats || {};
  if (portal.isEmployee) {
    return {
      kpis: [
        { label: 'My Incidents', value: s.myIncidents, icon: AlertTriangle, tone: 'primary' },
        { label: 'Open Reports', value: s.openReports, icon: FileWarning, tone: 'warning' },
        { label: 'CAPA Assigned', value: s.capaAssigned, icon: ClipboardCheck, tone: 'accent' },
        { label: 'Action Tasks', value: s.actionTasks, icon: ListTodo, tone: 'info' },
      ],
      recentIncidents: asArray(data.recent?.incidents),
      trend: data.monthlyTrend || [],
      activity: data.recentActivity || [],
    };
  }
  if (portal.isDept) {
    return {
      kpis: [
        { label: 'Total Reports', value: s.totalReports, icon: AlertTriangle, tone: 'primary' },
        { label: 'Open Incidents', value: s.openIncidents, icon: FileWarning, tone: 'warning' },
        { label: 'Pending Tasks', value: s.pendingTasks, icon: ListTodo, tone: 'accent' },
        { label: 'Completed', value: s.completed, icon: CheckCircle2, tone: 'success' },
      ],
      recentIncidents: asArray(data.recent?.incidents),
      trend: data.monthlyTrend || [],
      activity: data.recentActivity || [],
    };
  }
  // Admin / company
  return {
    kpis: [
      { label: 'Total Incidents', value: s.totalIncidents, icon: AlertTriangle, tone: 'primary' },
      { label: 'Open Incidents', value: s.openIncidents, icon: FileWarning, tone: 'warning' },
      { label: 'Total CAPAs', value: s.totalCAPAs, icon: ClipboardCheck, tone: 'accent' },
      { label: 'Open CAPAs', value: s.openCAPAs, icon: ShieldCheck, tone: 'info' },
    ],
    recentIncidents: asArray(data.recentIncidents),
    trend: data.monthlyTrend || [],
    activity: data.recentActivity || [],
  };
}

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const portal = usePortal();
  const user = useAuthStore((s) => s.user);
  const REPORT_BLUE = useAccent();

  const { data, loading, refreshing, refresh } = useAsync(() => portal.fetchDashboard(), [portal.portalType], {
    cacheKey: `dashboard:${portal.portalType}`,
  });

  const view = useMemo(() => normalize(portal, data), [portal, data]);

  // Employee ID is already shown once as the hero badge, so don't repeat it as
  // the subtitle (C: employee ID was rendered twice in the top bar).
  const subtitle = portal.isDept ? user?.department?.name : portal.isEmployee ? null : portal.label;

  const goNotifications = () => navigation.navigate('Notifications');
  // Open the Profile page from the dashboard header (mobile §1). ProfileTab is an
  // ancestor tab route, so navigating to it bubbles up from this stack. Target the
  // nested `Profile` screen explicitly so it always lands on the Profile page
  // instead of whatever screen the Profile stack was last left on (Settings,
  // ChangePassword, an incident opened from notifications, etc.).
  const goProfile = () => navigation.navigate('ProfileTab', { screen: 'Profile' });
  const openIncident = (incident) => navigation.navigate('IncidentDetail', { id: incident.id, title: incident.incidentNo });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        <DashboardHero
          user={user}
          subtitle={subtitle}
          badge={portal.isEmployee && user?.employeeId ? `ID ${user.employeeId}` : null}
          role={portal.isEmployee ? 'Employee' : portal.isDept ? 'Department' : portal.label}
          onBellPress={goNotifications}
          onProfilePress={goProfile}
        />

        <View style={styles.body}>
          {/* KPI grid */}
          {loading && !data ? (
            <View style={styles.kpiGrid}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} width="48%" height={120} radius={20} style={{ marginBottom: 12 }} />
              ))}
            </View>
          ) : (
            <View style={styles.kpiGrid}>
              {view.kpis.map((k) => (
                <KpiCard key={k.label} {...k} style={styles.kpi} />
              ))}
            </View>
          )}

          {/* Trend chart */}
          {view.trend.length ? (
            <Card style={styles.section}>
              <TrendChart data={view.trend} title="Incident trend (6 months)" />
            </Card>
          ) : null}

          {/* Recent incidents */}
          <View style={styles.sectionHeader}>
            <Text variant="h3">Recent incidents</Text>
            {view.recentIncidents.length ? (
              <Text variant="small" style={{ color: REPORT_BLUE, fontWeight: '700' }} onPress={() => navigation.navigate('IncidentsTab')}>View all</Text>
            ) : null}
          </View>
          {loading && !data ? (
            <Skeleton width="100%" height={120} radius={20} />
          ) : view.recentIncidents.length ? (
            view.recentIncidents.slice(0, 4).map((inc) => (
              <IncidentCard key={inc.id} incident={inc} onPress={() => openIncident(inc)} />
            ))
          ) : (
            <Card><Text variant="body" color="textMuted">No incidents reported yet.</Text></Card>
          )}

          {/* Activity feed */}
          {view.activity.length ? (
            <>
              <Text variant="h3" style={styles.activityTitle}>Recent activity</Text>
              <Card>
                {view.activity.slice(0, 6).map((a, i, arr) => (
                  <View key={a.id || i} style={[styles.activityRow, i < arr.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                    <View style={[styles.activityDot, { backgroundColor: colors.primaryBg }]}>
                      <Activity size={14} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="small" numberOfLines={2}>
                        {(a.action || 'Activity').replace(/_/g, ' ')}
                        {a.entity ? ` · ${a.entity}` : ''}
                      </Text>
                      <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
                        {a.user ? `${fullName(a.user)} · ` : ''}{timeAgo(a.createdAt)}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 16, marginTop: 16 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  kpi: { flexBasis: '48%', flexGrow: 0, marginBottom: 12 },
  section: { marginTop: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 12 },
  activityTitle: { marginTop: 20, marginBottom: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  activityDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
});
