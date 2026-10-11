-- Fase 1 del panel: embudo, historial de estados, mail único por prospecto y vínculo venta → prospecto.
-- Ejecutar en Supabase → SQL Editor (proyecto de la web), después de admin.sql y admin_ventas.sql.
-- Se puede correr más de una vez. RLS activado y sin políticas: solo accede la API del panel.

alter table public.admin_contactos add column if not exists email  text;
alter table public.admin_contactos add column if not exists origen text;

-- Un mismo mail no puede estar dos veces entre los prospectos (sin distinguir mayúsculas)
create unique index if not exists admin_contactos_email_uk
  on public.admin_contactos (lower(email))
  where email is not null and email <> '';

-- Qué prospecto originó cada venta
alter table public.admin_ventas
  add column if not exists contacto_id uuid references public.admin_contactos(id) on delete set null;

-- Historial de cada prospecto (cambios de estado ahora; notas en la fase 2)
create table if not exists public.admin_contacto_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  contacto_id uuid not null references public.admin_contactos(id) on delete cascade,
  tipo        text not null default 'estado',
  estado      text,
  texto       text
);

create index if not exists admin_contacto_log_contacto_idx on public.admin_contacto_log (contacto_id);

alter table public.admin_contacto_log enable row level security;
