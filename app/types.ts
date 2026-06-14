export type EstadoProyecto = 'pendiente' | 'editando' | 'revision' | 'entregado' | 'pagado' | 'en_espera';
export type Prioridad = 'alta' | 'media' | 'baja';
export const PRIORIDADES: Prioridad[] = ['alta', 'media', 'baja'];
export const PRIORIDAD_CONFIG: Record<Prioridad, { label: string; color: string }> = {
  alta:  { label: 'Alta',  color: '#ef4444' },
  media: { label: 'Media', color: '#f59e0b' },
  baja:  { label: 'Baja',  color: '#6b7280' },
};

export type CardMode = 'normal' | 'minimal';

export interface CardPreferences {
  mode: CardMode;
  showCliente: boolean;
  showEstado: boolean;
  showPrecio: boolean;
  showFecha: boolean;
  showNotas: boolean;
  showMaterial: boolean;
}

export const DEFAULT_CARD_PREFS: CardPreferences = {
  mode: 'normal',
  showCliente: true,
  showEstado: true,
  showPrecio: true,
  showFecha: false,
  showNotas: false,
  showMaterial: false,
};

export interface Proyecto {
  id: string;
  nombre: string;
  cliente: string;
  fechaEntrega: string; // YYYY-MM-DD
  estado: EstadoProyecto;
  precio: number;
  material: string;
  notas: string;
  fechaInicio?: string; // YYYY-MM-DD — fecha en que se recibió el material
  prioridad?: Prioridad;
}

export const ESTADOS: EstadoProyecto[] = ['pendiente', 'editando', 'revision', 'entregado', 'pagado', 'en_espera'];

export interface Recurso {
  id: string;
  nombre: string;
  url: string;
  cliente: string;
  descripcion: string;
}

export const ESTADO_CONFIG: Record<EstadoProyecto, {
  label: string;
  border: string;
  badge: string;
  dot: string;
}> = {
  pendiente: {
    label: 'Pendiente',
    border: 'border-l-yellow-400',
    badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    dot: 'bg-yellow-400',
  },
  editando: {
    label: 'En edición',
    border: 'border-l-blue-400',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-400',
  },
  revision: {
    label: 'Revisión',
    border: 'border-l-purple-400',
    badge: 'bg-purple-50 text-purple-700 border border-purple-200',
    dot: 'bg-purple-400',
  },
  entregado: {
    label: 'Entregado',
    border: 'border-l-green-400',
    badge: 'bg-green-50 text-green-700 border border-green-200',
    dot: 'bg-green-500',
  },
  pagado: {
    label: 'Pagado',
    border: 'border-l-gray-300',
    badge: 'bg-gray-100 text-gray-500 border border-gray-200',
    dot: 'bg-gray-400',
  },
  en_espera: {
    label: 'En espera',
    border: 'border-l-cyan-500',
    badge: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    dot: 'bg-cyan-500',
  },
};
