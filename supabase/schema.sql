-- ============================================================
-- Video Manager Pro — Schema de Supabase
-- Pega esto en el SQL Editor de tu proyecto en supabase.com
-- ============================================================

-- Tabla de proyectos
create table if not exists proyectos (
  id            text        primary key,
  nombre        text        not null default '',
  cliente       text        not null default '',
  fecha_entrega text        not null default '',
  estado        text        not null default 'pendiente',
  precio        numeric     not null default 0,
  material      text        not null default '',
  notas         text        not null default '',
  fecha_inicio  text,
  prioridad     text,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now()
);

-- Tabla de recursos
create table if not exists recursos (
  id          text        primary key,
  nombre      text        not null default '',
  url         text        not null default '',
  cliente     text        not null default '',
  descripcion text        not null default '',
  created_at  timestamptz not null default now()
);

-- RLS habilitado con acceso público (app personal sin auth)
alter table proyectos enable row level security;
alter table recursos  enable row level security;

create policy "public_all" on proyectos for all to anon using (true) with check (true);
create policy "public_all" on recursos  for all to anon using (true) with check (true);
