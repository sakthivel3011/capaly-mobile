import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileText, MapPin, AlertOctagon, ShieldAlert, Paperclip, Send, Type, AlignLeft,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccents } from '../../theme/accent';
import { incidentApi } from '../../api/data.api';
import { apiError } from '../../api/client';
import { useToast } from '../../components/feedback/ToastProvider';
import AppHeader from '../../components/ui/AppHeader';
import KeyboardAwareScroll from '../../components/ui/KeyboardAwareScroll';
import SectionCard from '../../components/ui/SectionCard';
import { TextField, ControlledField } from '../../components/ui/Input';
import SelectField from '../../components/ui/SelectField';
import DateField from '../../components/ui/DateField';
import Button from '../../components/ui/Button';
import AttachmentPicker from '../../components/domain/AttachmentPicker';

const TYPES = ['Injury', 'Near Miss', 'Property Damage', 'Environmental', 'Fire / Explosion', 'Chemical Spill', 'Equipment Failure', 'Security', 'Other'];
const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

const schema = z.object({
  title: z.string().min(3, 'Add a short title'),
  type: z.string().min(1, 'Select an incident type'),
  severity: z.string().min(1, 'Select severity'),
  dateOccurred: z.string().min(1, 'Select the date'),
  location: z.string().optional(),
  description: z.string().min(10, 'Describe what happened (min 10 chars)'),
  immediateAction: z.string().optional(),
});

export default function ReportIncidentScreen({ navigation }) {
  const { colors } = useTheme();
  const { accent, accentDark } = useAccents();
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', type: '', severity: '', dateOccurred: new Date().toISOString(),
      location: '', description: '', immediateAction: '',
    },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(values).forEach(([k, v]) => v != null && form.append(k, v));
      files.forEach((f) => {
        form.append('attachments', { uri: f.uri, name: f.name, type: f.mimeType });
      });
      await incidentApi.empReport(form);
      toast.success('Incident reported successfully');
      navigation.goBack();
    } catch (err) {
      toast.error(apiError(err, 'Could not submit the report'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="Report Incident" subtitle="Capture what happened" onBack={() => navigation.goBack()} />
      <KeyboardAwareScroll contentContainerStyle={styles.scroll}>
        <SectionCard icon={FileText} title="Incident details">
          <ControlledField control={control} name="title" label="Title" placeholder="e.g. Slip near loading bay"
            leftIcon={<Type size={18} color={colors.textMuted} />} />
          <Controller control={control} name="type" render={({ field: { value, onChange }, fieldState: { error } }) => (
            <SelectField label="Incident type" value={value} onChange={onChange} options={TYPES} placeholder="Select type"
              leftIcon={<AlertOctagon size={18} color={colors.textMuted} />} error={error?.message} />
          )} />
          <Controller control={control} name="severity" render={({ field: { value, onChange }, fieldState: { error } }) => (
            <SelectField label="Severity" value={value} onChange={onChange} options={SEVERITIES} placeholder="Select severity"
              leftIcon={<ShieldAlert size={18} color={colors.textMuted} />} error={error?.message} />
          )} />
          <Controller control={control} name="dateOccurred" render={({ field: { value, onChange }, fieldState: { error } }) => (
            <DateField label="Date occurred" value={value} onChange={onChange} maximumDate={new Date()} error={error?.message} />
          )} />
          <ControlledField control={control} name="location" label="Location (optional)" placeholder="e.g. Warehouse B, Aisle 4"
            leftIcon={<MapPin size={18} color={colors.textMuted} />} />
        </SectionCard>

        <SectionCard icon={AlignLeft} title="Description">
          <ControlledField control={control} name="description" label="What happened?"
            placeholder="Describe the incident, sequence of events and people involved" multiline />
          <ControlledField control={control} name="immediateAction" label="Immediate action taken (optional)"
            placeholder="Any first response or containment action" multiline />
        </SectionCard>

        <SectionCard icon={Paperclip} title="Evidence" subtitle="Photos or documents — no video">
          <AttachmentPicker value={files} onChange={setFiles} />
        </SectionCard>

        <Button title="Submit report" icon={<Send size={18} color="#fff" />} onPress={handleSubmit(onSubmit)} loading={submitting} color={[accent, accentDark]} />
      </KeyboardAwareScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
});
