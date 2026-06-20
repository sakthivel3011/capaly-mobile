import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Pending debounce timer + a generation counter. clear() bumps the generation
  // and cancels the timer so an in-flight auto-save can never resurrect a draft
  // that was just cleared or submitted (E: old draft reappeared after submit).
  const timerRef = useRef(null);
  const genRef = useRef(0);

  // Detect an existing draft on mount.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey).then((raw) => { if (active) setHasDraft(!!raw); }).catch(() => {});
    return () => { active = false; };
  }, [storageKey]);

  // Auto-save while typing (debounced), skipping an empty form.
  useEffect(() => {
    if (!watch) return undefined;
    const sub = watch((values) => {
      const meaningful = Object.values(values || {}).some((v) => v !== '' && v != null && v !== false);
      if (!meaningful) return;
      clearTimeout(timerRef.current);
      const gen = genRef.current;
      timerRef.current = setTimeout(async () => {
        // Drop this save if the draft was cleared/submitted after it was scheduled.
        if (gen !== genRef.current) return;
        try {
          await AsyncStorage.setItem(storageKey, JSON.stringify({ values, savedAt: Date.now() }));
          if (gen !== genRef.current) return; // cleared while the write was in flight
          setHasDraft(true);
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        } catch { /* ignore */ }
      }, 700);
    });
    return () => { clearTimeout(timerRef.current); sub?.unsubscribe?.(); };
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
    // Invalidate any scheduled/in-flight auto-save, then remove the key entirely
    // so the draft is gone for good (E: Clear Draft / submit must fully remove it).
    genRef.current += 1;
    clearTimeout(timerRef.current);
    try { await AsyncStorage.removeItem(storageKey); } catch { /* ignore */ }
    setHasDraft(false);
    setSaved(false);
  }, [storageKey]);

  return { hasDraft, saved, restore, saveNow, clear };
}
