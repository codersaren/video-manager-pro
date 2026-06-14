'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Proyecto } from '../types';
import { getTodayISO, getWeekStart, getWeekDays, toISODate } from '../utils/dates';

interface Props {
  proyectos: Proyecto[];
}

export function Dashboard({ proyectos }: Props) {
  const [open, setOpen] = useState(true);

  const hoy = getTodayISO();
  const weekDays = getWeekDays(getWeekStart(new Date())).map(d => toISODate(d));

  const videosHoy   = proyectos.filter(p => p.fechaEntrega === hoy).length;
  const videosSemana = proyectos.filter(p => weekDays.includes(p.fechaEntrega)).length;
  const enProgreso  = proyectos.filter(p => ['pendiente', 'editando', 'revision'].includes(p.estado)).length;
  const porCobrar   = proyectos
    .filter(p => p.estado !== 'pagado')
    .reduce((s, p) => s + (p.precio || 0), 0);

  const stats = [
    { label: 'Hoy',         value: videosHoy },
    { label: 'Esta semana', value: videosSemana },
    { label: 'En progreso', value: enProgreso },
    { label: 'Por cobrar',  value: `${porCobrar.toLocaleString('es-ES')}€` },
  ];

  return (
    <div className="mb-6">
      {open ? (
        /* ── Expanded ── */
        <div
          style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}
        >
          <div className="grid grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="px-5 py-4"
                style={{
                  background: 'var(--surface)',
                  borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                  position: 'relative',
                }}
              >
                <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </p>
                <p className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {s.value}
                </p>

                {/* Toggle button only on last cell */}
                {i === stats.length - 1 && (
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute top-3 right-3 flex items-center gap-1 text-xs rounded px-1.5 py-0.5 transition-colors"
                    style={{ color: 'var(--text-muted)', background: 'transparent' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    title="Ocultar resumen"
                  >
                    <ChevronDown size={12} strokeWidth={2} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Collapsed ── */
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-xs rounded-md px-3 py-1.5 transition-colors"
          style={{
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
        >
          <ChevronRight size={12} strokeWidth={2} />
          Resumen
          <span style={{ color: 'var(--border-strong)', margin: '0 2px' }}>·</span>
          <span style={{ color: 'var(--text-secondary)' }}>{videosHoy} hoy</span>
          <span style={{ color: 'var(--border-strong)', margin: '0 2px' }}>·</span>
          <span style={{ color: 'var(--text-secondary)' }}>{enProgreso} en progreso</span>
          <span style={{ color: 'var(--border-strong)', margin: '0 2px' }}>·</span>
          <span style={{ color: 'var(--text-secondary)' }}>{porCobrar.toLocaleString('es-ES')}€ por cobrar</span>
        </button>
      )}
    </div>
  );
}
