-- Mentorados de Sistema Propio: una ficha por persona y sus 12 semanas (panel /admin → Mentoría → Mentorados).
-- Ejecutar en Supabase → SQL Editor (proyecto de la web), después de los SQL anteriores.
-- Se puede correr más de una vez. RLS activado y sin políticas: solo accede la API del panel.

create table if not exists public.admin_mentorados (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  nombre        text not null,
  email         text,
  perfil        text,
  cohorte       text not null default 'Estándar',
  inicio        date not null,
  estado        text not null default 'activo',
  equipo        text,
  objetivo      text,
  trabado       text,
  control_fecha date,
  venta_id      uuid references public.admin_ventas(id) on delete set null,
  notas         text
);

create table if not exists public.admin_mentorado_semanas (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  mentorado_id     uuid not null references public.admin_mentorados(id) on delete cascade,
  semana           integer not null,
  estado           text not null default 'pendiente',
  fecha_llamada    date,
  plan             text,
  notas            text,
  tarea            text,
  entregable_en    date,
  devolucion_url   text,
  unique (mentorado_id, semana)
);

create index if not exists admin_mentorado_semanas_m_idx on public.admin_mentorado_semanas (mentorado_id);

alter table public.admin_mentorados         enable row level security;
alter table public.admin_mentorado_semanas  enable row level security;
