/**
 * Contenido de la página de mentoría (Sistema Propio).
 * Precio y cupos se cambian acá, en un solo lugar.
 */

export const pricing = {
  currency: 'USD',
  weeks: 12,
  full: 1500,
  /** Cuotas en orden. `when` es el momento de cada pago. Todo se cobra antes de la semana 9. */
  installments: [
    { amount: 600, when: 'al iniciar' },
    { amount: 450, when: 'en la semana 5' },
    { amount: 450, when: 'en la semana 9' },
  ],
  /** Cohorte fundadora: precio reducido a cambio de testimonio y caso de estudio. Poner `spots: 0` para ocultarla. */
  founders: {
    price: 750,
    spots: 3,
    installments: [
      { amount: 375, when: 'al iniciar' },
      { amount: 375, when: 'a la mitad del programa' },
    ],
  },
};

/** Sesión 1:1: su valor se bonifica en la mentoría si la persona entra dentro del plazo. */
export const session = { price: 80, creditDays: 30 };

/** Texto de cuotas listo para mostrar: "600 al iniciar · 450 en la semana 5 · 450 en la semana 9". */
export const installmentsText = (list: { amount: number; when: string }[]) =>
  list.map((i) => `${pricing.currency} ${i.amount} ${i.when}`).join(' · ');

/** Garantía: cada semana cursada se cobra a valor proporcional; el resto se devuelve. */
export const guarantee = {
  windowWeeks: 2,
  weekValue: (price: number) => Math.round((price / pricing.weeks) * 100) / 100,
};

/** Pago completo por adelantado: descuento sobre el precio de lista. */
export const upfrontDiscount = 0.1;

/** Niveles de la escalera. El estándar toma sus números de `pricing`; el resto se ajusta acá. */
export const tiers = [
  {
    id: 'intensivo',
    name: 'Intensivo de pretemporada',
    weeks: 4,
    price: 490,
    summary: 'Para entrar al método sin comprometer 12 semanas: un mapa de observación, un panel y un informe de rival hechos con tu equipo.',
    items: ['4 llamadas 1:1 de 45 minutos', 'Mapa de observación, panel propio e informe de rival', 'Plantillas y ebook "Leé el Partido"', 'Si seguís con Sistema Propio, el intensivo se descuenta'],
    note: 'Se hace antes de que arranque la temporada.',
  },
  {
    id: 'estandar',
    name: 'Sistema Propio',
    weeks: pricing.weeks,
    price: pricing.full,
    summary: 'El programa completo: tu sistema de análisis funcionando sobre tu equipo real.',
    items: ['12 llamadas 1:1 de 45 minutos', '5 entregables con devolución en video', 'Consultas de lunes a viernes, respuesta en 24 horas', 'Llamada de control a los 30 días'],
    note: 'El más elegido.',
  },
  {
    id: 'pro',
    name: 'Sistema Propio Pro',
    weeks: 24,
    price: 2900,
    summary: 'El programa completo más 12 semanas de implementación: analizamos tus partidos reales, semana a semana, con vos.',
    items: ['Todo Sistema Propio', '12 semanas más: revisión de tus partidos reales y de tu rival de turno', 'Respuesta en el día por WhatsApp', 'Una presentación al cuerpo técnico, preparada y ensayada juntos'],
    note: 'Cupo de 2 personas por cohorte.',
  },
  {
    id: 'cuerpo-tecnico',
    name: 'Cuerpo Técnico',
    weeks: pricing.weeks,
    price: 2400,
    summary: 'Para 2 o 3 personas del mismo staff que quieren trabajar con el mismo sistema.',
    items: ['Programa de 12 semanas para hasta 3 personas', 'Un plan único y un panel compartido', 'Informe de rival y propio hechos por el staff', 'Llamada de control a los 30 días'],
    note: 'Un solo equipo, un solo método.',
  },
] as const;

/** Bonos incluidos en Sistema Propio y los niveles superiores. */
export const bonuses = [
  { title: 'Revisión de un partido en vivo', body: 'Un partido real de tu equipo analizado juntos, con vos viendo cómo lo hago.' },
  { title: 'Banco de informes modelo', body: 'Informes de rival, de partido propio y de jugador reales, para copiar la estructura.' },
  { title: 'Certificado de finalización', body: 'Con el detalle de tus entregables, para tu CV o tu portfolio.' },
  { title: 'Comunidad de egresados', body: 'Un grupo cerrado con quienes pasaron por el programa: dudas, partidos y ofertas de trabajo.' },
] as const;

