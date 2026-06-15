import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccents } from '../../theme/accent';
import { authApi } from '../../api/auth.api';
import { apiError } from '../../api/client';
import { useToast } from '../../components/feedback/ToastProvider';
import AppHeader from '../../components/ui/AppHeader';
import SectionCard from '../../components/ui/SectionCard';
import { ControlledField } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmNewPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, { path: ['confirmNewPassword'], message: 'Passwords do not match' });

export default function ChangePasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const { accent, accentDark } = useAccents();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await authApi.changePassword(values);
      toast.success('Password changed successfully');
      reset();
      navigation.goBack();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="Change Password" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SectionCard icon={ShieldCheck} title="Update your password" subtitle="Use at least 8 characters">
          <ControlledField control={control} name="currentPassword" label="Current password" placeholder="••••••••" secure autoCapitalize="none"
            leftIcon={<Lock size={18} color={colors.textMuted} />} />
          <ControlledField control={control} name="newPassword" label="New password" placeholder="At least 8 characters" secure autoCapitalize="none"
            leftIcon={<Lock size={18} color={colors.textMuted} />} />
          <ControlledField control={control} name="confirmNewPassword" label="Confirm new password" placeholder="Re-enter password" secure autoCapitalize="none"
            leftIcon={<Lock size={18} color={colors.textMuted} />} />
          <Button title="Update password" onPress={handleSubmit(onSubmit)} loading={submitting} style={{ marginTop: 4 }} color={[accent, accentDark]} />
        </SectionCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
});
