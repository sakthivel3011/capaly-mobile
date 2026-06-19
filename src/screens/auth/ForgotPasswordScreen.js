import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, MailCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { authApi } from '../../api/auth.api';
import { useToast } from '../../components/feedback/ToastProvider';
import { apiError } from '../../api/client';
import AppHeader from '../../components/ui/AppHeader';
import KeyboardAwareScroll from '../../components/ui/KeyboardAwareScroll';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { ControlledField } from '../../components/ui/Input';

const schema = z.object({ email: z.string().min(1, 'Email is required').email('Enter a valid email') });

export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async ({ email }) => {
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader
        title="Forgot password"
        onBack={() => navigation.goBack()}
        right={
          <Image
            source={require('../../../assets/icon.png')}
            style={{ width: 26, height: 26, marginRight: 4 }}
            contentFit="contain"
          />
        }
      />
      <KeyboardAwareScroll contentContainerStyle={styles.scroll}>
        {sent ? (
          <View style={styles.sent}>
            <View style={[styles.iconWrap, { backgroundColor: colors.successBg }]}>
              <MailCheck size={30} color={colors.success} />
            </View>
            <Text variant="h2" style={styles.title}>Check your email</Text>
            <Text variant="body" color="textMuted" style={styles.subtitle}>
              If the email is registered, we've sent a password reset link. The link expires in 30 minutes.
            </Text>
            <Button title="Enter reset code" variant="outline" onPress={() => navigation.navigate('ResetPassword')} style={{ marginTop: 24 }} />
            <Button title="Back to sign in" variant="ghost" onPress={() => navigation.popToTop()} style={{ marginTop: 8 }} />
          </View>
        ) : (
          <>
            <Text variant="h1" style={styles.title}>Reset your password</Text>
            <Text variant="body" color="textMuted" style={styles.subtitle}>
              Enter your account email and we'll send you a secure reset link.
            </Text>
            <View style={styles.form}>
              <ControlledField
                control={control}
                name="email"
                label="Email address"
                placeholder="you@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={colors.textMuted} />}
                focusBorderColor="#0d419d"
              />
              <Button title="Send reset link" onPress={handleSubmit(onSubmit)} loading={submitting} style={{ marginTop: 8 }} color="#0d419d" />
            </View>
          </>
        )}
      </KeyboardAwareScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  title: { textAlign: 'left' },
  subtitle: { marginTop: 8 },
  form: { marginTop: 28 },
  sent: { alignItems: 'center', paddingTop: 40 },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
});
