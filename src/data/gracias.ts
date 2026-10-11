/**
 * Páginas de agradecimiento (/gracias?de=...). Cada formulario o reserva termina acá:
 * dice qué pasó, qué va a pasar y qué hacer mientras tanto.
 * Para sumar un caso: agregá una clave en `gracias` y mandá a la persona a /gracias?de=esa-clave.
 */

export type Gracias = {
  kicker: string;
  title: string;
  intro: string;
  steps: { title: string; body: string }[];
  /** Muestra el aviso de "revisá tu mail". */
  mail?: boolean;
  /** Qué hacer mientras tanto. */
  next: { title: string; body: string; href: string; event: string; external?: boolean }[];
};

const diagnostico = {
  title: 'Hacé el diagnóstico',
  body: 'En 3 minutos te dice cómo analizás hoy y por dónde empezar.',
  href: '/diagnostico',
  event: 'gracias_diagnostico',
};
const plantillas = {
  title: 'Bajá las plantillas gratis',
  body: 'Mapa de observación, panel, ficha de partido y checklist semanal.',
  href: '/plantillas',
  event: 'gracias_plantillas',
};
const casos = {
  title: 'Mirá lo que construí',
  body: 'Futsal Hub y LAA Sports: cómo los pensé y cómo funcionan.',
  href: '/#proyectos',
  event: 'gracias_casos',
};

export const gracias: Record<string, Gracias> = {
  equipos: {
    kicker: 'Consulta recibida',
    title: 'Gracias por contarme',
    intro: 'Te mandé un mail de confirmación. Lo que me contaste lo leo yo y te respondo personalmente dentro de las 24 horas.',
    mail: true,
    steps: [
      { title: 'Leo tu consulta', body: 'Con lo que me contaste de tu club u organización, antes de escribirte.' },
      { title: 'Te respondo', body: 'Con preguntas concretas o con una propuesta, dentro de las 24 horas.' },
      { title: 'Si hay encaje, lo coordinamos', body: 'Una llamada corta para definir qué plan te conviene.' },
    ],
    next: [casos, plantillas],
  },

  clip: {
    kicker: 'Clip recibido',
    title: 'Gracias por mandarlo',
    intro: 'Te mandé un mail de confirmación. Cada mes elijo los clips que dejan más enseñanza, así que no se analizan todos.',
    mail: true,
    steps: [
      { title: 'Lo veo', body: 'Miro el clip y la pregunta que me dejaste.' },
      { title: 'Elijo los del mes', body: 'Priorizo los que le sirven a más gente. Que el tuyo no entre este mes no dice nada sobre tu clip.' },
      { title: 'Si lo elijo, te aviso', body: 'Lo analizo de manera pública (Instagram o YouTube) el mes que viene y te paso el link.' },
    ],
    next: [diagnostico, { title: 'Mirá análisis en YouTube', body: 'Así vas viendo cómo trabajo un partido.', href: 'https://www.youtube.com/@dtpablogranados', event: 'gracias_youtube', external: true }],
  },

  aplicacion: {
    kicker: 'Aplicación recibida',
    title: 'Gracias por contarme',
    intro: 'Por lo que me contaste, hoy Sistema Propio no es lo que más te va a servir, y prefiero decírtelo ahora en lugar de venderte algo que no vas a poder aprovechar. Te mandé un mail con los próximos pasos.',
    mail: true,
    steps: [
      { title: 'Empezá por el diagnóstico', body: 'Son 3 minutos y te devuelve tu perfil de analista.' },
      { title: 'Probá las plantillas gratis', body: 'Sirven para ordenar tu trabajo sin pagar nada.' },
      { title: 'Volvé cuando tu situación cambie', body: 'Podés aplicar de nuevo cuando quieras.' },
    ],
    next: [diagnostico, plantillas],
  },

  reserva: {
    kicker: 'Llamada agendada',
    title: 'Quedó agendada',
    intro: 'Te llega un mail de Cal.com con el día, la hora y el link de la videollamada.',
    mail: true,
    steps: [
      { title: 'Leo tu aplicación', body: 'Antes de la llamada, así no perdemos tiempo en lo que ya me contaste.' },
      { title: 'Tené a mano un partido', body: 'Si podés, el video de un partido del equipo con el que querés trabajar.' },
      { title: 'Hablamos', body: 'Vemos tu caso y si Sistema Propio te sirve. Si no es para vos, te lo digo.' },
    ],
    next: [diagnostico, plantillas],
  },

  mentoria: {
    kicker: 'Llamada reservada',
    title: 'Listo, quedó agendada',
    intro: 'Te llega un mail de Cal.com con la confirmación. Si necesitás cambiarla, podés reprogramarla desde ese mismo mail.',
    mail: true,
    steps: [
      { title: 'Repasá tu tarea', body: 'La de la semana anterior, así aprovechamos la llamada.' },
      { title: 'Llegá con tus dudas anotadas', body: 'Es la mejor forma de usar los 45 minutos.' },
      { title: 'Después de la llamada', body: 'Te dejo la tarea de la semana y la devolución en video de tu entregable.' },
    ],
    next: [],
  },
};

/** Si el caso no existe, se muestra un agradecimiento genérico. */
export const graciasGenerica: Gracias = {
  kicker: 'Recibido',
  title: 'Gracias',
  intro: 'Recibí tu mensaje. Si esperás una respuesta, te escribo a tu mail.',
  steps: [],
  next: [diagnostico, plantillas],
};
