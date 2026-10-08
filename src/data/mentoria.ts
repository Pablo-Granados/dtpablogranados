/**
 * Contenido de la página de mentoría (Sistema Propio).
 * Precio y cupos se cambian acá, en un solo lugar.
 */

export const pricing = {
  currency: 'USD',
  weeks: 12,
  full: 690,
  /** Cuotas en orden. `when` es el momento de cada pago. */
  installments: [
    { amount: 250, when: 'al iniciar' },
    { amount: 250, when: 'a la mitad del programa' },
    { amount: 190, when: 'al finalizar' },
  ],
  /** Cohorte fundadora: precio reducido a cambio de testimonio y caso de estudio. Poner `spots: 0` para ocultarla. */
  founders: {
    price: 350,
    spots: 3,
    installments: [
      { amount: 175, when: 'al iniciar' },
      { amount: 175, when: 'a la mitad del programa' },
    ],
  },
};

/** Sesión 1:1: su valor se bonifica en la mentoría si la persona entra dentro del plazo. */
export const session = { price: 80, creditDays: 30 };

/** Texto de cuotas listo para mostrar: "250 al iniciar · 250 a la mitad del programa · 190 al finalizar". */
export const installmentsText = (list: { amount: number; when: string }[]) =>
  list.map((i) => `${pricing.currency} ${i.amount} ${i.when}`).join(' · ');

/** Garantía: cada semana cursada se cobra a valor proporcional; el resto se devuelve. */
export const guarantee = {
  windowWeeks: 2,
  weekValue: (price: number) => Math.round((price / pricing.weeks) * 100) / 100,
};

export const problem = {
  title: 'Mirás muchos partidos. Pocos terminan en una decisión.',
  body: [
    'Tenés clips, notas y alguna planilla. Pero cada semana empezás de cero, las categorías cambian según el rival y el informe termina siendo largo, o directamente no llega.',
    'No es falta de conocimiento del juego. Es falta de un sistema que ordene qué mirás, cómo lo guardás y cómo lo convertís en algo que el cuerpo técnico use.',
  ],
};

export const forWho = {
  yes: [
    'Entrenás o analizás en fútbol o futsal, en cualquier nivel competitivo',
    'Tenés acceso a video de tu equipo, o podés conseguirlo',
    'Podés dedicarle al menos 4 horas por semana',
    'Querés un proceso propio, no copiar el de otro',
  ],
  no: [
    'Buscás un curso grabado para mirar a tu ritmo',
    'No tenés equipo ni forma de conseguir video',
    'Querés aprender un software botón por botón (para eso están los tutoriales)',
    'Esperás que la mentoría te consiga trabajo en un club',
  ],
};

export const stages = [
  {
    weeks: 'Semana 1',
    title: 'Diagnóstico',
    body: 'Vemos cómo analizás hoy, tu contexto y qué querés tener resuelto en 12 semanas.',
    deliverable: 'Punto de partida y objetivo',
  },
  {
    weeks: 'Semanas 2–3',
    title: 'Qué mirar',
    body: 'Fases, principios y preguntas según el modelo de juego de tu equipo. Separar lo que pasó de cómo lo interpretás.',
    deliverable: 'Mapa de observación',
  },
  {
    weeks: 'Semanas 4–6',
    title: 'Capturar',
    body: 'Categorías, codificación y selección de clips en tu herramienta: Nacsport, LongoMatch, Once Sport o una opción gratuita.',
    deliverable: 'Panel propio y un partido analizado',
  },
  {
    weeks: 'Semanas 7–9',
    title: 'Rival y datos',
    body: 'Scouting de rival e individual. Qué medir, qué no y cómo mostrarlo sin que el número tape al video.',
    deliverable: 'Informe de rival real y tablero de seguimiento',
  },
  {
    weeks: 'Semanas 10–12',
    title: 'Comunicar y sostener',
    body: 'Presentar en 10 minutos, priorizar y armar tu semana de trabajo para que el proceso no dependa del tiempo que sobre.',
    deliverable: 'Presentación grabada y tu sistema documentado',
  },
] as const;

export const includes = [
  { title: '12 llamadas 1:1', body: 'Una por semana, de 45 minutos, por videollamada.' },
  { title: 'Devolución en video', body: 'Reviso cada entregable y te mando un video con mis anotaciones sobre tu trabajo.' },
  { title: 'Consultas entre sesiones', body: 'Por mensaje, de lunes a viernes, con respuesta dentro de las 24 horas.' },
  { title: 'Plantillas', body: 'Informe de rival, panel base, tablero y checklist semanal, listos para adaptar.' },
  { title: 'Ebook "Leé el Partido"', body: 'Como material de consulta durante todo el programa.' },
  { title: 'Seguimiento', body: 'Una llamada de control 30 días después de terminar.' },
] as const;

export const faq = [
  {
    q: '¿Sirve para fútbol o solo para futsal?',
    a: 'Para los dos. Vengo del futsal y lo uso como ejemplo muchas veces, pero el método es el mismo: cambian las estructuras, no las preguntas. Trabajamos siempre sobre tu deporte y tu equipo.',
  },
  {
    q: '¿Necesito Nacsport u otro software pago?',
    a: 'No. Si ya usás uno, trabajamos ahí. Si no, arrancamos con herramientas gratuitas y, si en algún momento conviene pasar a una paga, lo vemos juntos.',
  },
  {
    q: '¿Y si no trabajo en un club ahora?',
    a: 'Necesitás video de algún equipo que puedas seguir durante las 12 semanas: uno que dirijas, uno amateur, uno formativo. Sin eso, los entregables quedan en teoría y la mentoría pierde sentido.',
  },
  {
    q: '¿Cuánto tiempo por semana lleva?',
    a: 'Entre 4 y 6 horas: la llamada más el trabajo sobre tu entregable de esa etapa.',
  },
  {
    q: '¿Cómo se paga?',
    a: 'En 3 cuotas: la primera al iniciar, la segunda a la mitad del programa y la última al finalizar. Desde Argentina, por transferencia. Desde otros países, por ARQ o Takenos.',
  },
  {
    q: 'Hice una sesión 1:1, ¿se descuenta?',
    a: 'Sí. La sesión queda incluida en el precio: si hacés una sesión 1:1 y entrás a Sistema Propio dentro de los 30 días, los USD 80 se descuentan de las 12 semanas, también en la cohorte fundadora. En total pagás el precio del programa y tenés una llamada más (13 en vez de 12). Avisame al aplicar y lo coordinamos.',
  },
  {
    q: '¿Qué pasa si empiezo y no es para mí?',
    a: 'Podés pedir la devolución dentro de las 2 primeras semanas. Cada semana que cursaste se cobra a valor proporcional (el precio dividido 12) y el resto te lo devuelvo. Ejemplo: si pagaste USD 690 y hiciste 1 semana, esa semana son USD 57,50 y te devuelvo USD 632,50.',
  },
] as const;
