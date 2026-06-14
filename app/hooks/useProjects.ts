'use client';
import { useState, useEffect, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { Proyecto } from '../types';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'video-manager-proyectos';

// supabase-js v2 queries son LAZY — no hacen HTTP hasta que se llama .then().
// supabaseReady controla si usar Supabase o localStorage.
const supabaseReady = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

function fromRow(row: Record<string, unknown>): Proyecto {
  return {
    id:           row.id as string,
    nombre:       row.nombre as string,
    cliente:      row.cliente as string,
    fechaEntrega: row.fecha_entrega as string,
    estado:       row.estado as Proyecto['estado'],
    precio:       Number(row.precio),
    material:     row.material as string,
    notas:        row.notas as string,
    ...(row.fecha_inicio ? { fechaInicio: row.fecha_inicio as string } : {}),
    ...(row.prioridad    ? { prioridad:   row.prioridad as Proyecto['prioridad'] } : {}),
  };
}

function toRow(p: Omit<Proyecto, 'id'>): Record<string, unknown> {
  return {
    nombre:        p.nombre,
    cliente:       p.cliente,
    fecha_entrega: p.fechaEntrega,
    estado:        p.estado,
    precio:        p.precio,
    material:      p.material,
    notas:         p.notas,
    fecha_inicio:  p.fechaInicio ?? null,
    prioridad:     p.prioridad ?? null,
  };
}

function partialToRow(cambios: Partial<Omit<Proyecto, 'id'>>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ('nombre'       in cambios) row.nombre        = cambios.nombre;
  if ('cliente'      in cambios) row.cliente       = cambios.cliente;
  if ('fechaEntrega' in cambios) row.fecha_entrega = cambios.fechaEntrega;
  if ('estado'       in cambios) row.estado        = cambios.estado;
  if ('precio'       in cambios) row.precio        = cambios.precio;
  if ('material'     in cambios) row.material      = cambios.material;
  if ('notas'        in cambios) row.notas         = cambios.notas;
  if ('fechaInicio'  in cambios) row.fecha_inicio  = cambios.fechaInicio ?? null;
  if ('prioridad'    in cambios) row.prioridad     = cambios.prioridad ?? null;
  return row;
}

// Dispara el request sin bloquear (supabase-js v2 es lazy, .then() fuerza la ejecución)
function fire(q: PromiseLike<unknown>) { q.then(); }

export function useProjects() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabaseReady) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setProyectos(JSON.parse(stored));
      } catch {}
      setLoaded(true);
      return;
    }

    async function load() {
      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) console.error('[useProjects] SELECT error:', error.message);

      if ((!error && data && data.length === 0) || error) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const local: Proyecto[] = JSON.parse(stored);
            if (local.length > 0) {
              if (!error) {
                const ts = Date.now();
                const { error: insertError } = await supabase.from('proyectos').insert(
                  local.map((p, i) => ({ id: p.id, ...toRow(p), sort_order: ts + i }))
                );
                if (insertError) {
                  console.error('[useProjects] INSERT error:', insertError.message);
                } else {
                  localStorage.removeItem(STORAGE_KEY);
                }
              }
              setProyectos(local);
              setLoaded(true);
              return;
            }
          } catch (e) {
            console.error('[useProjects] localStorage parse error:', e);
          }
        }
      }

      if (!error && data) setProyectos(data.map(fromRow));
      setLoaded(true);
    }

    load();
  }, []);

  useEffect(() => {
    if (loaded && !supabaseReady) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(proyectos));
    }
  }, [proyectos, loaded]);

  const agregarProyecto = useCallback((p: Omit<Proyecto, 'id'>): Proyecto => {
    const nuevo: Proyecto = {
      ...p,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    setProyectos(prev => [...prev, nuevo]);
    if (supabaseReady) {
      fire(supabase.from('proyectos').insert({ id: nuevo.id, ...toRow(p), sort_order: Date.now() }));
    }
    return nuevo;
  }, []);

  const editarProyecto = useCallback((id: string, cambios: Partial<Omit<Proyecto, 'id'>>) => {
    setProyectos(prev => prev.map(p => p.id === id ? { ...p, ...cambios } : p));
    if (supabaseReady) {
      fire(supabase.from('proyectos').update(partialToRow(cambios)).eq('id', id));
    }
  }, []);

  const eliminarProyecto = useCallback((id: string) => {
    setProyectos(prev => prev.filter(p => p.id !== id));
    if (supabaseReady) {
      fire(supabase.from('proyectos').delete().eq('id', id));
    }
  }, []);

  const importarProyectos = useCallback((nuevos: Omit<Proyecto, 'id'>[]) => {
    const ts = Date.now();
    const conIds: Proyecto[] = nuevos.map((p, i) => ({
      ...p,
      id: `${ts + i}-${Math.random().toString(36).slice(2, 8)}`,
    }));
    setProyectos(prev => [...prev, ...conIds]);
    if (supabaseReady) {
      fire(supabase.from('proyectos').insert(
        conIds.map((p, i) => ({ id: p.id, ...toRow(p), sort_order: ts + i }))
      ));
    }
  }, []);

  const editarProyectosMasa = useCallback((ids: string[], cambios: Partial<Omit<Proyecto, 'id'>>) => {
    const idSet = new Set(ids);
    setProyectos(prev => prev.map(p => idSet.has(p.id) ? { ...p, ...cambios } : p));
    if (supabaseReady) {
      fire(supabase.from('proyectos').update(partialToRow(cambios)).in('id', ids));
    }
  }, []);

  const eliminarProyectosMasa = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setProyectos(prev => prev.filter(p => !idSet.has(p.id)));
    if (supabaseReady) {
      fire(supabase.from('proyectos').delete().in('id', ids));
    }
  }, []);

  const reordenarProyectos = useCallback((activeId: string, overId: string) => {
    setProyectos(prev => {
      const oldIndex = prev.findIndex(p => p.id === activeId);
      const newIndex = prev.findIndex(p => p.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      if (supabaseReady) {
        next.forEach((p, i) => {
          fire(supabase.from('proyectos').update({ sort_order: i }).eq('id', p.id));
        });
      }
      return next;
    });
  }, []);

  return {
    proyectos, agregarProyecto, editarProyecto, eliminarProyecto,
    editarProyectosMasa, eliminarProyectosMasa,
    importarProyectos, reordenarProyectos, loaded,
  };
}
