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
  { label: 'Mentoría', href: '/mentoria' },
  { label: 'Equipos', href: '/#equipos' },
  { label: 'Proyectos', href: '/#proyectos' },
  { label: 'Contenido', href: '/#contenido' },
  { label: 'Sobre mí', href: '/#sobre-mi' },
] as const;

/** Link de WhatsApp con mensaje precargado (temporal, hasta tener formularios). */
const wa = (msg: string) => `https://wa.me/543416287921?text=${encodeURIComponent(msg)}`;

/** Rutas de conversión. Un CTA por intención, nunca "Contactame" genérico. */
export const cta = {
  mentoria: { label: 'Ver la mentoría', href: '/mentoria', event: 'cta_mentoria' },
  aplicar: { label: 'Aplicar a Sistema Propio', href: '/mentoria/aplicar', event: 'cta_aplicar' },
  diagnostico: { label: 'Hacer el diagnóstico', href: '/diagnostico', event: 'cta_diagnostico' },
  propuesta: { label: 'Solicitar propuesta', href: wa('Hola Pablo, quiero pedirte una propuesta de análisis para mi equipo.'), event: 'cta_propuesta' },
  proyecto: { label: 'Contarme el proyecto', href: wa('Hola Pablo, quiero contarte un proyecto digital.'), event: 'cta_proyecto' },
  proyectos: { label: 'Ver lo que construí', href: '/#proyectos', event: 'cta_proyectos' },
  youtube: { label: 'Ver en YouTube', href: site.social.youtube, event: 'out_youtube' },
} as const;

/** Selector de intención del hero. */
export const intents = [
  {
    id: 'aprender',
    kicker: 'Entreno o analizo',
    title: 'Quiero mejorar mi proceso de análisis',
    href: '/diagnostico',
    action: 'Empezar por el diagnóstico',
  },
  {
    id: 'equipo',
    kicker: 'Club · Agencia · Jugador',
    title: 'Necesito análisis o una herramienta',
    href: '#equipos',
    action: 'Ver cómo trabajo con equipos',
  },
  {
    id: 'ver',
    kicker: 'Primero quiero ver',
    title: 'Mostrame lo que construiste',
    href: '/#proyectos',
    action: 'Ver proyectos',
  },
] as const;

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
    media: { label: 'Captura · Futsal Hub · tabla y estadísticas', src: '/public/media/fh.png' },
  },
  {
    slug: 'laa-sports',
    name: 'LAA Sports',
    kind: 'Plataforma a medida · Cliente',
    year: '2026',
    problem:
      'Una agencia de representación necesitaba mostrar a más de 45 jugadores de forma profesional ante clubes y actualizar sus datos sin depender de nadie.',
    built:
      'Un plantel filtrable por posición, perfiles con trayectoria en línea de tiempo y video, y un panel privado para que la agencia gestione cada jugador.',
    result:
      'La agencia presenta a su plantel con un link y lo mantiene actualizado por su cuenta.',
    stack: ['JavaScript', 'Supabase Auth', 'Vercel'],
    href: '/proyectos/laa-sports',
    external: 'https://laasports.vercel.app/',
    externalLabel: 'Ver el sitio',
    media: { label: 'Captura · LAA Sports · plantel y perfil de jugador', src: '/public/media/logoblanco.png' },
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

export const teamServices = [
  {
    title: 'Análisis',
    items: [
      'Análisis de rival y scouting',
      'Análisis propio y seguimiento semanal',
      'Análisis individual de jugadores',
      'Pelota parada (ABP)',
    ],
    cta: 'propuesta' as const,
  },
  {
    title: 'Herramientas',
    items: [
      'Sitios para clubes, agencias y jugadores',
      'Dashboards para cuerpos técnicos',
      'Bases de datos de partidos y rendimiento',
      'Herramientas internas a medida',
    ],
    cta: 'proyecto' as const,
  },
] as const;

/**
 * Videos destacados. Completar con IDs reales de YouTube.
 * Mientras el id esté vacío, se muestra un placeholder.
 */
export const featuredVideos = [
  { id: '9ojI3L4ZYvI', series: 'Oficio de analista', title: 'Cómo hago un informe de rival' },
  { id: 'hJmOFP4WZPQ', series: 'Construido para el análisis', title: 'Construí una plataforma para analizar la liga de mi ciudad' },
  { id: 'wLZow1vNiPk', series: 'Lo que no se ve', title: 'Por qué este cierre nunca pierde la marca' },
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
