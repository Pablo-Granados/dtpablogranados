/**
 * Casos de estudio. Solo se publica lo que Pablo confirmó: sin datos inventados.
 * Para sumar un caso: agregarlo acá y listo (la página /proyectos/[slug] lo genera sola).
 */

export type CaseStudy = {
  slug: string;
  name: string;
  kind: string;
  year: string;
  tagline: string;
  /** Resumen de dos líneas, para la cabecera y el SEO. */
  intro: string;
  problem: string[];
  /** Título de la sección del motivo ("Por qué lo hice", "Qué me pidieron"). */
  whyTitle?: string;
  why: string[];
  /** Qué incluyó la plataforma, por grupos. */
  built: { title: string; items: string[] }[];
  hard?: { title: string; body: string[] };
  /** Qué cambió para el cliente o los usuarios. */
  after?: string[];
  users: { who: string; uses: string }[];
  /** Números verificables. `note` aclara el período o la fuente. */
  results: { value: string; label: string; note?: string }[];
  /** Cita de alguien con nombre y permiso. Sin atribución no se publica. */
  quote?: { text: string; who: string };
  stack: string[];
  external: string;
  externalLabel: string;
  /** Capturas de celular (vertical). `group` las agrupa en la galería. */
  shots: { src: string; alt: string; caption: string; fit?: 'cover' | 'contain'; ratio?: string }[];
};

