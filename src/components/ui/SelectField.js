import React, { useState } from 'react';
import { View, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAccent } from '../../theme/accent';
import Text from './Text';

// Bottom-sheet single-select. `options` is [{ label, value }] or strings.
export default function SelectField({ label, value, onChange, options = [], placeholder = 'Select', leftIcon, error }) {
  const { colors, radius } = useTheme();
  const ACCENT = useAccent();
  const [open, setOpen] = useState(false);

  const opts = options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o));
  const selected = opts.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      {label ? <Text variant="small" color="textMuted" style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, { backgroundColor: colors.inputBg, borderColor: error ? colors.danger : open ? ACCENT : colors.border, borderRadius: radius.md }]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <Text variant="body" color={selected ? 'text' : 'textFaint'} style={{ flex: 1 }} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={18} color={open ? ACCENT : colors.textMuted} style={open && { transform: [{ rotate: '180deg' }] }} />
      </Pressable>
      {error ? <Text variant="caption" color="danger" style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Animated.View entering={FadeIn.duration(180)} style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <Animated.View
            entering={FadeInDown.springify().damping(14).stiffness(140).mass(0.7)}
            style={[styles.sheet, { backgroundColor: colors.card }]}
          >
            <View style={styles.handleWrap}><View style={[styles.handle, { backgroundColor: colors.borderStrong }]} /></View>
            <View style={styles.sheetHeader}>
              <Text variant="h3" style={styles.sheetTitle}>{label || 'Select'}</Text>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={10}
                style={({ pressed }) => [styles.closeBtn, { backgroundColor: colors.surfaceAlt }, pressed && { opacity: 0.6 }]}
              >
                <X size={18} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {opts.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable
                    key={String(o.value)}
                    onPress={() => { onChange(o.value); setOpen(false); }}
                    style={[styles.option, { borderBottomColor: colors.border }]}
                  >
                    <Text variant="body" style={active ? { color: ACCENT, fontWeight: '600' } : null} color={active ? undefined : 'text'}>{o.label}</Text>
                    {active ? <Check size={18} color={ACCENT} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { marginBottom: 6, marginLeft: 2 },
  field: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, paddingHorizontal: 14, minHeight: 52 },
  leftIcon: { marginRight: 10 },
  error: { marginTop: 5, marginLeft: 2 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 8 },
  handleWrap: { alignItems: 'center', paddingVertical: 8 },
  handle: { width: 44, height: 5, borderRadius: 3 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { marginBottom: 8, marginTop: 4 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
});
