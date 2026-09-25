/**
 * Diagnóstico del analista.
 * Lo usan la página (para mostrar el resultado al instante) y la API
 * (que recalcula el puntaje en el servidor antes de guardar y enviar el email).
 */

export type AreaId = 'observar' | 'capturar' | 'medir' | 'comunicar' | 'organizar';

export type Question = {
  area: AreaId;
  text: string;
  /** Ordenadas de 0 a 3 puntos */
  options: [string, string, string, string];
};

export const areas: Record<AreaId, { label: string; tip: string; firstStep: string }> = {
  observar: {
    label: 'Qué observás',
    tip: 'Sin preguntas claras, cualquier partido se convierte en una colección de clips. El análisis empieza antes de darle play.',
    firstStep: 'Antes del próximo partido, escribí 3 preguntas que el cuerpo técnico necesite responder y mirá solo buscando esas respuestas.',
  },
  capturar: {
    label: 'Cómo capturás',
    tip: 'Si tus categorías cambian cada semana, no podés comparar partidos ni encontrar lo que ya viste.',
    firstStep: 'Armá una lista de 8 a 12 categorías fijas basadas en las fases del juego y usala igual durante 4 partidos seguidos.',
  },
  medir: {
    label: 'Qué medís',
    tip: 'El dato no reemplaza al video, pero te muestra si lo que viste es una tendencia o una excepción.',
    firstStep: 'Elegí 3 indicadores que tu equipo pueda mejorar (por ejemplo, pérdidas en salida) y registralos en todos los partidos del mes.',
  },
  comunicar: {
    label: 'Cómo comunicás',
    tip: 'Un análisis que nadie usa no cambia nada. El formato importa tanto como el contenido.',
    firstStep: 'En tu próximo informe, limitá la conclusión a 3 ideas y acompañá cada una con un solo clip.',
  },
  organizar: {
    label: 'Cómo organizás tu semana',
    tip: 'Sin rutina, el análisis depende de cuánto tiempo sobre. Con rutina, sale siempre, aunque la semana venga complicada.',
    firstStep: 'Definí qué día hacés cada tarea (partido propio, rival, datos, presentación) y guardá tu último informe como plantilla.',
  },
};

export const questions: Question[] = [
  {
    area: 'observar',
    text: 'Antes de mirar un partido, ¿definís qué querés responder?',
    options: [
      'Casi nunca: miro y voy viendo',
      'A veces, si es un rival importante',
      'Casi siempre, pero lo tengo en la cabeza',
      'Siempre, por escrito y según lo que necesita el cuerpo técnico',
    ],
  },
  {
    area: 'observar',
    text: '¿Lo que observás está conectado con el modelo de juego de tu equipo?',
    options: [
      'No hay un modelo de juego definido',
      'Hay un modelo, pero no lo uso para analizar',
      'Lo tengo en cuenta en general',
      'Mis categorías de observación salen del modelo de juego',
    ],
  },
  {
    area: 'observar',
    text: 'Cuando anotás algo, ¿separás lo que pasó de cómo lo interpretás?',
    options: [
      'Nunca lo pensé',
      'Me cuesta separarlo',
      'Casi siempre',
      'Siempre: primero el hecho, después la lectura',
    ],
  },
  {
    area: 'capturar',
    text: '¿Cómo registrás lo que ves?',
    options: [
      'De memoria o con notas sueltas',
      'En un cuaderno o una planilla',
      'Con software de video, sin categorías fijas',
      'Con un panel de codificación propio (Nacsport, LongoMatch, etc.)',
    ],
  },
  {
    area: 'capturar',
    text: '¿Usás las mismas categorías de un partido a otro?',
    options: [
      'No uso categorías',
      'Cambian cada vez',
      'Tengo una base, pero la modifico mucho',
      'Son estables y puedo comparar partidos',
    ],
  },
  {
    area: 'capturar',
    text: '¿Cuánto tardás en encontrar un clip de un partido de hace un mes?',
    options: [
      'No lo encuentro',
      'Tengo que volver a mirar el partido',
      'Unos minutos buscando',
      'Menos de un minuto: está etiquetado',
    ],
  },
  {
    area: 'medir',
    text: '¿Qué datos registrás de tu equipo?',
    options: [
      'Ninguno',
      'Resultado y goles',
      'Algunas estadísticas, cuando puedo',
      'Un grupo definido de indicadores en cada partido',
    ],
  },
  {
    area: 'medir',
    text: '¿Los datos te ayudan a tomar decisiones?',
    options: [
      'No los uso',
      'Rara vez',
      'A veces confirman lo que vi',
      'Sí, y los comparo a lo largo del tiempo',
    ],
  },
  {
    area: 'comunicar',
    text: '¿Cómo le entregás el análisis al cuerpo técnico o a los jugadores?',
    options: [
      'De palabra',
      'Por mensaje o audio',
      'Con clips sueltos',
      'Con un informe y clips seleccionados, con conclusiones',
    ],
  },
  {
    area: 'comunicar',
    text: '¿Cuánto dura tu presentación de un rival?',
    options: [
      'No presento',
      'Más de 30 minutos',
      'Entre 15 y 30 minutos',
      'Menos de 15, con 3 a 5 ideas clave',
    ],
  },
  {
    area: 'organizar',
    text: '¿Tenés una rutina semanal de análisis?',
    options: [
      'No',
      'Depende de la semana',
      'Más o menos',
      'Sí, con días y tareas definidos',
    ],
  },
  {
    area: 'organizar',
    text: '¿Usás plantillas para no empezar de cero cada vez?',
    options: [
      'No',
      'Copio el último trabajo que hice',
      'Tengo algunas',
      'Sí: para el informe, el panel y un checklist',
    ],
  },
];

