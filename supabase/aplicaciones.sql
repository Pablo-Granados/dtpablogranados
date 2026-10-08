-- Aplicaciones a Sistema Propio (/mentoria/aplicar).
-- Ejecutar completo en Supabase → SQL Editor.
-- RLS activado y sin políticas: solo escribe la API con la service_role.

create table if not exists public.aplicaciones (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nombre        text not null,
  email         text not null,
  whatsapp      text,
  rol           text not null,
  deporte       text not null,
  nivel         text not null,
  video         text not null,
  herramientas  text[] not null default '{}',
  objetivo      text not null,
  horas         text not null,
  inversion     text not null,
  calificada    boolean not null default false,
  motivos       text[] not null default '{}',
  utm           jsonb not null default '{}'::jsonb,
  -- Seguimiento manual: nueva / llamada / propuesta / cerrada / descartada
  estado        text not null default 'nueva'
);

alter table public.aplicaciones enable row level security;
