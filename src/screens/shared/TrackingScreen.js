import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Workflow } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { investigationApi, capaApi, inspectionApi, incidentApi } from '../../api/data.api';
import { useAsync } from '../../hooks/useAsync';
import Screen from '../../components/ui/Screen';
import AppHeader from '../../components/ui/AppHeader';
import SegmentedTabs from '../../components/ui/SegmentedTabs';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import { StatusBadge } from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { asArray, formatDate, fullName } from '../../utils/format';

const TABS = [
  { key: 'investigation', label: 'Investigations', fetch: () => investigationApi.list() },
  { key: 'capa', label: 'CAPA', fetch: () => capaApi.list() },
  { key: 'inspection', label: 'Inspections', fetch: () => inspectionApi.list() },
  { key: 'final', label: 'Final Complete', fetch: () => incidentApi.list({ status: 'Closed' }) },
];

export default function TrackingScreen({ navigation }) {
  const { colors } = useTheme();
  const [tab, setTab] = useState('investigation');
  const current = TABS.find((t) => t.key === tab);

  const { data, loading, refreshing, refresh, error } = useAsync(() => current.fetch(), [tab], {
    cacheKey: `tracking:${tab}`,
  });

  const rows = useMemo(() => asArray(data), [data]);

  const openIncident = (item) => {
    const id = item.incidentId || item.incident?.id || item.id;
    if (id) navigation.navigate('IncidentDetail', { id });
  };

  const renderItem = ({ item }) => {
    const titleNo = item.incidentNo || item.capaNo || item.inspectionNo || item.incident?.incidentNo;
    const title = item.title || item.incident?.title || item.rootCause || 'Record';
    const who = fullName(item.assignedTo || item.investigator || item.inspector || item.reportedBy);
    return (
      <Card onPress={() => openIncident(item)} style={styles.card}>
        <View style={styles.rowBetween}>
          {titleNo ? <Text variant="caption" color="primary">{titleNo}</Text> : <View />}
          <StatusBadge value={item.status} />
        </View>
        <Text variant="title" numberOfLines={2} style={{ marginTop: 8 }}>{title}</Text>
        <View style={styles.metaRow}>
          {who ? <Text variant="caption" color="textMuted">{who}</Text> : null}
          <Text variant="caption" color="textFaint">{formatDate(item.dueDate || item.scheduledDate || item.createdAt)}</Text>
        </View>
      </Card>
    );
  };

  return (
    <Screen padded={false}>
      <AppHeader title="Tracking" subtitle="Workflow across modules" />
      <View style={styles.tabs}>
        <SegmentedTabs tabs={TABS.map((t) => ({ key: t.key, label: t.label }))} active={tab} onChange={setTab} />
      </View>

      {loading && !data ? (
        <View style={styles.pad}><SkeletonList count={5} /></View>
      ) : error && !rows.length ? (
        <EmptyState title="Couldn't load data" message={error} actionTitle="Retry" onAction={refresh} />
      ) : !rows.length ? (
        <EmptyState icon={Workflow} title={`No ${current.label.toLowerCase()}`} message="Records will appear here as the workflow progresses." />
      ) : (
        <FlashList
          data={rows}
          renderItem={renderItem}
          keyExtractor={(item, i) => item.id || String(i)}
          estimatedItemSize={130}
          contentContainerStyle={styles.list}
          onRefresh={refresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  pad: { paddingHorizontal: 16, paddingTop: 8 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  card: { marginBottom: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
});
