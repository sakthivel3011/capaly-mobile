import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useToast } from '../feedback/ToastProvider';
import { useConfirm } from '../feedback/ConfirmProvider';
import Text from './Text';

// Compact draft controls for mobile report forms (I). Shows a Continue/Discard
// banner when a saved draft exists, plus Save / Clear actions.
//
// `onClear` (optional) lets the host form reset its fields when the draft is
// discarded so the visible form is emptied along with the stored draft.
export default function DraftBanner({ draft, getValues, onClear, accent = '#233DFF' }) {
  const { colors, radius } = useTheme();
  const toast = useToast();
  const confirm = useConfirm();
  if (!draft) return null;

  // E §7: confirm before clearing, remove the AsyncStorage key, reset the form,
  // then toast "Draft cleared".
  const clearDraft = async () => {
    const ok = await confirm({
      title: 'Clear draft?',
      message: 'This will remove the saved draft and clear the form. This cannot be undone.',
      confirmText: 'Clear draft',
      danger: true,
    });
    if (!ok) return;
    await draft.clear();
    onClear?.();
    toast.success('Draft cleared');
  };

  const saveDraft = async () => {
    await draft.saveNow(getValues?.());
    toast.success('Draft saved');
  };

  return (
    <View style={{ marginBottom: 14 }}>
      {draft.hasDraft ? (
        <View style={[styles.banner, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderRadius: radius.md }]}>
          <Text variant="small" style={{ color: '#92400E', flex: 1 }}>
            You have an unsaved draft. Continue or discard?
          </Text>
          <Pressable onPress={() => draft.restore()} style={[styles.btn, { backgroundColor: '#F59E0B' }]}>
            <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>Continue</Text>
          </Pressable>
          <Pressable onPress={clearDraft} style={[styles.btn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FCD34D' }]}>
            <Text variant="caption" style={{ color: '#92400E', fontWeight: '700' }}>Discard</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.actions}>
        {draft.saved ? <Text variant="caption" style={{ color: '#16A34A', fontWeight: '700', marginRight: 'auto' }}>Draft saved</Text> : null}
        <Pressable onPress={saveDraft} style={[styles.smallBtn, { borderColor: colors.border }]}>
          <Text variant="caption" style={{ color: colors.textMuted, fontWeight: '700' }}>Save Draft</Text>
        </Pressable>
        <Pressable onPress={clearDraft} style={[styles.smallBtn, { borderColor: colors.border }]}>
          <Text variant="caption" style={{ color: colors.textMuted, fontWeight: '700' }}>Clear Draft</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderWidth: 1, marginBottom: 10 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9, borderWidth: 1 },
});
