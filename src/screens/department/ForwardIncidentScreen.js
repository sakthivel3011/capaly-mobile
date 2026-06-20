import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Forward, Send, Building2, AlignLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccents } from '../../theme/accent';
import { departmentApi } from '../../api/data.api';
import { apiError } from '../../api/client';
import { useAsync } from '../../hooks/useAsync';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/feedback/ToastProvider';
import AppHeader from '../../components/ui/AppHeader';
import KeyboardAwareScroll from '../../components/ui/KeyboardAwareScroll';
import SectionCard from '../../components/ui/SectionCard';
import SearchSelectField from '../../components/ui/SearchSelectField';
import { TextField } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Text from '../../components/ui/Text';
import { asArray } from '../../utils/format';

// Department: forward / pass an incident to another department (M). Loads the
// company's departments, excludes the user's own, and posts to the backend which
// updates routing, notifies the target department, and logs the timeline entry.
export default function ForwardIncidentScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { accent, accentDark } = useAccents();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const { id, incidentNo, title } = route.params || {};

  const myDeptId = user?.departmentId || user?.department?.id;
  const { data, loading, error, reload } = useAsync(() => departmentApi.departments(), []);
  const departments = useMemo(
    () => asArray(data).filter((d) => d.id !== myDeptId),
    [data, myDeptId]
  );

  const [targetId, setTargetId] = useState('');
  const [targetName, setTargetName] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const searchDepartments = (q) => {
    const term = (q || '').toLowerCase().trim();
    if (!term) return departments;
    return departments.filter((d) => (d.name || '').toLowerCase().includes(term));
  };
  const mapDepartment = (d) => ({ label: d.name, value: d.id });

  const submit = async () => {
    if (!targetId) { toast.warning('Select a department to forward to.'); return; }
    setSubmitting(true);
    try {
      await departmentApi.forward(id, { targetDepartmentId: targetId, note: note || undefined });
      toast.success(`Forwarded to ${targetName || 'the department'}`);
      navigation.goBack();
    } catch (err) {
      toast.error(apiError(err, 'Could not forward the incident.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="Forward incident" subtitle={incidentNo || title} onBack={() => navigation.goBack()} />
      <KeyboardAwareScroll contentContainerStyle={styles.scroll}>
        <SectionCard icon={Forward} title="Pass to another department">
          <SearchSelectField
            label="Department"
            placeholder={loading ? 'Loading departments…' : 'Select a department'}
            value={targetId}
            display={targetName}
            onSelect={(val, lbl) => { setTargetId(val); setTargetName(lbl); }}
            search={searchDepartments}
            mapItem={mapDepartment}
            leftIcon={<Building2 size={18} color={colors.textMuted} />}
          />

          {!loading && error && departments.length === 0 ? (
            <View style={styles.retryRow}>
              <Text variant="caption" color="danger" style={{ flex: 1 }}>Couldn’t load departments.</Text>
              <Text variant="caption" style={{ color: accent, fontWeight: '700' }} onPress={reload}>Retry</Text>
            </View>
          ) : null}

          <TextField
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Add context for the receiving department"
            multiline
            leftIcon={<AlignLeft size={18} color={colors.textMuted} />}
          />
        </SectionCard>

        <Button
          title="Forward incident"
          icon={<Send size={18} color="#fff" />}
          onPress={submit}
          loading={submitting}
          color={[accent, accentDark]}
        />
      </KeyboardAwareScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  retryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -6, marginBottom: 10 },
});
