'use client';
import { X, Search, Eye, EyeOff } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { EstadoProyecto, ESTADOS, ESTADO_CONFIG } from '../types';

const STATUS_COLOR: Record<string, string> = {
  pendiente: '#d97706', editando: '#2563eb', revision: '#9333ea',
  entregado: '#16a34a', pagado: '#9ca3af', en_espera: '#0891b2', cancelado: '#dc2626',
};

export type FechaFiltro = 'todos' | 'hoy' | 'semana' | 'mes';

export interface Filtros {
  estados: EstadoProyecto[];
  cliente: string;
  fecha: FechaFiltro;
  busqueda: string;
  clientesOcultos: string[];
}

export const FILTROS_EMPTY: Filtros = { estados: [...ESTADOS], cliente: '', fecha: 'todos', busqueda: '', clientesOcultos: [] };

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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const hasActive = filtros.estados.length < ESTADOS.length || filtros.cliente !== '' || filtros.fecha !== 'todos' || filtros.busqueda !== '' || filtros.clientesOcultos.length > 0;
  const hayOcultos = filtros.clientesOcultos.length > 0;

  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [popoverOpen]);

  const toggleEstado = (e: EstadoProyecto) => {
    const isActive = filtros.estados.includes(e);
    if (isActive && filtros.estados.length <= 1) return; // keep at least one selected
    const next = isActive
      ? filtros.estados.filter(s => s !== e)
      : [...filtros.estados, e];
    onChange({ ...filtros, estados: next });
  };

  const toggleOculto = (cliente: string) => {
    const next = filtros.clientesOcultos.includes(cliente)
      ? filtros.clientesOcultos.filter(c => c !== cliente)
      : [...filtros.clientesOcultos, cliente];
    onChange({ ...filtros, clientesOcultos: next });
  };

  const inner = (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
      style={compact ? {} : { borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 24 }}
    >
      {/* Buscador */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={12} style={{ position: 'absolute', left: 7, color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Buscar proyecto..."
          value={filtros.busqueda}
          onChange={e => onChange({ ...filtros, busqueda: e.target.value })}
          style={{
            paddingLeft: 24, paddingRight: 8, paddingTop: 3, paddingBottom: 3,
            fontSize: 12, borderRadius: 'var(--radius-xs)',
            border: '1px solid', borderColor: filtros.busqueda ? 'var(--border-strong)' : 'var(--border)',
            background: filtros.busqueda ? 'var(--surface-hover)' : 'transparent',
            color: 'var(--text-primary)', outline: 'none', width: 160,
            fontFamily: 'var(--font)',
          }}
        />
      </div>

      <div className="shrink-0" style={{ width: 1, height: 16, background: 'var(--border)' }} />

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
              onMouseEnter={ev => { if (!active) (ev.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
              onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = active ? STATUS_COLOR[e] + '18' : 'transparent'; }}
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

        {/* Botón visibilidad */}
        <div ref={popoverRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setPopoverOpen(v => !v)}
            title="Mostrar/ocultar clientes"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 7px', fontSize: 12, borderRadius: 'var(--radius-xs)',
              border: '1px solid', borderColor: hayOcultos ? 'var(--border-strong)' : 'var(--border)',
              background: hayOcultos ? 'var(--surface-hover)' : 'transparent',
              color: hayOcultos ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = hayOcultos ? 'var(--surface-hover)' : 'transparent'; }}
          >
            {hayOcultos ? <EyeOff size={12} /> : <Eye size={12} />}
            {hayOcultos && <span>{filtros.clientesOcultos.length} oculto{filtros.clientesOcultos.length > 1 ? 's' : ''}</span>}
          </button>

          {popoverOpen && clientes.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '6px 0', minWidth: 180,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}>
              {clientes.map(c => {
                const oculto = filtros.clientesOcultos.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleOculto(c)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 8, padding: '5px 12px', fontSize: 12, textAlign: 'left',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: oculto ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}
                    onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
                    onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <span style={{ textDecoration: oculto ? 'line-through' : 'none' }}>{c}</span>
                    {oculto ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
