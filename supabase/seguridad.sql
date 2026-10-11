-- Seguridad de los formularios públicos: freno de abusos y acceso que solo puede insertar.
-- Ejecutar en Supabase → SQL Editor (proyecto de la web). Se puede correr más de una vez.
-- Orden: 1) correr este archivo, 2) recién después cargar SUPABASE_ANON_KEY en Vercel.

/* ---------- 1. Freno de abusos por IP ---------- */
create table if not exists public.rate_limits (
  key        text    not null,
  bucket     bigint  not null,
  hits       integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (key, bucket)
);

alter table public.rate_limits enable row level security;

-- Cuenta un intento y dice si todavía está dentro del límite (true) o lo superó (false).
create or replace function public.rate_hit(p_key text, p_limit integer, p_window integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  b bigint := floor(extract(epoch from now()) / p_window);
  h integer;
begin
  insert into public.rate_limits (key, bucket, hits) values (p_key, b, 1)
  on conflict (key, bucket) do update set hits = public.rate_limits.hits + 1
  returning hits into h;

  -- Limpieza ocasional de registros viejos
  if random() < 0.02 then
    delete from public.rate_limits where created_at < now() - interval '2 days';
  end if;

  return h <= p_limit;
end;
$$;

revoke all on function public.rate_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_hit(text, integer, integer) to service_role;

/* ---------- 2. Acceso público que solo puede insertar ---------- */
-- Con esto, los formularios pueden usar la clave pública (anon): puede agregar filas, pero no leer, cambiar ni borrar nada.
do $$
declare t text;
begin
  foreach t in array array['diagnosticos', 'aplicaciones', 'solicitudes_equipos', 'plantillas_leads', 'clips'] loop
    execute format('drop policy if exists insert_publico on public.%I', t);
    execute format('create policy insert_publico on public.%I for insert to anon with check (true)', t);
    execute format('revoke select, update, delete on public.%I from anon', t);
    execute format('grant insert on public.%I to anon', t);
  end loop;
end $$;
