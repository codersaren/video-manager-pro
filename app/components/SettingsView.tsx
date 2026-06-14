'use client';
import { RotateCcw, AlignLeft, Dot } from 'lucide-react';
import { CardPreferences, CardMode } from '../types';
import { ProjectCard } from './ProjectCard';
import { CardPrefsContext } from '../context/CardPrefsContext';

const SAMPLE_PROJECT = {
  id: '__preview__',
  nombre: 'Reel de boda · María & Tomás',
  cliente: 'María García',
  fechaEntrega: new Date().toISOString().split('T')[0],
  estado: 'editando' as const,
  precio: 350,
  material: 'https://drive.google.com',
  notas: 'Música de Coldplay, corte de 90 segundos, sin texto en pantalla.',
};

interface FieldRow {
  key: keyof CardPreferences;
  label: string;
  description: string;
}

const FIELDS: FieldRow[] = [
  { key: 'showCliente',  label: 'Cliente',          description: 'Nombre del cliente debajo del título' },
  { key: 'showEstado',   label: 'Estado',            description: 'Etiqueta de color con el estado actual' },
  { key: 'showPrecio',   label: 'Precio',            description: 'Importe del proyecto en euros' },
  { key: 'showFecha',    label: 'Fecha de entrega',  description: 'Fecha límite visible dentro de la tarjeta' },
  { key: 'showNotas',    label: 'Notas',             description: 'Vista previa de las instrucciones (2 líneas)' },
  { key: 'showMaterial', label: 'Link de material',  description: 'Icono de enlace al drive / carpeta' },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      aria-checked={value}
      role="switch"
      style={{
        width: 36, height: 20,
        borderRadius: 10,
        background: value ? 'var(--text-primary)' : 'var(--border-strong)',
        position: 'relative',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.15s',
      }}
    >
      <span style={{
        position: 'absolute',
        top: 2,
        left: value ? 18 : 2,
        width: 16, height: 16,
        borderRadius: '50%',
        background: '#ffffff',
        transition: 'left 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        display: 'block',
      }} />
    </button>
  );
}

interface Props {
  prefs: CardPreferences;
  onUpdate: <K extends keyof CardPreferences>(key: K, value: CardPreferences[K]) => void;
  onReset: () => void;
}

export function SettingsView({ prefs, onUpdate, onReset }: Props) {
  return (
    <div className="max-w-2xl mx-auto py-2">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Personalización
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Elige qué información se muestra en cada tarjeta del calendario.
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-all"
          style={{
            color: 'var(--text-muted)',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: 'var(--border)',
            background: 'transparent',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <RotateCcw size={12} strokeWidth={1.5} />
          Restablecer
        </button>
      </div>

      <div className="grid grid-cols-[1fr_220px] gap-10 items-start">
        {/* ── Left column ── */}
        <div className="space-y-5">

        {/* ── Mode selector ── */}
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Modo de visualización
            </p>
          </div>
          <div className="grid grid-cols-2" style={{ background: 'var(--surface)' }}>
            {([
              {
                value: 'normal' as CardMode,
                label: 'Detalle',
                desc: 'Nombre, cliente, estado y precio',
                icon: AlignLeft,
              },
              {
                value: 'minimal' as CardMode,
                label: 'Compacto',
                desc: 'Solo el color del estado, sin texto',
                icon: Dot,
              },
            ]).map(({ value, label, desc, icon: Icon }, i) => {
              const active = prefs.mode === value;
              return (
                <button
                  key={value}
                  onClick={() => onUpdate('mode', value)}
                  className="flex flex-col items-start gap-2 p-4 text-left transition-all"
                  style={{
                    background: active ? 'var(--text-primary)' : 'var(--surface)',
                    color: active ? '#f7f6f3' : 'var(--text-primary)',
                    borderRight: i === 0 ? '1px solid var(--border)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: active ? 'rgba(247,246,243,0.65)' : 'var(--text-muted)' }}>
                      {desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Field toggles ── */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)', opacity: prefs.mode === 'minimal' ? 0.4 : 1, pointerEvents: prefs.mode === 'minimal' ? 'none' : 'auto' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Campos de la tarjeta
            </p>
          </div>

          {/* Nombre — always on */}
          <div
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nombre</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Título principal — siempre visible
              </p>
            </div>
            <div
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: 'var(--surface-hover)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              Fijo
            </div>
          </div>

          {FIELDS.map(({ key, label, description }, i) => (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-3.5 transition-colors"
              style={{
                borderBottom: i < FIELDS.length - 1 ? '1px solid var(--border)' : 'none',
                background: 'var(--surface)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
              </div>
              <Toggle value={prefs[key] as boolean} onChange={v => onUpdate(key, v as CardPreferences[typeof key])} />
            </div>
          ))}
        </div>

        </div>{/* end left column */}

        {/* ── Live preview ── */}
        <div className="sticky top-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Vista previa
          </p>
          <div style={{ maxWidth: 220 }}>
            <CardPrefsContext.Provider value={prefs}>
              <ProjectCard
                proyecto={SAMPLE_PROJECT}
                onClick={() => {}}
              />
            </CardPrefsContext.Provider>
          </div>
          <p className="text-xs mt-3 leading-snug" style={{ color: 'var(--text-muted)' }}>
            Así se verá cada tarjeta en el calendario y la tabla.
          </p>
        </div>
      </div>
    </div>
  );
}
