/**
 * Contenido central del sitio.
 * Todo el texto y los datos que cambian con el tiempo viven acá,
 * así los componentes quedan limpios y se actualiza en un solo lugar.
 */

export const site = {
  name: 'Pablo Granados',
  handle: '@dtpablogranados',
  tagline: 'Del partido a la decisión.',
  description:
    'Analista de fútbol y futsal. Analizo el juego, construyo las herramientas para hacerlo y enseño el proceso a entrenadores y analistas.',
  locale: 'es_AR',
  email: 'pablogranados22@gmail.com',
  social: {
    youtube: 'https://www.youtube.com/@dtpablogranados',
    instagram: 'https://www.instagram.com/dtpablogranados',
    linkedin: 'https://www.linkedin.com/in/pablongranados/',
  },
} as const;

/** Mientras no existan las páginas internas, el menú navega a las secciones de la Home. */
export const nav = [
  { label: 'Trabajar juntos', href: '/trabajar-juntos' },
  { label: 'Mentoría', href: '/mentoria' },
  { label: 'Equipos', href: '/trabajar-juntos#equipos' },
  { label: 'Proyectos', href: '/#proyectos' },
  { label: 'Contenido', href: '/contenido' },
  { label: 'Sobre mí', href: '/sobre-mi' },
] as const;

/** Link de WhatsApp con mensaje precargado (temporal, hasta tener formularios). */
export const wa = (msg: string) => `https://wa.me/543416287921?text=${encodeURIComponent(msg)}`;

/** Rutas de conversión. Un CTA por intención, nunca "Contactame" genérico. */
export const cta = {
  trabajar: { label: 'Ver cómo trabajamos', href: '/trabajar-juntos', event: 'cta_trabajar' },
  mentoria: { label: 'Ver la mentoría', href: '/mentoria', event: 'cta_mentoria' },
  aplicar: { label: 'Aplicar a Sistema Propio', href: '/mentoria/aplicar', event: 'cta_aplicar' },
  diagnostico: { label: 'Hacer el diagnóstico', href: '/diagnostico', event: 'cta_diagnostico' },
  propuesta: { label: 'Solicitar propuesta', href: '/equipos?necesidad=acompanamiento', event: 'cta_propuesta' },
  proyecto: { label: 'Contarme el proyecto', href: '/equipos?necesidad=herramientas', event: 'cta_proyecto' },
  proyectos: { label: 'Ver lo que construí', href: '/#proyectos', event: 'cta_proyectos' },
  youtube: { label: 'Ver en YouTube', href: site.social.youtube, event: 'out_youtube' },
} as const;

/** Franja de evidencia: solo datos verificables, sin adjetivos. */
export const evidence = [
  { value: '3.500+', label: 'partidos registrados en Futsal Hub desde 2023' },
  { value: '2.500+', label: 'visitas a Futsal Hub en 3 semanas' },
  { value: '100k', label: 'visualizaciones mensuales en Instagram' },
  { value: 'Lic. A', label: 'DT de futsal · CONMEBOL (vía ATFA)' },
] as const;

export type Project = {
  slug: string;
  name: string;
  kind: string;
  year: string;
  problem: string;
  built: string;
  result: string;
  stack: string[];
  href: string;
  external: string;
  externalLabel: string;
  media: { label: string; src?: string };
};

export const projects: Project[] = [
  {
    slug: 'futsal-hub',
    name: 'Futsal Hub',
    kind: 'Plataforma de datos · Producto propio',
    year: '2023 — hoy',
    problem:
      'La liga de futsal de Rosario no tenía un lugar donde consultar resultados, tablas ni historial. La información estaba dispersa y se perdía de una temporada a otra.',
    built:
      'Una plataforma con resultados en vivo, tablas, H2H, forma reciente y estadísticas por equipo, un Prode con ranking Elo para la comunidad y un módulo para entrenadores con gestión de plantel, seguimiento en vivo y pizarra táctica.',
    result:
      'Más de 3.500 partidos registrados y más de 2.500 visitas en tres semanas. Hoy es la referencia de datos del futsal rosarino.',
    stack: ['JavaScript', 'Supabase', 'Apps Script', 'Canvas'],
    href: '/proyectos/futsal-hub',
    external: 'https://www.futsalhub.com.ar/',
    externalLabel: 'Explorar la plataforma',
    media: { label: 'Captura · Futsal Hub · tabla y estadísticas', src: '/media/fh.png' },
  },
  {
    slug: 'laa-sports',
    name: 'LAA Sports',
    kind: 'Plataforma a medida · Cliente',
    year: '2026',
    problem:
      'Una agencia de representación reunía a más de 50 jugadores y necesitaba mostrar todo en un solo lugar: trayectoria, ficha, foto y video de cada uno.',
    built:
      'Un sitio con el plantel filtrable por posición y un perfil por jugador, más un panel de administración para editar más rápido. Lo desarrollé en menos de una semana.',
    result:
      'La agencia se presenta ante clubes y jugadores con un sitio propio que reúne todo su plantel en un solo link.',
    stack: ['JavaScript', 'Supabase Auth', 'Vercel'],
    href: '/proyectos/laa-sports',
    external: 'https://laasports.vercel.app/',
    externalLabel: 'Ver el sitio',
    media: { label: 'Captura · LAA Sports · plantel y perfil de jugador', src: '/media/logoblanco.png' },
  },
];

