'use client';
import { useMemo, useState } from 'react';
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
const MONTH_FULL  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

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

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

interface Props { proyectos: Proyecto[]; }

export function IngresosView({ proyectos }: Props) {
  const now = new Date();

  // null = all time; otherwise { year, month } (month is 0-indexed)
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(['cobrado', 'porCobrar', 'enCurso']));
  const [hiddenClients, setHiddenClients] = useState<Set<string>>(new Set());

  const conPrecio = useMemo(() =>
    proyectos.filter(p => p.precio > 0 && p.estado !== 'cancelado' && p.estado !== 'en_espera'),
    [proyectos]
  );

  // Apply month filter first, then status + client filters
  const filtered = useMemo(() => conPrecio.filter(p => {
    if (selectedMonth) {
      const key = monthKey(selectedMonth.year, selectedMonth.month);
      if (!p.fechaEntrega.startsWith(key)) return false;
    }
    const client = p.cliente || '—';
    if (hiddenClients.has(client)) return false;
    if (p.estado === 'pagado'   && !statusFilter.has('cobrado'))   return false;
    if (p.estado === 'entregado' && !statusFilter.has('porCobrar')) return false;
    if (p.estado !== 'pagado' && p.estado !== 'entregado' && !statusFilter.has('enCurso')) return false;
    return true;
  }), [conPrecio, selectedMonth, statusFilter, hiddenClients]);

  const toggleStatus = (key: string) => {
    setStatusFilter(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  };

  const toggleClient = (client: string) => {
    setHiddenClients(prev => {
      const next = new Set(prev);
      if (next.has(client)) next.delete(client); else next.add(client);
      return next;
    });
  };

  const prevMonth = () => {
    const base = selectedMonth ?? { year: now.getFullYear(), month: now.getMonth() };
    const d = new Date(base.year, base.month - 1, 1);
    setSelectedMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

  const nextMonth = () => {
    if (!selectedMonth) return;
    const d = new Date(selectedMonth.year, selectedMonth.month + 1, 1);
    const isAfterNow = d.getFullYear() > now.getFullYear() ||
      (d.getFullYear() === now.getFullYear() && d.getMonth() > now.getMonth());
    if (isAfterNow) { setSelectedMonth(null); return; }
    setSelectedMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

  const hasActiveFilters = statusFilter.size < 3 || hiddenClients.size > 0;

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const cobrado   = filtered.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.precio, 0);
    const porCobrar = filtered.filter(p => p.estado === 'entregado').reduce((s, p) => s + p.precio, 0);
    const enCurso   = filtered.filter(p => p.estado !== 'pagado' && p.estado !== 'entregado').reduce((s, p) => s + p.precio, 0);
    return { cobrado, porCobrar, enCurso, total: cobrado + porCobrar + enCurso };
  }, [filtered]);

  const counts = useMemo(() => ({
    cobrado:   filtered.filter(p => p.estado === 'pagado').length,
    porCobrar: filtered.filter(p => p.estado === 'entregado').length,
    enCurso:   filtered.filter(p => p.estado !== 'pagado' && p.estado !== 'entregado').length,
  }), [filtered]);

  // ── Chart: 12-month view OR week-by-week for selected month ─────────────────
  const chartBars = useMemo(() => {
    if (!selectedMonth) {
      // Last 12 months
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const key = monthKey(d.getFullYear(), d.getMonth());
        const isSelected = false;
        const isCurrent = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        const label = MONTH_SHORT[d.getMonth()] + (d.getFullYear() !== now.getFullYear() ? ` '${String(d.getFullYear()).slice(2)}` : '');
        const mp = conPrecio.filter(p => p.fechaEntrega.startsWith(key));
        const cobrado   = mp.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.precio, 0);
        const porCobrar = mp.filter(p => p.estado === 'entregado').reduce((s, p) => s + p.precio, 0);
        const enCurso   = mp.filter(p => p.estado !== 'pagado' && p.estado !== 'entregado').reduce((s, p) => s + p.precio, 0);
        return { key, label, isCurrent, isSelected, cobrado, porCobrar, enCurso, total: cobrado + porCobrar + enCurso };
      });
    }

    // Week breakdown for selected month (Mon–Sun weeks)
    const { year, month } = selectedMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const weeks: { label: string; key: string; cobrado: number; porCobrar: number; enCurso: number; total: number; isCurrent: boolean; isSelected: boolean }[] = [];

    let weekStart = new Date(firstDay);
    let weekNum = 1;
    while (weekStart <= lastDay) {
      const weekEnd = new Date(Math.min(
        new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6).getTime(),
        lastDay.getTime()
      ));
      const startD = weekStart.getDate();
      const endD   = weekEnd.getDate();
      const label  = `${startD}–${endD} ${MONTH_SHORT[month]}`;
      const key    = `w${weekNum}`;

      const wp = conPrecio.filter(p => {
        if (!p.fechaEntrega) return false;
        const pd = new Date(p.fechaEntrega);
        return pd >= weekStart && pd <= weekEnd;
      });
      const cobrado   = wp.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.precio, 0);
      const porCobrar = wp.filter(p => p.estado === 'entregado').reduce((s, p) => s + p.precio, 0);
      const enCurso   = wp.filter(p => p.estado !== 'pagado' && p.estado !== 'entregado').reduce((s, p) => s + p.precio, 0);

      weeks.push({ key, label, isCurrent: false, isSelected: false, cobrado, porCobrar, enCurso, total: cobrado + porCobrar + enCurso });
      weekStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);
      weekNum++;
    }
    return weeks;
  }, [selectedMonth, conPrecio, now]);

  const maxChart = useMemo(() => Math.max(...chartBars.map(b => b.total), 1), [chartBars]);

  // ── By client (from full conPrecio filtered by month only, so hidden toggles always show) ──
  const byClient = useMemo(() => {
    const base = selectedMonth
      ? conPrecio.filter(p => p.fechaEntrega.startsWith(monthKey(selectedMonth.year, selectedMonth.month)))
      : conPrecio;
    const map = new Map<string, { cobrado: number; porCobrar: number; enCurso: number; count: number }>();
    base.forEach(p => {
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
  }, [conPrecio, selectedMonth]);

  const maxClient = useMemo(() => Math.max(...byClient.map(c => c.total), 1), [byClient]);

  const sortedProjects = useMemo(() => [...filtered].sort((a, b) => b.precio - a.precio), [filtered]);

  // ── Empty state ──────────────────────────────────────────────────────────────
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
    { label: 'Total facturado', value: totals.total,     count: filtered.length,   color: 'var(--text-primary)', bar: 100 },
    { label: 'Cobrado',         value: totals.cobrado,   count: counts.cobrado,    color: GREEN, bar: pct(totals.cobrado) },
    { label: 'Por cobrar',      value: totals.porCobrar, count: counts.porCobrar,  color: BLUE,  bar: pct(totals.porCobrar) },
    { label: 'En curso',        value: totals.enCurso,   count: counts.enCurso,    color: AMBER, bar: pct(totals.enCurso) },
  ];

  const STATUS_PILLS = [
    { key: 'cobrado',   label: 'Cobrado',    color: GREEN },
    { key: 'porCobrar', label: 'Por cobrar', color: BLUE  },
    { key: 'enCurso',   label: 'En curso',   color: AMBER },
  ];

  const monthLabel = selectedMonth
    ? `${MONTH_FULL[selectedMonth.month]} ${selectedMonth.year}`
    : 'Todo el tiempo';

  const isCurrentMonth = selectedMonth
    ? selectedMonth.year === now.getFullYear() && selectedMonth.month === now.getMonth()
    : false;

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>

      {/* ── Month navigator ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
        <button
          onClick={prevMonth}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRight: 'none',
            borderRadius: 'var(--radius) 0 0 var(--radius)', padding: '6px 12px', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1,
          }}
        >
          ‹
        </button>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          padding: '6px 20px', minWidth: 180, textAlign: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {monthLabel}
          </span>
        </div>
        <button
          onClick={nextMonth}
          disabled={!selectedMonth}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: 'none',
            borderRadius: '0 var(--radius) var(--radius) 0', padding: '6px 12px',
            cursor: selectedMonth ? 'pointer' : 'default',
            color: selectedMonth ? 'var(--text-secondary)' : 'var(--text-muted)',
            fontSize: 14, lineHeight: 1,
          }}
        >
          ›
        </button>
        {selectedMonth && (
          <button
            onClick={() => setSelectedMonth(null)}
            style={{
              marginLeft: 10, padding: '6px 12px', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: 'transparent',
              fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            Ver todo
          </button>
        )}

        {/* Status pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {STATUS_PILLS.map(pill => {
            const active = statusFilter.has(pill.key);
            return (
              <button
                key={pill.key}
                onClick={() => toggleStatus(pill.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
                  fontSize: 12, fontWeight: 600, border: `1.5px solid ${pill.color}`,
                  background: active ? pill.color + '20' : 'transparent',
                  color: active ? pill.color : 'var(--text-muted)',
                  opacity: active ? 1 : 0.5,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: pill.color, flexShrink: 0 }} />
                {pill.label}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              onClick={() => { setStatusFilter(new Set(['cobrado', 'porCobrar', 'enCurso'])); setHiddenClients(new Set()); }}
              style={{
                padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                fontSize: 11, border: '1.5px solid var(--border)',
                background: 'transparent', color: 'var(--text-muted)',
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

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

        {/* Monthly / weekly chart */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              {selectedMonth ? `Semanas · ${MONTH_FULL[selectedMonth.month]} ${selectedMonth.year}` : 'Evolución mensual'}
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
            {chartBars.map(bar => (
              <div
                key={bar.key}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 4,
                  background: !selectedMonth && bar.isCurrent ? 'var(--bg)' : 'transparent',
                  cursor: !selectedMonth ? 'pointer' : 'default',
                  padding: '1px 2px', margin: '-1px -2px',
                }}
                onClick={() => {
                  if (selectedMonth) return;
                  // Parse key like "2026-07" to set selected month
                  const [y, m] = bar.key.split('-').map(Number);
                  if (y && m) setSelectedMonth({ year: y, month: m - 1 });
                }}
                title={!selectedMonth ? `Ver ${bar.label}` : undefined}
              >
                <span style={{
                  fontSize: 11, minWidth: 70, textAlign: 'right', flexShrink: 0,
                  color: bar.isCurrent ? 'var(--text-secondary)' : 'var(--text-muted)',
                  fontWeight: bar.isCurrent ? 600 : 400,
                }}>
                  {bar.label}
                </span>

                <div style={{ flex: 1, height: 18, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden', display: 'flex' }}>
                  {bar.cobrado > 0 && (
                    <div style={{ width: `${(bar.cobrado / maxChart) * 100}%`, background: GREEN, transition: 'width 0.4s' }} />
                  )}
                  {bar.porCobrar > 0 && (
                    <div style={{ width: `${(bar.porCobrar / maxChart) * 100}%`, background: BLUE, transition: 'width 0.4s' }} />
                  )}
                  {bar.enCurso > 0 && (
                    <div style={{ width: `${(bar.enCurso / maxChart) * 100}%`, background: AMBER, transition: 'width 0.4s' }} />
                  )}
                </div>

                <span style={{
                  fontSize: 11, minWidth: 62, textAlign: 'right', flexShrink: 0,
                  color: bar.total > 0 ? 'var(--text-secondary)' : 'var(--text-muted)',
                  fontWeight: bar.total > 0 ? 500 : 400,
                }}>
                  {bar.total > 0 ? fmt(bar.total) : '—'}
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

          {byClient.length === 0 ? (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin proyectos este mes</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {byClient.map(c => {
                const hidden = hiddenClients.has(c.cliente);
                return (
                  <div key={c.cliente} style={{ opacity: hidden ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: hidden ? 0 : 5 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 6,
                      }}>
                        {c.cliente}
                      </span>
                      <button
                        onClick={() => toggleClient(c.cliente)}
                        title={hidden ? 'Mostrar cliente' : 'Ocultar cliente'}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 4px',
                          color: 'var(--text-muted)', fontSize: 14, lineHeight: 1, flexShrink: 0,
                        }}
                      >
                        {hidden ? '👁' : '✕'}
                      </button>
                      {!hidden && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0, marginLeft: 4 }}>
                          {fmt(c.total)}
                        </span>
                      )}
                    </div>
                    {!hidden && (
                      <>
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
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
            {sortedProjects.length !== conPrecio.length && (
              <span style={{ fontWeight: 400, marginLeft: 4 }}>de {conPrecio.length}</span>
            )}
          </span>
        </div>
        {sortedProjects.length === 0 ? (
          <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Sin proyectos para este período
          </div>
        ) : sortedProjects.map((p, idx) => {
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
