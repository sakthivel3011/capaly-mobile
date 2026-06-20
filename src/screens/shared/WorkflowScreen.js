import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { GitBranch, Building2, Tag, ChevronRight, Workflow as WorkflowIcon } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccents } from '../../theme/accent';
import { workflowApi } from '../../api/data.api';
import { useAsync } from '../../hooks/useAsync';
import AppHeader from '../../components/ui/AppHeader';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import { Badge } from '../../components/ui/Badge';
import { asArray } from '../../utils/format';

// Default lifecycle steps shown when a workflow has no explicit stages, so the
// user always sees the standard CAPALY pipeline.
const DEFAULT_STEPS = ['Incident', 'Investigation', 'CAPA', 'Inspection', 'Final Report'];

// Company Workflow screen — read-only view of the company's incident workflows.
// Visible to Employee and Department users (D §2/§5/§6).
export default function WorkflowScreen({ navigation }) {
  const { colors } = useTheme();
  const { accent } = useAccents();
  const { data, loading, refreshing, error, refresh } = useAsync(() => workflowApi.myCompany(), []);
  const workflows = asArray(data);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="Company Workflow" onBack={navigation?.canGoBack?.() ? () => navigation.goBack() : undefined} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={accent} />}
      >
        {!loading && workflows.length === 0 ? (
          <Card style={styles.empty}>
            <WorkflowIcon size={34} color={colors.textFaint} />
            <Text variant="title" style={{ marginTop: 12, textAlign: 'center' }}>No workflow configured</Text>
            <Text variant="small" color="textMuted" style={{ marginTop: 6, textAlign: 'center' }}>
              No workflow configured for your company.
            </Text>
          </Card>
        ) : null}

        {error && !loading ? (
          <Card style={styles.empty}>
            <Text variant="small" color="danger" style={{ textAlign: 'center' }}>Could not load workflows. Pull to retry.</Text>
          </Card>
        ) : null}

        {workflows.map((w) => {
          const steps = (w.steps && w.steps.length ? w.steps : DEFAULT_STEPS);
          return (
            <Card key={w.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: `${accent}1A` }]}>
                  <GitBranch size={18} color={accent} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="title" numberOfLines={1}>{w.workflowName}</Text>
                  <View style={styles.metaRow}>
                    <Tag size={12} color={colors.textMuted} />
                    <Text variant="caption" color="textMuted" style={{ marginLeft: 4 }}>{w.incidentType}</Text>
                  </View>
                </View>
                <Badge label={w.isActive ? 'Active' : 'Inactive'} color={w.isActive ? '#16A34A' : colors.textMuted} />
              </View>

              {w.firstReceiverDepartment ? (
                <View style={[styles.infoLine, { borderTopColor: colors.border }]}>
                  <Building2 size={14} color={colors.textMuted} />
                  <Text variant="small" color="textMuted" style={{ marginLeft: 8 }}>First receiver</Text>
                  <Text variant="small" style={{ marginLeft: 'auto', fontWeight: '700' }}>{w.firstReceiverDepartment}</Text>
                </View>
              ) : null}

              {/* Steps pipeline */}
              <View style={[styles.stepsWrap, { borderTopColor: colors.border }]}>
                {steps.map((s, i) => (
                  <View key={`${w.id}-${i}`} style={styles.stepItem}>
                    <View style={[styles.stepDot, { backgroundColor: accent }]} />
                    <Text variant="caption" style={{ marginLeft: 6 }} numberOfLines={1}>{s}</Text>
                    {i < steps.length - 1 ? <ChevronRight size={14} color={colors.textFaint} style={{ marginHorizontal: 2 }} /> : null}
                  </View>
                ))}
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 40, marginTop: 8 },
  card: { marginBottom: 14, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoLine: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  stepsWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 7, height: 7, borderRadius: 4 },
});
