import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccents } from '../../theme/accent';
import { actionPlanApi } from '../../api/data.api';
import { apiError } from '../../api/client';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../components/feedback/ToastProvider';
import Screen from '../../components/ui/Screen';
import AppHeader from '../../components/ui/AppHeader';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import DetailRow from '../../components/ui/DetailRow';
import SelectField from '../../components/ui/SelectField';
import Button from '../../components/ui/Button';
import { StatusBadge, SeverityBadge } from '../../components/ui/Badge';
import AttachmentGrid from '../../components/domain/AttachmentGrid';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDate, fullName } from '../../utils/format';

const STATUS = ['Pending', 'In Progress', 'Completed'];

export default function ActionPlanDetailScreen({ navigation, route }) {
  const { id } = route.params || {};
  const { accent, accentDark } = useAccents();
  const toast = useToast();
  const { data, loading, reload } = useAsync(() => actionPlanApi.deptGetOne(id), [id]);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const task = data || {};
  const currentStatus = status ?? task.status;

  const updateStatus = async () => {
    setSaving(true);
    try {
      await actionPlanApi.deptUpdateStatus(id, currentStatus);
      toast.success('Status updated');
      reload();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padded={false}>
      <AppHeader title="Action Plan" subtitle={task.title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading && !data ? (
          <Skeleton width="100%" height={220} radius={20} />
        ) : (
          <>
            <Card>
              <View style={styles.headerRow}>
                <Text variant="h3" style={{ flex: 1, marginRight: 8 }}>{task.title}</Text>
                <StatusBadge value={task.status} />
              </View>
              {task.description ? <Text variant="body" color="textMuted" style={{ marginTop: 10, lineHeight: 21 }}>{task.description}</Text> : null}
            </Card>

            <Card style={styles.section}>
              <DetailRow label="Incident" value={task.incident?.incidentNo || '—'} />
              <DetailRow label="Assigned to" value={task.assignedDepartment?.name || fullName(task.assignedUser) || '—'} />
              <DetailRow label="Priority" value={task.priority ? <SeverityBadge value={task.priority} /> : '—'} />
              <DetailRow label="Due date" value={formatDate(task.dueDate)} />
              <DetailRow label="Created by" value={fullName(task.createdBy)} last />
            </Card>

            {task.attachments?.length ? (
              <Card style={styles.section}>
                <Text variant="title" style={{ marginBottom: 12 }}>Evidence</Text>
                <AttachmentGrid attachments={task.attachments} />
              </Card>
            ) : null}

            <Card style={styles.section}>
              <Text variant="title" style={{ marginBottom: 12 }}>Update status</Text>
              <SelectField value={currentStatus} onChange={setStatus} options={STATUS} />
              <Button title="Save status" icon={<CheckCircle2 size={18} color="#fff" />} onPress={updateStatus} loading={saving} color={[accent, accentDark]} />
            </Card>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  section: { marginTop: 16 },
});
