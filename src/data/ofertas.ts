/**
 * Ofertas de la página "Trabajar juntos".
 * Precios y condiciones se cambian acá. La mentoría toma sus números de mentoria.ts.
 *
 * Los CTA que apuntan a WhatsApp son temporales, hasta tener los formularios propios.
 */
import { pricing, installmentsText, session, tiers, upfrontDiscount } from './mentoria';
import { cta, wa } from './site';

export type Offer = {
  id: string;
  name: string;
  /** Una línea: qué resuelve. */
  summary: string;
  items: string[];
  /** Precio principal, ya formateado. */
  price: string;
  /** Aclaración de precio o forma de pago. */
  priceNote?: string;
  /** Etiqueta chica arriba del nombre (ej: "Cupo limitado"). */
  badge?: string;
  /** Detalle secundario destacado (ej: cohorte fundadora). */
  extra?: { label: string; text: string };
  cta: { label: string; href: string; event: string };
};

export type Chapter = {
  id: 'gratis' | 'individual' | 'equipos';
  n: string;
  title: string;
  lead: string;
  offers: Offer[];
};

const usd = (n: number) => `USD ${n.toLocaleString('es-AR')}`;

const MONTHS_UPFRONT = 3;
const UPFRONT_DISCOUNT = 0.25;

/** Planes mensuales para clubes, en USD. Cambiar acá. */
export const clubPlans = { seguimiento: 220, integral: 350, medida: 500 };
const upfront = (monthly: number) => Math.round(monthly * MONTHS_UPFRONT * (1 - UPFRONT_DISCOUNT));

