'use client';
import { useState, useRef, useCallback } from 'react';
import {
  DndContext, DragEndEvent, DragStartEvent, DragOverlay,
  PointerSensor, useSensor, useSensors, pointerWithin,
  useDraggable, useDroppable,
} from '@dnd-kit/core';
import { Proyecto, EstadoProyecto } from '../types';
import { formatDisplayDate } from '../utils/dates';
import { useAuth } from '../context/AuthContext';

const COLUMNS: { estado: EstadoProyecto; label: string; color: string }[] = [
  { estado: 'pendiente', label: 'Pendiente', color: '#eab308' },
  { estado: 'editando',  label: 'Editando',  color: '#3b82f6' },
  { estado: 'revision',  label: 'Revisión',  color: '#a855f7' },
  { estado: 'entregado', label: 'Entregado', color: '#22c55e' },
  { estado: 'pagado',    label: 'Pagado',    color: '#6b7280' },
  { estado: 'en_espera', label: 'En espera', color: '#0891b2' },
  { estado: 'cancelado',  label: 'Cancelado',  color: '#dc2626' },
];

interface Props {
  proyectos: Proyecto[];
  onEdit: (p: Proyecto) => void;
  onStatusChange: (id: string, estado: EstadoProyecto) => void;
}

// ── Shared card visuals ──────────────────────────────────────────────────────
function CardContent({ proyecto }: { proyecto: Proyecto }) {
  const { role } = useAuth();
  return (
    <>
      <span style={{
        fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        lineHeight: '1.3', display: 'block',
      }}>
        {proyecto.nombre}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontSize: 11, color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {proyecto.cliente || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Sin cliente</span>}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
          {formatDisplayDate(proyecto.fechaEntrega)}
        </span>
      </div>
      {role !== 'clipper' && proyecto.precio > 0 && (
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
          {proyecto.precio.toLocaleString('es-ES')}€
        </span>
      )}
    </>
  );
}

// ── Draggable card ───────────────────────────────────────────────────────────
function DraggableBoardCard({
  proyecto, color, onEdit, faded, dragJustEnded,
}: {
  proyecto: Proyecto; color: string; onEdit: () => void;
  faded: boolean; dragJustEnded: { current: boolean };
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: proyecto.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => { if (!dragJustEnded.current) onEdit(); }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${color}`,
        borderRadius: 'var(--radius-sm)',
        padding: '10px 12px',
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex', flexDirection: 'column', gap: 5,
        flexShrink: 0,
        // Do NOT apply transform — DragOverlay handles the moving visual
        opacity: isDragging ? 0.18 : (faded ? 0.45 : 1),
        transition: 'opacity 0.1s, background 0.12s',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onMouseEnter={e => { if (!isDragging) (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
    >
      <CardContent proyecto={proyecto} />
    </div>
  );
}

// ── Droppable column ─────────────────────────────────────────────────────────
function DroppableColumn({
  estado, color, children,
}: {
  estado: EstadoProyecto; color: string; children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });
  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        padding: '8px', display: 'flex', flexDirection: 'column', gap: 7,
        background: isOver ? color + '14' : 'transparent',
        outline: isOver ? `2px dashed ${color}60` : 'none',
        outlineOffset: -2,
        transition: 'background 0.1s',
      }}
    >
      {children}
    </div>
  );
}

// ── Main board ───────────────────────────────────────────────────────────────
export function TableView({ proyectos, onEdit, onStatusChange }: Props) {
  const { role } = useAuth();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragJustEnded = useRef(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const activeProyecto = activeDragId ? proyectos.find(p => p.id === activeDragId) ?? null : null;
  const activeColor = activeProyecto
    ? (COLUMNS.find(c => c.estado === activeProyecto.estado)?.color ?? '#6b7280')
    : '#6b7280';

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveDragId(active.id as string);
  }, []);

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    setActiveDragId(null);
    dragJustEnded.current = true;
    setTimeout(() => { dragJustEnded.current = false; }, 200);

    if (!over) return;
    const targetEstado = over.id as EstadoProyecto;
    const proyecto = proyectos.find(p => p.id === active.id);
    if (proyecto && proyecto.estado !== targetEstado) {
      onStatusChange(proyecto.id, targetEstado);
    }
  }, [proyectos, onStatusChange]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        flex: 1, minHeight: 0, display: 'flex',
        gap: 10, padding: '14px 24px', overflow: 'hidden',
      }}>
        {COLUMNS.map(col => {
          const items = proyectos.filter(p => p.estado === col.estado);
          const total = items.reduce((s, p) => s + (p.precio ?? 0), 0);

          return (
            <div
              key={col.estado}
              style={{
                flex: 1, minWidth: 0,
                display: 'flex', flexDirection: 'column',
                border: '1px solid var(--border)',
                borderTop: `3px solid ${col.color}`,
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                background: 'var(--bg)',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '10px 14px 8px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface)',
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
                  {col.label}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: col.color + '22', color: col.color,
                  padding: '1px 7px', borderRadius: 10,
                }}>
                  {items.length}
                </span>
              </div>

              {/* Total */}
              {role !== 'clipper' && total > 0 && (
                <div style={{
                  padding: '4px 14px', borderBottom: '1px solid var(--border)',
                  background: 'var(--surface)', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {total.toLocaleString('es-ES')}€
                  </span>
                </div>
              )}

              {/* Cards */}
              <DroppableColumn estado={col.estado} color={col.color}>
                {items.length === 0 ? (
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: 'var(--text-muted)', opacity: 0.4,
                  }}>
                    Sin proyectos
                  </div>
                ) : (
                  items.map(p => (
                    <DraggableBoardCard
                      key={p.id}
                      proyecto={p}
                      color={col.color}
                      onEdit={() => onEdit(p)}
                      faded={!!activeDragId && activeDragId !== p.id}
                      dragJustEnded={dragJustEnded}
                    />
                  ))
                )}
              </DroppableColumn>
            </div>
          );
        })}
      </div>

      {/* Floating card while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeProyecto ? (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${activeColor}`,
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            display: 'flex', flexDirection: 'column', gap: 5,
            boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
            transform: 'rotate(1.5deg) scale(1.03)',
            cursor: 'grabbing',
            minWidth: 160,
          }}>
            <CardContent proyecto={activeProyecto} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
