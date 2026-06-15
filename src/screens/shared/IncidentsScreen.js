import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Search, Plus, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccent } from '../../theme/accent';
import { usePortal } from '../../hooks/usePortal';
import { useAsync } from '../../hooks/useAsync';
import Screen from '../../components/ui/Screen';
import AppHeader from '../../components/ui/AppHeader';
import { TextField } from '../../components/ui/Input';
import SegmentedTabs from '../../components/ui/SegmentedTabs';
import IncidentCard from '../../components/domain/IncidentCard';
import { SkeletonList } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { asArray } from '../../utils/format';

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'progress', label: 'In Progress' },
  { key: 'closed', label: 'Closed' },
];

export default function IncidentsScreen({ navigation }) {
  const { colors } = useTheme();
  const accent = useAccent();
  const portal = usePortal();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const { data, loading, refreshing, refresh, error } = useAsync(() => portal.fetchIncidents(), [portal.portalType], {
    cacheKey: `incidents:${portal.portalType}`,
  });

  const incidents = useMemo(() => {
    let list = asArray(data);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) => i.title?.toLowerCase().includes(q) || i.incidentNo?.toLowerCase().includes(q) || i.location?.toLowerCase().includes(q)
      );
    }
    if (filter !== 'all') {
      list = list.filter((i) => {
        const s = (i.status || '').toLowerCase();
        if (filter === 'open') return s.includes('open');
        if (filter === 'closed') return s.includes('closed') || s.includes('completed') || s.includes('resolved');
        if (filter === 'progress') return !s.includes('open') && !s.includes('closed') && !s.includes('completed');
        return true;
      });
    }
    // Severity-first sort (Critical/High first), then newest.
    return [...list].sort((a, b) => {
      const sa = SEVERITY_ORDER[a.severity] ?? 5;
      const sb = SEVERITY_ORDER[b.severity] ?? 5;
      if (sa !== sb) return sa - sb;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [data, query, filter]);

  const openDetail = (item) => navigation.navigate('IncidentDetail', { id: item.id, title: item.incidentNo });

  return (
    <Screen padded={false}>
      <AppHeader
        title={portal.isEmployee ? 'My Incidents' : 'Incidents'}
        subtitle={`${incidents.length} ${incidents.length === 1 ? 'record' : 'records'}`}
        right={
          portal.canReport ? (
            <Pressable onPress={() => navigation.navigate('ReportIncident')} hitSlop={10} style={[styles.add, { backgroundColor: accent }]}>
              <Plus size={20} color="#fff" />
            </Pressable>
          ) : null
        }
      />

      <View style={styles.controls}>
        <TextField
          placeholder="Search incidents"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          leftIcon={<Search size={18} color={colors.textMuted} />}
          style={{ marginBottom: 12 }}
        />
        <SegmentedTabs tabs={FILTERS} active={filter} onChange={setFilter} />
      </View>

      {loading && !data ? (
        <View style={styles.pad}><SkeletonList count={5} /></View>
      ) : error && !incidents.length ? (
        <EmptyState title="Couldn't load incidents" message={error} actionTitle="Retry" onAction={refresh} />
      ) : !incidents.length ? (
        <EmptyState
          icon={AlertTriangle}
          title="No incidents found"
          message={portal.canReport ? 'Tap + to report your first incident.' : 'Nothing matches your filters.'}
          actionTitle={portal.canReport ? 'Report incident' : undefined}
          onAction={portal.canReport ? () => navigation.navigate('ReportIncident') : undefined}
        />
      ) : (
        <FlashList
          data={incidents}
          renderItem={({ item }) => <IncidentCard incident={item} onPress={() => openDetail(item)} />}
          keyExtractor={(item) => item.id}
          estimatedItemSize={150}
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
  controls: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  add: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pad: { paddingHorizontal: 16, paddingTop: 8 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
});
