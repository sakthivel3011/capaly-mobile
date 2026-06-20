import React, { useMemo, useState } from 'react';
import {
  View, ScrollView, RefreshControl, StyleSheet, Pressable,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import {
  Search, ClipboardCheck, ListTodo, Clock, FileText, GitBranch, ChevronDown,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccent } from '../../theme/accent';
import { incidentApi } from '../../api/data.api';
import { usePortal } from '../../hooks/usePortal';
import { useAsync } from '../../hooks/useAsync';
import Screen from '../../components/ui/Screen';
import AppHeader from '../../components/ui/AppHeader';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import DetailRow from '../../components/ui/DetailRow';
import { SeverityBadge, StatusBadge } from '../../components/ui/Badge';
import WorkflowTimeline from '../../components/domain/WorkflowTimeline';
import AttachmentGrid from '../../components/domain/AttachmentGrid';
import EmptyState from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDate, formatDateTime, fullName } from '../../utils/format';

const DONE = ['Completed', 'Closed', 'Resolved'];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Map backend workflowStages to the timeline component shape.
function toTimeline(stages = []) {
  let activeAssigned = false;
  return stages.map((s) => {
    const done = !!s.completedAt || DONE.includes(s.status);
    const active = !done && !activeAssigned && s.count > 0;
    if (active) activeAssigned = true;
    return { key: s.key, label: s.title, done, active, date: s.completedAt ? formatDate(s.completedAt) : null };
  });
}

// Collapsible dropdown section with a right-side chevron.
function AccordionSection({ icon: Icon, title, count, open, onToggle, children }) {
  const { colors, radius } = useTheme();
  const ACCENT = useAccent();
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.secHeader, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.secIcon}>
          {Icon ? <Icon size={20} color={ACCENT} /> : null}
        </View>
        <Text variant="title" style={styles.secTitle}>{title}</Text>
        {count != null ? (
          <View style={[styles.countPill, { backgroundColor: `${ACCENT}1A` }]}>
            <Text variant="caption" style={{ color: ACCENT, fontWeight: '700' }}>{count}</Text>
          </View>
        ) : null}
        <View style={[styles.chevron, open && { transform: [{ rotate: '180deg' }] }]}>
          <ChevronDown size={20} color={colors.textMuted} />
        </View>
      </Pressable>
      {open ? <View style={[styles.secBody, { borderTopColor: colors.border }]}>{children}</View> : null}
    </View>
  );
}

