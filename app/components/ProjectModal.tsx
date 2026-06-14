'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Proyecto, EstadoProyecto, ESTADOS, ESTADO_CONFIG } from '../types';
import { getTodayISO } from '../utils/dates';
import { useAuth } from '../context/AuthContext';

interface Props {
  fechaInicial?: string;
  onClose: () => void;
  onSave: (p: Omit<Proyecto, 'id'>) => void;
}

const EMPTY: Omit<Proyecto, 'id'> = {
  nombre: '', cliente: '', fechaEntrega: getTodayISO(),
  estado: 'pendiente', precio: 0, material: '', notas: '',
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

export function ProjectModal({ fechaInicial, onClose, onSave }: Props) {
  const { role } = useAuth();
  const [form, setForm] = useState<Omit<Proyecto, 'id'>>({ ...EMPTY, fechaEntrega: fechaInicial || getTodayISO() });

  useEffect(() => {
    setForm(prev => ({ ...prev, fechaEntrega: fechaInicial || getTodayISO() }));
  }, [fechaInicial]);

  const set = (key: keyof typeof form, val: string | number) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onSave({ ...form, nombre: form.nombre.trim(), precio: Number(form.precio) || 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} onClick={onClose} />
      <div
        className="relative w-full max-w-md shadow-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nuevo proyecto</h2>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input
              autoFocus value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Reel Tomás"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              required
            />
          </div>

          <div className={role !== 'clipper' ? 'grid grid-cols-2 gap-3' : ''}>
            <div>
              <label style={labelStyle}>Cliente</label>
              <input
                value={form.cliente} onChange={e => set('cliente', e.target.value)}
                placeholder="Nombre del cliente" style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
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
                style={inputStyle} required
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Estado</label>
            <select
              value={form.estado} onChange={e => set('estado', e.target.value as EstadoProyecto)}
              style={{ ...inputStyle, cursor: 'pointer', background: 'var(--surface)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {ESTADOS.map(e => (
                <option key={e} value={e}>{ESTADO_CONFIG[e].label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Link del material</label>
            <input
              type="url" value={form.material} onChange={e => set('material', e.target.value)}
              placeholder="https://drive.google.com/..." style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Notas</label>
            <textarea
              value={form.notas} onChange={e => set('notas', e.target.value)}
              placeholder="Instrucciones del cliente..." rows={3}
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2 rounded text-sm transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded text-sm font-medium"
              style={{ background: '#37352f', color: '#ffffff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