/** "Cómo trabajo": el proceso en 5 pasos. Son también las etapas de la mentoría. */
export const method = [
  {
    n: '01',
    title: 'Pregunta',
    body: 'Antes de abrir el video defino qué necesita saber el cuerpo técnico. Sin pregunta, el análisis es una colección de clips.',
    tag: 'OBJETIVO',
  },
  {
    n: '02',
    title: 'Captura',
    body: 'Un panel de categorías pensado para esa pregunta. Codifico lo que responde y descarto lo que no.',
    tag: 'CODIFICACIÓN',
  },
  {
    n: '03',
    title: 'Datos',
    body: 'Cuento lo que se puede contar y muestro lo que el número no alcanza a explicar. El dato acompaña al video, no lo reemplaza.',
    tag: 'MEDICIÓN',
  },
  {
    n: '04',
    title: 'Síntesis',
    body: 'De cuarenta minutos a una página y cinco clips. Priorizo lo que cambia una decisión.',
    tag: 'INFORME',
  },
  {
    n: '05',
    title: 'Decisión',
    body: 'Presento para que alguien actúe: qué hacer el domingo, qué entrenar el martes.',
    tag: 'ACCIÓN',
  },
] as const;

/** Entregables de la mentoría (Sistema Propio). */
export const mentorshipDeliverables = [
  'Mapa de observación según el modelo de juego de tu equipo',
  'Panel de codificación propio en tu herramienta',
  'Informe de rival real, listo para presentar',
  'Tablero de seguimiento con los datos que importan',
  'Tu sistema semanal documentado: flujo, plantillas y checklist',
] as const;

/**
 * Videos destacados. Completar con IDs reales de YouTube.
 * Mientras el id esté vacío, se muestra un placeholder.
 */
export const featuredVideos = [
  { id: 'zpXVzPVo1Cs', series: 'Análisis · Penales', title: 'Estudio Penales' },
  { id: '5751Kb_yHLs', series: 'Táctica en un minuto', title: 'Sobreposición en Futsal' },
  { id: '-YULaBSm9So', series: 'Táctica en un minuto', title: 'La Gitana en Futsal argentino' },
] as const;

/** Resúmenes con mucha audiencia: prueba de alcance, no de método. Las vistas son aproximadas y "más de". */
export const audienceVideos = [
  { id: '9ojI3L4ZYvI', title: '¡BOCA vs RIVER! Fecha 5, Futsal AFA 2026', views: 'Más de 40 mil vistas' },
  { id: '-0Va1V4Ip38', title: '¡RIVER vs BOCA! Final de la Supercopa de Futsal AFA 2025', views: 'Más de 24 mil vistas' },
  { id: 'hJmOFP4WZPQ', title: '36 PENALES | Boca vs Independiente, pase a semifinales AFA 2025', views: 'Más de 17 mil vistas' },
] as const;

export const aboutShort = {
  lines: [
    'Soy entrenador de futsal desde 2019: primera división, femenino, inferiores.',
    'En el banco aprendí qué información sirve y cuál no llega nunca a la cancha.',
    'Después analicé para clubes de Argentina y de España, y empecé a construir las herramientas que me faltaban.',
    'Hoy junto las tres cosas: analizar, construir y enseñar.',
  ],
  path: ['Entrenador', 'Análisis', 'Contenido', 'Tecnología', 'Proyectos'],
} as const;
