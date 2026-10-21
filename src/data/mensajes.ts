/**
 * Mensajes listos para cada paso del contacto (panel /admin → ficha del prospecto).
 * Tokens: {nombre} (primer nombre), {organizacion} y {sitio}. Lo que va entre [corchetes] se completa a mano.
 * Orden importa: dentro de un mismo paso, el primero que coincide con el prospecto es el sugerido.
 */
import { clubPlans } from './ofertas';
import { pricing, installmentsText, cohort, guarantee } from './mentoria';

export type Mensaje = {
  id: string;
  titulo: string;
  /** Estado del prospecto en el que corresponde mandarlo. */
  paso: 'Por contactar' | 'Contactado' | 'Respondió' | 'Informe enviado' | 'Propuesta' | 'Cliente';
  /** Solo para estos tipos de prospecto (sin definir = todos). */
  tipos?: readonly string[];
  /** Solo si el prospecto llegó por estos medios (sin definir = todos). */
  origenes?: readonly string[];
  texto: string;
  /** Estado al que pasa el prospecto cuando se marca como enviado. */
  avanza?: Mensaje['paso'];
  /** Días hasta el próximo seguimiento si no cambia de estado. `null` = sin seguimiento. */
  dias?: number | null;
};

const clubes = ['Club local', 'Club del exterior'] as const;
/** Personas que compran para sí mismas: entrenadores, analistas y otros. */
const personas = ['Entrenador o analista', 'Otro'] as const;

const usd = (n: number) => `USD ${n.toLocaleString('es-AR')}`;
const inicio = cohort.start;

