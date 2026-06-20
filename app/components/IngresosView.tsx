'use client';
import { useMemo } from 'react';
import { Proyecto } from '../types';

const GREEN = '#16a34a';
const BLUE  = '#2563eb';
const AMBER = '#d97706';

const STATUS_SOLID: Record<string, string> = {
  pendiente: AMBER, editando: '#2563eb', revision: '#9333ea',
  entregado: GREEN, pagado: '#6b7280', en_espera: '#0891b2', cancelado: '#dc2626',
};
const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pendiente', editando: 'En edición', revision: 'Revisión',
  entregado: 'Entregado', pagado: 'Pagado', en_espera: 'En espera', cancelado: 'Cancelado',
};

const MONTH_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

interface Props { proyectos: Proyecto[]; }

export function IngresosView({ proyectos }: Props) {
  const conPrecio = useMemo(() => proyectos.filter(p => p.precio > 0 && p.estado !== 'cancelado'), [proyectos]);

  const totals = useMemo(() => {
    const cobrado   = conPrecio.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.precio, 0);
    const porCobrar = conPrecio.filter(p => p.estado === 'entregado').reduce((s, p) => s + p.precio, 0);
    const enCurso   = conPrecio.filter(p => p.estado !== 'pagado' && p.estado !== 'entregado').reduce((s, p) => s + p.precio, 0);
    return { cobrado, porCobrar, enCurso, total: cobrado + porCobrar + enCurso };
  }, [conPrecio]);

  const counts = useMemo(() => ({
    cobrado:   conPrecio.filter(p => p.estado === 'pagado').length,
    porCobrar: conPrecio.filter(p => p.estado === 'entregado').length,
    enCurso:   conPrecio.filter(p => p.estado !== 'pagado' && p.estado !== 'entregado').length,
  }), [conPrecio]);

  // Last 12 months data
  const monthly = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const isCurrent = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      const label = MONTH_SHORT[d.getMonth()] + (d.getFullYear() !== now.getFullYear() ? ` '${String(d.getFullYear()).slice(2)}` : '');
      const mp = conPrecio.filter(p => p.fechaEntrega.startsWith(key));
      const cobrado   = mp.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.precio, 0);
      const porCobrar = mp.filter(p => p.estado === 'entregado').reduce((s, p) => s + p.precio, 0);
      const enCurso   = mp.filter(p => p.estado !== 'pagado' && p.estado !== 'entregado').reduce((s, p) => s + p.precio, 0);
      return { key, label, isCurrent, cobrado, porCobrar, enCurso, total: cobrado + porCobrar + enCurso };
    });
  }, [conPrecio]);

  const maxMonthly = useMemo(() => Math.max(...monthly.map(m => m.total), 1), [monthly]);

  // By client
  const byClient = useMemo(() => {
    const map = new Map<string, { cobrado: number; porCobrar: number; enCurso: number; count: number }>();
    conPrecio.forEach(p => {
      const key = p.cliente || '—';
      const e = map.get(key) ?? { cobrado: 0, porCobrar: 0, enCurso: 0, count: 0 };
      if (p.estado === 'pagado') e.cobrado += p.precio;
      else if (p.estado === 'entregado') e.porCobrar += p.precio;
      else e.enCurso += p.precio;
      e.count++;
      map.set(key, e);
    });
    return Array.from(map.entries())
      .map(([cliente, v]) => ({ cliente, ...v, total: v.cobrado + v.porCobrar + v.enCurso }))
      .sort((a, b) => b.total - a.total);
  }, [conPrecio]);

  const maxClient = useMemo(() => Math.max(...byClient.map(c => c.total), 1), [byClient]);

  const sortedProjects = useMemo(() => [...conPrecio].sort((a, b) => b.precio - a.precio), [conPrecio]);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (conPrecio.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>💰</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Sin datos de ingresos
          </p>
          <p style={{ fontSize: 13 }}>
            Añade precios a tus proyectos para ver el resumen financiero.
          </p>
        </div>
      </div>
    );
  }

  const pct = (n: number) => totals.total > 0 ? Math.round((n / totals.total) * 100) : 0;

  const CARDS = [
    { label: 'Total facturado', value: totals.total, count: conPrecio.length, color: 'var(--text-primary)', bar: 100 },
    { label: 'Cobrado',         value: totals.cobrado,   count: counts.cobrado,   color: GREEN, bar: pct(totals.cobrado) },
    { label: 'Por cobrar',      value: totals.porCobrar, count: counts.porCobrar, color: BLUE,  bar: pct(totals.porCobrar) },
    { label: 'En curso',        value: totals.enCurso,   count: counts.enCurso,   color: AMBER, bar: pct(totals.enCurso) },
  ];

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>

      {/* ── Summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {CARDS.map(card => (
          <div key={card.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px 18px 14px',
            display: 'flex', flexDirection: 'column',
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8,
            }}>
              {card.label}
            </span>
            <span style={{
              fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em',
              color: card.color, marginBottom: 4,
            }}>
              {fmt(card.value)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
              {card.count} proyecto{card.count !== 1 ? 's' : ''}
              {card.label !== 'Total facturado' && <> · {card.bar}%</>}
            </span>
            <div style={{ height: 3, borderRadius: 2, background: 'var(--border)' }}>
              <div style={{
                height: '100%', borderRadius: 2, background: card.color,
                width: `${card.bar}%`, transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 12, marginBottom: 20, alignItems: 'start' }}>

        {/* Monthly evolution */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Evolución mensual
            </span>
            <div style={{ display: 'flex', gap: 14 }}>
              {[{ color: GREEN, label: 'Cobrado' }, { color: BLUE, label: 'Por cobrar' }, { color: AMBER, label: 'En curso' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {monthly.map(m => (
              <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 11, minWidth: 46, textAlign: 'right', flexShrink: 0,
                  color: m.isCurrent ? 'var(--text-secondary)' : 'var(--text-muted)',
                  fontWeight: m.isCurrent ? 600 : 400,
                }}>
                  {m.label}
                </span>

                {/* Stacked bar */}
                <div style={{ flex: 1, height: 18, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden', display: 'flex' }}>
                  {m.cobrado > 0 && (
                    <div style={{ width: `${(m.cobrado / maxMonthly) * 100}%`, background: GREEN, transition: 'width 0.4s' }} />
                  )}
                  {m.porCobrar > 0 && (
                    <div style={{ width: `${(m.porCobrar / maxMonthly) * 100}%`, background: BLUE, transition: 'width 0.4s' }} />
                  )}
                  {m.enCurso > 0 && (
                    <div style={{ width: `${(m.enCurso / maxMonthly) * 100}%`, background: AMBER, transition: 'width 0.4s' }} />
                  )}
                </div>

                <span style={{
                  fontSize: 11, minWidth: 62, textAlign: 'right', flexShrink: 0,
                  color: m.total > 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
                  fontWeight: m.total > 0 ? 500 : 400,
                }}>
                  {m.total > 0 ? fmt(m.total) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By client */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '18px 20px',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: 14 }}>
            Por cliente
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {byClient.map(c => (
              <div key={c.cliente}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 6,
                  }}>
                    {c.cliente}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
                    {fmt(c.total)}
                  </span>
                </div>
                {/* Stacked bar */}
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden', display: 'flex', marginBottom: 3 }}>
                  {c.cobrado > 0 && (
                    <div style={{ width: `${(c.cobrado / maxClient) * 100}%`, background: GREEN }} />
                  )}
                  {c.porCobrar > 0 && (
                    <div style={{ width: `${(c.porCobrar / maxClient) * 100}%`, background: BLUE }} />
                  )}
                  {c.enCurso > 0 && (
                    <div style={{ width: `${(c.enCurso / maxClient) * 100}%`, background: AMBER }} />
                  )}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {c.count} proyecto{c.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Project table ── */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            Proyectos · {sortedProjects.length}
          </span>
        </div>
        {sortedProjects.map((p, idx) => {
          const color = STATUS_SOLID[p.estado] ?? '#6b7280';
          const label = STATUS_LABEL[p.estado] ?? p.estado;
          return (
            <div
              key={p.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '9px 20px',
                borderBottom: idx < sortedProjects.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{
                flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {p.nombre}
              </span>
              {p.cliente && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {p.cliente}
                </span>
              )}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                {fmtDate(p.fechaEntrega)}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, color: color,
                background: color + '15', border: `1px solid ${color}35`,
                padding: '1px 7px', borderRadius: 'var(--radius-xs)', flexShrink: 0,
              }}>
                {label}
              </span>
              <span style={{
                fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
                minWidth: 72, textAlign: 'right', flexShrink: 0,
              }}>
                {fmt(p.precio)}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
