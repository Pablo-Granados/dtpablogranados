/**
 * Mensajes listos para cada paso del contacto (panel /admin → ficha del prospecto).
 * Tokens: {nombre} (primer nombre), {organizacion} y {sitio}. Lo que va entre [corchetes] se completa a mano.
 * Orden importa: dentro de un mismo paso, el primero que coincide con el prospecto es el sugerido.
 */
import { clubPlans } from './ofertas';

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

export const mensajes: readonly Mensaje[] = [
  /* ---------- Primer contacto ---------- */
  {
    id: 'primer-club',
    titulo: 'Primer contacto · club o cuerpo técnico',
    paso: 'Por contactar',
    tipos: clubes,
    avanza: 'Contactado',
    texto: `Hola {nombre}, ¿cómo estás? Soy Pablo, DT de futsal.

Hago informes de rival para cuerpos técnicos: una página con cómo juega el equipo y cinco clips de lo que más repite.

Me gustaría armarte uno del próximo rival de {organizacion}, sin costo, para que veas si te sirve. Si me pasás contra quién juegan, te lo mando antes del partido.

¿Te interesa?`,
  },
  {
    id: 'primer-agencia',
    titulo: 'Primer contacto · agencia',
    paso: 'Por contactar',
    tipos: ['Agencia'],
    avanza: 'Contactado',
    texto: `Hola {nombre}, ¿cómo andás? Soy Pablo Granados, DT de futsal. Armé Futsal Hub (una plataforma de estadísticas de futsal) y el sitio de LAA Sports.

Hago herramientas y análisis para agencias y clubes. Vi lo que hacen en {organizacion} y se me ocurrieron un par de cosas que les podrían servir.

¿Te las cuento en un audio de un minuto o preferís por acá?`,
  },
  {
    id: 'primer-entrenador',
    titulo: 'Primer contacto · entrenador o analista',
    paso: 'Por contactar',
    tipos: ['Entrenador o analista', 'Otro'],
    avanza: 'Contactado',
    texto: `Hola {nombre}, ¿qué tal? Soy Pablo, DT de futsal.

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

Si querés te lo comento en un audio: qué me marcó tu resultado y por dónde empezaría yo.

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
    id: 'oferta-sesion',
    titulo: 'Ofrecer la sesión 1:1 (entrenadores)',
    paso: 'Respondió',
    tipos: ['Entrenador o analista', 'Otro'],
    dias: 3,
    texto: `{nombre}, si querés ayuda personal con tu forma de analizar, hago sesiones 1:1 de video (USD 80): vemos un partido tuyo, te marco qué ajustar y te llevás el ebook y el análisis de tres jugadas.

Y si después querés seguir, ese valor se descuenta del Sistema Propio, que es la mentoría. ¿Lo vemos?`,
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
    dias: 4,
    texto: `Hola {nombre}, ¿pudiste ver la propuesta?

Si tenés dudas con algún punto, decime y lo ajusto a lo que necesite {organizacion}. Y si preferís empezar más liviano, lo charlamos.`,
  },
  {
    id: 'cierre',
    titulo: 'Confirmación y arranque',
    paso: 'Propuesta',
    dias: 2,
    texto: `Perfecto {nombre}, ¡bienvenidos!

Para dejarlo en marcha: te paso los datos de pago (los pagos son del 1 al 5 de cada mes) y me confirmás el calendario de partidos del mes, así arranco con el primer informe. ¿Te parece?`,
  },

  /* ---------- Cliente ---------- */
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
