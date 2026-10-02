import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSupabaseTable(tableName, initialSeed = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: rows, error } = await supabase.from(tableName).select('*');
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        // If the table doesn't exist yet, we can fallback to the seed data temporarily
        setData(initialSeed);
      } else {
        // If the table is empty, we can seed it (or just rely on the user running a seed script)
        setData(rows || []);
      }
      setLoading(false);
    }
    fetchData();
  }, [tableName]);

  const updateData = async (updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      
      // Perform database sync in the background
      (async () => {
        try {
          const prevIds = new Set(prev.map(x => x.id));
          const nextIds = new Set(next.map(x => x.id));
          
          const added = next.filter(x => !prevIds.has(x.id));
          const removed = prev.filter(x => !nextIds.has(x.id));
          const updated = next.filter(x => {
             if (!prevIds.has(x.id)) return false;
             const old = prev.find(p => p.id === x.id);
             return JSON.stringify(old) !== JSON.stringify(x);
          });
          
          if (added.length > 0) {
            const { error } = await supabase.from(tableName).insert(added);
            if (error) console.error(`Error inserting into ${tableName}:`, error);
          }
          
          for (const item of updated) {
             const { error } = await supabase.from(tableName).update(item).eq('id', item.id);
             if (error) console.error(`Error updating ${tableName}:`, error);
          }
          
          for (const item of removed) {
             const { error } = await supabase.from(tableName).delete().eq('id', item.id);
             if (error) console.error(`Error deleting from ${tableName}:`, error);
          }
        } catch (err) {
          console.error(`Failed to sync ${tableName}:`, err);
        }
      })();

      return next;
    });
  };

  return [data, updateData, loading];
}
