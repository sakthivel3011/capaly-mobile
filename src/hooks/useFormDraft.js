import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

// Local draft auto-save for mobile report forms (I: draft support).
//
// Drafts live in AsyncStorage (non-sensitive only) under a company/user/form key
// so a user only ever sees their own drafts. Never store tokens/passwords; file
// URIs may be kept so the user can re-attach, but binaries are not persisted.
const KEY = (companyId, userId, formType) => `capaly:draft:${companyId || 'na'}:${userId || 'na'}:${formType}`;

export function useFormDraft(formType, { watch, reset } = {}) {
  const user = useAuthStore((s) => s.user);
  const storageKey = KEY(user?.companyId || user?.company?.id, user?.id, formType);

  const [hasDraft, setHasDraft] = useState(false);
  const [saved, setSaved] = useState(false);

  // Detect an existing draft on mount.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey).then((raw) => { if (active) setHasDraft(!!raw); }).catch(() => {});
    return () => { active = false; };
  }, [storageKey]);

  // Auto-save while typing (debounced), skipping an empty form.
  useEffect(() => {
    if (!watch) return undefined;
    let timer;
    const sub = watch((values) => {
      const meaningful = Object.values(values || {}).some((v) => v !== '' && v != null && v !== false);
      if (!meaningful) return;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          await AsyncStorage.setItem(storageKey, JSON.stringify({ values, savedAt: Date.now() }));
          setHasDraft(true);
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        } catch { /* ignore */ }
      }, 700);
    });
    return () => { clearTimeout(timer); sub?.unsubscribe?.(); };
  }, [watch, storageKey]);

  const restore = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      const d = raw ? JSON.parse(raw) : null;
      if (d?.values && reset) reset(d.values);
      setHasDraft(false);
      return d;
    } catch { return null; }
  }, [storageKey, reset]);

  const saveNow = useCallback(async (values) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify({ values, savedAt: Date.now() }));
      setHasDraft(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch { /* ignore */ }
  }, [storageKey]);

  const clear = useCallback(async () => {
    try { await AsyncStorage.removeItem(storageKey); } catch { /* ignore */ }
    setHasDraft(false);
  }, [storageKey]);

  return { hasDraft, saved, restore, saveNow, clear };
}