export const mensajes: readonly Mensaje[] = [
  /* ---------- Primer contacto ---------- */
  {
    id: 'primer-club',
    titulo: 'Primer contacto · club o cuerpo técnico',
    paso: 'Por contactar',
    tipos: clubes,
    avanza: 'Contactado',
    texto: `Hola {nombre}, ¿cómo estás? Soy Pablo, DT y analista de futsal.

Hago informes tanto propios, como de rival para cuerpos técnicos: una página con cómo juega el equipo y cinco clips con los patrones más claros.

Me gustaría armarte uno del próximo rival de {organizacion}, sin costo, para que veas si te sirve. Si me pasás contra quién juegan, te lo mando antes del partido.

¿Te interesa?`,
  },
  {
    id: 'primer-agencia',
    titulo: 'Primer contacto · agencia',
    paso: 'Por contactar',
    tipos: ['Agencia'],
    avanza: 'Contactado',
    texto: `Hola {nombre}, ¿cómo andás? Soy Pablo Granados, DT y analista de futsal. Armé Futsal Hub una plataforma con las estadísticas del futsal de Rosario, una version para datos en vivo para uso de los cuerpos técnicos con gestión de plantilla, minutos jugados, mapas de calor y demás.

Hago herramientas y análisis para agencias y clubes. Vi lo que hacen en {organizacion} y se me ocurrieron un par de cosas que les podrían servir.

¿Te las cuento en un minuto?`,
  },
  {
    id: 'primer-entrenador',
    titulo: 'Primer contacto · entrenador o analista',
    paso: 'Por contactar',
    tipos: ['Entrenador o analista', 'Otro'],
    avanza: 'Contactado',
    texto: `Hola {nombre}, ¿qué tal? Soy Pablo, DT y analista de futsal.

Analizo partidos y armo mis propias planillas y paneles para ordenar el trabajo. Dejé en la web un diagnóstico gratis de dos minutos para ver cómo analizás hoy y por dónde mejorar: {sitio}/diagnostico

Si lo hacés, me gustaría saber qué te pareció.`,
  },

  /* ---------- Seguimiento sin respuesta ---------- */
  {
    id: 'seguimiento-1',
    titulo: 'Seguimiento 1 · sin respuesta',
    paso: 'Contactado',
    dias: 4,
    texto: `Hola {nombre}, te escribo de nuevo por si el mensaje quedó perdido.

Sigo con lo del informe de rival sin costo: si me pasás el próximo partido, lo armo y lo ves. Si ahora no es el momento, decime y no insisto.`,
  },
  {
    id: 'seguimiento-2',
    titulo: 'Seguimiento 2 · último mensaje',
    paso: 'Contactado',
    dias: 14,
    texto: `{nombre}, te dejo este último mensaje por el tema para no molestar.

Si más adelante querés el informe del rival o conocer cómo trabajo, escribime cuando quieras. ¡Éxitos en lo que viene!`,
  },

  /* ---------- Entró por la web: primera respuesta ---------- */
  {
    id: 'entrante-diagnostico',
    titulo: 'Respuesta a quien hizo el diagnóstico',
    paso: 'Respondió',
    origenes: ['Diagnóstico'],
    dias: 3,
    texto: `Hola {nombre}, soy Pablo. Vi que hiciste el diagnóstico en la web, gracias.

Si querés te lo comento: qué me marcó tu resultado y por dónde empezaría yo.

Contame, ¿cuál es hoy tu mayor dolor de cabeza cuando preparás un partido?`,
  },
  {
    id: 'entrante-plantilla',
    titulo: 'Respuesta a quien bajó una plantilla',
    paso: 'Respondió',
    origenes: ['Plantillas'],
    dias: 3,
    texto: `Hola {nombre}, soy Pablo. Vi que bajaste la plantilla, ojalá te sirva.

Si la probás, contame qué ajustarías: las voy mejorando con lo que me dicen. ¿La vas a usar en tu equipo o para otra cosa?`,
  },
  {
    id: 'entrante-formulario',
    titulo: 'Respuesta a una consulta de la web',
    paso: 'Respondió',
    origenes: ['Formulario web'],
    dias: 2,
    texto: `Hola {nombre}, soy Pablo. Recibí tu consulta, gracias por escribir.

Para entender bien qué necesitás: ¿cuántos partidos juegan por semana y quién se encarga hoy del análisis? Con eso te digo cómo te puedo ayudar.`,
  },

  /* ---------- Respondió: informe de cortesía ---------- */
  {
    id: 'oferta-informe',
    titulo: 'Ofrecer el informe de cortesía',
    paso: 'Respondió',
    tipos: [...clubes, 'Agencia'],
    dias: 2,
    texto: `Genial {nombre}. Para armarte el informe de cortesía necesito dos cosas:

1) Contra quién juegan el próximo partido y cuándo.
2) Si tenés algún video o link del rival (si no, lo busco yo).

Te lo mando el [día] y me decís si te sirve. Sin compromiso.`,
  },
  {
    id: 'oferta-mini-taller',
    titulo: 'Ofrecer el mini-taller (para empezar liviano)',
    paso: 'Respondió',
    tipos: personas,
    dias: 3,
    texto: `{nombre}, si querés empezar por algo corto: tengo un mini-taller de una hora en video para armar tu primer informe de rival de una página, con la plantilla lista (ARS 9.900, pago único).

Lo ves a tu ritmo y lo usás con el próximo rival de tu equipo. Si te interesa, te paso cómo se paga.`,
  },
  {
    id: 'oferta-taller',
    titulo: 'Ofrecer el taller en vivo (USD 120)',
    paso: 'Respondió',
    tipos: personas,
    dias: 3,
    texto: `{nombre}, si preferís hacerlo acompañado: armé un taller en vivo, en grupo reducido (hasta 12 personas), de 3 encuentros de 90 minutos. Armás un informe de rival real con tu propio video y recibís una devolución mía en video, individual. Son USD 120 e incluye el ebook, las plantillas y las grabaciones.

Y si después seguís con la mentoría, esos USD 120 se descuentan. ¿Te cuento las fechas del próximo grupo?`,
  },
  {
    id: 'oferta-sesion',
    titulo: 'Ofrecer la sesión 1:1 (entrenadores)',
    paso: 'Respondió',
    tipos: personas,
    dias: 3,
    texto: `{nombre}, si querés ayuda personal con tu forma de analizar, hago sesiones 1:1 de video (USD 80): vemos un partido tuyo, te marco qué ajustar y te llevás el ebook y el análisis de tres jugadas.

Y si después querés seguir, ese valor se descuenta del Sistema Propio, que es la mentoría. ¿Lo vemos?`,
  },
  {
    id: 'invitacion-mentoria',
    titulo: 'Invitar a conocer la mentoría',
    paso: 'Respondió',
    tipos: personas,
    dias: 2,
    texto: `{nombre}, por lo que me contás, lo que más te serviría es ordenar todo tu proceso y no sumar otra herramienta suelta.

Para eso armé Sistema Propio: una mentoría 1:1 de ${pricing.weeks} semanas donde construís tu sistema de análisis con tu equipo real (qué mirar, cómo capturarlo, qué medir y cómo presentarlo). La próxima camada arranca el ${inicio}.

Está todo acá: {sitio}/mentoria. Si te interesa, aplicás en {sitio}/mentoria/aplicar y hacemos una llamada corta para ver si encaja. Si no encaja, te lo digo.`,
  },
  {
    id: 'propuesta-mentoria',
    titulo: 'Propuesta · Sistema Propio',
    paso: 'Respondió',
    tipos: personas,
    avanza: 'Propuesta',
    dias: 3,
    texto: `{nombre}, te dejo clara la propuesta de Sistema Propio:

• ${pricing.weeks} llamadas 1:1 de 45 minutos, una por semana.
• 5 entregables (plan, mapa de observación, panel propio, informes y presentación) con devolución en video.
• Consultas de lunes a viernes, con respuesta dentro de las 24 horas.
• Plantillas, ebook y una llamada de control a los 30 días.

Inversión: ${usd(pricing.full)} (${installmentsText(pricing.installments)}). Pagando todo junto, 10% de descuento.
Arranca el ${inicio}. Podés pedir la devolución dentro de las primeras ${guarantee.windowWeeks} semanas.

¿Lo vemos en una llamada corta?`,
  },
  {
    id: 'entrega-informe',
    titulo: 'Entrega del informe',
    paso: 'Respondió',
    avanza: 'Informe enviado',
    texto: `{nombre}, te paso el informe de [rival]: una página con cómo juega y cinco clips de lo que más repite.

Miralo con calma y contame: ¿qué te sirvió y qué le agregarías? Después del partido, si querés, charlamos cómo te fue con eso.`,
  },

  /* ---------- Propuesta ---------- */
  {
    id: 'propuesta',
    titulo: 'Propuesta de trabajo continuo',
    paso: 'Informe enviado',
    tipos: [...clubes, 'Agencia'],
    avanza: 'Propuesta',
    texto: `{nombre}, ¿cómo viste el informe? Si te sirvió, lo que hago de forma continua es esto:

• Plan Seguimiento (USD ${clubPlans.seguimiento}/mes): informe de rival por partido (hasta 4 por mes), una reunión mensual con el cuerpo técnico y consultas por WhatsApp.
• Plan Integral (USD ${clubPlans.integral}/mes): todo lo anterior, más la ficha de partido de tu propio equipo, dos reuniones al mes y un panel de seguimiento.

Es mes a mes, sin contrato. Si tienen varias categorías, lo armo a medida.

¿Cuál te cierra más?`,
  },
  {
    id: 'seguimiento-propuesta',
    titulo: 'Seguimiento de la propuesta',
    paso: 'Propuesta',
    tipos: [...clubes, 'Agencia'],
    dias: 4,
    texto: `Hola {nombre}, ¿pudiste ver la propuesta?

Si tenés dudas con algún punto, decime y lo ajusto a lo que necesite {organizacion}. Y si preferís empezar más liviano, lo charlamos.`,
  },
  {
    id: 'cierre',
    titulo: 'Confirmación y arranque',
    paso: 'Propuesta',
    tipos: [...clubes, 'Agencia'],
    dias: 2,
    texto: `Perfecto {nombre}, ¡bienvenidos!

Para dejarlo en marcha: te paso los datos de pago (los pagos son del 1 al 5 de cada mes) y me confirmás el calendario de partidos del mes, así arranco con el primer informe. ¿Te parece?`,
  },

  {
    id: 'seguimiento-mentoria',
    titulo: 'Mentoría · seguimiento de la propuesta',
    paso: 'Propuesta',
    tipos: personas,
    dias: 3,
    texto: `Hola {nombre}, ¿pudiste ver la propuesta de Sistema Propio?

Si te quedó alguna duda (el formato, el tiempo que lleva, cómo se adapta a tu nivel), decime y te la respondo. La camada del ${inicio} tiene ${cohort.spots} lugares y se van completando por orden de aplicación.`,
  },
  {
    id: 'objecion-precio',
    titulo: 'Mentoría · "es mucho para mí"',
    paso: 'Propuesta',
    tipos: personas,
    dias: 3,
    texto: `{nombre}, te entiendo, es una inversión importante y está bien que lo pienses.

Para que no sea todo de golpe: se paga en 3 cuotas (${installmentsText(pricing.installments)}), y todo termina de pagarse antes de la semana 9. Y si preferís probar antes, el taller en vivo (USD 120) se descuenta si después entrás a la mentoría.

También tenés ${guarantee.windowWeeks} semanas para pedir la devolución si no es lo que esperabas. ¿Cuál te sirve más?`,
  },
  {
    id: 'objecion-tiempo',
    titulo: 'Mentoría · "no tengo tiempo"',
    paso: 'Propuesta',
    tipos: personas,
    dias: 3,
    texto: `{nombre}, es la duda más común. El programa pide entre 4 y 6 horas por semana: la llamada de 45 minutos más el trabajo sobre tu propio equipo. No es un curso aparte: el entregable de cada semana ES tu análisis de la semana.

Si hoy no podés sostener eso, mejor lo dejamos para la próxima camada, así no pagás algo que no vas a aprovechar. ¿Cómo viene tu semana tipo?`,
  },
  {
    id: 'cupos-cierre',
    titulo: 'Mentoría · últimos lugares',
    paso: 'Propuesta',
    tipos: personas,
    dias: 2,
    texto: `Hola {nombre}, te aviso que la camada del ${inicio} está cerrando: quedan [N] lugares.

Si querés asegurar el tuyo, esta semana te paso los datos de pago y lo dejamos confirmado. Si no es el momento, avisame y te guardo para la próxima. ¿Cómo lo ves?`,
  },
  {
    id: 'cierre-mentoria',
    titulo: 'Mentoría · confirmación y pago',
    paso: 'Propuesta',
    tipos: personas,
    avanza: 'Cliente',
    dias: 1,
    texto: `¡Genial {nombre}, bienvenido a Sistema Propio!

Para dejar tu lugar confirmado:
1) Primera cuota de ${usd(pricing.installments[0].amount)} (o ${usd(Math.round(pricing.full * 0.9))} si pagás todo junto). Datos de pago: [datos de pago; desde el exterior, por ARQ o Takenos].
2) Cuando acredite, te mando por mail las condiciones del programa y el formulario de inicio.

La primera llamada es en la semana del ${inicio}. Apenas confirmo el pago te escribo para coordinar día y horario.`,
  },

  /* ---------- Cliente ---------- */
  {
    id: 'onb-bienvenida',
    titulo: 'Onboarding 1 · bienvenida (al confirmar el pago)',
    paso: 'Cliente',
    tipos: personas,
    dias: 2,
    texto: `{nombre}, ¡pago recibido, gracias! Ya estás adentro de Sistema Propio.

Te dejo los próximos pasos:
1) Leé las condiciones del programa (adjuntas en el mail).
2) Completá el formulario de inicio: [link]. Me sirve para llegar a la primera llamada con tu plan casi armado.
3) Reservá tu primera llamada acá: [link de Cal.com].
4) Elegí el equipo y dos partidos completos en video con los que vamos a trabajar las ${pricing.weeks} semanas.

Cualquier duda, escribime por acá.`,
  },
  {
    id: 'onb-previa',
    titulo: 'Onboarding 2 · tres días antes de la primera llamada',
    paso: 'Cliente',
    tipos: personas,
    dias: 2,
    texto: `Hola {nombre}, en 3 días es nuestra primera llamada. Para aprovechar los 45 minutos, traé:

• El equipo y los dos partidos con los que vamos a trabajar, ya con el video a mano.
• Un partido que hayas analizado hasta hoy (o la planilla que usás), aunque sea desordenado.
• Qué herramienta tenés instalada, si es que tenés alguna.
• Cuánto tiempo te lleva hoy preparar un informe y qué querés tener resuelto en la semana ${pricing.weeks}.

Con eso armamos tu plan personal de una página.`,
  },
  {
    id: 'onb-recordatorio',
    titulo: 'Onboarding 3 · recordatorio del día anterior',
    paso: 'Cliente',
    tipos: personas,
    dias: 1,
    texto: `{nombre}, te recuerdo que mañana a las [hora] tenemos la primera llamada. Link: [link]. Si tenés que mover el horario, avisame hoy así lo reprogramamos sin problema.`,
  },
  {
    id: 'onb-primera-semana',
    titulo: 'Onboarding 4 · después de la primera llamada',
    paso: 'Cliente',
    tipos: personas,
    dias: 5,
    texto: `{nombre}, gracias por la llamada de hoy. Te dejo por escrito lo acordado:

• Equipo y partidos con los que trabajamos: [equipo y partidos].
• Tu objetivo para la semana ${pricing.weeks}: [objetivo].
• Tarea de esta semana: [tarea]. Entregable: plan personal de una página.

Me lo mandás antes de nuestra próxima llamada y te respondo con un video de devolución. Cualquier consulta entre llamadas, por acá, de lunes a viernes.`,
  },
  {
    id: 'tes-semana-12',
    titulo: 'Mentoría · pedir testimonio (semana 12)',
    paso: 'Cliente',
    tipos: personas,
    dias: 7,
    texto: `{nombre}, ¡llegamos al final del programa! Quería felicitarte por el trabajo que hiciste.

Te pido dos cosas: 1) un testimonio sincero de cómo fue el proceso y qué cambió en tu forma de analizar (el texto o un audio cortito, como te quede cómodo); y 2) si estás de acuerdo, tu permiso para mostrar tu informe (sin datos sensibles) como caso de estudio.

Y recordá que a los 30 días hacemos la llamada de control: [fecha].`,
  },
  {
    id: 'upsell-pro',
    titulo: 'Mentoría · invitar a Sistema Propio Pro (llamada de control)',
    paso: 'Cliente',
    tipos: personas,
    dias: null,
    texto: `{nombre}, ¿cómo te fue estos 30 días aplicando tu sistema?

Si querés seguir con acompañamiento, tengo Sistema Propio Pro: 12 semanas más donde revisamos tus partidos reales y tu rival de turno semana a semana, con respuesta en el día y una presentación al cuerpo técnico preparada juntos. Cupo de 2 personas por camada. ¿Lo charlamos en la llamada de control?`,
  },
  {
    id: 'post-mini-taller',
    titulo: 'Después del mini-taller · invitar al taller en vivo',
    paso: 'Cliente',
    tipos: personas,
    dias: 7,
    texto: `Hola {nombre}, ¿pudiste ver el mini-taller y armar tu primer informe de rival? Contame cómo te fue y qué te trabó.

Si querés hacerlo acompañado y con devolución mía sobre tu propio informe, el próximo paso es el taller en vivo (USD 120, grupo reducido). ¿Te cuento cuándo es el siguiente?`,
  },
  {
    id: 'post-taller',
    titulo: 'Después del taller en vivo · invitar a la mentoría',
    paso: 'Cliente',
    tipos: personas,
    dias: 5,
    texto: `{nombre}, gracias por participar del taller. Vi tu informe y tenés una base muy buena.

Lo que sigue, si querés ordenar todo tu proceso y no solo los informes de rival, es Sistema Propio. Como hiciste el taller, tus USD 120 se descuentan si entrás dentro de los 30 días. La próxima camada arranca el ${inicio}. ¿Lo vemos en una llamada corta?`,
  },
  {
    id: 'posventa',
    titulo: 'Pedir opinión (posventa)',
    paso: 'Cliente',
    dias: null,
    texto: `Hola {nombre}, ¿cómo vienen? Quería saber qué es lo que más te está sirviendo de lo que hacemos y qué cambiarías.

Me ayuda un montón para ajustar el trabajo.`,
  },
] as const;

export const pasos = ['Por contactar', 'Contactado', 'Respondió', 'Informe enviado', 'Propuesta', 'Cliente'] as const;
