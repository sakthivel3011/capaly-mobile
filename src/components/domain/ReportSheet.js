import React, { useEffect } from 'react';
import { View, Modal, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, Search, ClipboardCheck, ShieldCheck, X, ChevronRight } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import Text from '../ui/Text';

// Items mirror ReportHubScreen so the sheet and full page stay in sync.
const ITEMS = [
  { key: 'incident', title: 'Report Incident', subtitle: 'Hazards, near-misses, injuries', icon: AlertTriangle, tone: 'danger', route: 'ReportIncident' },
  { key: 'investigation', title: 'Report Investigation', subtitle: 'Root cause & findings', icon: Search, tone: 'accent', route: 'ReportModule', params: { module: 'investigation' } },
  { key: 'capa', title: 'Report CAPA', subtitle: 'Corrective / preventive action', icon: ClipboardCheck, tone: 'primary', route: 'ReportModule', params: { module: 'capa' } },
  { key: 'inspection', title: 'Report Inspection', subtitle: 'Safety inspection checklist', icon: ShieldCheck, tone: 'success', route: 'ReportModule', params: { module: 'inspection' } },
];

// Premium animated bottom sheet for the center Report tab.
export default function ReportSheet({ visible, onClose, onSelect }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [mounted, setMounted] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withSpring(1, { damping: 18, stiffness: 180, mass: 0.7 });
    } else if (mounted) {
      progress.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.ease) }, (f) => {
        if (f) runOnJS(setMounted)(false);
      });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 420 }],
    opacity: progress.value < 0.05 ? 0 : 1,
  }));

  const handleSelect = (item) => {
    onClose?.();
    // let the close animation start, then navigate
    setTimeout(() => onSelect?.(item), 180);
  };

  if (!mounted) return null;

  return (
    <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <View style={styles.fill}>
        <AnimatedPressable style={[styles.backdrop, { backgroundColor: colors.overlay }, backdropStyle]} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom: insets.bottom + 16 },
            sheetStyle,
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.borderStrong }]} />
          <View style={styles.headingRow}>
            <View style={{ flex: 1 }}>
              <Text variant="h2" style={styles.heading}>New Report</Text>
              <Text variant="caption" color="textMuted" style={styles.sub}>Choose what you want to submit</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [styles.closeBtn, { backgroundColor: colors.surfaceAlt }, pressed && { opacity: 0.6 }]}
            >
              <X size={20} color={colors.text} />
            </Pressable>
          </View>

          {ITEMS.map((item) => {
            const Icon = item.icon;
            const tone = colors[item.tone] || colors.primary;
            return (
              <Pressable
                key={item.key}
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: pressed ? colors.surfaceAlt : 'transparent', borderColor: colors.border },
                ]}
              >
                <View style={styles.iconWrap}>
                  <Icon size={24} color={tone} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="title">{item.title}</Text>
                  <Text variant="caption" color="textMuted" style={{ marginTop: 2 }}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={18} color={colors.textFaint} />
              </Pressable>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 14 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  heading: { marginLeft: 4 },
  sub: { marginLeft: 4, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginBottom: 6,
  },
  iconWrap: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
});
