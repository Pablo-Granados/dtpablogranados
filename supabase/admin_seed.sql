-- Datos iniciales del panel: calendario de contenido de 4 semanas y tareas de arranque.
-- Ejecutar DESPUÉS de admin.sql. Las fechas parten del próximo lunes.
-- Se puede correr de nuevo sin duplicar (no inserta lo que ya existe con el mismo título).

with base as (
  select (date_trunc('week', current_date) + interval '7 days')::date as lunes
),
piezas(sem, dia, titulo, tipo, notas) as (
  values
    (0, 0, 'Rachas de la fecha: quién viene sin perder y quién sin ganar', 'Dato de la semana', 'Semana 1 · solo voz y pantalla · palabra clave: DIAGNÓSTICO'),
    (0, 2, 'Penales: ¿dónde patean?', 'Análisis en 60 s', 'Semana 1 · solo voz y pantalla · palabra clave: DIAGNÓSTICO'),
    (0, 4, 'Cómo armé el mapa de calor de Futsal Hub', 'Detrás de la herramienta', 'Semana 1 · solo voz y pantalla · palabra clave: DIAGNÓSTICO'),
    (1, 0, 'Historial entre dos equipos que juegan este fin de semana', 'Dato de la semana', 'Semana 2 · 10 segundos en cámara al final · palabra clave: CLUB'),
    (1, 2, 'Sobreposición en futsal', 'Análisis en 60 s', 'Semana 2 · 10 segundos en cámara al final · palabra clave: CLUB'),
    (1, 4, 'Cómo hice el sitio de una agencia en menos de una semana', 'Detrás de la herramienta', 'Semana 2 · 10 segundos en cámara al final · palabra clave: CLUB'),
    (2, 0, 'Promedio de goles por categoría', 'Dato de la semana', 'Semana 3 · 20 a 30 segundos en cámara al inicio · palabra clave: PLANTILLA'),
    (2, 2, 'Una jugada de mi propio equipo', 'Análisis en 60 s', 'Semana 3 · con permiso del club y de los jugadores · palabra clave: PLANTILLA'),
    (2, 4, 'Cómo ordeno un informe de rival en una página', 'Detrás de la herramienta', 'Semana 3 · 20 a 30 segundos en cámara al inicio · palabra clave: PLANTILLA'),
    (3, 0, 'La tabla en la recta final', 'Dato de la semana', 'Semana 4 · voz en off · palabra clave: CLIP'),
    (3, 2, 'La Gitana: cómo se juega', 'Análisis en 60 s', 'Semana 4 · voz en off · palabra clave: CLIP'),
    (3, 4, 'Mi panel de codificación', 'Detrás de la herramienta', 'Semana 4 · reel completo a cámara (45 a 60 segundos) · palabra clave: CLIP')
)
insert into public.admin_contenido (titulo, tipo, canal, fecha, estado, notas)
select p.titulo, p.tipo, 'Instagram', b.lunes + (p.sem * 7 + p.dia), 'idea', p.notas
from piezas p, base b
where not exists (select 1 from public.admin_contenido c where c.titulo = p.titulo);

with base as (
  select (date_trunc('week', current_date) + interval '7 days')::date as lunes
),
t(titulo, detalle, dias, prioridad) as (
  values
    ('Configurar el link de la bio con etiquetas de medición', 'Un link por tipo de publicación para saber cuál trae gente.', 0, 'alta'),
    ('Armar la lista de 30 contactos', 'Clubes, cuerpos técnicos, agencias y entrenadores de la red.', 1, 'alta'),
    ('Elegir 3 equipos para el informe de cortesía', 'Pedirles el próximo rival y fijar una fecha de entrega.', 3, 'alta'),
    ('Pedir permiso para usar material de mi equipo', 'Al club y a los jugadores (a los responsables si son menores).', 4, 'media'),
    ('Grabar las 3 piezas de la semana 1', 'Sábado de grabación en bloque, unos 90 minutos.', 5, 'media'),
    ('Revisar Umami, formularios y mensajes recibidos', 'Revisión semanal de 30 minutos.', 6, 'media')
)
insert into public.admin_tareas (titulo, detalle, estado, prioridad, fecha_limite)
select t.titulo, t.detalle, 'pendiente', t.prioridad, b.lunes + t.dias
from t, base b
where not exists (select 1 from public.admin_tareas a where a.titulo = t.titulo);
