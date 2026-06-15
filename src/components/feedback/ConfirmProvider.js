import React, { createContext, useContext, useCallback, useState } from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Text from '../ui/Text';
import Button from '../ui/Button';

const ConfirmContext = createContext(null);

// Centered confirmation modal — replaces native confirm(). `confirm()` returns a
// promise that resolves true/false.
export function ConfirmProvider({ children }) {
  const { colors, radius, shadow } = useTheme();
  const [state, setState] = useState(null);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        setState({ ...opts, resolve });
      }),
    []
  );

  const close = (result) => {
    state?.resolve(result);
    setState(null);
  };

  const danger = state?.danger;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal visible={!!state} transparent animationType="none" onRequestClose={() => close(false)}>
        <Animated.View entering={FadeIn.duration(150)} style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => close(false)} />
          <Animated.View
            entering={FadeInUp.springify().damping(14).stiffness(150).mass(0.7)}
            style={[styles.card, { backgroundColor: colors.card, borderRadius: radius.xl }, shadow()]}
          >
            <View style={[styles.iconWrap, { backgroundColor: danger ? colors.dangerBg : colors.primaryBg }]}>
              <AlertTriangle size={26} color={danger ? colors.danger : colors.primary} />
            </View>
            <Text variant="h2" style={styles.title}>{state?.title || 'Are you sure?'}</Text>
            {state?.message ? (
              <Text variant="body" color="textMuted" style={styles.message}>{state.message}</Text>
            ) : null}
            <View style={styles.actions}>
              <Button
                title={state?.cancelText || 'Cancel'}
                variant="secondary"
                onPress={() => close(false)}
                style={styles.cancelBtn}
              />
              <Button
                title={state?.confirmText || 'Confirm'}
                variant={danger ? 'danger' : 'primary'}
                onPress={() => close(true)}
                style={styles.btn}
              />
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  card: { width: '100%', maxWidth: 380, padding: 24, alignItems: 'center' },
  iconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', marginTop: 24, gap: 12 },
  btn: { flex: 2 },
  cancelBtn: { flex: 0.8 },
});
