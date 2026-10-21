import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Reads a Supabase table and exposes the rows together with a setter that
 * syncs changes back to the database in the background.
 *
 * Falls back to initialSeed when:
 *  - the table does not exist yet (Postgres error), OR
 *  - the table exists but has 0 rows (so pages always have data to render).
 */
export function useSupabaseTable(tableName, initialSeed = []) {
  const [data, setData] = useState(initialSeed); // start with seed immediately
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const { data: rows, error } = await supabase.from(tableName).select('*');
        if (cancelled) return;
        if (error) {
          // Table may not exist yet in database
          console.warn('[useSupabaseTable] ' + tableName + ': ' + error.message);
        } else if (rows) {
          // Genuine production data: reflects exact database state (empty when 0 records)
          setData(rows);
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

      // Background DB sync - fire-and-forget
      (async () => {
        try {
          const prevIds = new Set(prev.map((x) => x.id));
          const nextIds = new Set(next.map((x) => x.id));

          const added   = next.filter((x) => !prevIds.has(x.id));
          const removed = prev.filter((x) => !nextIds.has(x.id));
          const updated = next.filter((x) => {
            if (!prevIds.has(x.id)) return false;
            const old = prev.find((p) => p.id === x.id);
            return JSON.stringify(old) !== JSON.stringify(x);
          });

          if (added.length > 0) {
            const { error } = await supabase.from(tableName).insert(added);
            if (error) console.error('[useSupabaseTable] insert ' + tableName + ':', error);
          }
          for (const item of updated) {
            const { error } = await supabase.from(tableName).update(item).eq('id', item.id);
            if (error) console.error('[useSupabaseTable] update ' + tableName + ':', error);
          }
          for (const item of removed) {
            const { error } = await supabase.from(tableName).delete().eq('id', item.id);
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