export const chapters: Chapter[] = [
  {
    id: 'gratis',
    n: '01',
    title: 'Empezar sin pagar',
    lead: 'Antes de invertir, conviene saber dónde estás parado. Esto es gratis y sirve aunque no trabajemos juntos.',
    offers: [
      {
        id: 'diagnostico',
        name: 'Diagnóstico del analista',
        summary: 'Doce preguntas sobre cómo analizás hoy. Te devuelvo tu perfil y por dónde conviene empezar.',
        items: ['3 minutos', 'Perfil en 5 áreas', 'Tus dos prioridades', 'Te llega por mail con la plantilla de informe de rival'],
        price: 'Gratis',
        cta: { label: cta.diagnostico.label, href: cta.diagnostico.href, event: cta.diagnostico.event },
      },
      {
        id: 'plantillas',
        name: 'Plantillas de trabajo',
        summary: 'Las herramientas que uso para analizar, completas y sin versiones de prueba.',
        items: [
          'Mapa de observación, panel de codificación, ficha de partido y checklist semanal',
          'Cada una en PDF y en hoja de cálculo editable',
          'Informe de rival de una página: se entrega con el diagnóstico',
        ],
        price: 'Gratis',
        badge: '4 plantillas',
        cta: { label: 'Ver las plantillas', href: '/plantillas', event: 'cta_plantillas' },
      },
      {
        id: 'clip',
        name: 'Análisis de un clip',
        summary: 'Mandás un clip de tu equipo. Elijo los que dejan más enseñanza y los analizo de manera pública.',
        items: [
          'Hay cupo cada mes: no se analizan todos los clips',
          'Un clip enviado este mes se analiza de manera pública (Instagram o YouTube) el mes que viene',
          'Al enviarlo, autorizás que se use en esa publicación',
        ],
        price: 'Gratis',
        badge: 'Por cupo mensual',
        cta: { label: 'Mandar un clip', href: '/clip', event: 'cta_clip' },
      },
    ],
  },
  {
    id: 'individual',
    n: '02',
    title: 'Trabajar conmigo',
    lead: 'Para entrenadores y analistas que quieren mejorar su propio proceso. De lo más corto a lo más profundo.',
    offers: [
      {
        id: 'ebook',
        name: 'Ebook "Leé el Partido"',
        summary: 'La forma de mirar un partido antes de analizarlo, con un glosario para usar los mismos términos.',
        items: [
          'PDF + glosario',
          'Se coordina por WhatsApp: pagás por transferencia en pesos y te lo envío por mail al confirmar',
        ],
        price: 'ARS 29.500',
        priceNote: 'Pago por transferencia en pesos',
        cta: {
          label: 'Pedir el ebook por WhatsApp',
          href: wa('Hola Pablo, quiero comprar el ebook "Leé el Partido".'),
          event: 'cta_ebook',
        },
      },
      {
        id: 'sesion',
        name: 'Sesión de análisis 1:1',
        summary: 'Una hora conmigo sobre tu equipo, con material hecho a partir de lo que vos elijas.',
        items: [
          'Videollamada de 60 minutos',
          'Me mandás 3 jugadas antes de la sesión: del video que quieras (tu equipo, un rival, un partido de referencia)',
          'Te entrego el material realizado durante la sesión',
          'Incluye el ebook "Leé el Partido" y su glosario',
          `Si en los ${session.creditDays} días siguientes entrás a Sistema Propio, los ${usd(session.price)} se descuentan del precio`,
          'Cómo se reserva: me escribís por WhatsApp, abonás, y te mando un link privado para elegir día y horario y cargar tus 3 jugadas',
        ],
        price: usd(session.price),
        priceNote: 'Pago único, bonificado si pasás a la mentoría',
        cta: {
          label: 'Reservar por WhatsApp',
          href: wa('Hola Pablo, quiero reservar una sesión de análisis 1:1 (USD 80).'),
          event: 'cta_sesion',
        },
      },
      {
        id: 'mentoria',
        name: 'Sistema Propio',
        summary: 'Mentoría 1:1 de 12 semanas. Construís tu sistema de análisis sobre tu equipo real.',
        items: [
          `${pricing.weeks} llamadas 1:1 de 45 minutos`,
          '5 entregables con devolución en video',
          'Consultas de lunes a viernes, respuesta en 24 horas',
          'Plantillas, ebook, bonos y llamada de control a los 30 días',
          `Niveles superiores: Pro (${usd(tiers[2].price)}), Cuerpo Técnico (${usd(tiers[3].price)}) e Intensivo (${usd(tiers[0].price)})`,
          `Pagando todo por adelantado, ${Math.round(upfrontDiscount * 100)}% de descuento`,
          `Si hiciste una sesión 1:1 en los últimos ${session.creditDays} días, se descuentan ${usd(session.price)}`,
        ],
        price: usd(pricing.full),
        priceNote: `${pricing.installments.length} cuotas: ${installmentsText(pricing.installments)}`,
        badge: '3 lugares simultáneos',
        // Pagando todo por adelantado hay descuento; ver mentoria.ts.
        extra:
          pricing.founders.spots > 0
            ? {
                label: `Cohorte fundadora · ${pricing.founders.spots} lugares`,
                text: `${usd(pricing.founders.price)} (${pricing.founders.installments.length} cuotas de ${usd(pricing.founders.installments[0].amount)}). A cambio, tu caso de estudio y tu opinión sincera al terminar.`,
              }
            : undefined,
        cta: { label: 'Ver la mentoría', href: cta.mentoria.href, event: cta.mentoria.event },
      },
    ],
  },
  {
    id: 'equipos',
    n: '03',
    title: 'Para clubes y agencias',
    lead: 'Trabajo a distancia con cuerpos técnicos y organizaciones. Cada servicio parte de una pregunta concreta del equipo.',
    offers: [
      {
        id: 'seguimiento',
        name: 'Plan Seguimiento',
        summary: 'Llegar mejor preparado a cada partido: un informe de rival por partido y una devolución mensual.',
        items: [
          'Informe de rival por partido, hasta 4 por mes (una página + cinco clips)',
          '1 reunión mensual de devolución con el cuerpo técnico (30 minutos)',
          'Consultas por WhatsApp de lunes a viernes',
        ],
        price: `${usd(clubPlans.seguimiento)}/mes`,
        priceNote: `Mes a mes, sin contrato. Pago del 1 al 5. Pagando ${MONTHS_UPFRONT} meses juntos: ${usd(upfront(clubPlans.seguimiento))}.`,
        cta: { label: 'Quiero este plan', href: '/equipos?necesidad=informes', event: 'cta_plan_seguimiento' },
      },
      {
        id: 'integral',
        name: 'Plan Integral',
        summary: 'Un analista fijo para tu cuerpo técnico: el rival, tu propio equipo y el seguimiento de lo que importa.',
        items: [
          'Todo lo del plan Seguimiento',
          'Ficha de partido de tu propio equipo después de cada partido',
          '2 reuniones mensuales con el cuerpo técnico',
          'Panel de codificación e indicadores de seguimiento',
        ],
        price: `${usd(clubPlans.integral)}/mes`,
        priceNote: `Mes a mes, sin contrato. Pago del 1 al 5. Pagando ${MONTHS_UPFRONT} meses juntos: ${usd(upfront(clubPlans.integral))}.`,
        badge: 'Recomendado',
        cta: { label: 'Quiero este plan', href: '/equipos?necesidad=acompanamiento', event: 'cta_plan_integral' },
      },
      {
        id: 'a-medida',
        name: 'Plan A medida',
        summary: 'Para clubes o agencias con varias categorías o necesidades específicas.',
        items: [
          'Todo lo del plan Integral',
          'Reuniones semanales y análisis de pelota parada',
          'Scouting individual de jugadores',
          'Una herramienta propia para tu club: tablero, panel o plataforma',
        ],
        price: `Desde ${usd(clubPlans.medida)}/mes`,
        priceNote: 'Depende de las categorías y los partidos por semana. Pago del 1 al 5.',
        cta: { label: cta.propuesta.label, href: cta.propuesta.href, event: cta.propuesta.event },
      },
      {
        id: 'herramientas',
        name: 'Herramientas a medida',
        summary: 'Sitios, paneles y bases de datos para tu organización, como hice con Futsal Hub y LAA Sports.',
        items: ['Plataformas para clubes, agencias y jugadores', 'Paneles internos para cuerpos técnicos', 'Pago en cuotas'],
        price: 'A medida',
        priceNote: 'Se cotiza según el alcance y se paga en cuotas.',
        cta: { label: cta.proyecto.label, href: cta.proyecto.href, event: cta.proyecto.event },
      },
    ],
  },
];

/** "¿Cuál me conviene?": una frase de situación → un capítulo. */
export const chooser = [
  { situation: 'Quiero saber cómo analizo hoy y por dónde mejorar', to: 'gratis', label: 'Empezar sin pagar' },
  { situation: 'Quiero ayuda personal para armar mi sistema', to: 'individual', label: 'Trabajar conmigo' },
  { situation: 'Soy un club, un cuerpo técnico o una agencia', to: 'equipos', label: 'Para clubes y agencias' },
] as const;

export const payment = {
  title: 'Cómo se paga',
  items: [
    'Ebook: transferencia en pesos.',
    'Servicios en dólares: desde Argentina, por transferencia. Desde el exterior, por ARQ o Takenos.',
    'Planes para clubes: mes a mes, sin contrato, y se abonan del 1 al 5 de cada mes. El valor en pesos se informa al abonar, según el cambio del día.',
    'Herramientas a medida: en cuotas, que se acuerdan según el alcance.',
  ],
};
