import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { AlertTriangle, ClipboardList, Users, Building2, Send, Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccents } from '../../theme/accent';
import { actionPlanApi } from '../../api/data.api';
import { apiError } from '../../api/client';
import { useToast } from '../../components/feedback/ToastProvider';
import AppHeader from '../../components/ui/AppHeader';
import SectionCard from '../../components/ui/SectionCard';
import { TextField } from '../../components/ui/Input';
import SelectField from '../../components/ui/SelectField';
import SearchSelectField from '../../components/ui/SearchSelectField';
import DateField from '../../components/ui/DateField';
import Button from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import { fullName } from '../../utils/format';

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

export default function CreateActionPlanScreen({ navigation }) {
  const { colors, radius } = useTheme();
  const { accent, accentDark } = useAccents();
  const toast = useToast();

  const [form, setForm] = useState({
    incidentId: '', incidentLabel: '',
    title: '', description: '',
    assignToType: 'DEPARTMENT',
    assignedDepartmentId: '', assignedUserId: '', assigneeLabel: '',
    priority: 'Medium', dueDate: '',
    evidenceRequired: false, commentsRequired: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.incidentId || !form.title.trim() || !form.description.trim()) {
      toast.warning('Incident, title and description are required.');
      return;
    }
    if (form.assignToType === 'USER' && !form.assignedUserId) return toast.warning('Select a user to assign.');
    if (form.assignToType === 'DEPARTMENT' && !form.assignedDepartmentId) return toast.warning('Select a department to assign.');

    setSubmitting(true);
    try {
      await actionPlanApi.deptCreate({
        incidentId: form.incidentId,
        title: form.title.trim(),
        description: form.description.trim(),
        assignToType: form.assignToType,
        assignedDepartmentId: form.assignToType === 'DEPARTMENT' ? form.assignedDepartmentId : undefined,
        assignedUserId: form.assignToType === 'USER' ? form.assignedUserId : undefined,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        evidenceRequired: form.evidenceRequired,
        commentsRequired: form.commentsRequired,
      });
      toast.success('Action plan created');
      navigation.goBack();
    } catch (err) {
      toast.error(apiError(err, 'Could not create action plan'));
    } finally {
      setSubmitting(false);
    }
  };

  const Toggle = ({ label, value, onToggle }) => (
    <Pressable onPress={onToggle} style={styles.toggleRow}>
      <View style={[styles.checkbox, { borderColor: value ? colors.primary : colors.border, backgroundColor: value ? colors.primary : 'transparent' }]}>
        {value ? <Check size={14} color="#fff" /> : null}
      </View>
      <Text variant="body" style={{ marginLeft: 10 }}>{label}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="New Action Plan" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <SectionCard icon={AlertTriangle} title="Related incident">
          <SearchSelectField
            placeholder="Search incident by number or title"
            value={form.incidentId}
            display={form.incidentLabel}
            search={(q) => actionPlanApi.searchIncidents(q)}
            mapItem={(i) => ({ label: `${i.incidentNo} · ${i.title}`, sublabel: i.status, value: i.id })}
            onSelect={(value, label) => setForm((f) => ({ ...f, incidentId: value, incidentLabel: label }))}
            leftIcon={<AlertTriangle size={18} color={colors.textMuted} />}
          />
        </SectionCard>

        <SectionCard icon={ClipboardList} title="Task">
          <TextField label="Title" value={form.title} onChangeText={(v) => set('title', v)} placeholder="What needs to be done" />
          <TextField label="Description" value={form.description} onChangeText={(v) => set('description', v)} placeholder="Task details and expectations" multiline />
          <SelectField label="Priority" value={form.priority} onChange={(v) => set('priority', v)} options={PRIORITIES} />
          <DateField label="Due date" value={form.dueDate} onChange={(v) => set('dueDate', v)} />
        </SectionCard>

        <SectionCard icon={Users} title="Assignment">
          <View style={styles.segRow}>
            {[
              { key: 'DEPARTMENT', label: 'Department', icon: Building2 },
              { key: 'USER', label: 'Employee', icon: Users },
            ].map((opt) => {
              const active = form.assignToType === opt.key;
              const Icon = opt.icon;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setForm((f) => ({ ...f, assignToType: opt.key, assignedUserId: '', assignedDepartmentId: '', assigneeLabel: '' }))}
                  style={[styles.seg, { backgroundColor: active ? colors.primary : colors.surfaceAlt, borderRadius: radius.md }]}
                >
                  <Icon size={18} color={active ? '#fff' : colors.textMuted} />
                  <Text variant="small" color={active ? '#FFFFFF' : 'textMuted'} style={{ marginLeft: 8 }}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {form.assignToType === 'USER' ? (
            <SearchSelectField
              placeholder="Search by name, code or email"
              value={form.assignedUserId}
              display={form.assigneeLabel}
              search={(q) => actionPlanApi.searchUsers(q)}
              mapItem={(u) => ({ label: fullName(u), sublabel: u.employeeId || u.email, value: u.id })}
              onSelect={(value, label) => setForm((f) => ({ ...f, assignedUserId: value, assigneeLabel: label }))}
              leftIcon={<Users size={18} color={colors.textMuted} />}
            />
          ) : (
            <SearchSelectField
              placeholder="Search department by name or code"
              value={form.assignedDepartmentId}
              display={form.assigneeLabel}
              search={(q) => actionPlanApi.searchDepartments(q)}
              mapItem={(d) => ({ label: d.name, sublabel: d.departmentCode || d.code, value: d.id })}
              onSelect={(value, label) => setForm((f) => ({ ...f, assignedDepartmentId: value, assigneeLabel: label }))}
              leftIcon={<Building2 size={18} color={colors.textMuted} />}
            />
          )}

          <Toggle label="Require evidence upload" value={form.evidenceRequired} onToggle={() => set('evidenceRequired', !form.evidenceRequired)} />
          <Toggle label="Require comments" value={form.commentsRequired} onToggle={() => set('commentsRequired', !form.commentsRequired)} />
        </SectionCard>

        <Button title="Create action plan" icon={<Send size={18} color="#fff" />} onPress={submit} loading={submitting} color={[accent, accentDark]} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  segRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  seg: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
