'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChRight, AlignLeft, Dot } from 'lucide-react';
import { Proyecto, CardMode, ESTADO_CONFIG } from '../types';
import { useCardPrefs } from '../context/CardPrefsContext';
import { DayColumn } from './DayColumn';
import { getWeekDays, addDays, toISODate, formatWeekRange, getTodayISO } from '../utils/dates';

const STATUS_SOLID: Record<string, string> = {
  pendiente: '#d97706', editando: '#2563eb', revision: '#9333ea',
  entregado: '#16a34a', pagado: '#6b7280',
};

interface Props {
  weekStart: Date;
  proyectos: Proyecto[];
  onWeekChange: (d: Date) => void;
  onCardClick: (p: Proyecto) => void;
  onAddClick: (fecha: string) => void;
  selectedIds: Set<string>;
  onCardSelect: (id: string) => void;
  activeDragId: string | null;
  draggingSelected: boolean;
  onCardModeChange: (mode: CardMode) => void;
  calView: 'week' | 'month';
  onCalViewChange: (v: 'week' | 'month') => void;
}

const navBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 4, borderRadius: 6, border: 'none', background: 'transparent',
  cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.1s',
};

export function WeeklyCalendar({
  weekStart, proyectos, onWeekChange, onCardClick, onAddClick,
  selectedIds, onCardSelect, activeDragId, draggingSelected,
  onCardModeChange, calView, onCalViewChange,
}: Props) {
  const { mode } = useCardPrefs();
  const days = getWeekDays(weekStart);
  const [showToday, setShowToday] = useState(false);

  const todayISO      = getTodayISO();
  const todayProjects = proyectos.filter(p => p.fechaEntrega === todayISO);

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(today);
    mon.setDate(today.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    onWeekChange(mon);
  };

  return (
    <div className="flex flex-col" style={{ height: '100%' }}>

      {/* ── Nav bar ── */}
      <div
        className="shrink-0 flex items-center justify-between"
        style={{ padding: '10px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {/* Left: prev / range / next */}
        <div className="flex items-center gap-1">
          <button
            style={navBtn}
            onClick={() => onWeekChange(addDays(weekStart, -7))}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>

          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', minWidth: 210, textAlign: 'center' }}>
            {formatWeekRange(weekStart)}
          </span>

          <button
            style={navBtn}
            onClick={() => onWeekChange(addDays(weekStart, 7))}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">

          {/* "Hoy" section toggle — shows only when there are projects today */}
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
              }}>
                {todayProjects.length}
              </span>
            </button>
          )}

          {/* Semana / Mes */}
          <div className="flex items-center overflow-hidden" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)' }}>
            {(['week', 'month'] as const).map(v => (
              <button
                key={v}
                onClick={() => onCalViewChange(v)}
                style={{
                  padding: '4px 12px', fontSize: 12,
                  background: calView === v ? 'var(--text-primary)' : 'transparent',
                  color: calView === v ? '#f7f6f3' : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >
                {v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          {/* Detail / Compact */}
          <div className="flex items-center overflow-hidden" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)' }}>
            {([
              { value: 'normal'  as CardMode, icon: AlignLeft, title: 'Vista detalle' },
              { value: 'minimal' as CardMode, icon: Dot,       title: 'Vista compacta' },
            ]).map(({ value, icon: Icon, title }) => {
              const active = mode === value;
              return (
                <button
                  key={value}
                  onClick={() => onCardModeChange(value)}
                  title={title}
                  style={{
                    width: 28, height: 26,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? 'var(--text-primary)' : 'transparent',
                    color: active ? '#f7f6f3' : 'var(--text-muted)',
                    border: 'none', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <Icon size={13} strokeWidth={1.8} />
                </button>
              );
            })}
          </div>

          {/* Ir a hoy */}
          <button
            onClick={goToToday}
            style={{
              ...navBtn, padding: '4px 10px', fontSize: 12, borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border)', color: 'var(--text-muted)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            Hoy
          </button>
        </div>
      </div>

      {/* ── Today section — collapsible strip ── */}
      {showToday && todayProjects.length > 0 && (
        <div
          className="shrink-0 flex flex-wrap gap-1.5"
          style={{ padding: '8px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          {todayProjects.map(p => (
            <button
              key={p.id}
              onClick={() => onCardClick(p)}
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

      {/* ── Calendar columns — flex so each column gets a definite height and can scroll ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {days.map((day, idx) => {
          const fecha = toISODate(day);
          return (
            <DayColumn
              key={fecha}
              date={day}
              proyectos={proyectos.filter(p => p.fechaEntrega === fecha)}
              onCardClick={onCardClick}
              onAddClick={onAddClick}
              selectedIds={selectedIds}
              onCardSelect={onCardSelect}
              activeDragId={activeDragId}
              draggingSelected={draggingSelected}
              isLast={idx === 6}
            />
          );
        })}
      </div>
    </div>
  );
}
