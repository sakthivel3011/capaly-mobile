import React, { useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import {
  AlertTriangle, Search, ClipboardCheck, ShieldCheck, CheckCircle2, FileText, FileSpreadsheet, Download,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccents } from '../../theme/accent';
import { reportApi } from '../../api/data.api';
import { apiError } from '../../api/client';
import { downloadAndShare } from '../../utils/download';
import { useToast } from '../../components/feedback/ToastProvider';
import AppHeader from '../../components/ui/AppHeader';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { asArray } from '../../utils/format';

const REPORTS = [
  { type: 'incidents', title: 'Incident Reports', icon: AlertTriangle, tone: 'danger' },
  { type: 'investigation', title: 'Investigation Reports', icon: Search, tone: 'accent' },
  { type: 'capa', title: 'CAPA Reports', icon: ClipboardCheck, tone: 'primary' },
  { type: 'inspections', title: 'Inspection Reports', icon: ShieldCheck, tone: 'success' },
  { type: 'final-completion', title: 'Final Completion', icon: CheckCircle2, tone: 'info' },
];

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { accent, accentDark } = useAccents();
  const toast = useToast();
  const [active, setActive] = useState(REPORTS[0]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const loadPreview = async (report) => {
    setActive(report);
    setLoading(true);
    setPreview(null);
    try {
      const res = await reportApi.preview(report.type);
      setPreview(asArray(res));
    } catch (err) {
      toast.error(apiError(err, 'Could not load report'));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadPreview(REPORTS[0]); }, []);

  const download = async (fmt) => {
    setDownloading(fmt);
    try {
      const ext = fmt === 'pdf' ? 'pdf' : 'xlsx';
      await downloadAndShare(`/reports/${active.type}/${fmt}`, `${active.type}-report.${ext}`);
    } catch (err) {
      toast.error(apiError(err, 'Download failed'));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader title="Reports" subtitle="Generate & share reports" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="small" color="textMuted" style={styles.label}>REPORT TYPE</Text>
        <View style={styles.typeGrid}>
          {REPORTS.map((r) => {
            const Icon = r.icon;
            const tone = colors[r.tone] || colors.primary;
            const isActive = r.type === active.type;
            return (
              <Pressable
                key={r.type}
                onPress={() => loadPreview(r)}
                style={[
                  styles.typeCard,
                  { backgroundColor: isActive ? tone : colors.card, borderColor: isActive ? tone : colors.border },
                ]}
              >
                <Icon size={20} color={isActive ? '#fff' : tone} />
                <Text variant="small" color={isActive ? '#FFFFFF' : 'text'} style={{ marginTop: 8 }} numberOfLines={2}>{r.title}</Text>
              </Pressable>
            );
          })}
        </View>

        <Card style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text variant="title">{active.title}</Text>
            <Text variant="caption" color="textMuted">{preview ? `${preview.length} records` : ''}</Text>
          </View>

          {loading ? (
            <>
              <Skeleton width="100%" height={14} style={{ marginTop: 14 }} />
              <Skeleton width="80%" height={14} style={{ marginTop: 10 }} />
              <Skeleton width="90%" height={14} style={{ marginTop: 10 }} />
            </>
          ) : preview?.length ? (
            <View style={styles.table}>
              {preview.slice(0, 8).map((row, i) => (
                <View key={row.id || i} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                  <Text variant="small" numberOfLines={1} style={{ flex: 1 }}>
                    {row.incidentNo || row.capaNo || row.inspectionNo || row.title || `Record ${i + 1}`}
                  </Text>
                  <Text variant="caption" color="textMuted" numberOfLines={1} style={{ maxWidth: 110, textAlign: 'right' }}>
                    {row.status || row.severity || row.type || ''}
                  </Text>
                </View>
              ))}
              {preview.length > 8 ? (
                <Text variant="caption" color="textFaint" style={{ marginTop: 10, textAlign: 'center' }}>
                  +{preview.length - 8} more in the exported file
                </Text>
              ) : null}
            </View>
          ) : (
            <Text variant="body" color="textMuted" style={{ marginTop: 14 }}>No records found for this report.</Text>
          )}
        </Card>

        <View style={styles.downloadRow}>
          <Button title="PDF" icon={<FileText size={18} color="#fff" />} onPress={() => download('pdf')} loading={downloading === 'pdf'} style={styles.dlBtn} color={[accent, accentDark]} />
          <Button title="Excel" variant="secondary" icon={<FileSpreadsheet size={18} color={colors.text} />} onPress={() => download('excel')} loading={downloading === 'excel'} style={styles.dlBtn} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  label: { marginBottom: 10, marginLeft: 4, letterSpacing: 1 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { width: '31%', minHeight: 92, borderRadius: 16, borderWidth: 1.5, padding: 12, justifyContent: 'space-between' },
  previewCard: { marginTop: 20 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  table: { marginTop: 8 },
  tableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth },
  downloadRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  dlBtn: { flex: 1 },
});
