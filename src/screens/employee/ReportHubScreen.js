import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { AlertTriangle, Search, ClipboardCheck, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import AppHeader from '../../components/ui/AppHeader';
import Text from '../../components/ui/Text';
import Card from '../../components/ui/Card';

const ITEMS = [
  { key: 'incident', title: 'Report Incident', subtitle: 'Hazards, near-misses, injuries', icon: AlertTriangle, tone: 'danger', route: 'ReportIncident' },
  { key: 'investigation', title: 'Report Investigation', subtitle: 'Root cause & findings', icon: Search, tone: 'accent', route: 'ReportModule', params: { module: 'investigation' } },
  { key: 'capa', title: 'Report CAPA', subtitle: 'Corrective / preventive action', icon: ClipboardCheck, tone: 'primary', route: 'ReportModule', params: { module: 'capa' } },
  { key: 'inspection', title: 'Report Inspection', subtitle: 'Safety inspection checklist', icon: ShieldCheck, tone: 'success', route: 'ReportModule', params: { module: 'inspection' } },
];

export default function ReportHubScreen({ navigation }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="Report" subtitle="Submit a new safety record" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const tone = colors[item.tone] || colors.primary;
          return (
            <Card key={item.key} onPress={() => navigation.navigate(item.route, item.params)} style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: `${tone}1A` }]}>
                  <Icon size={24} color={tone} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text variant="h3">{item.title}</Text>
                  <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={20} color={colors.textFaint} />
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingTop: 12 },
  card: { marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
