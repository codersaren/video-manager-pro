'use client';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, ExternalLink } from 'lucide-react';
import { Proyecto, ESTADO_CONFIG } from '../types';
import { useCardPrefs } from '../context/CardPrefsContext';
import { formatDisplayDate } from '../utils/dates';

interface Props {
  proyecto: Proyecto;
  onClick: () => void;
  onSelect?: (id: string) => void;
  selected?: boolean;
  isDimmed?: boolean;
  overlay?: boolean;
}

// Status color tokens — bg/border are hex with alpha suffix
const STATUS: Record<string, { solid: string; bg: string; bgHover: string; border: string; borderSelected: string }> = {
  pendiente: { solid: '#d97706', bg: '#f59e0b18', bgHover: '#f59e0b28', border: '#f59e0b50', borderSelected: '#f59e0b90' },
  editando:  { solid: '#2563eb', bg: '#3b82f618', bgHover: '#3b82f628', border: '#3b82f650', borderSelected: '#3b82f690' },
  revision:  { solid: '#9333ea', bg: '#a855f718', bgHover: '#a855f728', border: '#a855f750', borderSelected: '#a855f790' },
  entregado: { solid: '#16a34a', bg: '#22c55e18', bgHover: '#22c55e28', border: '#22c55e50', borderSelected: '#22c55e90' },
  pagado:    { solid: '#6b7280', bg: '#9ca3af18', bgHover: '#9ca3af28', border: '#9ca3af50', borderSelected: '#9ca3af90' },
  en_espera: { solid: '#0891b2', bg: '#06b6d418', bgHover: '#06b6d428', border: '#06b6d450', borderSelected: '#06b6d490' },
};

export function ProjectCard({ proyecto, onClick, onSelect, selected = false, isDimmed = false, overlay = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const prefs = useCardPrefs();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: proyecto.id,
    disabled: overlay,
    data: { fecha: proyecto.fechaEntrega },
  });

  const cfg   = ESTADO_CONFIG[proyecto.estado];
  const tok   = STATUS[proyecto.estado] ?? STATUS.pagado;
  const showCheckbox = !overlay && !!onSelect && (selected || hovered);

  // ── Minimal mode — solid circle ─────────────────────────────────
  if (prefs.mode === 'minimal' && !overlay) {
    return (
      <div
        ref={setNodeRef}
        style={{
          width: 22, height: 22,
          borderRadius: '50%',
          background: tok.solid,
          cursor: 'grab',
          opacity: isDimmed ? 0.2 : (isDragging ? 0.3 : 1),
          transform: transform ? CSS.Transform.toString(transform) : undefined,
          transition,
          zIndex: isDragging ? 999 : undefined,
          outline: selected ? `3px solid ${tok.solid}` : 'none',
          outlineOffset: 2,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          flexShrink: 0,
        }}
        {...listeners}
        {...attributes}
        onClick={e => { e.stopPropagation(); onClick(); }}
        title={`${proyecto.nombre}${proyecto.cliente ? ` · ${proyecto.cliente}` : ''} — ${cfg.label}`}
        onMouseEnter={e => { if (!isDragging) (e.currentTarget as HTMLElement).style.transform = 'scale(1.18)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = transform ? (CSS.Transform.toString(transform) ?? 'none') : 'none'; }}
      />
    );
  }

  // ── Normal mode ─────────────────────────────────────────────────
  const style: React.CSSProperties = {
    position: 'relative',
    background: selected ? tok.bgHover : (overlay ? tok.bgHover : tok.bg),
    border: `1px solid ${selected ? tok.borderSelected : tok.border}`,
    borderRadius: 'var(--radius)',
    opacity: isDimmed ? 0.25 : (isDragging ? 0.3 : 1),
    boxShadow: overlay
      ? '0 8px 24px rgba(0,0,0,0.10)'
      : '0 1px 3px rgba(0,0,0,0.04)',
    transform: overlay
      ? 'rotate(1.5deg) scale(1.02)'
      : transform ? CSS.Transform.toString(transform) : undefined,
    transition: overlay ? undefined : transition,
    zIndex: isDragging ? 999 : undefined,
  };

  const hasBottom = prefs.showEstado || (prefs.showPrecio && proyecto.precio > 0) || (prefs.showMaterial && proyecto.material);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={e => { e.stopPropagation(); onClick(); }}
      className="cursor-grab active:cursor-grabbing select-none p-2.5"
      onMouseEnter={e => {
        setHovered(true);
        if (!overlay && !isDragging)
          (e.currentTarget as HTMLElement).style.background = tok.bgHover;
      }}
      onMouseLeave={e => {
        setHovered(false);
        if (!overlay)
          (e.currentTarget as HTMLElement).style.background = selected ? tok.bgHover : tok.bg;
      }}
    >
      {/* Checkbox */}
      {showCheckbox && (
        <button
          onClick={e => { e.stopPropagation(); onSelect!(proyecto.id); }}
          style={{
            position: 'absolute', top: 7, right: 7,
            width: 16, height: 16, borderRadius: '50%',
            borderStyle: 'solid', borderWidth: '1.5px',
            borderColor: selected ? tok.solid : tok.border,
            background: selected ? tok.solid : 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.1s', zIndex: 10,
          }}
        >
          {selected && <Check size={9} strokeWidth={3} color="#ffffff" />}
        </button>
      )}

      {/* Nombre */}
      <p
        className="text-sm font-semibold leading-snug truncate"
        style={{ color: 'var(--text-primary)', paddingRight: showCheckbox ? '20px' : 0 }}
      >
        {proyecto.nombre}
      </p>

      {/* Cliente */}
      {prefs.showCliente && proyecto.cliente && (
        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {proyecto.cliente}
        </p>
      )}

      {/* Fecha */}
      {prefs.showFecha && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {formatDisplayDate(proyecto.fechaEntrega)}
        </p>
      )}

      {/* Notas */}
      {prefs.showNotas && proyecto.notas && (
        <p
          className="text-xs mt-1 leading-snug"
          style={{
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {proyecto.notas}
        </p>
      )}

      {/* Bottom row */}
      {hasBottom && (
        <div className="flex items-center justify-between mt-2 gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            {prefs.showEstado && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: tok.border,
                  color: tok.solid,
                  fontSize: 10,
                }}
              >
                {cfg.label}
              </span>
            )}
            {prefs.showPrecio && proyecto.precio > 0 && (
              <span className="text-xs font-semibold" style={{ color: tok.solid, fontSize: 11 }}>
                {proyecto.precio}€
              </span>
            )}
          </div>
          {prefs.showMaterial && proyecto.material && (
            <a
              href={proyecto.material}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: tok.solid, display: 'flex', alignItems: 'center', opacity: 0.7 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
            >
              <ExternalLink size={11} strokeWidth={1.5} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
