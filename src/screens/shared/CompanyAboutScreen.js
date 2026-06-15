import React from 'react';
import { View, Image, ScrollView, StyleSheet } from 'react-native';
import { Building2, Mail, Phone, MapPin, Briefcase, Globe, User, BadgeCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthStore } from '../../store/authStore';
import { useAccent } from '../../theme/accent';
import AppHeader from '../../components/ui/AppHeader';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import { resolveImageUrl } from '../../utils/format';

function InfoRow({ icon: Icon, label, value, colors, accent, last }) {
  if (!value) return null;
  return (
    <View style={[styles.infoRow, !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={styles.rowIcon}><Icon size={18} color={accent} /></View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text variant="caption" color="textMuted">{label}</Text>
        <Text variant="body" style={{ marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
}

export default function CompanyAboutScreen({ navigation }) {
  const { colors } = useTheme();
  const accent = useAccent();
  const company = useAuthStore((s) => s.user?.company) || {};

  const logo = resolveImageUrl(company.logoUrl);
  const address = [company.address, company.city, company.state, company.country].filter(Boolean).join(', ');
  const contact = [company.contactPersonName, company.contactEmail || company.contactPhone].filter(Boolean).join(' · ');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="About Company" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo + identity */}
        <Card style={styles.headerCard}>
          <View style={[styles.logoWrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logo} resizeMode="contain" />
            ) : (
              <Building2 size={44} color={accent} />
            )}
          </View>
          <Text variant="h2" style={{ marginTop: 16, textAlign: 'center' }}>{company.name || 'Company'}</Text>
          {company.companyCode ? (
            <View style={[styles.codeChip, { backgroundColor: `${accent}1A` }]}>
              <BadgeCheck size={13} color={accent} />
              <Text variant="caption" style={{ color: accent, fontWeight: '700' }}>{company.companyCode}</Text>
            </View>
          ) : null}
          {company.industry || company.type ? (
            <Text variant="caption" color="textMuted" style={{ marginTop: 8 }}>
              {[company.industry, company.type].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </Card>

        {/* Details */}
        <Text variant="small" color="textMuted" style={styles.sectionLabel}>COMPANY DETAILS</Text>
        <Card>
          <InfoRow icon={Briefcase} label="Industry" value={company.industry} colors={colors} accent={accent} />
          <InfoRow icon={Mail} label="Email" value={company.email} colors={colors} accent={accent} />
          <InfoRow icon={Phone} label="Phone" value={company.phone} colors={colors} accent={accent} />
          <InfoRow icon={Globe} label="Website" value={company.website} colors={colors} accent={accent} />
          <InfoRow icon={MapPin} label="Address" value={address} colors={colors} accent={accent} />
          <InfoRow icon={User} label="Contact" value={contact} colors={colors} accent={accent} last />
          {!company.industry && !company.email && !company.phone && !address && !contact ? (
            <Text variant="body" color="textMuted" style={{ paddingVertical: 8 }}>
              No additional company details available.
            </Text>
          ) : null}
        </Card>

        <Text variant="caption" color="textFaint" style={styles.version}>
          Powered by CAPALY · Safety • Compliance • CAPA • Inspections
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  headerCard: { alignItems: 'center', paddingVertical: 28 },
  logoWrap: {
    width: 110, height: 110, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  logo: { width: '78%', height: '78%' },
  codeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  sectionLabel: { marginTop: 20, marginBottom: 10, marginLeft: 4, letterSpacing: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowIcon: { width: 24, alignItems: 'center' },
  version: { textAlign: 'center', marginTop: 24 },
});
