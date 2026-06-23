import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { Workflow as WorkflowIcon, ChevronRight, User, Building2, Calendar } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccents } from '../../theme/accent';
import { workflowApi } from '../../api/data.api';
import { useAsync } from '../../hooks/useAsync';
import AppHeader from '../../components/ui/AppHeader';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import { SeverityBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { asArray, formatDate } from '../../utils/format';

// The standard CAPALY incident lifecycle shown as the pipeline header.
const PIPELINE = ['Incident Reported', 'Investigation', 'CAPA', 'Inspection', 'Final Report', 'Closed'];

// Company Workflow screen — read-only list of every company incident with its
// current lifecycle stage + progress. Visible to Employee and Department users.
// Includes employee-, department- and safety-reported incidents (no filtering).
export default function WorkflowScreen({ navigation }) {
  const { colors } = useTheme();
  const { accent } = useAccents();
  const { data, loading, refreshing, error, refresh } = useAsync(() => workflowApi.myCompanyIncidents(), []);
  const incidents = asArray(data);

  const openIncident = (inc) => navigation.navigate('IncidentDetail', { id: inc.id, title: inc.incidentNo });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="Company Workflow" onBack={navigation?.canGoBack?.() ? () => navigation.goBack() : undefined} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={accent} />}
      >
        {/* Pipeline overview */}
        <Card style={styles.pipelineCard}>
          <Text variant="title" style={{ marginBottom: 12 }}>Incident lifecycle</Text>
          <View style={styles.pipeline}>
            {PIPELINE.map((s, i) => (
              <View key={s} style={styles.pipeStep}>
                <View style={[styles.pipeDot, { backgroundColor: accent }]} />
                <Text variant="caption" style={{ marginLeft: 6 }} numberOfLines={1}>{s}</Text>
                {i < PIPELINE.length - 1 ? <ChevronRight size={13} color={colors.textFaint} style={{ marginHorizontal: 1 }} /> : null}
              </View>
            ))}
          </View>
        </Card>

        {loading && !data ? (
          <>
            <Skeleton width="100%" height={130} radius={20} style={{ marginTop: 14 }} />
            <Skeleton width="100%" height={130} radius={20} style={{ marginTop: 14 }} />
          </>
        ) : null}

        {/* Empty state only when the request succeeded but returned nothing — an
            empty response must NOT look like an error. */}
        {!loading && !error && incidents.length === 0 ? (
          <Card style={styles.empty}>
            <WorkflowIcon size={34} color={colors.textFaint} />
            <Text variant="title" style={{ marginTop: 12, textAlign: 'center' }}>No incidents yet</Text>
            <Text variant="small" color="textMuted" style={{ marginTop: 6, textAlign: 'center' }}>
              Incidents reported in your company will appear here as they move through the workflow.
            </Text>
          </Card>
        ) : null}

        {error && !loading ? (
          <Card style={styles.empty}>
            <Text variant="small" color="danger" style={{ textAlign: 'center' }}>Could not load the workflow. Pull to retry.</Text>
          </Card>
        ) : null}

        {incidents.map((inc) => {
          const progress = Math.max(0, Math.min(100, inc.progress || 0));
          return (
            <Pressable key={inc.id} onPress={() => openIncident(inc)} style={({ pressed }) => pressed && { opacity: 0.85 }}>
              <Card style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text variant="caption" style={{ color: accent, fontWeight: '700' }}>{inc.incidentNo}</Text>
                    <Text variant="title" numberOfLines={2} style={{ marginTop: 2 }}>{inc.title}</Text>
                  </View>
                  <SeverityBadge value={inc.severity} />
                </View>

                {/* Reporter / department / date meta */}
                <View style={styles.metaWrap}>
                  <View style={styles.metaItem}>
                    <User size={13} color={colors.textMuted} />
                    <Text variant="caption" color="textMuted" style={styles.metaText} numberOfLines={1}>{inc.reporter || '—'}</Text>
                  </View>
                  {inc.department ? (
                    <View style={styles.metaItem}>
                      <Building2 size={13} color={colors.textMuted} />
                      <Text variant="caption" color="textMuted" style={styles.metaText} numberOfLines={1}>{inc.department}</Text>
                    </View>
                  ) : null}
                  <View style={styles.metaItem}>
                    <Calendar size={13} color={colors.textMuted} />
                    <Text variant="caption" color="textMuted" style={styles.metaText}>{formatDate(inc.createdAt)}</Text>
                  </View>
                </View>

                {/* Current stage + progress */}
                <View style={[styles.progressHeader, { borderTopColor: colors.border }]}>
                  <View style={[styles.stageChip, { backgroundColor: `${accent}14` }]}>
                    <Text variant="caption" style={{ color: accent, fontWeight: '700' }}>{inc.currentStage}</Text>
                  </View>
                  <Text variant="caption" color="textMuted" style={{ fontWeight: '700' }}>{progress}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.surfaceAlt }]}>
                  <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: accent }]} />
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  pipelineCard: { padding: 16 },
  pipeline: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  pipeStep: { flexDirection: 'row', alignItems: 'center' },
  pipeDot: { width: 7, height: 7, borderRadius: 4 },
  empty: { alignItems: 'center', paddingVertical: 40, marginTop: 14 },
  card: { marginTop: 14, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  metaWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', maxWidth: '100%' },
  metaText: { marginLeft: 5, flexShrink: 1 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  stageChip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  progressTrack: { height: 7, borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4 },
});
