'use client';
import { X } from 'lucide-react';
import { EstadoProyecto, ESTADOS, ESTADO_CONFIG } from '../types';

const STATUS_COLOR: Record<string, string> = {
  pendiente: '#d97706', editando: '#2563eb', revision: '#9333ea',
  entregado: '#16a34a', pagado: '#9ca3af', en_espera: '#0891b2',
};

export type FechaFiltro = 'todos' | 'hoy' | 'semana' | 'mes';

export interface Filtros {
  estados: EstadoProyecto[];
  cliente: string;
  fecha: FechaFiltro;
}

export const FILTROS_EMPTY: Filtros = { estados: [], cliente: '', fecha: 'todos' };

const FECHAS: { value: FechaFiltro; label: string }[] = [
  { value: 'todos', label: 'Todas' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
];

interface Props {
  filtros: Filtros;
  clientes: string[];
  onChange: (f: Filtros) => void;
  compact?: boolean;
}

export function FilterBar({ filtros, clientes, onChange, compact = false }: Props) {
  const hasActive = filtros.estados.length > 0 || filtros.cliente !== '' || filtros.fecha !== 'todos';

  const toggleEstado = (e: EstadoProyecto) => {
    const next = filtros.estados.includes(e)
      ? filtros.estados.filter(s => s !== e)
      : [...filtros.estados, e];
    onChange({ ...filtros, estados: next });
  };

  const inner = (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
      style={compact ? {} : { borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 24 }}
    >
      {/* Estado */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Estado</span>
        {ESTADOS.map(e => {
          const active = filtros.estados.includes(e);
          return (
            <button
              key={e}
              onClick={() => toggleEstado(e)}
              className="px-2 py-0.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: active ? STATUS_COLOR[e] + '18' : 'transparent',
                borderStyle: 'solid', borderWidth: '1px',
                borderColor: active ? STATUS_COLOR[e] + '70' : 'var(--border)',
                color: active ? STATUS_COLOR[e] : 'var(--text-secondary)',
              }}
              onMouseEnter={ev => {
                if (!active) (ev.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={ev => {
                (ev.currentTarget as HTMLElement).style.background = active ? STATUS_COLOR[e] + '18' : 'transparent';
              }}
            >
              {ESTADO_CONFIG[e].label}
            </button>
          );
        })}
      </div>

      <div className="shrink-0" style={{ width: 1, height: 16, background: 'var(--border)' }} />

      {/* Cliente */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Cliente</span>
        <select
          value={filtros.cliente}
          onChange={e => onChange({ ...filtros, cliente: e.target.value })}
          style={{
            background: filtros.cliente ? 'var(--surface-hover)' : 'transparent',
            borderStyle: 'solid', borderWidth: '1px',
            borderColor: filtros.cliente ? 'var(--border-strong)' : 'var(--border)',
            borderRadius: 'var(--radius-xs)',
            padding: '3px 7px', fontSize: 12,
            color: filtros.cliente ? 'var(--text-primary)' : 'var(--text-muted)',
            fontFamily: 'var(--font)', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="">Todos</option>
          {clientes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="shrink-0" style={{ width: 1, height: 16, background: 'var(--border)' }} />

      {/* Fecha */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium mr-0.5" style={{ color: 'var(--text-muted)' }}>Fecha</span>
        {FECHAS.map(({ value, label }) => {
          const active = filtros.fecha === value;
          return (
            <button
              key={value}
              onClick={() => onChange({ ...filtros, fecha: value })}
              className="px-2 py-0.5 rounded text-xs transition-all"
              style={{
                background: active ? 'var(--surface-hover)' : 'transparent',
                borderStyle: 'solid', borderWidth: '1px',
                borderColor: active ? 'var(--border-strong)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active ? 500 : 400,
              }}
              onMouseEnter={ev => { if (!active) (ev.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
              onMouseLeave={ev => { if (!active) (ev.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Clear */}
      {hasActive && (
        <button
          onClick={() => onChange(FILTROS_EMPTY)}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs ml-auto transition-all"
          style={{
            color: 'var(--text-muted)',
            borderStyle: 'solid', borderWidth: '1px', borderColor: 'var(--border)',
            background: 'transparent',
          }}
          onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
          onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <X size={10} strokeWidth={2} /> Limpiar
        </button>
      )}
    </div>
  );

  return inner;
}
