'use client';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChRight, AlignLeft, Dot, Plus } from 'lucide-react';
import { Proyecto, CardMode } from '../types';
import { useCardPrefs } from '../context/CardPrefsContext';
import { ProjectCard } from './ProjectCard';
import { toISODate, isToday, getTodayISO } from '../utils/dates';

const DAY_NAMES   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const STATUS_SOLID: Record<string, string> = {
  pendiente: '#d97706', editando: '#2563eb', revision: '#9333ea',
  entregado: '#16a34a', pagado: '#6b7280', en_espera: '#0891b2', cancelado: '#dc2626',
};

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  const daysInMonth     = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { date: Date; currentMonth: boolean }[] = [];
  for (let i = startDow - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), currentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), currentMonth: true });
  const rem = cells.length % 7;
  if (rem > 0)
    for (let d = 1; d <= 7 - rem; d++)
      cells.push({ date: new Date(year, month + 1, d), currentMonth: false });
  return cells;
}

// ── Compact one-line row for month cells and popover ─────────────────────
function MonthProjectRow({ proyecto, onClick, selected, isDimmed }: {
  proyecto: Proyecto; onClick: () => void; selected: boolean; isDimmed: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: proyecto.id,
    data: { fecha: proyecto.fechaEntrega },
  });
  const color = STATUS_SOLID[proyecto.estado] ?? '#6b7280';

  return (
    <div
      ref={setNodeRef}
      onClick={e => { e.stopPropagation(); onClick(); }}
      {...listeners}
      {...attributes}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '1px 5px', borderRadius: 'var(--radius-xs)',
        background: color + (selected ? '28' : '15'),
        border: `1px solid ${color}${selected ? '60' : '35'}`,
        cursor: 'grab', userSelect: 'none', flexShrink: 0,
        opacity: isDimmed ? 0.3 : (isDragging ? 0.3 : 1),
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{
        fontSize: 11, fontWeight: 500, color: 'var(--text-primary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        flex: 1, lineHeight: '18px',
      }}>
        {proyecto.nombre}
      </span>
    </div>
  );
}

// ── Cell ──────────────────────────────────────────────────────────────────
interface CellProps {
  date: Date; currentMonth: boolean; proyectos: Proyecto[];
  onCardClick: (p: Proyecto) => void; onAddClick: (fecha: string) => void;
  selectedIds: Set<string>; onCardSelect: (id: string) => void;
  activeDragId: string | null; draggingSelected: boolean;
  isLastRow: boolean; isLastCol: boolean;
  onShowAll: (fecha: string, rect: DOMRect) => void;
  isExpanded: boolean;
}

