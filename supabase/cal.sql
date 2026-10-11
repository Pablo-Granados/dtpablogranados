-- Integración con Cal.com: las reservas se registran solas en el panel.
-- Ejecutar en Supabase → SQL Editor (proyecto de la web), después de admin_mentorados.sql.
-- Se puede correr más de una vez. RLS activado y sin políticas: solo accede la API con la service_role.

-- Hora y reserva de cada llamada de mentoría
alter table public.admin_mentorado_semanas
  add column if not exists hora_llamada text,
  add column if not exists cal_uid      text;

-- Registro de todas las reservas que llegan desde Cal.com
create table if not exists public.admin_reservas (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  uid           text not null unique,
  evento        text,
  nombre        text,
  email         text,
  inicio        timestamptz not null,
  estado        text not null default 'confirmada',
  mentorado_id  uuid references public.admin_mentorados(id) on delete set null,
  contacto_id   uuid references public.admin_contactos(id) on delete set null
);

create index if not exists admin_reservas_inicio_idx on public.admin_reservas (inicio);

alter table public.admin_reservas enable row level security;
