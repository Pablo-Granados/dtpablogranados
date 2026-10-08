-- Consultas del formulario de equipos (/equipos).
-- Ejecutar completo en Supabase → SQL Editor.
-- RLS activado y sin políticas: solo escribe la API con la service_role.

create table if not exists public.solicitudes_equipos (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nombre        text not null,
  email         text not null,
  whatsapp      text,
  organizacion  text not null,
  rol           text not null,
  necesidad     text not null,
  deporte       text not null,
  nivel         text not null,
  contexto      text not null,
  utm           jsonb not null default '{}'::jsonb,
  -- Seguimiento manual: nueva / llamada / propuesta / cerrada / descartada
  estado        text not null default 'nueva'
);

alter table public.solicitudes_equipos enable row level security;
