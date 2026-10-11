-- Mentorados conectados con prospectos y ventas, y enlaces de entregables.
-- Ejecutar en Supabase → SQL Editor (proyecto de la web), después de admin_mentorados.sql.
-- Se puede correr más de una vez. RLS activado y sin políticas: solo accede la API del panel.

-- Prospecto del que viene cada mentorado
alter table public.admin_mentorados
  add column if not exists contacto_id uuid references public.admin_contactos(id) on delete set null;

-- Enlaces a los entregables y materiales de cada mentorado
create table if not exists public.admin_mentorado_links (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  mentorado_id  uuid not null references public.admin_mentorados(id) on delete cascade,
  semana        integer,
  titulo        text not null,
  url           text not null,
  tipo          text not null default 'Entregable'
);

create index if not exists admin_mentorado_links_m_idx on public.admin_mentorado_links (mentorado_id);

alter table public.admin_mentorado_links enable row level security;
