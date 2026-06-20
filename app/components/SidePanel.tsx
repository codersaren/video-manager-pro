'use client';
import { useState, useEffect } from 'react';
import { X, Trash2, ExternalLink } from 'lucide-react';
import { Proyecto, EstadoProyecto, ESTADOS, ESTADO_CONFIG } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  proyecto: Proyecto | null;
  onClose: () => void;
  onSave: (id: string, cambios: Partial<Omit<Proyecto, 'id'>>) => void;
  onDelete: (id: string) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '7px 10px',
  fontSize: '13px',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'var(--font)',
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

const STATUS_BORDER: Record<string, string> = {
  pendiente: '#eab308',
  editando: '#3b82f6',
  revision: '#a855f7',
  entregado: '#22c55e',
  pagado: '#9ca3af',
  en_espera: '#0891b2',
  cancelado:  '#dc2626',
};

export function SidePanel({ proyecto, onClose, onSave, onDelete }: Props) {
  const { role } = useAuth();
  const [form, setForm] = useState<Omit<Proyecto, 'id'> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (proyecto) { setForm({ ...proyecto }); setConfirmDelete(false); }
  }, [proyecto]);

  if (!proyecto || !form) return null;

  const set = (key: keyof typeof form, val: string | number) =>
    setForm(prev => prev ? { ...prev, [key]: val } : null);

  const handleSave = () => {
    if (!form || !form.nombre.trim()) return;
    onSave(proyecto.id, { ...form, precio: Number(form.precio) || 0 });
    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete) { onDelete(proyecto.id); onClose(); }
    else setConfirmDelete(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.15)' }} onClick={onClose} />
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col"
        style={{ width: '380px', background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_BORDER[form.estado] }} />
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {proyecto.nombre}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded shrink-0 ml-2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label style={labelStyle}>Nombre</label>
            <input
              value={form.nombre} onChange={e => set('nombre', e.target.value)}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Cliente</label>
            <input
              value={form.cliente} onChange={e => set('cliente', e.target.value)}
              placeholder="Sin cliente" style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Estado */}
          <div>
            <label style={labelStyle}>Estado</label>
            <div className="flex flex-wrap gap-1.5">
              {ESTADOS.map(e => {
                const active = form.estado === e;
                return (
                  <button
                    key={e}
                    onClick={() => set('estado', e)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all"
                    style={{
                      borderStyle: 'solid',
                      borderTopWidth: '1px',
                      borderRightWidth: '1px',
                      borderBottomWidth: '1px',
                      borderLeftWidth: '3px',
                      borderTopColor: active ? STATUS_BORDER[e] + '60' : 'var(--border)',
                      borderRightColor: active ? STATUS_BORDER[e] + '60' : 'var(--border)',
                      borderBottomColor: active ? STATUS_BORDER[e] + '60' : 'var(--border)',
                      borderLeftColor: STATUS_BORDER[e],
                      background: active ? STATUS_BORDER[e] + '12' : 'var(--surface)',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {ESTADO_CONFIG[e].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Recibí material</label>
              <input
                type="date" value={form.fechaInicio || ''}
                onChange={e => set('fechaInicio', e.target.value)}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>Fecha de entrega</label>
              <input
                type="date" value={form.fechaEntrega}
                onChange={e => set('fechaEntrega', e.target.value)}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
            </div>
          </div>

          {role !== 'clipper' && (
            <div>
              <label style={labelStyle}>Precio (€)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.precio || ''} onChange={e => set('precio', e.target.value)}
                placeholder="0" style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Link del material</label>
            <div className="flex gap-2">
              <input
                type="url" value={form.material} onChange={e => set('material', e.target.value)}
                placeholder="https://drive.google.com/..."
                style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
              {form.material && (
                <a
                  href={form.material} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 p-2 rounded flex items-center transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <ExternalLink size={14} strokeWidth={1.5} />
                </a>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notas</label>
            <textarea
              value={form.notas} onChange={e => set('notas', e.target.value)}
              placeholder="Instrucciones del cliente..." rows={4}
              style={{ ...inputStyle, resize: 'none' }}
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
              border: `1px solid ${confirmDelete ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
              color: confirmDelete ? '#ef4444' : 'var(--text-muted)',
              background: confirmDelete ? 'rgba(239,68,68,0.05)' : 'transparent',
            }}
          >
            <Trash2 size={12} strokeWidth={1.5} />
            {confirmDelete ? '¿Confirmar?' : 'Eliminar'}
          </button>
          {confirmDelete && (
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-2 rounded text-xs transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              No
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded text-sm font-medium"
            style={{ background: '#37352f', color: '#ffffff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Guardar
          </button>
        </div>
      </div>
    </>
  );
}
