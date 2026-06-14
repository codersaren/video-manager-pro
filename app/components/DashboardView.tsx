'use client';
import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { Proyecto, ESTADO_CONFIG, PRIORIDAD_CONFIG } from '../types';
import { getTodayISO } from '../utils/dates';

const STATUS_COLOR: Record<string, string> = {
  pendiente: '#d97706', editando: '#2563eb', revision: '#9333ea',
  entregado: '#16a34a', pagado: '#6b7280', en_espera: '#0891b2',
};

const FINISHED = new Set(['entregado', 'pagado']);

function diffDays(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

interface DashCardProps {
  proyecto: Proyecto;
  today: string;
  onClick: () => void;
}

function DashCard({ proyecto: p, today, onClick }: DashCardProps) {
  const color = STATUS_COLOR[p.estado] ?? '#6b7280';
  const cfg = ESTADO_CONFIG[p.estado];
  const priorCfg = p.prioridad ? PRIORIDAD_CONFIG[p.prioridad] : null;

  const diasProduccion = p.fechaInicio ? diffDays(p.fechaInicio, today) : null;
  const diasRetraso = !FINISHED.has(p.estado) && p.fechaEntrega < today
    ? diffDays(p.fechaEntrega, today)
    : null;
  const diasHasta = !FINISHED.has(p.estado) && p.fechaEntrega >= today
    ? diffDays(today, p.fechaEntrega)
    : null;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${color}`,
        borderRadius: 'var(--radius-sm)',
        padding: '12px 14px',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 6,
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
    >
      {/* Top row: name + badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.3', flex: 1 }}>
          {p.nombre}
        </span>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {priorCfg && (
            <span style={{
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              color: priorCfg.color, background: priorCfg.color + '18',
              border: `1px solid ${priorCfg.color}40`, padding: '1px 5px', borderRadius: 4,
            }}>
              {priorCfg.label}
            </span>
          )}
          <span style={{
            fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
            color, background: color + '18', border: `1px solid ${color}40`,
            padding: '1px 5px', borderRadius: 4,
          }}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Client */}
      {p.cliente && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.cliente}</span>
      )}

      {/* Time indicators */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
        {diasProduccion !== null && (
          <span style={{
            fontSize: 11, color: 'var(--text-muted)',
            background: 'var(--bg)', border: '1px solid var(--border)',
            padding: '2px 7px', borderRadius: 4,
          }}>
            {diasProduccion === 0 ? 'Recibido hoy' : `${diasProduccion}d en producción`}
          </span>
        )}
        {diasRetraso !== null && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#ef4444',
            background: '#ef444415', border: '1px solid #ef444440',
            padding: '2px 7px', borderRadius: 4,
          }}>
            ⚠ {diasRetraso}d de retraso
          </span>
        )}
        {diasHasta !== null && diasHasta === 0 && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#f97316',
            background: '#f9731615', border: '1px solid #f9731640',
            padding: '2px 7px', borderRadius: 4,
          }}>
            Entrega hoy
          </span>
        )}
        {diasHasta !== null && diasHasta > 0 && (
          <span style={{
            fontSize: 11, color: 'var(--text-muted)',
            background: 'var(--bg)', border: '1px solid var(--border)',
            padding: '2px 7px', borderRadius: 4,
          }}>
            Entrega en {diasHasta}d
          </span>
        )}
        {p.material && (
          <a
            href={p.material} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: 11, color: color, display: 'flex', alignItems: 'center', gap: 3,
              background: color + '10', border: `1px solid ${color}35`,
              padding: '2px 7px', borderRadius: 4, textDecoration: 'none',
            }}
          >
            <ExternalLink size={10} strokeWidth={2} /> Material
          </a>
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  color?: string;
  count: number;
  children: React.ReactNode;
  emptyText: string;
}

function Section({ title, color, count, children, emptyText }: SectionProps) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: color ?? 'var(--text-muted)', flex: 1 }}>
          {title}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700,
          background: (color ?? '#6b7280') + '20', color: color ?? 'var(--text-muted)',
          padding: '1px 7px', borderRadius: 10,
        }}>
          {count}
        </span>
      </div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {count === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', opacity: 0.5 }}>
            {emptyText}
          </p>
        ) : children}
      </div>
    </div>
  );
}

interface Props {
  proyectos: Proyecto[];
  onCardClick: (p: Proyecto) => void;
}

export function DashboardView({ proyectos, onCardClick }: Props) {
  const today = getTodayISO();

  const activos = useMemo(() =>
    proyectos.filter(p => !FINISHED.has(p.estado)),
    [proyectos]);

  const hoy = useMemo(() =>
    activos.filter(p => p.fechaEntrega === today)
      .sort((a, b) => {
        const pa = a.prioridad === 'alta' ? 0 : a.prioridad === 'media' ? 1 : a.prioridad === 'baja' ? 2 : 3;
        const pb = b.prioridad === 'alta' ? 0 : b.prioridad === 'media' ? 1 : b.prioridad === 'baja' ? 2 : 3;
        return pa - pb;
      }),
    [activos, today]);

  const vencidos = useMemo(() =>
    activos.filter(p => p.fechaEntrega < today)
      .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega)), // más antiguos primero
    [activos, today]);

  const proximosSiete = useMemo(() => {
    const limit = new Date(today + 'T00:00:00');
    limit.setDate(limit.getDate() + 7);
    const limitISO = limit.toISOString().split('T')[0];
    return activos
      .filter(p => p.fechaEntrega > today && p.fechaEntrega <= limitISO)
      .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));
  }, [activos, today]);

  const masAdelante = useMemo(() => {
    const limit = new Date(today + 'T00:00:00');
    limit.setDate(limit.getDate() + 7);
    const limitISO = limit.toISOString().split('T')[0];
    return activos
      .filter(p => p.fechaEntrega > limitISO)
      .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));
  }, [activos, today]);

  // Stats
  const stats = [
    { label: 'Vencidos', value: vencidos.length, color: '#ef4444' },
    { label: 'Hoy', value: hoy.length, color: '#f97316' },
    { label: 'Próximos 7 días', value: proximosSiete.length, color: '#eab308' },
    { label: 'Activos en total', value: activos.length, color: 'var(--text-secondary)' },
  ];

  const todayFormatted = new Date(today + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '24px 28px' }}>

      {/* Date + greeting */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
          {todayFormatted}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          {vencidos.length > 0
            ? `Tienes ${vencidos.length} proyecto${vencidos.length > 1 ? 's' : ''} vencido${vencidos.length > 1 ? 's' : ''}`
            : hoy.length > 0
              ? `${hoy.length} entrega${hoy.length > 1 ? 's' : ''} para hoy`
              : 'Todo al día ✓'}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '12px 16px',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              {s.label}
            </span>
            <span style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Main grid: vencidos + hoy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Section title="Vencidos" color="#ef4444" count={vencidos.length} emptyText="Sin proyectos vencidos 🎉">
          {vencidos.map(p => <DashCard key={p.id} proyecto={p} today={today} onClick={() => onCardClick(p)} />)}
        </Section>
        <Section title="Entrega hoy" color="#f97316" count={hoy.length} emptyText="Sin entregas para hoy">
          {hoy.map(p => <DashCard key={p.id} proyecto={p} today={today} onClick={() => onCardClick(p)} />)}
        </Section>
      </div>

      {/* Próximos 7 días */}
      <div style={{ marginBottom: 12 }}>
        <Section title="Próximos 7 días" color="#eab308" count={proximosSiete.length} emptyText="Sin entregas esta semana">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 7 }}>
            {proximosSiete.map(p => <DashCard key={p.id} proyecto={p} today={today} onClick={() => onCardClick(p)} />)}
          </div>
        </Section>
      </div>

      {/* Más adelante */}
      {masAdelante.length > 0 && (
        <Section title="Más adelante" count={masAdelante.length} emptyText="">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 7 }}>
            {masAdelante.map(p => <DashCard key={p.id} proyecto={p} today={today} onClick={() => onCardClick(p)} />)}
          </div>
        </Section>
      )}
    </div>
  );
}
