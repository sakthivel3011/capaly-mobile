import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useAccents } from '../../theme/accent';
import { actionPlanApi } from '../../api/data.api';
import { apiError } from '../../api/client';
import { useToast } from '../../components/feedback/ToastProvider';
import Screen from '../../components/ui/Screen';
import AppHeader from '../../components/ui/AppHeader';
import KeyboardAwareScroll from '../../components/ui/KeyboardAwareScroll';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import DetailRow from '../../components/ui/DetailRow';
import SelectField from '../../components/ui/SelectField';
import { TextField } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { StatusBadge, SeverityBadge } from '../../components/ui/Badge';
import { formatDate, fullName } from '../../utils/format';

// Employees may advance their task through working states. Verification /
// rejection stays with the department (backend rejects other values).
const STATUS = ['Assigned', 'In Progress', 'Completed'];

export default function EmployeeActionPlanDetailScreen({ navigation, route }) {
  const { id, task: initialTask } = route.params || {};
  const { accent, accentDark } = useAccents();
  const toast = useToast();

  const [task, setTask] = useState(initialTask || {});
  const [status, setStatus] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const currentStatus = status ?? task.status;
  const completing = currentStatus === 'Completed';
  const notesRequired = completing && !!task.commentsRequired;

  const taskTitle = task.taskTitle || task.title || 'Action task';
  const taskDescription = task.taskDescription || task.description;

  const incident = task.incident;
  const incidentValue = incident?.id ? (
    <Pressable
      onPress={() => navigation.navigate('IncidentDetail', { id: incident.id, title: incident.incidentNo })}
      hitSlop={6}
      style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
    >
      <Text variant="body" style={{ color: accent, fontWeight: '600' }}>{incident.incidentNo || 'View incident'}</Text>
      <ChevronRight size={16} color={accent} />
    </Pressable>
  ) : '—';

  const updateStatus = async () => {
    if (notesRequired && !notes.trim()) {
      toast.error('Completion notes are required for this task.');
      return;
    }
    setSaving(true);
    try {
      const extra = notes.trim() ? { completionNotes: notes.trim() } : {};
      const updated = await actionPlanApi.employeeTaskStatus(id, currentStatus, extra);
      setTask((t) => ({ ...t, ...updated }));
      setStatus(null);
      toast.success(updated?.incidentClosed ? 'Task completed — incident closed' : 'Status updated');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const requirements = useMemo(() => {
    const r = [];
    if (task.commentsRequired) r.push('Completion notes required');
    if (task.evidenceRequired) r.push('Evidence upload required');
    return r;
  }, [task.commentsRequired, task.evidenceRequired]);

  return (
    <Screen padded={false}>
      <AppHeader title="Action Plan" subtitle={taskTitle} onBack={() => navigation.goBack()} />
      <KeyboardAwareScroll contentContainerStyle={styles.scroll}>
        <Card>
          <View style={styles.headerRow}>
            <Text variant="h3" style={{ flex: 1, marginRight: 8 }}>{taskTitle}</Text>
            <StatusBadge value={task.status} />
          </View>
          {taskDescription ? (
            <Text variant="body" color="textMuted" style={{ marginTop: 10, lineHeight: 21 }}>{taskDescription}</Text>
          ) : null}
        </Card>

        <Card style={styles.section}>
          <DetailRow label="Incident" value={incidentValue} />
          <DetailRow label="Assigned to" value={task.assignedDepartment?.name || fullName(task.assignedUser) || '—'} />
          <DetailRow label="Priority" value={task.priority ? <SeverityBadge value={task.priority} /> : '—'} />
          <DetailRow label="Due date" value={formatDate(task.dueDate)} />
          <DetailRow label="Assigned by" value={fullName(task.createdBy)} last />
        </Card>

        {requirements.length ? (
          <Card style={styles.section}>
            <Text variant="title" style={{ marginBottom: 8 }}>To complete this task</Text>
            {requirements.map((r) => (
              <Text key={r} variant="small" color="textMuted" style={{ marginTop: 4 }}>• {r}</Text>
            ))}
          </Card>
        ) : null}

        <Card style={styles.section}>
          <Text variant="title" style={{ marginBottom: 12 }}>Update status</Text>
          <SelectField value={currentStatus} onChange={setStatus} options={STATUS} />
          {completing ? (
            <TextField
              label={notesRequired ? 'Completion notes (required)' : 'Completion notes (optional)'}
              value={notes}
              onChangeText={setNotes}
              placeholder="What was done to resolve this task?"
              multiline
              style={{ marginTop: 12 }}
            />
          ) : null}
          <Button
            title="Save status"
            icon={<CheckCircle2 size={18} color="#fff" />}
            onPress={updateStatus}
            loading={saving}
            color={[accent, accentDark]}
          />
        </Card>
      </KeyboardAwareScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  section: { marginTop: 16 },
  link: { flexDirection: 'row', alignItems: 'center' },
});
