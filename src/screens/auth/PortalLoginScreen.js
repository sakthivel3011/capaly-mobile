import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Building2, ChevronLeft, Mail, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/feedback/ToastProvider';
import { apiError } from '../../api/client';
import { resolveImageUrl } from '../../utils/format';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { ControlledField } from '../../components/ui/Input';

const PORTAL_META = {
  department: { label: 'Department Portal', color: '#008062', colorDark: '#00674e', image: require('../../../assets/10.png') },
  employee: { label: 'Employee Portal', color: '#0d419d', colorDark: '#0a3179', image: require('../../../assets/11.png') },
};

const schema = z.object({
  identifier: z.string().min(1, 'Employee code or email is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(6, 'Min 6 characters'),
});

// Shared login for Department + Employee portals — company is pre-selected, the
// user enters employee code / email + password.
export default function PortalLoginScreen({ navigation, route }) {
  const { colors, radius, shadowSoft } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const portal = route.params?.portal || 'employee';
  const company = route.params?.company || {};
  const meta = PORTAL_META[portal] || PORTAL_META.employee;
  const C = meta.color;

  const departmentLogin = useAuthStore((s) => s.departmentLogin);
  const employeeLogin = useAuthStore((s) => s.employeeLogin);
  const employeeRegister = useAuthStore((s) => s.employeeRegister);
  const [submitting, setSubmitting] = useState(false);

  const isDept = portal === 'department';
  const logo = resolveImageUrl(company.logoUrl);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const canRegister = !isDept;

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { identifier: '', password: '' },
  });
  const { control: regControl, handleSubmit: handleRegSubmit } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '' },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = { companyCode: company.companyCode, identifier: values.identifier.trim(), password: values.password };
      if (isDept) await departmentLogin(payload, true);
      else await employeeLogin(payload, true);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.portal && data.portal !== portal) toast.warning(data.message || 'This account belongs to a different portal.');
      else toast.error(apiError(err, 'Invalid login details'));
    } finally {
      setSubmitting(false);
    }
  };

  const onRegister = async (values) => {
    setSubmitting(true);
    try {
      await employeeRegister({
        companyCode: company.companyCode,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      }, true);
      toast.success('Account created successfully.');
    } catch (err) {
      toast.error(apiError(err, 'Could not create account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Fixed back button over the hero */}
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={10}
        style={[styles.backBtn, { top: insets.top + 6 }]}
      >
        <ChevronLeft size={22} color="#fff" />
      </Pressable>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero image */}
          <View style={styles.hero}>
            <Image source={meta.image} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.55)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.heroText, { paddingTop: insets.top + 56 }]}>
              <Text style={styles.heroTitle}>{meta.label}</Text>
              <View style={styles.companyChip}>
                {logo ? (
                  <Image source={{ uri: logo }} style={styles.companyLogo} contentFit="contain" />
                ) : (
                  <View style={[styles.companyLogo, styles.logoFallback]}>
                    <Building2 size={14} color="#fff" />
                  </View>
                )}
                <Text style={styles.companyName} numberOfLines={1}>{company.name || 'Company'}</Text>
              </View>
            </View>
          </View>

          {/* Form sheet */}
          <View style={styles.sheet}>
            <Text style={[styles.welcome, { color: colors.text }]}>
              {mode === 'register' ? 'Create account' : 'Welcome back'}
            </Text>
            <Text style={[styles.welcomeSub, { color: colors.textMuted }]}>
              {mode === 'register' ? 'Register to access your portal' : 'Sign in to continue to your workspace'}
            </Text>

            {/* Sign in / Sign up toggle */}
            {canRegister && (
              <View style={[styles.tabs, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
                <Pressable
                  onPress={() => setMode('login')}
                  style={[styles.tab, { borderRadius: radius.sm }, mode === 'login' && [styles.tabActive, { backgroundColor: colors.card, ...shadowSoft() }]]}
                >
                  <Text style={{ color: mode === 'login' ? C : colors.textMuted, fontWeight: '700', fontSize: 13 }}>Sign in</Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode('register')}
                  style={[styles.tab, { borderRadius: radius.sm }, mode === 'register' && [styles.tabActive, { backgroundColor: colors.card, ...shadowSoft() }]]}
                >
                  <Text style={{ color: mode === 'register' ? C : colors.textMuted, fontWeight: '700', fontSize: 13 }}>Sign up</Text>
                </Pressable>
              </View>
            )}

            {mode === 'register' && canRegister ? (
              <View style={styles.form}>
                <View style={styles.row}>
                  <ControlledField control={regControl} name="firstName" label="First name" placeholder="John" style={styles.rowItem}
                    leftIcon={<User size={18} color={colors.textMuted} />} focusBorderColor={C} />
                  <ControlledField control={regControl} name="lastName" label="Last name" placeholder="Doe" style={styles.rowItem}
                    leftIcon={<User size={18} color={colors.textMuted} />} focusBorderColor={C} />
                </View>
                <ControlledField control={regControl} name="email" label="Email" placeholder="you@company.com" autoCapitalize="none"
                  keyboardType="email-address" leftIcon={<Mail size={18} color={colors.textMuted} />} focusBorderColor={C} />
                <ControlledField control={regControl} name="phone" label="Phone" placeholder="e.g. +1234567890" autoCapitalize="none"
                  keyboardType="phone-pad" leftIcon={<Phone size={18} color={colors.textMuted} />} focusBorderColor={C} />
                <ControlledField control={regControl} name="password" label="Password" placeholder="••••••••" secure autoCapitalize="none"
                  leftIcon={<Lock size={18} color={colors.textMuted} />} focusBorderColor={C} />
                <Button title="Create account" onPress={handleRegSubmit(onRegister)} loading={submitting} style={{ marginTop: 8 }} color={[C, meta.colorDark]} />
              </View>
            ) : (
              <View style={styles.form}>
                <ControlledField control={control} name="identifier"
                  label={isDept ? 'Login email' : 'Employee code or email'}
                  placeholder={isDept ? 'name@company.com' : 'EMP001 or email'} autoCapitalize="none"
                  leftIcon={<User size={18} color={colors.textMuted} />} focusBorderColor={C} />
                <ControlledField control={control} name="password" label="Password" placeholder="••••••••" secure autoCapitalize="none"
                  leftIcon={<Lock size={18} color={colors.textMuted} />} focusBorderColor={C} />

                <Button title="Sign in" onPress={handleSubmit(onSubmit)} loading={submitting} style={{ marginTop: 8 }} color={[C, meta.colorDark]} />

                <View style={styles.forgotRow}>
                  <Text variant="small" color="textMuted">Forgot password? </Text>
                  <Text variant="small" style={{ color: C, fontWeight: '700' }} onPress={() => navigation.navigate('ForgotPassword')}>Reset it</Text>
                </View>

                <View style={styles.spacer} />

                <View style={styles.legalWrap}>
                  <Text style={[styles.legalIntro, { color: colors.textFaint }]}>By signing in you agree to our</Text>
                  <View style={styles.legalLinks}>
                    <Text style={[styles.legalLink, { color: C }]}
                      onPress={() => Linking.openURL('https://capaly.in/terms').catch((e) => console.error(e))}>Terms & Conditions</Text>
                    <Text style={[styles.legalSep, { color: colors.textFaint }]}>•</Text>
                    <Text style={[styles.legalLink, { color: C }]}
                      onPress={() => Linking.openURL('https://capaly.in/privacy').catch((e) => console.error(e))}>Privacy Policy</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: 'absolute', left: 14, zIndex: 10,
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  appIcon: { position: 'absolute', right: 16, zIndex: 10, width: 34, height: 34, borderRadius: 9 },
  hero: { height: 240, justifyContent: 'flex-end' },
  heroText: { paddingHorizontal: 22, paddingBottom: 40 },
  heroTitle: { fontSize: 25, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  companyChip: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 12, gap: 8,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6,
  },
  companyLogo: { width: 22, height: 22, borderRadius: 6, backgroundColor: '#fff' },
  logoFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.25)' },
  companyName: { color: '#fff', fontWeight: '600', fontSize: 13, maxWidth: 200 },
  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -26,
    paddingHorizontal: 22,
    paddingTop: 26,
  },
  welcome: { fontSize: 24, fontWeight: '800' },
  welcomeSub: { fontSize: 13, marginTop: 4 },
  tabs: { flexDirection: 'row', padding: 4, marginTop: 20, gap: 4 },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', justifyContent: 'center' },
  tabActive: {},
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  form: { flex: 1, marginTop: 18 },
  forgotRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  spacer: { flex: 1, minHeight: 20 },
  legalWrap: { alignItems: 'center', paddingTop: 14 },
  legalIntro: { fontSize: 11.5, textAlign: 'center' },
  legalLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  legalLink: { fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  legalSep: { marginHorizontal: 8, fontSize: 11 },
});