export const cases: CaseStudy[] = [
  {
    slug: 'futsal-hub',
    name: 'Futsal Hub',
    kind: 'Plataforma de datos · Producto propio',
    year: '2023 — hoy',
    tagline: 'La plataforma de datos del futsal de Rosario',
    intro:
      'Resultados, tablas, historial y estadísticas de la liga en un solo lugar, con un módulo para que los entrenadores registren datos en vivo durante el partido.',
    problem: [
      'Los datos de la liga estaban dispersos y se mostraban de una forma limitada. Faltaba información, y sin historial accesible lo que pasaba en una temporada se perdía en la siguiente.',
    ],
    whyTitle: 'Por qué lo hice',
    why: [
      'Sentí que faltaban datos y que lo que se mostraba se podía mejorar. Empecé a construirlo en 2023 con esa idea: un lugar donde la información de la liga estuviera completa y se pudiera consultar sin esfuerzo.',
    ],
    built: [
      {
        title: 'Lo que consulta cualquiera',
        items: [
          'Partidos de la fecha, por categoría',
          'Tabla de posiciones por temporada',
          'Historial y cruces entre equipos (H2H)',
          'Últimos partidos, forma reciente y promedio de goles',
          'Rachas de cada equipo, para compartir por WhatsApp',
        ],
      },
      {
        title: 'Lo que hace volver',
        items: ['Un prode para jugar con gente de otros clubes, con ranking Elo', 'Un juego de penales', 'Noticias de la liga'],
      },
      {
        title: 'Para entrenadores',
        items: [
          'Planificación con pizarra táctica, jugadas y entrenamientos',
          'Registro de datos en vivo durante el partido',
          'Mapa de calor ofensivo y defensivo por zona',
          'Minutos jugados por jugador',
          'Gestión de plantel',
        ],
      },
    ],
    hard: {
      title: 'El módulo de entrenadores',
      body: [
        'Lo más difícil de construir fue la parte de entrenadores: registrar datos en vivo. Tiene que funcionar mientras el partido sigue, sin estorbar a quien está en el banco, y los datos que se cargan alimentan las estadísticas del resto de la plataforma.',
      ],
    },
    users: [
      { who: 'Entrenadores', uses: 'Registran el partido en vivo, gestionan el plantel y consultan estadísticas.' },
      { who: 'Jugadores', uses: 'Siguen su rendimiento y el de su equipo, y compiten en el prode y en el juego de penales.' },
      { who: 'Hinchas', uses: 'Miran resultados, tabla y próximos partidos, y se enteran de las noticias.' },
    ],
    results: [
      { value: '3.500+', label: 'partidos registrados', note: 'desde 2023' },
      { value: '2.700+', label: 'visitantes', note: 'desde el 25 de julio de 2026' },
      { value: '4.100+', label: 'visitas', note: 'desde el 25 de julio de 2026' },
      { value: '6.300+', label: 'páginas vistas', note: 'desde el 25 de julio de 2026' },
    ],
    stack: ['JavaScript', 'Supabase', 'Apps Script', 'Canvas'],
    external: 'https://www.futsalhub.com.ar/',
    externalLabel: 'Explorar la plataforma',
    shots: [
      { src: '/media/futsalhub-partidos.png', alt: 'Futsal Hub: partidos de la fecha por categoría', caption: 'Partidos de la fecha' },
      { src: '/media/futsalhub-tabla.png', alt: 'Futsal Hub: tabla de posiciones de Primera A 2026', caption: 'Tabla de posiciones' },
      { src: '/media/futsalhub-historial.png', alt: 'Futsal Hub: historial de enfrentamientos entre dos equipos', caption: 'Historial de enfrentamientos' },
      { src: '/media/futsalhub-rachas.png', alt: 'Futsal Hub: rachas de los equipos por categoría', caption: 'Rachas' },
      { src: '/media/futsalhub-penales.png', alt: 'Futsal Hub: juego de penales', caption: 'Juego de penales' },
      { src: '/media/futsalhub-planificacion.png', alt: 'Futsal Hub: planificación con pizarra táctica para entrenadores', caption: 'Planificación para entrenadores' },
      { src: '/media/futsalhub-mapa-de-calor.png', alt: 'Futsal Hub: mapa de calor ofensivo por zonas de la cancha', caption: 'Mapa de calor en vivo', fit: 'contain' },
    ],
  },
  {
    slug: 'laa-sports',
    name: 'LAA Sports',
    kind: 'Sitio a medida · Cliente',
    year: '2026',
    tagline: 'Todo el plantel de una agencia de representación, en un solo lugar',
    intro:
      'Un sitio con el plantel completo de la agencia: ficha, trayectoria, foto y video de cada jugador en un solo lugar, y un panel de administración para mantenerlo actualizado.',
    problem: [
      'No había un problema que arreglar: había una oportunidad. La agencia reunía a más de 50 jugadores y necesitaba poder mostrar todo en un solo lugar: la trayectoria, la ficha, la foto y, en algunos casos, el video de cada uno.',
    ],
    whyTitle: 'Qué me pidieron',
    why: [
      'Me pidieron desarrollar una página con esa información, y la desarrollé. Además del sitio, armé un panel de administración para ir editando los perfiles más rápido.',
    ],
    built: [
      {
        title: 'Para quien mira',
        items: [
          'Atletas y staff técnico, más de 50 perfiles en un solo lugar',
          'Ficha, trayectoria y foto de cada uno',
          'Video, en los casos en que existe',
          'Buscador por nombre o club y filtros por posición',
          'Sitio en español y en inglés',
        ],
      },
      {
        title: 'Lo institucional',
        items: ['Quiénes somos y objetivos de la agencia', 'Mapa de presencia internacional', 'Formulario de contacto'],
      },
      {
        title: 'Para la agencia',
        items: ['Panel de administración con acceso privado', 'Edición rápida de cada perfil'],
      },
    ],
    after: [
      'Hoy, al presentarse ante clubes y jugadores, la agencia cuenta con un sitio propio que reúne todo su plantel en un solo link.',
    ],
    users: [
      { who: 'La agencia', uses: 'Presenta a su plantel con un link y mantiene los perfiles desde el panel.' },
      { who: 'Clubes', uses: 'Conocen a los jugadores de la agencia en un solo lugar.' },
      { who: 'Jugadores', uses: 'Tienen una ficha completa en internet para mostrarse y darse a conocer con mayor facilidad, con el respaldo de LAA Sports.' },
    ],
    results: [
      { value: '50+', label: 'jugadores presentados' },
      { value: '< 1 semana', label: 'de desarrollo' },
      { value: 'Sitio + panel', label: 'entregados juntos' },
    ],
    stack: ['JavaScript', 'Supabase Auth', 'Vercel'],
    external: 'https://laasports.vercel.app/',
    externalLabel: 'Ver el sitio',
    shots: [
      { src: '/media/laasports-portada.png', alt: 'LAA Sports: portada del sitio, agencia internacional especializada en futsal profesional', caption: 'Portada', ratio: '4 / 5' },
      { src: '/media/laasports-atletas.png', alt: 'LAA Sports: atletas y staff técnico con buscador y filtros por posición', caption: 'Atletas y staff, con buscador y filtros', ratio: '4 / 5' },
      { src: '/media/laasports-quienes-somos.png', alt: 'LAA Sports: sección quiénes somos', caption: 'Quiénes somos', ratio: '4 / 5' },
      { src: '/media/laasports-objetivos.png', alt: 'LAA Sports: objetivos de la agencia', caption: 'Objetivos', ratio: '4 / 5' },
      { src: '/media/laasports-presencia.png', alt: 'LAA Sports: mapa de presencia internacional y formulario de contacto', caption: 'Presencia internacional y contacto', ratio: '4 / 5' },
    ],
  },
];

export const findCase = (slug: string) => cases.find((c) => c.slug === slug);
