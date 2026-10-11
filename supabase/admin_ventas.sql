-- Ventas y cobros del panel (/admin → Ventas). Ejecutar en Supabase → SQL Editor (proyecto de la web).
-- Se puede correr más de una vez. RLS activado y sin políticas: solo accede la API del panel con la service_role.

create table if not exists public.admin_ventas (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  cliente     text not null,
  producto    text not null,
  fecha       date not null,
  notas       text
);

create table if not exists public.admin_cobros (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  venta_id     uuid not null references public.admin_ventas(id) on delete cascade,
  concepto     text not null,
  monto_usd    numeric not null,
  monto_ars    numeric,
  vencimiento  date not null,
  cobrado_en   date
);

create index if not exists admin_cobros_venta_idx on public.admin_cobros (venta_id);
create index if not exists admin_cobros_venc_idx  on public.admin_cobros (vencimiento);

alter table public.admin_ventas enable row level security;
alter table public.admin_cobros enable row level security;
