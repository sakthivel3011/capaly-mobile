import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Lock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { authApi } from '../../api/auth.api';
import { useToast } from '../../components/feedback/ToastProvider';
import { apiError } from '../../api/client';
import AppHeader from '../../components/ui/AppHeader';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { ControlledField } from '../../components/ui/Input';

const schema = z
  .object({
    token: z.string().min(1, 'Reset code is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export default function ResetPasswordScreen({ navigation, route }) {
  const { colors } = useTheme();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { token: route.params?.token || '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await authApi.resetPassword(values);
      toast.success('Password reset. Please sign in.');
      navigation.popToTop();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader
        title="Set new password"
        onBack={() => navigation.goBack()}
        right={
          <Image
            source={require('../../../assets/icon.png')}
            style={{ width: 26, height: 26, marginRight: 4 }}
            contentFit="contain"
          />
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text variant="body" color="textMuted" style={styles.subtitle}>
          Paste the reset code from your email and choose a new password.
        </Text>
        <ControlledField
          control={control}
          name="token"
          label="Reset code"
          placeholder="Paste reset code"
          autoCapitalize="none"
          leftIcon={<KeyRound size={18} color={colors.textMuted} />}
          style={{ marginTop: 20 }}
          focusBorderColor="#0d419d"
        />
        <ControlledField
          control={control}
          name="newPassword"
          label="New password"
          placeholder="At least 8 characters"
          secure
          autoCapitalize="none"
          leftIcon={<Lock size={18} color={colors.textMuted} />}
          focusBorderColor="#0d419d"
        />
        <ControlledField
          control={control}
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter password"
          secure
          autoCapitalize="none"
          leftIcon={<Lock size={18} color={colors.textMuted} />}
          focusBorderColor="#0d419d"
        />
        <Button title="Reset password" onPress={handleSubmit(onSubmit)} loading={submitting} style={{ marginTop: 8 }} color="#0d419d" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  subtitle: { marginTop: 4 },
});
