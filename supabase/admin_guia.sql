-- Guía del panel (/admin → Guía): manual, plan y seguimiento, referencia. Editable desde el panel.
-- Ejecutar en Supabase → SQL Editor (proyecto de la web). Se puede correr más de una vez.
-- RLS activado y sin políticas: solo accede la API del panel con la service_role.
-- La tabla empieza vacía: en el panel, "Habilitar edición" carga la guía inicial.

create table if not exists public.admin_guia (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  seccion     text not null,
  titulo      text not null,
  orden       integer not null default 0,
  contenido   text not null
);

alter table public.admin_guia enable row level security;
