'use client';
import { useState, useMemo, useCallback } from 'react';
import {
  DndContext, DragEndEvent, DragStartEvent, DragOverlay,
  PointerSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';
import { useProjects } from './hooks/useProjects';
import { useCardPreferences } from './hooks/useCardPreferences';
import { useRecursos } from './hooks/useRecursos';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Proyecto } from './types';
import { getWeekStart, getTodayISO, toISODate, addDays } from './utils/dates';
import { CardPrefsContext } from './context/CardPrefsContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FilterBar, Filtros, FILTROS_EMPTY } from './components/FilterBar';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { TableView } from './components/TableView';
import { SettingsView } from './components/SettingsView';
import { RecursosView } from './components/RecursosView';
import { IngresosView } from './components/IngresosView';
import { DashboardView } from './components/DashboardView';
import { ProjectModal } from './components/ProjectModal';
import { SidePanel } from './components/SidePanel';
import { BulkEditPanel } from './components/BulkEditPanel';
import { ProjectCard } from './components/ProjectCard';

type Vista = 'dashboard' | 'calendario' | 'tabla' | 'ajustes' | 'recursos' | 'ingresos';

export default function Home() {
  const { user, role, loading: authLoading } = useAuth();

  const {
    proyectos, agregarProyecto, editarProyecto, eliminarProyecto,
    editarProyectosMasa, eliminarProyectosMasa, importarProyectos,
    reordenarProyectos, loaded,
  } = useProjects(!authLoading && !!user);

  const { prefs, updatePref, resetPrefs } = useCardPreferences();
  const { recursos, agregarRecurso, editarRecurso, eliminarRecurso } = useRecursos();

  const [vista, setVista]         = useState<Vista>('dashboard');
  const [calView, setCalView]     = useState<'week' | 'month'>('week');
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [proyectoEditando, setProyectoEditando] = useState<Proyecto | null>(null);
  const [modal, setModal]         = useState<{ open: boolean; fecha?: string }>({ open: false });
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [filtros, setFiltros]     = useState<Filtros>(FILTROS_EMPTY);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());


  // ── Selection ────────────────────────────────────────────────────────
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setProyectoEditando(null);
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleCardClick = useCallback((p: Proyecto) => {
    if (selectedIds.size > 0) toggleSelection(p.id);
    else setProyectoEditando(p);
  }, [selectedIds.size, toggleSelection]);

  // ── Filters ──────────────────────────────────────────────────────────
  const clientes = useMemo(() => {
    const set = new Set(proyectos.filter(p => p.cliente.trim()).map(p => p.cliente.trim()));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [proyectos]);

  const proyectosFiltrados = useMemo(() => proyectos.filter(p => {
    if (filtros.clientesOcultos.length > 0 && filtros.clientesOcultos.includes(p.cliente.trim())) return false;
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      if (!p.nombre.toLowerCase().includes(q) && !p.cliente.toLowerCase().includes(q)) return false;
    }
    if (!filtros.estados.includes(p.estado)) return false;
    if (filtros.cliente && p.cliente.trim() !== filtros.cliente) return false;
    if (filtros.fecha !== 'todos') {
      const hoy = getTodayISO();
      if (filtros.fecha === 'hoy' && p.fechaEntrega !== hoy) return false;
      if (filtros.fecha === 'semana') {
        const s = toISODate(getWeekStart(new Date()));
        const e = toISODate(addDays(getWeekStart(new Date()), 6));
        if (p.fechaEntrega < s || p.fechaEntrega > e) return false;
      }
      if (filtros.fecha === 'mes') {
        const now = new Date();
        const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        if (!p.fechaEntrega.startsWith(prefix)) return false;
      }
    }
    return true;
  }), [proyectos, filtros]);

  // ── Drag & drop ──────────────────────────────────────────────────────
  const activeProject    = activeDragId ? proyectos.find(p => p.id === activeDragId) ?? null : null;
  const draggingSelected = !!activeDragId && selectedIds.has(activeDragId) && selectedIds.size > 1;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = ({ active }: DragStartEvent) => setActiveDragId(active.id as string);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDragId(null);
    if (!over || active.id === over.id) return;

    const activeId  = active.id as string;
    const overId    = over.id as string;
    const activeProj = proyectos.find(p => p.id === activeId);
    if (!activeProj) return;

    // over.id is either a project id (dropped on a card) or a date string (dropped on empty column)
    const overProj    = proyectos.find(p => p.id === overId);
    const targetFecha = overProj ? overProj.fechaEntrega : overId;

    if (activeProj.fechaEntrega === targetFecha) {
      // Same column → reorder within the day
      if (overProj) reordenarProyectos(activeId, overId);
    } else {
      // Different column → move to new date
      if (selectedIds.has(activeId) && selectedIds.size > 1) {
        selectedIds.forEach(id => {
          const p = proyectos.find(proj => proj.id === id);
          if (p && p.fechaEntrega !== targetFecha) editarProyecto(id, { fechaEntrega: targetFecha });
        });
      } else {
        editarProyecto(activeId, { fechaEntrega: targetFecha });
      }
    }
  };

  // ── Auth + data guards ───────────────────────────────────────────────
  const spinner = (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-6 h-6 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'transparent' }} />
    </div>
  );
  if (authLoading) return spinner;
  if (!user) return <LoginPage />;
  if (!loaded) return spinner;

  // ── Calendar content ──────────────────────────────────────────────────
  const calendarContent = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {calView === 'week' ? (
          <WeeklyCalendar
            weekStart={weekStart}
            proyectos={proyectosFiltrados}
            onWeekChange={setWeekStart}
            onCardClick={handleCardClick}
            onAddClick={fecha => setModal({ open: true, fecha })}
            selectedIds={selectedIds}
            onCardSelect={toggleSelection}
            activeDragId={activeDragId}
            draggingSelected={draggingSelected}
            onCardModeChange={m => updatePref('mode', m)}
            calView={calView}
            onCalViewChange={setCalView}
          />
        ) : (
          <MonthlyCalendar
            monthDate={monthDate}
            proyectos={proyectosFiltrados}
            onMonthChange={setMonthDate}
            onCardClick={handleCardClick}
            onAddClick={fecha => setModal({ open: true, fecha })}
            selectedIds={selectedIds}
            onCardSelect={toggleSelection}
            activeDragId={activeDragId}
            draggingSelected={draggingSelected}
            onCardModeChange={m => updatePref('mode', m)}
            calView={calView}
            onCalViewChange={setCalView}
          />
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeProject ? (
          <div style={{ position: 'relative' }}>
            <ProjectCard proyecto={activeProject} onClick={() => {}} overlay />
            {draggingSelected && (
              <div style={{
                position: 'absolute', top: -7, right: -7,
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--text-primary)', color: 'var(--bg)',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selectedIds.size}
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <CardPrefsContext.Provider value={prefs}>
      <div className="flex" style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>

        <Sidebar
          vista={vista}
          setVista={v => { setVista(v); clearSelection(); }}
          onImport={importarProyectos}
          proyectos={proyectos}
          role={role}
        />

        {/* ── Right column: header + main ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          <Header vista={vista} onNewProject={() => setModal({ open: true })} />

          {/* ── Main area ── */}
          <main className="flex-1 min-h-0 overflow-hidden flex flex-col">

            {vista === 'dashboard' ? (
              <DashboardView
                proyectos={proyectos}
                onCardClick={handleCardClick}
                selectedIds={selectedIds}
                onSelectAll={(ids) => setSelectedIds(prev => new Set([...prev, ...ids]))}
              />

            ) : vista === 'ajustes' ? (
              <div className="flex-1 overflow-y-auto" style={{ padding: '28px 32px' }}>
                <SettingsView prefs={prefs} onUpdate={updatePref} onReset={resetPrefs} />
              </div>

            ) : vista === 'tabla' ? (
              <>
                <div
                  className="shrink-0 flex items-center"
                  style={{ padding: '6px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                >
                  <FilterBar filtros={filtros} clientes={clientes} onChange={setFiltros} compact />
                </div>
                <div className="flex-1 min-h-0 flex overflow-hidden">
                  <TableView
                  proyectos={proyectosFiltrados}
                  onEdit={handleCardClick}
                  onStatusChange={(id, estado) => editarProyecto(id, { estado })}
                />
                </div>
              </>

            ) : vista === 'recursos' ? (
              <RecursosView
                recursos={recursos}
                clientesSugeridos={clientes}
                onAdd={agregarRecurso}
                onEdit={editarRecurso}
                onDelete={eliminarRecurso}
              />

            ) : vista === 'ingresos' ? (
              role === 'clipper'
                ? <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text-muted)', fontSize: 14 }}>Acceso restringido</div>
                : <IngresosView proyectos={proyectos} />

            ) : (
              // ── Calendario — calendar is everything ──
              <>
                {/* Compact filter strip */}
                <div
                  className="shrink-0 flex items-center"
                  style={{ padding: '6px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                >
                  <FilterBar filtros={filtros} clientes={clientes} onChange={setFiltros} compact />
                </div>

                {/* Calendar — fills all remaining height */}
                {calendarContent}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── Panels (fixed overlay) ── */}
      {vista !== 'ajustes' && vista !== 'recursos' && vista !== 'ingresos' && (
        selectedIds.size > 0 ? (
          <BulkEditPanel
            selectedIds={selectedIds}
            proyectos={proyectos}
            onClose={clearSelection}
            onApply={editarProyectosMasa}
            onDelete={eliminarProyectosMasa}
          />
        ) : (
          <SidePanel
            proyecto={proyectoEditando}
            onClose={() => setProyectoEditando(null)}
            onSave={editarProyecto}
            onDelete={eliminarProyecto}
          />
        )
      )}

      {modal.open && (
        <ProjectModal
          fechaInicial={modal.fecha}
          onClose={() => setModal({ open: false })}
          onSave={p => { agregarProyecto(p); setModal({ open: false }); }}
        />
      )}
    </CardPrefsContext.Provider>
  );
}
