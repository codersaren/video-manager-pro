'use client';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Proyecto } from '../types';
import { ProjectCard } from './ProjectCard';
import { useCardPrefs } from '../context/CardPrefsContext';
import { toISODate, formatDayHeader, isToday } from '../utils/dates';

interface Props {
  date: Date;
  proyectos: Proyecto[];
  onCardClick: (p: Proyecto) => void;
  onAddClick: (fecha: string) => void;
  selectedIds: Set<string>;
  onCardSelect: (id: string) => void;
  activeDragId: string | null;
  draggingSelected: boolean;
  isLast?: boolean;
}

const BLUE = '#2563eb';

export function DayColumn({
  date, proyectos, onCardClick, onAddClick,
  selectedIds, onCardSelect, activeDragId, draggingSelected,
  isLast = false,
}: Props) {
  const fecha   = toISODate(date);
  const today   = isToday(date);
  const { isOver, setNodeRef } = useDroppable({ id: fecha });
  const { mode } = useCardPrefs();
  const { dayName, dayNum } = formatDayHeader(date);
  const [colHovered, setColHovered] = useState(false);

  return (
    <div
      className="flex flex-col flex-1 min-w-0 overflow-hidden"
      style={{ borderRight: isLast ? 'none' : '1px solid var(--border)' }}
      onMouseEnter={() => setColHovered(true)}
      onMouseLeave={() => setColHovered(false)}
    >
      {/* ── Day header ── */}
      <div
        className="shrink-0 flex flex-col items-center py-3 px-2 relative select-none"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <span style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em',
          color: today ? BLUE : 'var(--text-muted)', marginBottom: 5,
        }}>
          {dayName}
        </span>

        <span style={{
          width: 34, height: 34, borderRadius: '50%',
          background: today ? BLUE : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: today ? 700 : 500, lineHeight: 1,
          color: today ? '#ffffff' : 'var(--text-primary)',
        }}>
          {dayNum}
        </span>

        {/* Quick-add on column hover */}
        <button
          onClick={() => onAddClick(fecha)}
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--surface-hover)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
            opacity: colHovered ? 1 : 0, transition: 'opacity 0.12s',
          }}
        >
          <Plus size={10} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Drop zone / cards ── fills all remaining height, scrolls ── */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1, minHeight: 0, overflowY: 'auto',
          padding: '6px',
          background: isOver
            ? 'var(--surface-hover)'
            : today ? 'rgba(37,99,235,0.025)' : 'transparent',
          outline: isOver ? '2px dashed var(--border-strong)' : 'none',
          outlineOffset: -2,
          display: 'flex',
          flexDirection: mode === 'minimal' ? 'row' : 'column',
          flexWrap: mode === 'minimal' ? 'wrap' : 'nowrap',
          gap: 4, alignContent: 'flex-start',
          transition: 'background 0.1s',
        }}
      >
        <SortableContext items={proyectos.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {proyectos.map(p => {
            const isDimmed = draggingSelected && selectedIds.has(p.id) && p.id !== activeDragId;
            return (
              <ProjectCard
                key={p.id}
                proyecto={p}
                onClick={() => onCardClick(p)}
                onSelect={onCardSelect}
                selected={selectedIds.has(p.id)}
                isDimmed={isDimmed}
              />
            );
          })}
        </SortableContext>

        {/* Bottom add — visible on column hover */}
        <button
          onClick={() => onAddClick(fecha)}
          style={{
            width: '100%', padding: '6px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: 'none', cursor: 'pointer',
            color: 'var(--text-muted)',
            opacity: colHovered ? 0.5 : 0, transition: 'opacity 0.12s',
            marginTop: 'auto', flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = colHovered ? '0.5' : '0'; }}
        >
          <Plus size={12} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
