'use client';
import { Plus } from 'lucide-react';

type Vista = 'dashboard' | 'calendario' | 'tabla' | 'ajustes' | 'recursos' | 'ingresos';

const TITLES: Record<Vista, { title: string; subtitle: string }> = {
  dashboard:  { title: 'Hoy',                 subtitle: 'Resumen del día y prioridades' },
  calendario: { title: 'Calendario',          subtitle: 'Vista de entregas por fecha' },
  tabla:      { title: 'Tablero',              subtitle: 'Vista Kanban de todos los proyectos' },
  ajustes:    { title: 'Personalizar',         subtitle: 'Configura qué se muestra en las tarjetas' },
  recursos:   { title: 'Recursos',             subtitle: 'Accesos directos organizados por cliente' },
  ingresos:   { title: 'Ingresos',             subtitle: 'Resumen financiero de todos los proyectos' },
};

interface Props {
  vista: Vista;
  onNewProject: () => void;
}

export function Header({ vista, onNewProject }: Props) {
  const { title, subtitle } = TITLES[vista];

  return (
    <header
      className="flex items-center justify-between px-8 shrink-0"
      style={{ height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      <div>
        <h1 className="text-base font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      </div>

      {vista === 'calendario' || vista === 'tabla' ? (
        <button
          onClick={onNewProject}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-all"
          style={{ background: 'var(--text-primary)', color: '#f7f6f3', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          <Plus size={14} strokeWidth={2} />
          Nuevo proyecto
        </button>
      ) : null}
    </header>
  );
}
