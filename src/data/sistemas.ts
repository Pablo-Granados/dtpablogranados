/**
 * Página /sistemas: sistemas a medida para clubes y agencias.
 * Precios y plazos se cambian acá. Solo se afirma lo que ya está construido o lo que Pablo se compromete a dar.
 */

const usd = (n: number) => `USD ${n.toLocaleString('es-AR')}`;

/**
 * Referencia interna en USD, solo para los cobros sugeridos del panel de admin.
 * No se muestran en el sitio: lo que supera los USD 800 se cotiza a medida, por mail.
 */
export const sistemaPrecios = {
  base: 1500,
  completo: 3000,
  mantenimiento: 150,
};

export const sistemaHero = {
  kicker: 'Clubes y agencias',
  title: 'Tu club, en un solo sistema.',
  lead: 'Las cuotas, las fichas, el plantel y los partidos hoy viven en planillas, grupos de WhatsApp y la memoria de alguien. Construyo el sistema a medida para que todo esté en un solo lugar y lo pueda usar cualquiera de la comisión.',
};

/** Franja de evidencia: solo datos verificables, tomados de los casos publicados. */
export const sistemaEvidencia = [
  { value: '3.500+', label: 'partidos registrados en Futsal Hub desde 2023' },
  { value: '50+', label: 'jugadores presentados en el sitio de LAA Sports' },
  { value: '< 1 semana', label: 'de desarrollo del sitio y panel de LAA Sports' },
  { value: '1 persona', label: 'que lo piensa, lo construye y lo mantiene' },
] as const;

export const sistemaProblema = {
  title: '¿Te suena alguna?',
  items: [
    'La cuota se anota en una planilla que solo entiende una persona, y nadie sabe bien cuánto se debe.',
    'La ficha de cada jugador está repartida entre fotos, mensajes y carpetas.',
    'Cuando cambia la comisión, se pierde el historial y se empieza de cero.',
    'El dirigente pregunta por un dato y la respuesta es "dame un rato que lo busco".',
  ],
  closing: 'No hace falta un software enorme. Hace falta uno que se parezca a cómo trabaja tu club.',
};

/** Módulos: se eligen solo los que el club necesita. */
export const sistemaModulos = [
  { title: 'Socios y cuotas', body: 'Quién pagó, quién debe y cuánto entra por mes, sin planillas sueltas.' },
  { title: 'Plantel y fichas', body: 'Una ficha por jugador, con datos, foto, categoría y documentación en un solo lugar.' },
  { title: 'Partidos y estadísticas', body: 'Fixture, resultados y datos del equipo, como hago en Futsal Hub.' },
  { title: 'Panel para dirigentes', body: 'Un tablero con lo que se necesita saber hoy, sin pedirle el dato a nadie.' },
  { title: 'Accesos por rol', body: 'Cada persona ve y edita solo lo que le corresponde: comisión, cuerpo técnico, administración.' },
  { title: 'Sitio público', body: 'La cara visible del club o la agencia, que se actualiza desde el mismo panel, como en LAA Sports.' },
] as const;

export const sistemaCasos = [
  {
    slug: 'laa-sports',
    name: 'LAA Sports',
    kind: 'Agencia de representación',
    body: 'Sitio con más de 50 perfiles de atletas, buscador, filtros y panel privado para editarlos. Entregado en menos de una semana.',
  },
  {
    slug: 'futsal-hub',
    name: 'Futsal Hub',
    kind: 'Producto propio',
    body: 'Plataforma de datos del futsal de Rosario, con módulo de gestión de plantel y registro de partidos en vivo para entrenadores.',
  },
] as const;

export const sistemaPasos = [
  { n: '01', title: 'Charla', body: 'Una conversación de 30 minutos, sin costo. Me contás cómo trabajan hoy y qué les duele.' },
  { n: '02', title: 'Propuesta', body: 'Te mando por mail el alcance, el plazo y un precio cerrado, adaptado a tu presupuesto. Si no cierra, no pagás nada.' },
  { n: '03', title: 'Construcción', body: 'Avanzo con entregas cortas y te muestro lo hecho en el camino, para corregir a tiempo.' },
  { n: '04', title: 'Entrega y acompañamiento', body: 'Te lo entrego funcionando, te enseño a usarlo y queda el mantenimiento mensual si lo querés.' },
] as const;

export const sistemaPlanes = [
  {
    id: 'base',
    name: 'Una herramienta',
    price: 'A medida',
    priceNote: 'Adaptado a tu presupuesto',
    summary: 'Resolver un problema puntual: cuotas, plantel o un sitio con panel.',
    items: ['1 o 2 módulos a elección', 'Panel privado con acceso por usuario', 'Capacitación para quienes lo van a usar', 'Entrega con fecha acordada'],
  },
  {
    id: 'completo',
    name: 'Club completo',
    price: 'A medida',
    priceNote: 'Adaptado a tu presupuesto',
    summary: 'Ordenar la operación entera del club o la agencia.',
    items: ['Socios y cuotas, plantel, partidos y panel de dirigentes', 'Accesos por rol', 'Sitio público conectado al panel', 'Migración de las planillas que ya tienen'],
    badge: 'Recomendado para clubes',
  },
  {
    id: 'medida',
    name: 'A medida',
    price: 'A cotizar',
    priceNote: 'Adaptado a tu presupuesto',
    summary: 'Varias categorías, una agencia grande o una idea que no entra en los otros dos.',
    items: ['Alcance definido en la charla', 'Etapas con entregas parciales', 'Precio cerrado antes de empezar'],
  },
] as const;

export const sistemaCondiciones = {
  mantenimiento: `Mantenimiento mensual: ${usd(sistemaPrecios.mantenimiento)}. Incluye el funcionamiento del sistema, soporte y ajustes menores. Es opcional.`,
  pago: 'Se paga en cuotas: una parte al empezar y el resto contra entregas. Desde Argentina por transferencia; desde el exterior por ARQ o Takenos.',
  datos: 'Los datos del club son del club: se pueden exportar cuando quieran.',
};

export const sistemaFaq = [
  {
    q: '¿Cuánto tarda?',
    a: 'Depende del alcance y lo definimos por escrito en la propuesta. Como referencia, el sitio con panel de LAA Sports lo desarrollé en menos de una semana.',
  },
  {
    q: '¿Necesito saber de tecnología?',
    a: 'No. Yo me ocupo de todo lo técnico y te enseño a usar el sistema. Si sabés manejar una planilla, podés manejar esto.',
  },
  {
    q: '¿Puedo ver algo antes de decidir?',
    a: 'Sí. La charla inicial no tiene costo y la propuesta tampoco. Además podés entrar a Futsal Hub y LAA Sports para ver cómo trabajo.',
  },
  {
    q: '¿Y si después quiero cambios?',
    a: 'Con el mantenimiento mensual se hacen los ajustes menores. Si lo que querés es sumar un módulo nuevo, lo cotizamos por separado.',
  },
  {
    q: '¿Solo sirve para futsal?',
    a: 'Conozco el futsal y el fútbol por dentro, porque soy entrenador y analista. Los sistemas se arman para cualquier club o agencia deportiva.',
  },
] as const;
