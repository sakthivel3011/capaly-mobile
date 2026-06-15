import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertTriangle, Search, ClipboardCheck, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Text from '../ui/Text';

// The CAPALY incident lifecycle: Incident -> Investigation -> CAPA -> Inspection
// -> Final Completion. `stages` is an array of { key, label, done, active, date }.
const ICONS = {
  incident: AlertTriangle,
  investigation: Search,
  capa: ClipboardCheck,
  inspection: ShieldCheck,
  final: CheckCircle2,
};

export default function WorkflowTimeline({ stages = [] }) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {stages.map((stage, i) => {
        const Icon = ICONS[stage.key] || AlertTriangle;
        const isLast = i === stages.length - 1;
        const tone = stage.done ? colors.success : stage.active ? colors.primary : colors.textFaint;
        const bg = stage.done ? colors.successBg : stage.active ? colors.primaryBg : colors.surfaceAlt;
        return (
          <View key={stage.key} style={styles.row}>
            <View style={styles.railCol}>
              <View style={[styles.node, { backgroundColor: bg, borderColor: tone }]}>
                <Icon size={18} color={tone} />
              </View>
              {!isLast ? (
                <View style={[styles.rail, { backgroundColor: stage.done ? colors.success : colors.border }]} />
              ) : null}
            </View>
            <View style={styles.body}>
              <Text variant="title" color={stage.active || stage.done ? 'text' : 'textMuted'}>
                {stage.label}
              </Text>
              <Text variant="caption" color="textMuted" style={styles.sub}>
                {stage.done ? `Completed${stage.date ? ` · ${stage.date}` : ''}` : stage.active ? 'In progress' : 'Pending'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 4 },
  row: { flexDirection: 'row' },
  railCol: { alignItems: 'center', width: 44 },
  node: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rail: { width: 2, flex: 1, minHeight: 24, marginVertical: 2 },
  body: { flex: 1, paddingBottom: 22, paddingLeft: 8, paddingTop: 6 },
  sub: { marginTop: 3 },
});
