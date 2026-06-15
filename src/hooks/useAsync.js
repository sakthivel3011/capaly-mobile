import { useState, useEffect, useCallback, useRef } from 'react';
import { apiError } from '../api/client';
import { cacheStore } from '../api/storage';

// Data-fetch hook with loading/refresh/error and optional offline cache.
// `cacheKey` persists the last successful payload so screens render instantly on
// relaunch and survive brief network loss.
export function useAsync(fn, deps = [], { cacheKey, immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const run = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (!mounted.current) return;
      setData(result);
      if (cacheKey) cacheStore.setJSON(cacheKey, result);
    } catch (err) {
      if (!mounted.current) return;
      setError(apiError(err));
      if (cacheKey) {
        const cached = await cacheStore.getJSON(cacheKey);
        if (cached?.value) setData(cached.value);
      }
    } finally {
      if (mounted.current) { setLoading(false); setRefreshing(false); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, refreshing, error, refresh: () => run(true), reload: () => run(false), setData };
}