export default function IncidentDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const ACCENT = useAccent();
  const portal = usePortal();
  const { id } = route.params || {};
  const [open, setOpen] = useState({ overview: true });

  // workflow-summary is access-controlled per portal and returns the richest
  // payload; fall back to the portal detail endpoint if it's not permitted.
  const { data, loading, refreshing, refresh } = useAsync(
    async () => {
      try {
        return await incidentApi.workflowSummary(id);
      } catch {
        const inc = await portal.fetchIncidentDetail(id);
        return { incident: inc, fallback: true };
      }
    },
    [id],
    { cacheKey: `incident:${id}` }
  );

  const incident = data?.incident || {};
  const timeline = useMemo(() => toTimeline(data?.workflowStages), [data]);
  const capas = data?.capa || [];
  const tasks = data?.actionPlanTasks || data?.departmentTasks || [];
  const history = data?.activityHistory || [];
  const inv = data?.investigation;

  const toggle = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => ({ ...o, [key]: !o[key] }));
  };

  return (
    <Screen padded={false}>
      <AppHeader
        title={route.params?.title || incident.incidentNo || 'Incident'}
        subtitle={incident.title}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {loading && !data ? (
          <>
            <Skeleton width="60%" height={20} />
            <Skeleton width="100%" height={200} radius={20} style={{ marginTop: 16 }} />
          </>
        ) : (
          <>
            <View style={styles.headerCard}>
              <Text variant="h2">{incident.title}</Text>
              <View style={styles.badgeRow}>
                <SeverityBadge value={incident.severity} />
                <StatusBadge value={incident.status} />
              </View>
            </View>

            {/* Department actions — add a workflow report against this incident */}
            {portal.isDept && incident.id ? (
              <View style={styles.actionBar}>
                {[
                  { label: 'Investigation', module: 'investigation' },
                  { label: 'CAPA', module: 'capa' },
                  { label: 'Inspection', module: 'inspection' },
                ].map((a) => (
                  <Pressable
                    key={a.module}
                    onPress={() => navigation.navigate('ReportModule', { module: a.module, incidentId: incident.id, incidentNo: incident.incidentNo })}
                    style={({ pressed }) => [styles.actionBtn, { borderColor: ACCENT, backgroundColor: `${ACCENT}10` }, pressed && { opacity: 0.7 }]}
                  >
                    <Text variant="caption" style={{ color: ACCENT, fontWeight: '700' }}>+ {a.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View style={styles.sections}>
              {/* Overview */}
              <AccordionSection icon={FileText} title="Overview" open={!!open.overview} onToggle={() => toggle('overview')}>
                <DetailRow label="Incident No" value={incident.incidentNo} />
                <DetailRow label="Type" value={incident.type} />
                <DetailRow label="Severity" value={<SeverityBadge value={incident.severity} />} />
                <DetailRow label="Status" value={<StatusBadge value={incident.status} />} />
                <DetailRow label="Location" value={incident.location} />
                <DetailRow label="Occurred" value={formatDate(incident.dateOccurred)} />
                <DetailRow label="Reported by" value={fullName(incident.reportedBy)} />
                <DetailRow label="Department" value={incident.department?.name} />
                <DetailRow label="Reported at" value={formatDateTime(incident.reportedAt || incident.createdAt)} last />
                {incident.description ? (
                  <View style={styles.descBlock}>
                    <Text variant="small" color="textMuted">Description</Text>
                    <Text variant="body" style={{ marginTop: 6, lineHeight: 21 }}>{incident.description}</Text>
                  </View>
                ) : null}
                {data?.attachments?.length ? (
                  <View style={styles.descBlock}>
                    <Text variant="small" color="textMuted" style={{ marginBottom: 8 }}>Attachments</Text>
                    <AttachmentGrid attachments={data.attachments} />
                  </View>
                ) : null}
              </AccordionSection>

              {/* Workflow */}
              <AccordionSection icon={GitBranch} title="Workflow" open={!!open.workflow} onToggle={() => toggle('workflow')}>
                {timeline.length ? <WorkflowTimeline stages={timeline} /> : <Text variant="body" color="textMuted">Workflow not available.</Text>}
              </AccordionSection>

              {/* Investigation */}
              <AccordionSection icon={Search} title="Investigation" open={!!open.investigation} onToggle={() => toggle('investigation')}>
                {inv ? (
                  <>
                    <DetailRow label="Status" value={<StatusBadge value={inv.status} />} />
                    <DetailRow label="Root cause" value={inv.rootCause} />
                    <DetailRow label="Findings" value={inv.findings} />
                    <DetailRow label="Investigator" value={fullName(inv.investigator || inv.assignedTo)} last />
                  </>
                ) : (
                  <EmptyState icon={Search} title="No investigation yet" message="An investigation has not been started for this incident." />
                )}
              </AccordionSection>

              {/* CAPA */}
              <AccordionSection icon={ClipboardCheck} title="CAPA" count={capas.length || null} open={!!open.capa} onToggle={() => toggle('capa')}>
                {capas.length ? (
                  capas.map((c) => (
                    <View key={c.id} style={[styles.itemCard, { borderColor: colors.border }]}>
                      <View style={styles.rowBetween}>
                        <Text variant="caption" style={{ color: ACCENT }}>{c.capaNo || 'CAPA'}</Text>
                        <StatusBadge value={c.status} />
                      </View>
                      <Text variant="title" style={{ marginTop: 8 }}>{c.title || c.description}</Text>
                      {c.dueDate ? <Text variant="caption" color="textMuted" style={{ marginTop: 6 }}>Due {formatDate(c.dueDate)}</Text> : null}
                    </View>
                  ))
                ) : (
                  <EmptyState icon={ClipboardCheck} title="No CAPA assigned" message="Corrective / preventive actions will appear here." />
                )}
              </AccordionSection>

              {/* Action Plan */}
              <AccordionSection icon={ListTodo} title="Action Plan" count={tasks.length || null} open={!!open.tasks} onToggle={() => toggle('tasks')}>
                {tasks.length ? (
                  tasks.map((t) => (
                    <View key={t.id} style={[styles.itemCard, { borderColor: colors.border }]}>
                      <View style={styles.rowBetween}>
                        <Text variant="title" numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>{t.title || t.task || 'Task'}</Text>
                        <StatusBadge value={t.status} />
                      </View>
                      {t.assignedDepartment?.name || t.assignedTo ? (
                        <Text variant="caption" color="textMuted" style={{ marginTop: 6 }}>
                          Assigned to {t.assignedDepartment?.name || fullName(t.assignedTo)}
                        </Text>
                      ) : null}
                      {t.dueDate ? <Text variant="caption" color="textFaint" style={{ marginTop: 4 }}>Due {formatDate(t.dueDate)}</Text> : null}
                    </View>
                  ))
                ) : (
                  <EmptyState icon={ListTodo} title="No action plans" message="Assigned action plan tasks will appear here." />
                )}
              </AccordionSection>

              {/* Activity */}
              <AccordionSection icon={Clock} title="Activity" count={history.length || null} open={!!open.activity} onToggle={() => toggle('activity')}>
                {history.length ? (
                  history.map((h, i) => (
                    <View key={i} style={[styles.activityRow, i < history.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                      <View style={[styles.dot, { backgroundColor: ACCENT }]} />
                      <View style={{ flex: 1 }}>
                        <Text variant="small">{h.title || h.action}</Text>
                        {h.comments ? <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{h.comments}</Text> : null}
                        <Text variant="caption" color="textFaint" style={{ marginTop: 2 }}>
                          {h.user ? `${h.user} · ` : ''}{formatDateTime(h.date)}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <EmptyState icon={Clock} title="No activity yet" />
                )}
              </AccordionSection>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  headerCard: { paddingHorizontal: 16, paddingTop: 8 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 16 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  sections: { paddingHorizontal: 16, marginTop: 18, gap: 12 },
  section: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  secHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  secIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  secTitle: { flex: 1 },
  countPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 },
  chevron: {},
  secBody: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4, borderTopWidth: StyleSheet.hairlineWidth },
  itemCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, marginTop: 10 },
  descBlock: { marginTop: 14, paddingTop: 14, borderTopColor: 'rgba(127,127,127,0.15)', borderTopWidth: StyleSheet.hairlineWidth },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activityRow: { flexDirection: 'row', paddingVertical: 11, alignItems: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 12 },
});
