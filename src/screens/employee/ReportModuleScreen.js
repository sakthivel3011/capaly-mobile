import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Search, ClipboardCheck, ShieldCheck, Send, AlignLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccents } from '../../theme/accent';
import { incidentApi, investigationApi, capaApi, inspectionApi } from '../../api/data.api';
import { apiError } from '../../api/client';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../components/feedback/ToastProvider';
import AppHeader from '../../components/ui/AppHeader';
import KeyboardAwareScroll from '../../components/ui/KeyboardAwareScroll';
import SectionCard from '../../components/ui/SectionCard';
import { TextField } from '../../components/ui/Input';
import SelectField from '../../components/ui/SelectField';
import SearchSelectField from '../../components/ui/SearchSelectField';
import DateField from '../../components/ui/DateField';
import Button from '../../components/ui/Button';
import { asArray } from '../../utils/format';

// Config-driven employee report form for Investigation / CAPA / Inspection.
const MODULES = {
  investigation: {
    title: 'Report Investigation',
    icon: Search,
    needsIncident: true,
    incidentRequired: true,
    persistIncident: true,
    submit: (body) => investigationApi.employeeSubmit(body),
    fields: [
      { name: 'rootCause', label: 'Root cause', placeholder: 'Identified root cause', multiline: true },
      { name: 'findings', label: 'Findings', placeholder: 'Key findings from the investigation', multiline: true },
      { name: 'recommendations', label: 'Recommendations', placeholder: 'Recommended corrective actions', multiline: true },
    ],
    status: ['Open', 'In Progress', 'Completed'],
  },
  capa: {
    title: 'Report CAPA',
    icon: ClipboardCheck,
    needsIncident: true,
    incidentRequired: true,
    persistIncident: true,
    incidentKey: 'incidentId',
    submit: (body) => capaApi.create(body),
    fields: [
      { name: 'title', label: 'CAPA title', placeholder: 'Short title', required: true },
      { name: 'description', label: 'Description', placeholder: 'What action is required', multiline: true },
      { name: 'actionType', label: 'Action type', placeholder: 'Corrective / Preventive' },
    ],
    hasDue: true,
    status: ['Open', 'In Progress', 'Completed'],
  },
  inspection: {
    title: 'Report Inspection',
    icon: ShieldCheck,
    needsIncident: true,        // show the field…
    incidentRequired: false,    // …but optional
    persistIncident: false,     // inspections aren't stored against an incident
    submit: (body) => inspectionApi.create(body),
    fields: [
      { name: 'title', label: 'Inspection title', placeholder: 'e.g. Monthly fire safety check', required: true },
      { name: 'location', label: 'Location', placeholder: 'Area inspected' },
      { name: 'findings', label: 'Findings', placeholder: 'Observations', multiline: true },
    ],
    hasDue: true,
    dueLabel: 'Scheduled date',
    dueKey: 'scheduledDate',
    status: ['Scheduled', 'In Progress', 'Completed'],
  },
};

export default function ReportModuleScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { accent, accentDark } = useAccents();
  const toast = useToast();
  const moduleKey = route.params?.module || 'investigation';
  const cfg = MODULES[moduleKey];
  const [submitting, setSubmitting] = useState(false);

  // Pull the whole company's incidents so the picker can target older ones too.
  const { data: incidentsData } = useAsync(() => incidentApi.empCompanyList(), [], { immediate: cfg.needsIncident });
  const incidents = useMemo(() => asArray(incidentsData), [incidentsData]);
  const [incidentDisplay, setIncidentDisplay] = useState('');

  // Client-side search over the already-loaded incident list.
  const searchIncidents = (q) => {
    const term = (q || '').toLowerCase().trim();
    if (!term) return incidents;
    return incidents.filter((i) =>
      `${i.incidentNo || ''} ${i.title || ''} ${i.location || ''}`.toLowerCase().includes(term)
    );
  };
  const mapIncident = (i) => ({ label: `${i.incidentNo} · ${i.title}`, sublabel: i.location || i.status, value: i.id });

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      incidentId: '', status: cfg.status[0], due: '',
      ...Object.fromEntries(cfg.fields.map((f) => [f.name, ''])),
    },
  });

  const onSubmit = async (values) => {
    if (cfg.incidentRequired && !values.incidentId) {
      toast.warning('Please select an incident.');
      return;
    }
    setSubmitting(true);
    try {
      const body = { status: values.status };
      cfg.fields.forEach((f) => { if (values[f.name]) body[f.name] = values[f.name]; });
      if (cfg.persistIncident && values.incidentId) body[cfg.incidentKey || 'incidentId'] = values.incidentId;
      if (cfg.hasDue && values.due) body[cfg.dueKey || 'dueDate'] = values.due;
      await cfg.submit(body);
      toast.success(`${cfg.title.replace('Report ', '')} submitted`);
      navigation.goBack();
    } catch (err) {
      toast.error(apiError(err, 'Could not submit'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title={cfg.title} onBack={() => navigation.goBack()} />
      <KeyboardAwareScroll contentContainerStyle={styles.scroll}>
        <SectionCard icon={cfg.icon} title="Details">
          {cfg.needsIncident ? (
            <Controller control={control} name="incidentId" render={({ field: { value, onChange } }) => (
              <SearchSelectField
                label={cfg.incidentRequired ? 'Related incident' : 'Related incident (optional)'}
                placeholder="Search & select incident"
                value={value}
                display={incidentDisplay}
                onSelect={(val, lbl) => { onChange(val); setIncidentDisplay(lbl); }}
                search={searchIncidents}
                mapItem={mapIncident}
                leftIcon={<Search size={18} color={colors.textMuted} />}
              />
            )} />
          ) : null}

          {cfg.fields.map((f) => (
            <Controller key={f.name} control={control} name={f.name} render={({ field: { value, onChange, onBlur } }) => (
              <TextField label={f.label} value={value} onChangeText={onChange} onBlur={onBlur} placeholder={f.placeholder} multiline={f.multiline} />
            )} />
          ))}

          {cfg.hasDue ? (
            <Controller control={control} name="due" render={({ field: { value, onChange } }) => (
              <DateField label={cfg.dueLabel || 'Due date'} value={value} onChange={onChange} />
            )} />
          ) : null}

          <Controller control={control} name="status" render={({ field: { value, onChange } }) => (
            <SelectField label="Status" value={value} onChange={onChange} options={cfg.status} />
          )} />
        </SectionCard>

        <Button title="Submit" icon={<Send size={18} color="#fff" />} onPress={handleSubmit(onSubmit)} loading={submitting} color={[accent, accentDark]} />
      </KeyboardAwareScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
});
