import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MapPin, Calendar } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccent } from '../../theme/accent';
import Card from '../ui/Card';
import Text from '../ui/Text';
import { SeverityBadge, StatusBadge } from '../ui/Badge';
import { formatDate } from '../../utils/format';

// Incident summary card used across all portal incident lists.
export default function IncidentCard({ incident, onPress }) {
  const { colors } = useTheme();
  const accent = useAccent();
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text variant="caption" style={{ color: accent, fontWeight: '700' }}>{incident.incidentNo || 'INC'}</Text>
        <SeverityBadge value={incident.severity} />
      </View>
      <Text variant="title" numberOfLines={2} style={styles.title}>{incident.title}</Text>
      <View style={styles.metaRow}>
        {incident.location ? (
          <View style={styles.meta}>
            <MapPin size={13} color={colors.textMuted} />
            <Text variant="caption" color="textMuted" style={styles.metaText} numberOfLines={1}>
              {incident.location}
            </Text>
          </View>
        ) : null}
        <View style={styles.meta}>
          <Calendar size={13} color={colors.textMuted} />
          <Text variant="caption" color="textMuted" style={styles.metaText}>
            {formatDate(incident.dateOccurred || incident.createdAt)}
          </Text>
        </View>
      </View>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <StatusBadge value={incident.status} />
        {incident.department?.name ? (
          <Text variant="caption" color="textFaint" numberOfLines={1} style={styles.dept}>
            {incident.department.name}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { marginTop: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', maxWidth: '60%' },
  metaText: { marginLeft: 5 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dept: { flex: 1, textAlign: 'right', marginLeft: 12 },
});
