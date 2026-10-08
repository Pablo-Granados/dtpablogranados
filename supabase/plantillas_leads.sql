-- Descargas de plantillas gratuitas y suscripciones a avisos (/plantillas).
-- Ejecutar completo en Supabase → SQL Editor.
-- RLS activado y sin políticas: solo escribe la API con la service_role.

create table if not exists public.plantillas_leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null,
  nombre      text,
  -- slug de la plantilla descargada; null si solo pidió el aviso
  plantilla   text,
  -- true si tildó "avisame cuando salga la próxima"
  avisos      boolean not null default false,
  utm         jsonb not null default '{}'::jsonb
);

create index if not exists plantillas_leads_email_idx on public.plantillas_leads (email);

alter table public.plantillas_leads enable row level security;

-- Para mandar un aviso: lista única de mails que aceptaron
-- select distinct email from public.plantillas_leads where avisos;
