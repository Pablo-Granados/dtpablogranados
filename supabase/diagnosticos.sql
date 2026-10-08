-- Resultados del diagnóstico del analista (/diagnostico).
-- Ejecutar completo en Supabase → SQL Editor.
-- RLS activado y sin políticas: solo escribe la API con la service_role.

create table if not exists public.diagnosticos (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  nombre       text not null,
  email        text not null,
  rol          text not null,
  respuestas   jsonb not null,
  puntajes     jsonb not null,
  total        integer not null,
  nivel        text not null,
  prioridades  text[] not null default '{}',
  utm          jsonb not null default '{}'::jsonb
);

alter table public.diagnosticos enable row level security;
