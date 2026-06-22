import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronDown, Search, Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Text from './Text';
import { TextField } from './Input';

// Async searchable single-select. `search(query)` resolves an array; `mapItem`
// turns a result into { label, sublabel, value }.
//
// `loading` (optional) reflects an *external* fetch of the dataset (e.g. the
// related-incident list still loading on the parent). `searchKey` (optional)
// re-runs the search whenever it changes — pass the dataset's length/version so
// the open dropdown refreshes once the data arrives instead of staying stuck on
// a stale "No results" snapshot taken while the list was still empty (F).
export default function SearchSelectField({ label, placeholder = 'Select', value, display, onSelect, search, mapItem, leftIcon, error, loading: externalLoading = false, searchKey }) {
  const { colors, radius } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await search(query);
        setResults(Array.isArray(res) ? res : res?.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => debounce.current && clearTimeout(debounce.current);
  }, [query, open, searchKey]);

  const choose = (item) => {
    const mapped = mapItem(item);
    onSelect(mapped.value, mapped.label, item);
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text variant="small" color="textMuted" style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, { backgroundColor: colors.inputBg, borderColor: error ? colors.danger : colors.border, borderRadius: radius.md }]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <Text variant="body" color={display ? 'text' : 'textFaint'} style={{ flex: 1 }} numberOfLines={1}>{display || placeholder}</Text>
        <ChevronDown size={18} color={colors.textMuted} />
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
            <TextField
              placeholder="Search…"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              leftIcon={<Search size={18} color={colors.textMuted} />}
              style={{ marginBottom: 8 }}
            />
            <View style={{ height: 320 }}>
              {loading || externalLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
              ) : (
                <FlashList
                  data={results}
                  keyExtractor={(item, i) => item.id || String(i)}
                  estimatedItemSize={56}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={<Text variant="small" color="textMuted" style={styles.empty}>No results</Text>}
                  renderItem={({ item }) => {
                    const mapped = mapItem(item);
                    const active = mapped.value === value;
                    return (
                      <Pressable onPress={() => choose(item)} style={[styles.option, { borderBottomColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                          <Text variant="body" color={active ? 'primary' : 'text'} numberOfLines={1}>{mapped.label}</Text>
                          {mapped.sublabel ? <Text variant="caption" color="textMuted" numberOfLines={1}>{mapped.sublabel}</Text> : null}
                        </View>
                        {active ? <Check size={18} color={colors.primary} /> : null}
                      </Pressable>
                    );
                  }}
                />
              )}
            </View>
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
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 28, paddingTop: 8, maxHeight: '80%' },
  handleWrap: { alignItems: 'center', paddingVertical: 8 },
  handle: { width: 44, height: 5, borderRadius: 3 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  empty: { textAlign: 'center', marginTop: 24 },
});
