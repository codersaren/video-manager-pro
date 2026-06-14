'use client';
import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Proyecto, EstadoProyecto, ESTADOS, ESTADO_CONFIG } from '../types';

const STATUS_COLOR: Record<string, string> = {
  pendiente: '#eab308',
  editando: '#3b82f6',
  revision: '#a855f7',
  entregado: '#22c55e',
  pagado: '#9ca3af',
  en_espera: '#0891b2',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 500,
  color: 'var(--text-muted)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '7px 10px',
  fontSize: '13px',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'var(--font)',
};

interface Props {
  selectedIds: Set<string>;
  proyectos: Proyecto[];
  onClose: () => void;
  onApply: (ids: string[], cambios: Partial<Omit<Proyecto, 'id'>>) => void;
  onDelete: (ids: string[]) => void;
}

interface BulkForm {
  estado: EstadoProyecto | '';
  fechaEntrega: string;
  cliente: string;
}

function getCommon<T>(items: T[], key: keyof T): T[keyof T] | null {
  if (items.length === 0) return null;
  const first = items[0][key];
  return items.every(i => i[key] === first) ? first : null;
}

export function BulkEditPanel({ selectedIds, proyectos, onClose, onApply, onDelete }: Props) {
  const [form, setForm] = useState<BulkForm>({ estado: '', fechaEntrega: '', cliente: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selected = proyectos.filter(p => selectedIds.has(p.id));
  const count = selected.length;

  // Pre-fill with common values when selection changes
  useEffect(() => {
    setConfirmDelete(false);
    setForm({
      estado: (getCommon(selected, 'estado') as EstadoProyecto | null) ?? '',
      fechaEntrega: getCommon(selected, 'fechaEntrega') as string ?? '',
      cliente: getCommon(selected, 'cliente') as string ?? '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  const handleApply = () => {
    const cambios: Partial<Omit<Proyecto, 'id'>> = {};
    if (form.estado) cambios.estado = form.estado;
    if (form.fechaEntrega) cambios.fechaEntrega = form.fechaEntrega;
    if (form.cliente !== '') cambios.cliente = form.cliente;
    if (Object.keys(cambios).length > 0) {
      onApply(Array.from(selectedIds), cambios);
    }
    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(Array.from(selectedIds));
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };

  if (count === 0) return null;

  return (
    <>
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col"
        style={{ width: '380px', background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded text-xs font-bold"
              style={{
                width: 22, height: 22,
                background: 'var(--text-primary)',
                color: 'var(--bg)',
                fontSize: 11,
              }}
            >
              {count}
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {count === 1 ? 'proyecto seleccionado' : 'proyectos seleccionados'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded shrink-0 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* Selected list preview */}
        <div
          className="px-5 py-3 shrink-0 overflow-y-auto"
          style={{ maxHeight: '130px', borderBottom: '1px solid var(--border)' }}
        >
          {selected.map(p => (
            <div key={p.id} className="flex items-center gap-2 py-0.5">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: STATUS_COLOR[p.estado] }}
              />
              <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {p.nombre}
              </span>
              {p.cliente && (
                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                  · {p.cliente}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Solo se aplican los campos que modifiques. Los campos vacíos no cambian.
          </p>

          {/* Estado */}
          <div>
            <label style={labelStyle}>Estado</label>
            <div className="flex flex-wrap gap-1.5">
              {ESTADOS.map(e => {
                const active = form.estado === e;
                return (
                  <button
                    key={e}
                    onClick={() => setForm(f => ({ ...f, estado: active ? '' : e }))}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all"
                    style={{
                      borderStyle: 'solid',
                      borderTopWidth: '1px',
                      borderRightWidth: '1px',
                      borderBottomWidth: '1px',
                      borderLeftWidth: '3px',
                      borderTopColor: active ? STATUS_COLOR[e] + '60' : 'var(--border)',
                      borderRightColor: active ? STATUS_COLOR[e] + '60' : 'var(--border)',
                      borderBottomColor: active ? STATUS_COLOR[e] + '60' : 'var(--border)',
                      borderLeftColor: STATUS_COLOR[e],
                      background: active ? STATUS_COLOR[e] + '12' : 'var(--surface)',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {ESTADO_CONFIG[e].label}
                  </button>
                );
              })}
            </div>
            {form.estado === '' && (
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                {(() => {
                  const common = getCommon(selected, 'estado');
                  return common ? `Valor actual: ${ESTADO_CONFIG[common as EstadoProyecto].label}` : 'Valores distintos — elige uno para aplicar a todos';
                })()}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label style={labelStyle}>Fecha de entrega</label>
            <input
              type="date"
              value={form.fechaEntrega}
              onChange={e => setForm(f => ({ ...f, fechaEntrega: e.target.value }))}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            {!form.fechaEntrega && (
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                {(() => {
                  const common = getCommon(selected, 'fechaEntrega');
                  return common ? `Valor actual: ${common as string}` : 'Fechas distintas';
                })()}
              </p>
            )}
          </div>

          {/* Cliente */}
          <div>
            <label style={labelStyle}>Cliente</label>
            <input
              value={form.cliente}
              onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))}
              placeholder="Dejar vacío para no cambiar"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded text-xs transition-all"
            style={{
              borderStyle: 'solid',
              borderWidth: '1px',
              borderColor: confirmDelete ? 'rgba(239,68,68,0.4)' : 'var(--border)',
              color: confirmDelete ? '#ef4444' : 'var(--text-muted)',
              background: confirmDelete ? 'rgba(239,68,68,0.05)' : 'transparent',
            }}
          >
            <Trash2 size={12} strokeWidth={1.5} />
            {confirmDelete ? '¿Eliminar todos?' : `Eliminar ${count}`}
          </button>
          {confirmDelete && (
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-2 rounded text-xs transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              No
            </button>
          )}
          <button
            onClick={handleApply}
            className="flex-1 py-2 rounded text-sm font-medium"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Aplicar a {count} {count === 1 ? 'proyecto' : 'proyectos'}
          </button>
        </div>
      </div>
    </>
  );
}
