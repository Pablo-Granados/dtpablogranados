-- Limpieza de filas de prueba. NO borra nada por sí solo: primero mirás, después borrás lo que sea tuyo.
-- Ejecutar en Supabase → SQL Editor, de a un bloque por vez.

-- 1) Mirá qué hay en cada tabla (mails y fechas), para reconocer tus pruebas
select 'plantillas_leads' as tabla, id, created_at, email, nombre from public.plantillas_leads order by created_at desc;
select 'clips' as tabla, id, created_at, email, nombre from public.clips order by created_at desc;
select 'diagnosticos' as tabla, id, created_at, email, nombre from public.diagnosticos order by created_at desc;
select 'aplicaciones' as tabla, id, created_at, email, nombre from public.aplicaciones order by created_at desc;
select 'solicitudes_equipos' as tabla, id, created_at, email, nombre from public.solicitudes_equipos order by created_at desc;

-- 2) Borrá solo lo tuyo. Cambiá los mails por los que usaste para probar y sacá los dos guiones del inicio de cada línea.
-- delete from public.plantillas_leads      where email in ('tu-mail-de-prueba@ejemplo.com');
-- delete from public.clips                 where email in ('tu-mail-de-prueba@ejemplo.com');
-- delete from public.diagnosticos          where email in ('tu-mail-de-prueba@ejemplo.com');
-- delete from public.aplicaciones          where email in ('tu-mail-de-prueba@ejemplo.com');
-- delete from public.solicitudes_equipos   where email in ('tu-mail-de-prueba@ejemplo.com');
