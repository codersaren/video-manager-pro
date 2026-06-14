'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Proyecto, ESTADO_CONFIG } from '../types';
import { getTodayISO } from '../utils/dates';

interface Props {
  proyectos: Proyecto[];
  onCardClick: (p: Proyecto) => void;
}

const STATUS_COLOR: Record<string, string> = {
  pendiente: '#eab308',
  editando: '#3b82f6',
  revision: '#a855f7',
  entregado: '#22c55e',
  pagado: '#6b7280',
};

export function TodaySection({ proyectos, onCardClick }: Props) {
  const [open, setOpen] = useState(true);
  const hoy = getTodayISO();
  const videosHoy = proyectos.filter(p => p.fechaEntrega === hoy);

  if (videosHoy.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 mb-3 group"
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {open
            ? <ChevronDown size={13} strokeWidth={2} />
            : <ChevronRight size={13} strokeWidth={2} />
          }
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Hoy
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          · {videosHoy.length} {videosHoy.length === 1 ? 'video' : 'videos'}
        </span>
      </button>

      {/* Collapsible content */}
      {open && (
        <div className="flex flex-wrap gap-2">
          {videosHoy.map(p => {
            const cfg = ESTADO_CONFIG[p.estado];
            const accent = STATUS_COLOR[p.estado] ?? '#ceccca';
            return (
              <button
                key={p.id}
                onClick={() => onCardClick(p)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm transition-all"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)',
                  borderStyle: 'solid',
                  borderTopWidth: '1px',
                  borderRightWidth: '1px',
                  borderBottomWidth: '1px',
                  borderLeftWidth: '3px',
                  borderTopColor: 'var(--border)',
                  borderRightColor: 'var(--border)',
                  borderBottomColor: 'var(--border)',
                  borderLeftColor: accent,
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
                }}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                <span className="font-medium">{p.nombre}</span>
                {p.cliente && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {p.cliente}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
