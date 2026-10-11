-- Fases 3 y 4 del panel: origen y renovación de ventas, resultados de contenido.
-- Ejecutar en Supabase → SQL Editor (proyecto de la web), después de los SQL anteriores.
-- Se puede correr más de una vez.

-- Ventas: de dónde vino el cliente, si se renueva cada mes y si sigue activa
alter table public.admin_ventas
  add column if not exists origen     text,
  add column if not exists recurrente boolean default false,
  add column if not exists activa     boolean default true;

-- Contenido: resultados cargados a mano cada semana
alter table public.admin_contenido
  add column if not exists vistas        integer,
  add column if not exists interacciones integer,
  add column if not exists mensajes      integer;
