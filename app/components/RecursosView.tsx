'use client';
import { useState, useMemo } from 'react';
import { Plus, ExternalLink, Pencil, Trash2, Search, Link, X } from 'lucide-react';
import { Recurso } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────
function getDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

function getFaviconUrl(url: string): string {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; } catch { return ''; }
}

// ── Resource form modal ────────────────────────────────────────────────────
interface ModalProps {
  initial?: Recurso;
  clientes: string[];
  onSave: (data: Omit<Recurso, 'id'>) => void;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  padding: '7px 10px', fontSize: 13, color: 'var(--text-primary)',
  outline: 'none', fontFamily: 'var(--font)',
};

function RecursoModal({ initial, clientes, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState({
    nombre: initial?.nombre ?? '',
    url: initial?.url ?? '',
    cliente: initial?.cliente ?? '',
    descripcion: initial?.descripcion ?? '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.url.trim()) return;
    onSave({ ...form, nombre: form.nombre.trim(), url: form.url.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} onClick={onClose} />
      <div className="relative w-full max-w-md shadow-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {initial ? 'Editar recurso' : 'Nuevo recurso'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          ><X size={15} strokeWidth={1.5} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Nombre *
            </label>
            <input autoFocus value={form.nombre} onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Drive de fotos" style={inputStyle} required
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              URL *
            </label>
            <input type="url" value={form.url} onChange={e => set('url', e.target.value)}
              placeholder="https://drive.google.com/..." style={inputStyle} required
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cliente
            </label>
            <input list="clientes-list" value={form.cliente} onChange={e => set('cliente', e.target.value)}
              placeholder="Sin cliente" style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            <datalist id="clientes-list">
              {clientes.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Descripción
            </label>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              placeholder="Link al material del cliente para el reel..." rows={2}
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 text-sm transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >Cancelar</button>
            <button type="submit"
              className="flex-1 py-2 text-sm font-medium"
              style={{ background: 'var(--text-primary)', color: '#f7f6f3', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Resource card ──────────────────────────────────────────────────────────
interface CardProps {
  recurso: Recurso;
  onEdit: () => void;
  onDelete: () => void;
}

function RecursoCard({ recurso, onEdit, onDelete }: CardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const domain = getDomain(recurso.url);
  const faviconUrl = getFaviconUrl(recurso.url);

  return (
    <div
      style={{
        position: 'relative',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '10px 12px',
        background: hovered ? 'var(--surface-hover)' : 'var(--surface)',
        boxShadow: hovered ? '0 2px 10px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.12s',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDel(false); }}
      onClick={() => window.open(recurso.url, '_blank', 'noopener,noreferrer')}
    >
      {/* Hover actions */}
      {hovered && (
        <div
          className="flex items-center gap-1"
          style={{ position: 'absolute', top: 8, right: 8 }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onEdit}
            style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
          ><Pencil size={11} strokeWidth={1.5} /></button>

          <button onClick={() => { if (confirmDel) { onDelete(); } else setConfirmDel(true); }}
            style={{
              height: 22, borderRadius: 6, border: '1px solid',
              borderColor: confirmDel ? 'rgba(239,68,68,0.5)' : 'var(--border)',
              background: confirmDel ? 'rgba(239,68,68,0.08)' : 'var(--surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: confirmDel ? '#ef4444' : 'var(--text-muted)',
              padding: confirmDel ? '0 8px' : '0 5px',
              fontSize: 11, gap: 4, fontFamily: 'var(--font)',
            }}
            onMouseEnter={e => { if (!confirmDel) (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
            onMouseLeave={e => { if (!confirmDel) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <Trash2 size={11} strokeWidth={1.5} />
            {confirmDel && 'Eliminar'}
          </button>
        </div>
      )}

      <div className="flex items-start gap-2.5" style={{ paddingRight: hovered ? 56 : 0 }}>
        {/* Favicon */}
        <div style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1 }}>
          {!imgError && faviconUrl ? (
            <img src={faviconUrl} alt="" width={20} height={20}
              style={{ borderRadius: 4, display: 'block' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{
              width: 20, height: 20, borderRadius: 4,
              background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: 'var(--text-muted)',
            }}>
              {domain.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {recurso.nombre}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Link size={9} strokeWidth={1.5} style={{ flexShrink: 0 }} />
            {domain}
          </p>
          {recurso.descripcion && (
            <p style={{
              fontSize: 11, color: 'var(--text-secondary)', marginTop: 5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {recurso.descripcion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0', color: 'var(--text-muted)' }}>
      <div style={{
        width: 52, height: 52, borderRadius: 'var(--radius)',
        background: 'var(--surface)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      }}>
        <Link size={22} strokeWidth={1.2} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
        Sin recursos todavía
      </p>
      <p style={{ fontSize: 13, marginBottom: 20, textAlign: 'center', maxWidth: 320 }}>
        Centraliza aquí los links de tus clientes — drives, carpetas, referencias, briefs...
      </p>
      <button onClick={onAdd}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium"
        style={{ background: 'var(--text-primary)', color: '#f7f6f3', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
      >
        <Plus size={14} strokeWidth={2} /> Añadir primer recurso
      </button>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────
interface Props {
  recursos: Recurso[];
  clientesSugeridos: string[];
  onAdd: (data: Omit<Recurso, 'id'>) => void;
  onEdit: (id: string, data: Partial<Omit<Recurso, 'id'>>) => void;
  onDelete: (id: string) => void;
}

export function RecursosView({ recursos, clientesSugeridos, onAdd, onEdit, onDelete }: Props) {
  const [modal, setModal] = useState<{ open: boolean; recurso?: Recurso; defaultCliente?: string }>({ open: false });
  const [query, setQuery] = useState('');

  // Combine clients from recursos + suggested from proyectos, deduplicated
  const allClientes = useMemo(() => {
    const set = new Set<string>();
    recursos.forEach(r => { if (r.cliente.trim()) set.add(r.cliente.trim()); });
    clientesSugeridos.forEach(c => set.add(c));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [recursos, clientesSugeridos]);

  // Filter + sort: by client name (empty last), then by resource name
  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? recursos.filter(r =>
          r.nombre.toLowerCase().includes(q) ||
          r.cliente.toLowerCase().includes(q) ||
          r.url.toLowerCase().includes(q) ||
          r.descripcion.toLowerCase().includes(q)
        )
      : recursos;
    return [...base].sort((a, b) => {
      const ca = a.cliente.trim().toLowerCase();
      const cb = b.cliente.trim().toLowerCase();
      if (!ca && cb) return 1;
      if (ca && !cb) return -1;
      const cmp = ca.localeCompare(cb);
      if (cmp !== 0) return cmp;
      return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
    });
  }, [recursos, query]);

  const openAdd = (defaultCliente?: string) => setModal({ open: true, defaultCliente });
  const openEdit = (recurso: Recurso) => setModal({ open: true, recurso });
  const closeModal = () => setModal({ open: false });

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-6">
        {/* Search */}
        <div className="flex items-center gap-2" style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '6px 12px',
          width: 260,
        }}>
          <Search size={13} strokeWidth={1.5} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar recursos..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font)', width: '100%' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
              <X size={12} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* New resource button */}
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium"
          style={{ background: 'var(--text-primary)', color: '#f7f6f3', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          <Plus size={14} strokeWidth={2} /> Nuevo recurso
        </button>
      </div>

      {/* ── Content ── */}
      {recursos.length === 0 ? (
        <EmptyState onAdd={() => openAdd()} />
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center" style={{ padding: '60px 0', color: 'var(--text-muted)' }}>
          <Search size={24} strokeWidth={1.2} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 14 }}>Sin resultados para "{query}"</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 8 }}>
          {sorted.map(r => (
            <RecursoCard
              key={r.id}
              recurso={r}
              onEdit={() => openEdit(r)}
              onDelete={() => onDelete(r.id)}
            />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {modal.open && (
        <RecursoModal
          initial={modal.recurso}
          clientes={allClientes}
          onSave={data => {
            if (modal.recurso) onEdit(modal.recurso.id, data);
            else onAdd(data);
          }}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
