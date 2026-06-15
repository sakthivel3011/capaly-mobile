import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Text from '../ui/Text';

const ToastContext = createContext(null);

const CONFIG = {
  success: { color: '#16A34A', Icon: CheckCircle2 },
  error: { color: '#DC2626', Icon: XCircle },
  warning: { color: '#F59E0B', Icon: AlertTriangle },
  info: { color: '#233DFF', Icon: Info },
};

export function ToastProvider({ children }) {
  const { colors, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, type, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), duration);
  }, []);

  const api = {
    show,
    success: (m, d) => show(m, 'success', d),
    error: (m, d) => show(m, 'error', d),
    warning: (m, d) => show(m, 'warning', d),
    info: (m, d) => show(m, 'info', d),
  };

  const cfg = toast ? CONFIG[toast.type] || CONFIG.info : null;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && cfg ? (
        <Animated.View
          key={toast.id}
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(180)}
          style={[
            styles.toast,
            { top: insets.top + 8, backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md },
            shadow(),
          ]}
        >
          <Pressable style={styles.row} onPress={() => setToast(null)}>
            <cfg.Icon size={22} color={cfg.color} />
            <Text variant="body" style={styles.message} numberOfLines={3}>
              {toast.message}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    zIndex: 1000,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  message: { flex: 1, marginLeft: 12 },
});
