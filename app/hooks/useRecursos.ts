'use client';
import { useState, useEffect, useCallback } from 'react';
import { Recurso } from '../types';
import { supabase } from '@/lib/supabase';

const KEY = 'vm_recursos_v1';

const supabaseReady = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('TU_PROJECT_ID') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('TU_ANON_KEY_AQUI')
);

function fromRow(row: Record<string, unknown>): Recurso {
  return {
    id:          row.id as string,
    nombre:      row.nombre as string,
    url:         row.url as string,
    cliente:     row.cliente as string,
    descripcion: row.descripcion as string,
  };
}

export function useRecursos() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabaseReady) {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) setRecursos(JSON.parse(raw));
      } catch {}
      setLoaded(true);
      return;
    }

    async function load() {
      const { data, error } = await supabase
        .from('recursos')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length === 0) {
        // Migrar desde localStorage si hay datos
        try {
          const raw = localStorage.getItem(KEY);
          if (raw) {
            const local: Recurso[] = JSON.parse(raw);
            if (local.length > 0) {
              await supabase.from('recursos').insert(local.map(r => ({ ...r })));
              setRecursos(local);
              localStorage.removeItem(KEY);
              setLoaded(true);
              return;
            }
          }
        } catch {}
      }

      if (!error && data) setRecursos(data.map(fromRow));
      setLoaded(true);
    }

    load();
  }, []);

  useEffect(() => {
    if (loaded && !supabaseReady) {
      localStorage.setItem(KEY, JSON.stringify(recursos));
    }
  }, [recursos, loaded]);

  const agregarRecurso = useCallback((r: Omit<Recurso, 'id'>) => {
    const id = crypto.randomUUID();
    setRecursos(prev => [...prev, { ...r, id }]);
    if (supabaseReady) {
      supabase.from('recursos').insert({ id, ...r });
    }
  }, []);

  const editarRecurso = useCallback((id: string, cambios: Partial<Omit<Recurso, 'id'>>) => {
    setRecursos(prev => prev.map(r => r.id === id ? { ...r, ...cambios } : r));
    if (supabaseReady) {
      supabase.from('recursos').update(cambios).eq('id', id);
    }
  }, []);

  const eliminarRecurso = useCallback((id: string) => {
    setRecursos(prev => prev.filter(r => r.id !== id));
    if (supabaseReady) {
      supabase.from('recursos').delete().eq('id', id);
    }
  }, []);

  return { recursos, loaded, agregarRecurso, editarRecurso, eliminarRecurso };
}
