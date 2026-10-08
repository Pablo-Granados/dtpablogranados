/**
 * Página /contenido. Los videos y las vistas salen del canal; las vistas son aproximadas ("más de").
 * Para actualizar: cambiar los IDs o las vistas acá. No hay videos de las series "Oficio de analista" todavía.
 */

export type Video = { id: string; title: string; note: string };

/** Análisis: jugadas y situaciones explicadas. */
export const analysis: Video[] = [
  { id: 'zpXVzPVo1Cs', title: 'Estudio Penales', note: 'Análisis · Penales' },
  { id: '5751Kb_yHLs', title: 'Sobreposición en Futsal', note: 'Táctica en un minuto' },
  { id: '-YULaBSm9So', title: 'La Gitana en Futsal argentino', note: 'Táctica en un minuto' },
];

/** Lo más visto, de mayor a menor. */
export const mostViewed: Video[] = [
  { id: '9ojI3L4ZYvI', title: '¡BOCA vs RIVER! Fecha 5, Futsal AFA 2026 | Lo mejor del Superclásico', note: 'Más de 40 mil vistas' },
  { id: '-0Va1V4Ip38', title: '¡RIVER vs BOCA! Final de la Supercopa de Futsal AFA 2025', note: 'Más de 24 mil vistas' },
  { id: 'hJmOFP4WZPQ', title: '36 PENALES | Boca vs Independiente, pase a semifinales AFA 2025', note: 'Más de 17 mil vistas' },
  { id: 'wLZow1vNiPk', title: 'PINOCHO vs BOCA | Semifinal AFA Futsal, juego 2', note: 'Más de 6 mil vistas' },
  { id: 'grsRKwx5WR0', title: 'TODOS LOS GOLES | Fecha 1, Futsal AFA 2026', note: 'Más de 5 mil vistas' },
  { id: 'HI7z0Xbgikw', title: 'TODOS LOS GOLES | Fecha 2, Futsal AFA 2026', note: 'Más de 5 mil vistas' },
  { id: '9iLZlElkOho', title: 'TODOS LOS GOLES | Fecha 3, Futsal AFA 2026', note: 'Más de 4 mil vistas' },
  { id: 'MXUe_uFQCR0', title: 'RESUMEN | Cuartos de final de la Copa de Oro, Rosario, AFA 2026', note: 'Más de 3 mil vistas' },
  { id: '64Wkf_kmrwk', title: 'RESUMEN | 17 de Agosto vs Boca, semifinal de la Supercopa 2026, 28 penales', note: 'Más de 3 mil vistas' },
];

export const channel = {
  playlists: 'https://www.youtube.com/@dtpablogranados/playlists',
  lists: [
    'Futsal AFA 2026: todos los resúmenes',
    'Futsal AFA 2025: todos los resúmenes, fecha 1 a 30',
    'Penales: ¿dónde lo patea?',
    'Definiciones y partidos clave',
    'Destacados Rosario',
  ],
};