export const roles = ['Entrenador/a', 'Analista', 'Scout', 'Ayudante de campo', 'Estudiante', 'Otro'] as const;

export type Result = {
  scores: Record<AreaId, number>;
  total: number;
  level: { name: string; text: string };
  priorities: AreaId[];
};

/** answers[i] = índice de la opción elegida (0 a 3) para questions[i] */
export function scoreAnswers(answers: number[]): Result {
  if (answers.length !== questions.length || answers.some((a) => !Number.isInteger(a) || a < 0 || a > 3)) {
    throw new Error('Respuestas inválidas');
  }

  const sum: Record<AreaId, number> = { observar: 0, capturar: 0, medir: 0, comunicar: 0, organizar: 0 };
  const max: Record<AreaId, number> = { observar: 0, capturar: 0, medir: 0, comunicar: 0, organizar: 0 };
  questions.forEach((q, i) => {
    sum[q.area] += answers[i];
    max[q.area] += 3;
  });

  const scores = Object.fromEntries(
    (Object.keys(sum) as AreaId[]).map((id) => [id, Math.round((sum[id] / max[id]) * 100)]),
  ) as Record<AreaId, number>;

  const total = Math.round(answers.reduce((a, b) => a + b, 0) / (questions.length * 3) * 100);

  // Las dos áreas más bajas; en empate, gana el orden del proceso.
  const order: AreaId[] = ['observar', 'capturar', 'medir', 'comunicar', 'organizar'];
  const priorities = [...order].sort((a, b) => scores[a] - scores[b] || order.indexOf(a) - order.indexOf(b)).slice(0, 2);

  const level =
    total < 40
      ? { name: 'Análisis intuitivo', text: 'Mirás mucho y tenés buen ojo, pero el proceso depende de vos y de cada semana. El salto está en ordenar qué mirás y cómo lo guardás.' }
      : total < 70
        ? { name: 'Sistema en construcción', text: 'Ya tenés partes del proceso resueltas. Lo que falta es que se conecten: que lo que observás, medís y presentás responda a las mismas preguntas.' }
        : { name: 'Análisis con sistema', text: 'Trabajás con método. El próximo paso está en afinar: priorizar mejor, medir lo que importa y sostenerlo sin que te consuma la semana.' };

  return { scores, total, level, priorities };
}
