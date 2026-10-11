/**
 * Guía interna de Sistema Propio (se ve solo en el panel /admin → Mentoría → Programa).
 * Es tu hoja de ruta: qué hacer en cada una de las 12 semanas y cómo cambia según el perfil de la persona.
 * La página pública usa las 5 etapas de `mentoria.ts`; esto es el detalle semana por semana.
 */

export const perfiles = [
  { id: 'principiante', label: 'Entrenador principiante' },
  { id: 'campo', label: 'Entrenador con campo y poca tecnología' },
  { id: 'analista', label: 'Analista' },
  { id: 'pf', label: 'Preparador físico que suma análisis' },
  { id: 'aficionado', label: 'Aficionado que se introduce' },
] as const;

export type Perfil = (typeof perfiles)[number]['id'];

/** Tipos de clase: sirven para filtrar y para saber qué clase de trabajo toca esa semana. */
export const tiposClase = ['Orientación', 'Concepto', 'Taller de herramienta', 'Producción de informe', 'Datos', 'Comunicación', 'Cierre'] as const;
export type TipoClase = (typeof tiposClase)[number];

/** Las 5 etapas que se muestran en la web, con las semanas que abarcan. */
export const etapasPrograma = [
  { titulo: 'Diagnóstico y plan a medida', semanas: [1] },
  { titulo: 'Qué mirar', semanas: [2, 3] },
  { titulo: 'Herramientas', semanas: [4, 5, 6] },
  { titulo: 'Informes y datos', semanas: [7, 8, 9, 10] },
  { titulo: 'Comunicar y sostener', semanas: [11, 12] },
] as const;

export type Semana = {
  n: number;
  titulo: string;
  tipo: TipoClase;
  objetivo: string;
  /** Qué prepararte antes de la llamada. */
  antes: string[];
  /** Agenda de la llamada de 45 minutos. */
  llamada: string[];
  /** Lo que hace la persona entre llamadas. */
  tarea: string;
  entregable: string;
  /** Qué mirar al hacer la devolución en video. */
  devolucion: string[];
  herramientas: string[];
  /** Señal para pasar a la semana siguiente. */
  avanza: string;
  /** Qué cambia según el perfil. */
  variantes: Record<Perfil, string>;
};

