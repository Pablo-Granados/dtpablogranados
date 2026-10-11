-- Panel privado (/admin): tareas, contenido, prospectos, registro y metas.
-- Ejecutar completo en Supabase → SQL Editor (proyecto de la web). Se puede correr más de una vez.
-- RLS activado y sin políticas: solo accede la API del panel con la service_role.

create table if not exists public.admin_tareas (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  titulo        text not null,
  detalle       text,
  estado        text not null default 'pendiente',
  prioridad     text not null default 'media',
  fecha_limite  date
);

create table if not exists public.admin_contenido (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  titulo      text not null,
  tipo        text not null default 'Dato de la semana',
  canal       text not null default 'Instagram',
  fecha       date,
  estado      text not null default 'idea',
  enlace      text,
  resultado   text,
  notas       text
);

create table if not exists public.admin_contactos (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  nombre               text not null,
  organizacion         text,
  tipo                 text not null default 'Club local',
  canal                text not null default 'Instagram',
  estado               text not null default 'Por contactar',
  proximo_seguimiento  date,
  contacto             text,
  notas                text
);

create table if not exists public.admin_registro (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  fecha       date not null,
  tipo        text not null,
  cantidad    numeric not null,
  nota        text
);

create index if not exists admin_registro_fecha_idx on public.admin_registro (fecha);

create table if not exists public.admin_metas (
  tipo      text primary key,
  etiqueta  text not null,
  objetivo  numeric not null,
  periodo   text not null default 'semana'
);

alter table public.admin_tareas    enable row level security;
alter table public.admin_contenido enable row level security;
alter table public.admin_contactos enable row level security;
alter table public.admin_registro  enable row level security;
alter table public.admin_metas     enable row level security;

-- Metas iniciales (se editan desde el panel)
insert into public.admin_metas (tipo, etiqueta, objetivo, periodo) values
  ('mensajes',       'Mensajes enviados',            25,   'semana'),
  ('conversaciones', 'Conversaciones (respuestas)',   5,   'semana'),
  ('informes',       'Informes de cortesía',          2,   'semana'),
  ('publicaciones',  'Publicaciones',                 3,   'semana'),
  ('ventas',         'Ventas cerradas',               2,   'mes'),
  ('ingresos',       'Ingresos (USD)',             2000,   'mes')
on conflict (tipo) do nothing;

-- Estado y notas en los contactos que entran por los formularios
alter table public.diagnosticos      add column if not exists estado text not null default 'nuevo';
alter table public.plantillas_leads  add column if not exists estado text not null default 'nuevo';

alter table public.diagnosticos         add column if not exists notas text;
alter table public.aplicaciones         add column if not exists notas text;
alter table public.solicitudes_equipos  add column if not exists notas text;
alter table public.plantillas_leads     add column if not exists notas text;
alter table public.clips                add column if not exists notas text;
