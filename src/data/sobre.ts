/**
 * Página /sobre-mi. Solo lo que Pablo confirmó: sin datos inventados ni el club actual.
 * Los momentos concretos (primera vez que un dato cambió una decisión, etc.) se suman cuando los cuente.
 */

export const about = {
  title: 'Entrené, analicé y después construí las herramientas que me faltaban',
  lead: 'Soy Pablo Granados. Analizo fútbol y futsal, construyo las herramientas para hacerlo y enseño el proceso.',
};

/** Recorrido, en orden. */
export const path = [
  {
    title: 'Entrenador',
    when: 'Desde 2019',
    body: 'Entrené futsal en primera división, en femenino y en inferiores. Desde el banco aprendí qué información sirve y cuál no llega nunca a la cancha.',
  },
  {
    title: 'Análisis',
    when: 'Hasta mayo de 2026, en remoto',
    body: 'Empecé a analizar partidos y trabajé para clubes de Argentina y de España. Fui videoanalista a distancia de Valdetires Ferrol, de España, hasta mayo de 2026.',
  },
  {
    title: 'Contenido',
    when: 'Hoy',
    body: 'Publico análisis y resúmenes de futsal en YouTube e Instagram: más de 200 videos, más de 1.100 suscriptores en YouTube y unas 100 mil visualizaciones por mes en Instagram.',
  },
  {
    title: 'Herramientas de terceros',
    when: 'Siempre',
    body: 'Uso e implemento las herramientas que ya existen para el análisis de video y de datos.',
  },
  {
    title: 'Herramientas propias',
    when: '2023 en adelante',
    body: 'Cuando lo que existía no alcanzaba, construí lo mío: Futsal Hub, la plataforma de datos del futsal de Rosario, y el sitio de LAA Sports para una agencia de representación.',
  },
  {
    title: 'Automatización, datos e informes',
    when: 'Hoy',
    body: 'Automatizo las tareas repetitivas para que el tiempo vaya al análisis, y convierto los datos en informes que un cuerpo técnico pueda leer y usar.',
  },
] as const;

export const why = {
  title: 'Por qué construyo',
  body: [
    'Empecé a crear porque me gusta ayudar a las personas que, por ahí, no tienen acceso a algunas cosas, y para contribuir al crecimiento del deporte.',
  ],
};

export const credentials = [
  { label: 'Licencia A de DT de futsal', detail: 'CONMEBOL, vía ATFA' },
  { label: 'Videoanalista remoto', detail: 'Valdetires Ferrol, España · hasta mayo de 2026' },
  { label: 'Futsal Hub', detail: 'Plataforma de datos del futsal de Rosario · desde 2023' },
  { label: 'LAA Sports', detail: 'Sitio y panel de administración para una agencia · 2026' },
] as const;