export const programa: readonly Semana[] = [
  {
    n: 1,
    titulo: 'Diagnóstico y plan a medida',
    tipo: 'Orientación',
    objetivo: 'Saber desde dónde arranca la persona y definir su ruta.',
    antes: ['Repasar su aplicación: rol, herramientas, horas y objetivo', 'Mirar el video que mandó de un partido que analice'],
    llamada: ['Cómo analiza hoy: qué mira, cómo lo guarda y qué entrega', 'Resultado que quiere tener en la semana 12', 'Definir su nivel y su ruta: ritmo y profundidad', 'Acordar con qué equipo y qué video trabaja las 12 semanas'],
    tarea: 'Elegir el equipo y dos partidos completos en video. Hacer el diagnóstico de la web si todavía no lo hizo.',
    entregable: 'Plan personal de una página',
    devolucion: ['Objetivo claro y medible', 'Video disponible durante las 12 semanas', 'Horas por semana realistas'],
    herramientas: ['Diagnóstico de la web', 'Formulario de aplicación'],
    avanza: 'Tiene objetivo, equipo y video definidos.',
    variantes: {
      principiante: 'Ritmo guiado: vocabulario básico primero y objetivos más chicos.',
      campo: 'Partimos de lo que ya ve en la cancha. La tecnología entra en pasos cortos y con plantillas listas.',
      analista: 'Revisamos su flujo actual y lo que quiere cambiar. Vamos más directo a lo avanzado.',
      pf: 'Ver cómo se conecta su trabajo físico con lo táctico, y qué quiere sumar del análisis.',
      aficionado: 'Definir con qué equipo practica (amateur o público) y un objetivo realista para aprender.',
    },
  },
  {
    n: 2,
    titulo: 'Lenguaje y modelo de juego',
    tipo: 'Concepto',
    objetivo: 'Tener un vocabulario y unos principios propios para mirar el juego.',
    antes: ['Leer su plan personal y marcar dudas', 'Preparar dos jugadas de ejemplo de su equipo'],
    llamada: ['Fases del juego y principios', 'Cómo describe hoy el modelo de juego de su equipo', 'Separar lo que pasó de cómo lo interpreta', 'Ejemplos en video'],
    tarea: 'Escribir los principios de su equipo por fase: ataque, defensa, transiciones y pelota parada.',
    entregable: 'Borrador de principios',
    devolucion: ['Principios que se pueden observar, no deseos', 'Una pregunta de observación por principio'],
    herramientas: ['Ebook "Leé el Partido"'],
    avanza: 'Cada fase tiene al menos dos principios observables.',
    variantes: {
      principiante: 'Más ejemplos en video y vocabulario del juego antes de llegar a los principios.',
      campo: 'Usar su forma de explicar en la cancha como punto de partida y ponerla por escrito.',
      analista: 'Contrastar su marco actual con el modelo del equipo y ajustar categorías.',
      pf: 'Traducir los principios tácticos a lo que implican en demandas físicas.',
      aficionado: 'Elegir un modelo de referencia del equipo que sigue y describirlo con sus palabras.',
    },
  },
  {
    n: 3,
    titulo: 'Qué mirar: el mapa de observación',
    tipo: 'Concepto',
    objetivo: 'Convertir los principios en un mapa que se pueda aplicar a un partido.',
    antes: ['Revisar los principios de la semana 2'],
    llamada: ['Armar las preguntas por fase', 'Probar el mapa sobre diez minutos de video', 'Qué ignorar a propósito'],
    tarea: 'Aplicar el mapa a un partido completo y anotar dónde se trabó.',
    entregable: 'Mapa de observación',
    devolucion: ['Preguntas que se pueden responder en el video', 'Que no sea demasiado largo'],
    herramientas: ['Plantilla de mapa de observación'],
    avanza: 'Puede mirar un partido con el mapa sin perderse.',
    variantes: {
      principiante: 'Mapa corto: una pregunta por fase.',
      campo: 'Ligarlo a lo que ya corrige en el entrenamiento.',
      analista: 'Mapa con prioridades y criterios para comparar partidos.',
      pf: 'Sumar preguntas sobre ritmo, intensidad y esfuerzos.',
      aficionado: 'Mapa simple para mirar un partido con intención.',
    },
  },
  {
    n: 4,
    titulo: 'Herramientas I: tu panel',
    tipo: 'Taller de herramienta',
    objetivo: 'Tener un panel de codificación propio.',
    antes: ['Confirmar qué herramienta tiene instalada', 'Tener el video listo'],
    llamada: ['Categorías y descriptores a partir del mapa', 'Armar el panel en LongoMatch', 'Cómo se hace lo mismo en Nacsport y Once Sport', 'Probar con cinco minutos de video'],
    tarea: 'Terminar el panel y codificar quince minutos.',
    entregable: 'Panel propio',
    devolucion: ['Pocas categorías, bien definidas', 'Que el panel responda al mapa'],
    herramientas: ['LongoMatch', 'Nacsport / Once Sport (equivalencias)', 'Plantilla de panel'],
    avanza: 'El panel codifica sin dudas sobre un video de prueba.',
    variantes: {
      principiante: 'Pocas categorías, paso a paso y con la plantilla.',
      campo: 'Instalación y primeros pasos acompañados. No avanzamos hasta que el panel funcione.',
      analista: 'Importar o adaptar su panel actual y revisar sus categorías.',
      pf: 'Sumar categorías de acciones con impacto físico.',
      aficionado: 'Empezar con una herramienta gratuita o una planilla si todavía no tiene software.',
    },
  },
  {
    n: 5,
    titulo: 'Herramientas II: codificar un partido',
    tipo: 'Taller de herramienta',
    objetivo: 'Codificar un partido completo con un flujo ordenado.',
    antes: ['Mirar el panel que armó y los quince minutos codificados'],
    llamada: ['Flujo: ver, codificar y revisar', 'Errores comunes y cómo evitarlos', 'Cuánto tiempo lleva y cómo bajarlo', 'Primeras lecturas de lo codificado'],
    tarea: 'Codificar un partido completo y anotar cinco conclusiones.',
    entregable: 'Partido analizado',
    devolucion: ['Consistencia de las etiquetas', 'Conclusiones que se sostienen en el video'],
    herramientas: ['LongoMatch', 'Nacsport / Once Sport'],
    avanza: 'Codifica un partido completo y saca conclusiones propias.',
    variantes: {
      principiante: 'Primero medio partido. El completo cuando el flujo le resulte cómodo.',
      campo: 'Sesiones cortas y atajos que ahorren tiempo.',
      analista: 'Optimizar su flujo y compararlo con su método anterior.',
      pf: 'Cruzar lo codificado con la carga o los esfuerzos que registra.',
      aficionado: 'Elegir un partido de su equipo de práctica y llevarlo a su ritmo.',
    },
  },
  {
    n: 6,
    titulo: 'Clips y edición',
    tipo: 'Taller de herramienta',
    objetivo: 'Convertir lo codificado en clips claros.',
    antes: ['Mirar el partido analizado y elegir los momentos clave'],
    llamada: ['Qué clip sirve y cuál no', 'Cortar y exportar desde la herramienta', 'Edición con Premiere (completo) o CapCut (rápido y gratuito)', 'Formatos para cuerpo técnico y para jugadores'],
    tarea: 'Armar un pack de cinco clips con título y una frase cada uno.',
    entregable: 'Pack de clips',
    devolucion: ['Cada clip muestra una sola idea', 'Duración y claridad'],
    herramientas: ['Adobe Premiere', 'CapCut'],
    avanza: 'Los clips se entienden sin explicación.',
    variantes: {
      principiante: 'CapCut: cortes simples y títulos básicos.',
      campo: 'CapCut con una receta fija para repetir cada semana.',
      analista: 'Premiere con plantillas propias y exportación estándar.',
      pf: 'Clips que muestren esfuerzos, posturas o acciones, según su trabajo.',
      aficionado: 'CapCut y pocos clips bien hechos antes que muchos.',
    },
  },
  {
    n: 7,
    titulo: 'Informe propio',
    tipo: 'Producción de informe',
    objetivo: 'Un informe sobre su propio equipo, con material que ya controla.',
    antes: ['Tener el partido codificado y el pack de clips'],
    llamada: ['Estructura de una página', 'Qué incluir y qué dejar afuera', 'Armar el informe con la plantilla', 'Cómo lo leería el cuerpo técnico'],
    tarea: 'Armar el informe propio de un partido.',
    entregable: 'Informe propio',
    devolucion: ['Una página', 'Prioridades claras', 'Clips que respaldan cada punto'],
    herramientas: ['Plantilla de ficha de partido'],
    avanza: 'Un tercero entiende el informe sin que se lo expliquen.',
    variantes: {
      principiante: 'Plantilla casi completa y foco en tres conclusiones.',
      campo: 'Informe pensado para contarlo en cinco minutos en el vestuario o la reunión.',
      analista: 'Sumar indicadores propios y comparación entre partidos.',
      pf: 'Incluir un bloque de lectura física.',
      aficionado: 'Informe del equipo de práctica con tres observaciones claras.',
    },
  },
  {
    n: 8,
    titulo: 'Informe de rival',
    tipo: 'Producción de informe',
    objetivo: 'Un informe de rival útil para la semana, hecho en el tiempo que realmente tiene.',
    antes: ['Tener elegido el rival y su video', 'Mirar el informe propio de la semana anterior'],
    llamada: ['Patrones que se repiten, no anécdotas', 'Los cinco clips que importan', 'Cómo plantear la semana con el informe', 'Qué hacer cuando hay poco tiempo o poco video'],
    tarea: 'Armar el informe de rival de un próximo partido.',
    entregable: 'Informe de rival real',
    devolucion: ['Patrones y no jugadas sueltas', 'Qué hacer con lo que se vio'],
    herramientas: ['Plantilla de informe de rival'],
    avanza: 'Puede armar el informe en el tiempo del que dispone.',
    variantes: {
      principiante: 'Rival de un partido ya jugado, para practicar sin presión.',
      campo: 'Foco en tres ideas para el entrenamiento de esa semana.',
      analista: 'Versión corta y versión completa del informe.',
      pf: 'Sumar datos del ritmo del rival si dispone de ellos.',
      aficionado: 'Elegir el próximo rival del equipo que sigue y armar el informe antes del partido.',
    },
  },
  {
    n: 9,
    titulo: 'Datos y tablero',
    tipo: 'Datos',
    objetivo: 'Medir lo justo y mostrarlo sin que el número tape al video.',
    antes: ['Revisar los informes de las semanas 7 y 8'],
    llamada: ['Qué medir y qué no', 'Del dato a la decisión', 'Tablero de seguimiento en planilla', 'Cómo mostrar un número junto al clip'],
    tarea: 'Armar el tablero con tres indicadores y cargar tres partidos.',
    entregable: 'Tablero de seguimiento',
    devolucion: ['Indicadores ligados a los principios', 'Lectura de la tendencia'],
    herramientas: ['Hojas de cálculo', 'Plantilla de tablero'],
    avanza: 'Cada indicador responde una pregunta del cuerpo técnico.',
    variantes: {
      principiante: 'Dos indicadores y fórmulas ya armadas.',
      campo: 'Un tablero simple que se actualiza en minutos.',
      analista: 'Indicadores propios y gráficos para comparar.',
      pf: 'Cruzar con carga y rendimiento físico.',
      aficionado: 'Seguir dos indicadores de un equipo a lo largo de varios partidos.',
    },
  },
  {
    n: 10,
    titulo: 'Scout individual',
    tipo: 'Producción de informe',
    objetivo: 'Analizar a un jugador con criterios claros.',
    antes: ['Tener elegido el jugador y varios partidos suyos'],
    llamada: ['Qué buscar en un jugador según su rol', 'Criterios y escala', 'Estructura de la ficha', 'Cómo evitar el sesgo de un solo partido'],
    tarea: 'Armar la ficha individual de un jugador con cinco clips.',
    entregable: 'Ficha individual',
    devolucion: ['Criterios según el rol', 'Evidencia en video', 'Más de un partido como base'],
    herramientas: ['Ficha individual (modelo del programa)'],
    avanza: 'La ficha permite decidir sobre el jugador sin ver el video completo.',
    variantes: {
      principiante: 'Un solo rol y pocos criterios.',
      campo: 'Un jugador de su propio plantel, útil para el trabajo de la semana.',
      analista: 'Ficha comparativa con otros jugadores del mismo rol.',
      pf: 'Sumar el perfil físico y de carga.',
      aficionado: 'Un jugador que le guste seguir, con una ficha corta.',
    },
  },
  {
    n: 11,
    titulo: 'Comunicar en 10 minutos',
    tipo: 'Comunicación',
    objetivo: 'Presentar el trabajo de forma clara y breve.',
    antes: ['Elegir qué informe presenta y reunir los clips'],
    llamada: ['Estructura de diez minutos', 'Qué priorizar y qué dejar afuera', 'Cómo responder preguntas', 'Ensayo con un clip'],
    tarea: 'Grabar la presentación de diez minutos.',
    entregable: 'Presentación grabada',
    devolucion: ['Claridad', 'Una idea por clip', 'Duración'],
    herramientas: ['Grabación de pantalla', 'Informe y clips de las semanas anteriores'],
    avanza: 'Presenta en diez minutos sin perder la idea central.',
    variantes: {
      principiante: 'Guion más guiado y presentación de cinco minutos.',
      campo: 'Presentación pensada para su cuerpo técnico o sus jugadores.',
      analista: 'Presentación para cuerpo técnico y formato corto para jugadores.',
      pf: 'Presentación con foco en lo físico dentro del contexto táctico.',
      aficionado: 'Presentarla a alguien de su entorno y recibir devolución.',
    },
  },
  {
    n: 12,
    titulo: 'Sostener el sistema',
    tipo: 'Cierre',
    objetivo: 'Que el proceso no dependa del tiempo que sobre.',
    antes: ['Repasar todos los entregables y lo que costó más'],
    llamada: ['Semana de trabajo tipo', 'Qué sostener y qué soltar', 'Plan de 90 días', 'Cierre y próximos pasos. Agendar la llamada de control a los 30 días'],
    tarea: 'Documentar su sistema y su semana de trabajo.',
    entregable: 'Sistema documentado',
    devolucion: ['Semana realista', 'Qué se hace cada día'],
    herramientas: ['Checklist semanal'],
    avanza: 'Puede repetir el proceso solo.',
    variantes: {
      principiante: 'Plan de 90 días con una sola prioridad.',
      campo: 'Semana tipo compatible con su carga de trabajo.',
      analista: 'Plan de crecimiento y, si quiere, cómo ofrecer el servicio.',
      pf: 'Cómo integrar el análisis a su rutina de trabajo.',
      aficionado: 'Plan para seguir practicando y armar un portfolio simple.',
    },
  },
];
