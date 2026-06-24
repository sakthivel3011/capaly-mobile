import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ClipboardList, Paperclip } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { actionPlanApi } from '../../api/data.api';
import { useAsync } from '../../hooks/useAsync';
import Screen from '../../components/ui/Screen';
import AppHeader from '../../components/ui/AppHeader';
import SegmentedTabs from '../../components/ui/SegmentedTabs';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import { StatusBadge, SeverityBadge } from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { asArray, formatDate } from '../../utils/format';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Pending' },
  { key: 'progress', label: 'In Progress' },
  { key: 'done', label: 'Completed' },
];

// Department action plan tasks assigned to this employee (or their department).
// View + advance status only — employees don't create action plans.
export default function EmployeeActionPlanScreen({ navigation }) {
  const [filter, setFilter] = useState('all');

  const { data, loading, refreshing, refresh, error, reload } = useAsync(
    () => actionPlanApi.employeeList(),
    [],
    { cacheKey: 'employee-action-plans' },
  );

  useFocusEffect(React.useCallback(() => { reload(); }, []));

  const tasks = useMemo(() => {
    let list = asArray(data);
    if (filter !== 'all') {
      list = list.filter((t) => {
        const s = (t.status || '').toLowerCase();
        if (filter === 'open') return s.includes('pending') || s.includes('open') || s.includes('assigned');
        if (filter === 'progress') return s.includes('progress');
        if (filter === 'done') return s.includes('complete') || s.includes('closed') || s.includes('done') || s.includes('verified');
        return true;
      });
    }
    return list;
  }, [data, filter]);

  const summary = useMemo(() => {
    const all = asArray(data);
    return {
      total: all.length,
      pending: all.filter((t) => /pending|open|assigned/i.test(t.status || '')).length,
    };
  }, [data]);

  const renderItem = ({ item }) => (
    <Card onPress={() => navigation.navigate('ActionPlanDetail', { id: item.id, task: item })} style={styles.card}>
      <View style={styles.rowBetween}>
        <Text variant="title" numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
          {item.taskTitle || item.title || 'Task'}
        </Text>
        <StatusBadge value={item.status} />
      </View>
      {item.taskDescription || item.description ? (
        <Text variant="small" color="textMuted" numberOfLines={2} style={{ marginTop: 6 }}>
          {item.taskDescription || item.description}
        </Text>
      ) : null}
      <View style={styles.metaRow}>
        <Text variant="caption" color="textMuted" numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
          {item.incident?.incidentNo ? `Incident ${item.incident.incidentNo}` : 'Action task'}
        </Text>
        <View style={styles.metaRight}>
          {item.attachmentCount ? (
            <View style={styles.attach}>
              <Paperclip size={12} color="#94a3b8" />
              <Text variant="caption" color="textFaint" style={{ marginLeft: 3 }}>{item.attachmentCount}</Text>
            </View>
          ) : null}
          {item.priority ? <SeverityBadge value={item.priority} /> : null}
          {item.dueDate ? <Text variant="caption" color="textFaint" style={{ marginLeft: 8 }}>{formatDate(item.dueDate)}</Text> : null}
        </View>
      </View>
    </Card>
  );

  return (
    <Screen padded={false}>
      <AppHeader
        title="Action Plan"
        subtitle={`${summary.total} tasks · ${summary.pending} pending`}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      />
      <View style={styles.tabs}>
        <SegmentedTabs tabs={FILTERS} active={filter} onChange={setFilter} />
      </View>

      {loading && !data ? (
        <View style={styles.pad}><SkeletonList count={5} /></View>
      ) : error && !tasks.length ? (
        <EmptyState title="Couldn't load tasks" message={error} actionTitle="Retry" onAction={refresh} />
      ) : !tasks.length ? (
        <EmptyState
          icon={ClipboardList}
          title="No action plans"
          message="Tasks assigned to you by your department will appear here."
        />
      ) : (
        <FlashList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={140}
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
  rowBetween: { flexDirection: 'row', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  metaRight: { flexDirection: 'row', alignItems: 'center' },
  attach: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
});
