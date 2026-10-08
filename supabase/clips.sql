-- Clips enviados para el análisis público mensual (/clip).
-- Ejecutar completo en Supabase → SQL Editor.
-- RLS activado y sin políticas: solo escribe la API con la service_role.

create table if not exists public.clips (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  -- Mes de recepción (para elegir los clips de cada mes): 2026-10
  mes         text not null default to_char(now(), 'YYYY-MM'),
  nombre      text not null,
  email       text not null,
  instagram   text,
  link        text not null,
  minuto      text,
  pregunta    text not null,
  deporte     text not null,
  -- Autorizó que el clip se analice y se publique
  autoriza    boolean not null default true,
  utm         jsonb not null default '{}'::jsonb,
  -- Seguimiento manual: recibido / elegido / publicado / descartado
  estado      text not null default 'recibido'
);

create index if not exists clips_mes_idx on public.clips (mes);

alter table public.clips enable row level security;

-- Para elegir los clips del mes:
-- select nombre, email, instagram, link, minuto, pregunta from public.clips
--  where mes = to_char(now(), 'YYYY-MM') order by created_at;
