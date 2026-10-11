-- Textos editables desde el panel: los mensajes de contacto y las 12 semanas del programa.
-- Ejecutar en Supabase → SQL Editor (proyecto de la web). Se puede correr más de una vez.
-- RLS activado y sin políticas: solo accede la API del panel con la service_role.
-- Las tablas empiezan vacías: en el panel, "Habilitar edición" carga los textos iniciales.

create table if not exists public.admin_mensajes (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  titulo       text not null,
  paso         text not null,
  tipos        text,
  origenes     text,
  texto        text not null,
  avanza       text,
  seguimiento  text not null default 'no cambia',
  dias         integer,
  orden        integer not null default 0
);

create table if not exists public.admin_programa (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  semana           integer not null unique,
  titulo           text not null,
  tipo             text not null,
  objetivo         text,
  antes            text,
  llamada          text,
  tarea            text,
  entregable       text,
  devolucion       text,
  herramientas     text,
  avanza           text,
  var_principiante text,
  var_campo        text,
  var_analista     text,
  var_pf           text,
  var_aficionado   text
);

alter table public.admin_mensajes enable row level security;
alter table public.admin_programa enable row level security;
