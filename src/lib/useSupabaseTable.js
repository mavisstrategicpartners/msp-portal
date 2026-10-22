import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Reads a Supabase table and exposes the rows together with a setter that
 * syncs changes back to the database in the background, with local storage fallback
 * so that state is never wiped out when navigating away, refreshing, or logging back in.
 */
export function useSupabaseTable(tableName, initialSeed = []) {
  const storageKey = `msp_table_${tableName}`;

  // 1. Initial State: Load from localStorage if available, otherwise use initialSeed
  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn(`[useSupabaseTable] Failed to read localStorage for ${tableName}:`, err);
      }
    }
    return initialSeed;
  });

  const [loading, setLoading] = useState(true);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const { data: rows, error } = await supabase.from(tableName).select('*');
        if (cancelled) return;
        if (error) {
          // Table may not exist yet in database — retain current cached/seed state
          console.warn('[useSupabaseTable] ' + tableName + ': ' + error.message);
        } else if (rows && rows.length > 0) {
          // Genuine remote database records
          setData(rows);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(storageKey, JSON.stringify(rows));
            } catch (e) {}
          }
        } else if (rows && rows.length === 0) {
          // Remote table exists but is currently empty
          // If we have local records, try to populate the remote table
          const currentLocal = dataRef.current;
          if (currentLocal && currentLocal.length > 0) {
            supabase.from(tableName).insert(currentLocal).then(({ error: insertErr }) => {
              if (insertErr) console.warn('[useSupabaseTable] initial push to ' + tableName + ':', insertErr);
            });
          }
        }
      } catch (err) {
        if (!cancelled) console.warn('[useSupabaseTable] ' + tableName + ':', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [tableName]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateData = (updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      // 1. Immediately persist to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (err) {
          console.warn(`[useSupabaseTable] Failed to save localStorage for ${tableName}:`, err);
        }
      }

      // 2. Background DB sync - fire-and-forget
      (async () => {
        try {
          const getItemId = (x) => x?.id ?? x?._id ?? x?.dept ?? JSON.stringify(x);
          const prevIds = new Set(prev.map(getItemId));
          const nextIds = new Set(next.map(getItemId));

          const added   = next.filter((x) => !prevIds.has(getItemId(x)));
          const removed = prev.filter((x) => !nextIds.has(getItemId(x)));
          const updated = next.filter((x) => {
            const id = getItemId(x);
            if (!prevIds.has(id)) return false;
            const old = prev.find((p) => getItemId(p) === id);
            return JSON.stringify(old) !== JSON.stringify(x);
          });

          if (added.length > 0) {
            const { error } = await supabase.from(tableName).insert(added);
            if (error) console.error('[useSupabaseTable] insert ' + tableName + ':', error);
          }
          for (const item of updated) {
            const id = getItemId(item);
            const { error } = await supabase.from(tableName).update(item).eq('id', id);
            if (error) console.error('[useSupabaseTable] update ' + tableName + ':', error);
          }
          for (const item of removed) {
            const id = getItemId(item);
            const { error } = await supabase.from(tableName).delete().eq('id', id);
            if (error) console.error('[useSupabaseTable] delete ' + tableName + ':', error);
          }
        } catch (err) {
          console.error('[useSupabaseTable] sync ' + tableName + ':', err);
        }
      })();

      return next;
    });
  };

  return [data, updateData, loading];
}
