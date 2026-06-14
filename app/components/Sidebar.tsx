'use client';
import { useRef } from 'react';
import { Film, Home, Calendar, LayoutDashboard, Sliders, Upload, Download, FolderOpen, TrendingUp, LogOut } from 'lucide-react';
import { Proyecto, EstadoProyecto, ESTADOS } from '../types';
import { Role, useAuth } from '../context/AuthContext';

type Vista = 'dashboard' | 'calendario' | 'tabla' | 'ajustes' | 'recursos' | 'ingresos';

const NAV: { value: Vista; label: string; icon: React.FC<{ size?: number; strokeWidth?: number }> }[] = [
  { value: 'dashboard',  label: 'Hoy',           icon: Home },
  { value: 'calendario', label: 'Calendario',    icon: Calendar },
  { value: 'tabla',      label: 'Tablero',       icon: LayoutDashboard },
  { value: 'ingresos',   label: 'Ingresos',      icon: TrendingUp },
  { value: 'recursos',   label: 'Recursos',      icon: FolderOpen },
  { value: 'ajustes',    label: 'Personalizar',  icon: Sliders },
];

function parseCSV(text: string): Omit<Proyecto, 'id'>[] {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const results: Omit<Proyecto, 'id'>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] ?? ''; });
    const estado = ESTADOS.includes(row.estado as EstadoProyecto) ? (row.estado as EstadoProyecto) : 'pendiente';
    const precio = parseFloat(row.precio?.replace(',', '.') || '0') || 0;
    if (!row.nombre) continue;
    results.push({
      nombre: row.nombre,
      cliente: row.cliente || '',
      fechaEntrega: row.fechaentrega || row['fecha de entrega'] || row.fecha || new Date().toISOString().split('T')[0],
      estado, precio,
      material: row.material || '',
      notas: row.notas || '',
    });
  }
  return results;
}

export type SidebarVista = Vista;


interface Props {
  vista: Vista;
  setVista: (v: Vista) => void;
  onImport: (proyectos: Omit<Proyecto, 'id'>[]) => void;
  proyectos: Proyecto[];
  role: Role | null;
}

function exportToCSV(proyectos: Proyecto[]) {
  const headers = ['nombre', 'cliente', 'fechaEntrega', 'estado', 'precio', 'material', 'notas', 'prioridad', 'fechaInicio'];
  const escape  = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows    = proyectos.map(p =>
    [p.nombre, p.cliente, p.fechaEntrega, p.estado, p.precio,
     p.material, p.notas, p.prioridad ?? '', p.fechaInicio ?? ''].map(escape).join(',')
  );
  // UTF-8 BOM (﻿) para que Excel abra con tildes correctamente
  const csv  = '﻿' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `proyectos-${new Date().toISOString().split('T')[0]}.csv`,
  });
  a.click();
  URL.revokeObjectURL(url);
}

export function Sidebar({ vista, setVista, onImport, proyectos, role }: Props) {
  const { signOut } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const visibleNav = NAV.filter(n => !(role === 'clipper' && n.value === 'ingresos'));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        onImport(parsed);
        alert(`${parsed.length} proyecto${parsed.length > 1 ? 's' : ''} importado${parsed.length > 1 ? 's' : ''}.`);
      } else {
        alert('No se encontraron proyectos válidos.\nEncabezados: nombre, cliente, fechaEntrega, estado, precio, material, notas');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{
        width: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-2.5 px-5"
        style={{ height: 56, borderBottom: '1px solid var(--border)', flexShrink: 0 }}
      >
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 28, height: 28, background: 'var(--text-primary)' }}
        >
          <Film size={14} strokeWidth={1.5} color="#f7f6f3" />
        </div>
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Saren Agency
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p
          className="text-xs font-semibold uppercase tracking-widest px-2 mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Vistas
        </p>
        {visibleNav.map(({ value, label, icon: Icon }) => {
          const active = vista === value;
          return (
            <button
              key={value}
              onClick={() => setVista(value)}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm font-medium transition-all text-left"
              style={{
                background: active ? 'var(--text-primary)' : 'transparent',
                color: active ? '#f7f6f3' : 'var(--text-secondary)',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Icon size={15} strokeWidth={1.5} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* ── Bottom actions ── */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-sm transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
          }}
        >
          <Upload size={14} strokeWidth={1.5} />
          Importar CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />

        <button
          onClick={() => exportToCSV(proyectos)}
          disabled={proyectos.length === 0}
          className="flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-sm transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            if (proyectos.length === 0) return;
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
          }}
        >
          <Download size={14} strokeWidth={1.5} />
          Exportar CSV
        </button>

        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-sm transition-all mt-1"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
          }}
        >
          <LogOut size={14} strokeWidth={1.5} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