function MonthCell({
  date, currentMonth, proyectos, onCardClick, onAddClick,
  selectedIds, onCardSelect, activeDragId, draggingSelected,
  isLastRow, isLastCol, onShowAll, isExpanded,
}: CellProps) {
  const fecha = toISODate(date);
  const { isOver, setNodeRef } = useDroppable({ id: fecha });
  const { mode } = useCardPrefs();
  const today = isToday(date);
  const [hovered, setHovered] = useState(false);

  const MAX_NORMAL = 3, MAX_MINIMAL = 8;
  const max      = mode === 'minimal' ? MAX_MINIMAL : MAX_NORMAL;
  const visible  = proyectos.slice(0, max);
  const overflow = Math.max(0, proyectos.length - max);

  return (
    <div
      ref={setNodeRef}
      style={{
        borderRight:  isLastCol ? 'none' : '1px solid var(--border)',
        borderBottom: isLastRow ? 'none' : '1px solid var(--border)',
        background: isExpanded
          ? 'var(--surface-hover)'
          : isOver ? 'var(--surface-hover)' : currentMonth ? 'var(--surface)' : 'var(--bg)',
        padding: '5px 5px 4px',
        display: 'flex', flexDirection: 'column', gap: 2,
        outline: isOver ? '2px dashed var(--border-strong)' : 'none',
        outlineOffset: -2, transition: 'background 0.1s',
        overflow: 'hidden', minHeight: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Date header */}
      <div className="flex items-center justify-between mb-0.5">
        <span style={{
          width: 22, height: 22, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11,
          fontWeight: today ? 700 : currentMonth ? 500 : 400,
          background: today ? '#2563eb' : 'transparent',
          color: today ? '#ffffff' : currentMonth ? 'var(--text-secondary)' : 'var(--text-muted)',
          flexShrink: 0,
        }}>
          {date.getDate()}
        </span>
        {currentMonth && (
          <button
            onClick={() => onAddClick(fecha)}
            style={{
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--surface-hover)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
              opacity: hovered ? 1 : 0, transition: 'opacity 0.12s',
            }}
          >
            <Plus size={9} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Project rows — hidden when popover is open (items live in popover's SortableContext) */}
      {!isExpanded && (
        <>
          <div style={{
            display: 'flex',
            flexDirection: mode === 'minimal' ? 'row' : 'column',
            flexWrap: mode === 'minimal' ? 'wrap' : 'nowrap',
            gap: mode === 'minimal' ? 3 : 2,
            overflow: 'hidden',
          }}>
            <SortableContext items={visible.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {visible.map(p => {
                const isDimmed = draggingSelected && selectedIds.has(p.id) && p.id !== activeDragId;
                if (mode === 'minimal') {
                  return (
                    <ProjectCard
                      key={p.id} proyecto={p}
                      onClick={() => onCardClick(p)}
                      onSelect={onCardSelect}
                      selected={selectedIds.has(p.id)}
                      isDimmed={isDimmed}
                    />
                  );
                }
                return (
                  <MonthProjectRow
                    key={p.id} proyecto={p}
                    onClick={() => onCardClick(p)}
                    selected={selectedIds.has(p.id)}
                    isDimmed={isDimmed}
                  />
                );
              })}
            </SortableContext>
          </div>

          {overflow > 0 && (
            <button
              onClick={e => {
                e.stopPropagation();
                onShowAll(fecha, (e.currentTarget as HTMLElement).getBoundingClientRect());
              }}
              style={{
                fontSize: 10, color: 'var(--text-muted)', fontWeight: 600,
                paddingLeft: 2, background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'var(--font)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              +{overflow} más
            </button>
          )}
        </>
      )}

      {/* When expanded, show a subtle count so the cell isn't fully blank */}
      {isExpanded && proyectos.length > 0 && (
        <span style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 2 }}>
          {proyectos.length} proyectos ↗
        </span>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
interface Props {
  monthDate: Date; proyectos: Proyecto[];
  onMonthChange: (d: Date) => void;
  onCardClick: (p: Proyecto) => void; onAddClick: (fecha: string) => void;
  selectedIds: Set<string>; onCardSelect: (id: string) => void;
  activeDragId: string | null; draggingSelected: boolean;
  onCardModeChange: (mode: CardMode) => void;
  calView: 'week' | 'month'; onCalViewChange: (v: 'week' | 'month') => void;
}

const navBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 4, borderRadius: 6, border: 'none', background: 'transparent',
  cursor: 'pointer', color: 'var(--text-muted)',
};

export function MonthlyCalendar({
  monthDate, proyectos, onMonthChange, onCardClick, onAddClick,
  selectedIds, onCardSelect, activeDragId, draggingSelected,
  onCardModeChange, calView, onCalViewChange,
}: Props) {
  const { mode } = useCardPrefs();
  const year  = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const cells = getMonthGrid(year, month);
  const weeks = cells.length / 7;
  const [showToday, setShowToday] = useState(false);

  // Popover stores only the fecha; proyectos are derived reactively so they
  // stay in sync after drag-reorder without stale snapshot issues.
  const [popover, setPopover] = useState<{ fecha: string; x: number; y: number } | null>(null);
  const popoverProyectos = popover ? proyectos.filter(p => p.fechaEntrega === popover.fecha) : [];

  const todayISO      = getTodayISO();
  const todayProjects = proyectos.filter(p => p.fechaEntrega === todayISO);

  const prevMonth = () => onMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, month + 1, 1));
  const goToToday = () => onMonthChange(new Date());

  return (
    <div className="flex flex-col" style={{ height: '100%' }}>

      {/* ── Nav bar ── */}
      <div
        className="shrink-0 flex items-center justify-between"
        style={{ padding: '10px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-1">
          <button style={navBtn} onClick={prevMonth}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          ><ChevronLeft size={16} strokeWidth={1.5} /></button>

          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', minWidth: 180, textAlign: 'center' }}>
            {MONTH_NAMES[month]} {year}
          </span>

          <button style={navBtn} onClick={nextMonth}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          ><ChevronRight size={16} strokeWidth={1.5} /></button>
        </div>

        <div className="flex items-center gap-2">
          {/* Hoy section toggle */}
          {todayProjects.length > 0 && (
            <button
              onClick={() => setShowToday(v => !v)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all"
              style={{
                border: `1px solid ${showToday ? 'var(--border-strong)' : 'var(--border)'}`,
                background: showToday ? 'var(--surface-hover)' : 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = showToday ? 'var(--surface-hover)' : 'transparent'; }}
            >
              {showToday ? <ChevronDown size={11} strokeWidth={2} /> : <ChRight size={11} strokeWidth={2} />}
              Hoy
              <span style={{
                minWidth: 16, height: 16, borderRadius: '50%', padding: '0 4px',
                background: 'var(--text-primary)', color: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
              }}>{todayProjects.length}</span>
            </button>
          )}

          {/* Semana / Mes */}
          <div className="flex items-center overflow-hidden" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)' }}>
            {(['week', 'month'] as const).map(v => (
              <button key={v} onClick={() => onCalViewChange(v)} style={{
                padding: '4px 12px', fontSize: 12,
                background: calView === v ? 'var(--text-primary)' : 'transparent',
                color: calView === v ? '#f7f6f3' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
                {v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          {/* Detail / Compact */}
          <div className="flex items-center overflow-hidden" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)' }}>
            {([
              { value: 'normal'  as CardMode, icon: AlignLeft },
              { value: 'minimal' as CardMode, icon: Dot },
            ]).map(({ value, icon: Icon }) => (
              <button key={value} onClick={() => onCardModeChange(value)} style={{
                width: 28, height: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: mode === value ? 'var(--text-primary)' : 'transparent',
                color: mode === value ? '#f7f6f3' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer',
              }}
                onMouseEnter={e => { if (mode !== value) (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
                onMouseLeave={e => { if (mode !== value) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              ><Icon size={13} strokeWidth={1.8} /></button>
            ))}
          </div>

          <button onClick={goToToday} style={{
            ...navBtn, padding: '4px 10px', fontSize: 12,
            borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >Hoy</button>
        </div>
      </div>

      {/* ── Today strip ── */}
      {showToday && todayProjects.length > 0 && (
        <div className="shrink-0 flex flex-wrap gap-1.5"
          style={{ padding: '8px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          {todayProjects.map(p => (
            <button key={p.id} onClick={() => onCardClick(p)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 transition-all"
              style={{
                borderRadius: 'var(--radius-sm)',
                background: STATUS_SOLID[p.estado] + '12',
                border: `1px solid ${STATUS_SOLID[p.estado]}40`,
                color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = STATUS_SOLID[p.estado] + '22'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = STATUS_SOLID[p.estado] + '12'; }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_SOLID[p.estado], flexShrink: 0 }} />
              <span className="font-medium">{p.nombre}</span>
              {p.cliente && <span style={{ color: 'var(--text-muted)' }}>· {p.cliente}</span>}
            </button>
          ))}
        </div>
      )}

      {/* ── Calendar grid — fills remaining height ── */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* Day-name header row */}
        <div className="shrink-0 grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          {DAY_NAMES.map((d, i) => (
            <div key={d} className="text-center py-2" style={{
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              borderRight: i < 6 ? '1px solid var(--border)' : 'none',
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Cell grid — rows fill remaining height equally */}
        <div
          className="flex-1 min-h-0"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `repeat(${weeks}, 1fr)`, overflow: 'hidden' }}
        >
          {cells.map((cell, idx) => {
            const fecha = toISODate(cell.date);
            const dayProjects = proyectos.filter(p => p.fechaEntrega === fecha);
            const row = Math.floor(idx / 7);
            const col = idx % 7;
            return (
              <MonthCell
                key={fecha}
                date={cell.date}
                currentMonth={cell.currentMonth}
                proyectos={dayProjects}
                onCardClick={onCardClick}
                onAddClick={onAddClick}
                selectedIds={selectedIds}
                onCardSelect={onCardSelect}
                activeDragId={activeDragId}
                draggingSelected={draggingSelected}
                isLastRow={row === weeks - 1}
                isLastCol={col === 6}
                onShowAll={(fecha, rect) => setPopover({ fecha, x: rect.left, y: rect.bottom + 4 })}
                isExpanded={popover?.fecha === fecha}
              />
            );
          })}
        </div>
      </div>

      {/* ── Expanded day popover ── */}
      {popover && (
        <>
          {/* Backdrop — closes on click, but pointer-events:none during drag */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setPopover(null)}
          />
          <div style={{
            position: 'fixed',
            top: Math.min(popover.y, window.innerHeight - 340),
            left: Math.min(popover.x, window.innerWidth - 240),
            zIndex: 50,
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            padding: '6px',
            minWidth: 200,
            maxWidth: 240,
            maxHeight: 360,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
            <SortableContext
              items={popoverProyectos.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {popoverProyectos.map(p => {
                const isDimmed = draggingSelected && selectedIds.has(p.id) && p.id !== activeDragId;
                return (
                  <MonthProjectRow
                    key={p.id}
                    proyecto={p}
                    onClick={() => { onCardClick(p); setPopover(null); }}
                    selected={selectedIds.has(p.id)}
                    isDimmed={isDimmed}
                  />
                );
              })}
            </SortableContext>
          </div>
        </>
      )}
    </div>
  );
}
