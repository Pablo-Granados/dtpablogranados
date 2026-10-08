/**
 * Plantillas gratuitas. Los archivos los genera tools/plantillas (npm run todas) en public/plantillas.
 * Para sumar una: generar los archivos, agregarla acá y listo.
 */

export type TemplateFile = { label: string; href: string; kind: 'pdf' | 'xlsx' };

export type Template = {
  slug: string;
  n: string;
  name: string;
  /** Una línea: para qué sirve. */
  tagline: string;
  summary: string;
  /** Qué trae. */
  items: string[];
  files: TemplateFile[];
};

const files = (slug: string): TemplateFile[] => [
  { label: 'PDF · guía', href: `/plantillas/${slug}.pdf`, kind: 'pdf' },
  { label: 'Hoja de cálculo editable', href: `/plantillas/${slug}.xlsx`, kind: 'xlsx' },
];

export const templates: Template[] = [
  {
    slug: 'mapa-de-observacion',
    n: '01',
    name: 'Mapa de observación',
    tagline: 'Qué mirar antes de abrir el video',
    summary:
      'Seis fases del juego, tres principios por fase y, para cada uno, la pregunta, qué buscar en el video y un indicador. Con ejemplos de futsal; sirve igual para fútbol.',
    items: [
      'PDF para leer e imprimir, con una fase observada de ejemplo',
      'Hoja de cálculo para completar partido a partido',
      'Resumen automático: en qué fases cumple y en cuáles no',
      'Un paso a paso para elegir qué mirar cada semana',
    ],
    files: files('mapa-de-observacion'),
  },
  {
    slug: 'panel-de-codificacion',
    n: '02',
    name: 'Panel de codificación',
    tagline: 'Capturar lo que importa, no todo',
    summary:
      'Ocho categorías con sus descriptores, listas para Nacsport, LongoMatch o una hoja de cálculo, ordenadas según el mapa de observación.',
    items: [
      'PDF con las categorías, sus descriptores y las preguntas que responde cada una',
      'Hoja de registro con menús desplegables y resumen automático por categoría',
      'Cuatro reglas para no codificar de más y los errores que más se repiten',
      'Cómo cargarlo en tu herramienta, paso a paso',
    ],
    files: files('panel-de-codificacion'),
  },
  {
    slug: 'ficha-de-partido',
    n: '03',
    name: 'Ficha de partido propio',
    tagline: 'Del partido a una página',
    summary: 'El informe post-partido de una página: qué pasó, qué corregir y qué se entrena en la semana.',
    items: [
      'Ficha en blanco de una página, para imprimir y completar a mano',
      'Un ejemplo completo para ver cómo se llena',
      'Hoja de cálculo editable con historial de partidos',
      'Cuatro reglas: una pregunta, tres hallazgos, una decisión y cinco clips',
    ],
    files: files('ficha-de-partido'),
  },
  {
    slug: 'checklist-semanal',
    n: '04',
    name: 'Checklist semanal de análisis',
    tagline: 'Que el proceso no dependa del tiempo que sobre',
    summary: 'Cómo ordenar la semana del analista, de lunes a domingo, para que el análisis llegue antes del entrenamiento.',
    items: [
      'La semana tipo con tiempos y entregables, para ir tildando',
      'La versión mínima de 3 horas para las semanas apretadas',
      'Hoja de cálculo que calcula tu cumplimiento semanal',
      'Cómo adaptarla si jugás a mitad de semana o dos veces',
    ],
    files: files('checklist-semanal'),
  },
];

export const findTemplate = (slug: string) => templates.find((t) => t.slug === slug);