/** Cuándo abre la próxima cohorte. Actualizar acá cada vez que se abre una. */
export const cohort = { label: 'Próxima cohorte', start: 'A confirmar', spots: 3 };

export const problem = {
  title: 'Mirás muchos partidos. Pocos terminan en una decisión.',
  body: [
    'Tenés clips, notas y alguna planilla. Pero cada semana empezás de cero, las categorías cambian según el rival y el informe termina siendo largo, o directamente no llega.',
    'No es falta de conocimiento del juego. Es falta de un sistema que ordene qué mirás, cómo lo guardás y cómo lo convertís en algo que el cuerpo técnico use.',
  ],
};

export const forWho = {
  yes: [
    'Sos entrenador (con o sin experiencia en tecnología), analista, preparador físico que quiere sumar análisis o aficionado que quiere introducirse',
    'Trabajás fútbol o futsal, en cualquier nivel',
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
    title: 'Diagnóstico y plan a medida',
    body: 'Vemos cómo analizás hoy, tu nivel y tu contexto, y armamos tu ruta. El ritmo y la profundidad se ajustan a vos, no al revés.',
    deliverable: 'Plan personal de una página',
  },
  {
    weeks: 'Semanas 2–3',
    title: 'Qué mirar',
    body: 'Vocabulario, fases, principios y preguntas según el modelo de juego de tu equipo. Separar lo que pasó de cómo lo interpretás.',
    deliverable: 'Principios y mapa de observación',
  },
  {
    weeks: 'Semanas 4–6',
    title: 'Herramientas',
    body: 'Armás tu panel, codificás un partido completo y cortás los clips. Trabajamos con LongoMatch y te muestro cómo hacer lo mismo en Nacsport y Once Sport, y cómo editar con Premiere o CapCut.',
    deliverable: 'Panel propio, un partido analizado y un pack de clips',
  },
  {
    weeks: 'Semanas 7–10',
    title: 'Informes y datos',
    body: 'Tu informe propio, el informe de rival, un tablero de seguimiento y el scout de un jugador. Qué medir, qué no y cómo mostrarlo sin que el número tape al video.',
    deliverable: 'Informe propio, informe de rival, tablero y ficha individual',
  },
  {
    weeks: 'Semanas 11–12',
    title: 'Comunicar y sostener',
    body: 'Presentar en 10 minutos, priorizar y armar tu semana de trabajo para que el proceso no dependa del tiempo que sobre.',
    deliverable: 'Presentación grabada y tu sistema documentado',
  },
] as const;

export const includes = [
  { title: '12 llamadas 1:1', body: 'Una por semana, de 45 minutos, por videollamada. Armadas a tu medida desde la primera.' },
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
    a: 'No hace falta que compres nada para empezar. Trabajo con LongoMatch y te muestro cómo se hace lo mismo en Nacsport y Once Sport. Para editar los clips usamos Premiere o CapCut, que es gratis. Si ya usás una herramienta, trabajamos ahí. Si no tenés ninguna, arrancamos con opciones gratuitas y, si conviene pasar a una paga, lo vemos juntos.',
  },
  {
    q: '¿Sirve si recién empiezo o si no sé de tecnología?',
    a: 'Sí. En la primera llamada definimos tu nivel y tu ruta: si recién empezás, vamos paso a paso y con plantillas listas; si ya analizás, vamos más directo a lo avanzado. Son las mismas 12 semanas, con la profundidad que necesitás.',
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
    a: 'En 3 cuotas: USD 600 al iniciar, USD 450 en la semana 5 y USD 450 en la semana 9. Pagando todo por adelantado tenés un 10% de descuento (USD 1.350). Desde Argentina, por transferencia. Desde otros países, por ARQ o Takenos.',
  },
  {
    q: 'Hice una sesión 1:1, ¿se descuenta?',
    a: 'Sí. La sesión queda incluida en el precio: si hacés una sesión 1:1 y entrás a Sistema Propio dentro de los 30 días, los USD 80 se descuentan de las 12 semanas, también en la cohorte fundadora. En total pagás el precio del programa y tenés una llamada más (13 en vez de 12). Avisame al aplicar y lo coordinamos.',
  },
  {
    q: '¿Qué pasa si empiezo y no es para mí?',
    a: 'Podés pedir la devolución dentro de las 2 primeras semanas. Cada semana que cursaste se cobra a valor proporcional (el precio dividido 12) y el resto te lo devuelvo. Ejemplo: si pagaste USD 1.500 y hiciste 1 semana, esa semana son USD 125 y te devuelvo USD 1.375.',
  },
] as const;
