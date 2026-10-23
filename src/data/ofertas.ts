/**
 * Ofertas de la página "Trabajar juntos".
 * Precios y condiciones se cambian acá. La mentoría toma sus números de mentoria.ts.
 *
 * Los CTA que apuntan a WhatsApp son temporales, hasta tener los formularios propios.
 */
import { pricing, installmentsText, session, tiers, upfrontDiscount, guarantee } from './mentoria';
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
  /** Oferta principal del capítulo: se destaca visualmente. */
  featured?: boolean;
  cta: { label: string; href: string; event: string };
  /** Segundo botón, más discreto. */
  secondary?: { label: string; href: string; event: string };
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
        items: [
          '3 minutos, con perfil en 5 áreas y tus dos prioridades',
          'Te llega por mail con la plantilla de informe de rival',
          'Cuatro plantillas de trabajo completas, en PDF y en hoja de cálculo editable',
          'Si mandás un clip de tu equipo, puede ser elegido para analizarse de manera pública',
        ],
        price: 'Gratis',
        cta: { label: cta.diagnostico.label, href: cta.diagnostico.href, event: cta.diagnostico.event },
        secondary: { label: 'Ver las plantillas', href: '/plantillas', event: 'cta_plantillas' },
      },
    ],
  },
  {
    id: 'individual',
    n: '02',
    title: 'Trabajar conmigo',
    lead: 'Para entrenadores y analistas que quieren armar su propio sistema de análisis, con alguien que ya lo hizo.',
    offers: [
      {
        id: 'mentoria',
        name: 'Sistema Propio',
        summary: 'Mentoría 1:1 de 12 semanas. Construís tu sistema de análisis sobre tu equipo real y terminás con algo que usás todas las semanas.',
        items: [
          `${pricing.weeks} llamadas 1:1 de 45 minutos`,
          '5 entregables hechos con tus partidos, con devolución en video',
          'Consultas de lunes a viernes, respuesta en 24 horas',
          'Plantillas, ebook, bonos (Futsal Hub para entrenadores, banco de informes, certificado) y llamada de control a los 30 días',
          `Otros niveles: Intensivo (${usd(tiers[0].price)}), y Pro y Cuerpo Técnico, que se cotizan según tu caso`,
          `Pagando todo por adelantado, ${Math.round(upfrontDiscount * 100)}% de descuento`,
        ],
        price: usd(pricing.full),
        priceNote: `${pricing.installments.length} cuotas: ${installmentsText(pricing.installments)}. Garantía en las primeras ${guarantee.windowWeeks} semanas.`,
        badge: '3 lugares simultáneos',
        featured: true,
        extra:
          pricing.founders.spots > 0
            ? {
                label: `Cohorte fundadora · ${pricing.founders.spots} lugares`,
                text: `${usd(pricing.founders.price)} (${pricing.founders.installments.length} cuotas de ${usd(pricing.founders.installments[0].amount)}). A cambio, tu caso de estudio y tu opinión sincera al terminar.`,
              }
            : undefined,
        cta: { label: cta.aplicar.label, href: cta.aplicar.href, event: cta.aplicar.event },
        secondary: { label: 'Ver el programa completo', href: cta.mentoria.href, event: cta.mentoria.event },
      },
      {
        id: 'sesion',
        name: 'Sesión de análisis 1:1',
        summary: '¿Querés probar antes? Una hora conmigo sobre tu equipo, con material hecho a partir de lo que vos elijas.',
        items: [
          'Videollamada de 60 minutos',
          'Me mandás 3 jugadas antes de la sesión: del video que quieras',
          'Te entrego el material realizado durante la sesión',
          'Incluye el ebook "Leé el Partido" y su glosario',
          `Si en los ${session.creditDays} días siguientes entrás a Sistema Propio, los ${usd(session.price)} se descuentan del precio`,
        ],
        price: usd(session.price),
        priceNote: 'Pago único, bonificado si pasás a la mentoría',
        cta: {
          label: 'Reservar por WhatsApp',
          href: wa('Hola Pablo, quiero reservar una sesión de análisis 1:1 (USD 80).'),
          event: 'cta_sesion',
        },
      },
    ],
  },
  {
    id: 'equipos',
    n: '03',
    title: 'Para clubes y agencias',
    lead: 'Trabajo a distancia con cuerpos técnicos y organizaciones. O te construyo el sistema, o me sumo a tu staff como analista.',
    offers: [
      {
        id: 'sistema-a-medida',
        name: 'Sistema a medida',
        summary: 'Cuotas, plantel, partidos y panel de dirigentes en un solo lugar, construido para cómo trabaja tu club o agencia.',
        items: [
          'Solo los módulos que necesitás: socios y cuotas, fichas, partidos, accesos por rol, sitio público',
          'Propuesta y precio cerrados por escrito antes de empezar',
          'Capacitación para quienes lo van a usar',
          'Mantenimiento mensual opcional',
          'Ya lo hice: Futsal Hub (3.500+ partidos registrados) y LAA Sports (50+ perfiles de atletas)',
        ],
        price: 'A medida',
        priceNote: 'Adaptado a tu presupuesto. Te paso la propuesta por mail, con la primera charla sin costo.',
        badge: 'Para clubes y agencias',
        featured: true,
        cta: { label: 'Ver cómo funciona', href: '/sistemas', event: 'cta_sistemas' },
        secondary: { label: 'Pedir propuesta por mail', href: cta.proyecto.href, event: cta.proyecto.event },
      },
      {
        id: 'analisis',
        name: 'Analista para tu cuerpo técnico',
        summary: 'Llegar mejor preparado a cada partido: informes de rival, seguimiento de tu equipo y una reunión con el staff.',
        items: [
          `Seguimiento (${usd(clubPlans.seguimiento)}/mes): informe de rival por partido, hasta 4 por mes, y una reunión mensual`,
          `Integral (${usd(clubPlans.integral)}/mes): todo lo anterior, más ficha de partido de tu equipo, 2 reuniones y panel de codificación`,
          `A medida (desde ${usd(clubPlans.medida)}/mes): varias categorías, pelota parada y scouting`,
          `Mes a mes, sin contrato. Pagando ${MONTHS_UPFRONT} meses juntos, ${Math.round(UPFRONT_DISCOUNT * 100)}% de descuento.`,
        ],
        price: `Desde ${usd(clubPlans.seguimiento)}/mes`,
        priceNote: 'Pago del 1 al 5 de cada mes. El valor en pesos se informa al abonar, según el cambio del día.',
        cta: { label: cta.propuesta.label, href: cta.propuesta.href, event: cta.propuesta.event },
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
    'Sesión 1:1: transferencia en pesos o en dólares, según acordemos.',
    'Servicios en dólares: desde Argentina, por transferencia. Desde el exterior, por ARQ o Takenos.',
    'Planes para clubes: mes a mes, sin contrato, y se abonan del 1 al 5 de cada mes. El valor en pesos se informa al abonar, según el cambio del día.',
    'Sistemas a medida: en cuotas, una parte al empezar y el resto contra entregas.',
  ],
};
