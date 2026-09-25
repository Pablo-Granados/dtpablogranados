/**
 * Formulario de aplicación a Sistema Propio.
 * Lo usan la página (para armar los pasos) y la API (para validar y calificar).
 */

export const options = {
  rol: ['Entrenador/a', 'Analista', 'Scout', 'Ayudante de campo', 'Estudiante', 'Otro'],
  deporte: ['Futsal', 'Fútbol', 'Ambos'],
  nivel: ['Formativo', 'Amateur', 'Semiprofesional', 'Profesional'],
  video: ['Sí, siempre', 'A veces', 'No'],
  herramientas: ['Nacsport', 'LongoMatch', 'Once Sport', 'Hudl', 'Kinovea', 'Excel / Sheets', 'Ninguna', 'Otra'],
  horas: ['Menos de 2', '2 a 4', '4 a 6', 'Más de 6'],
  inversion: ['Sí', 'Sí, en cuotas', 'No por ahora'],
} as const;

export type Application = {
  nombre: string;
  email: string;
  whatsapp: string;
  rol: string;
  deporte: string;
  nivel: string;
  video: string;
  herramientas: string[];
  objetivo: string;
  horas: string;
  inversion: string;
};

/** Una aplicación califica para la llamada si puede aplicar el programa y está en condiciones de pagarlo. */
export function qualify(a: Pick<Application, 'video' | 'horas' | 'inversion'>) {
  const reasons: string[] = [];
  if (a.video === 'No') reasons.push('sin acceso a video');
  if (a.horas === 'Menos de 2') reasons.push('menos de 2 horas por semana');
  if (a.inversion === 'No por ahora') reasons.push('inversión no viable ahora');
  return { ok: reasons.length === 0, reasons };
}

const pick = <T extends readonly string[]>(list: T, v: unknown) =>
  (list as readonly string[]).includes(String(v)) ? String(v) : null;

/** Valida y limpia lo que llega del navegador. Devuelve null si algo no cierra. */
export function parseApplication(body: Record<string, unknown>): Application | null {
  const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  const a = {
    nombre: text(body.nombre, 80),
    email: text(body.email, 160).toLowerCase(),
    whatsapp: text(body.whatsapp, 40),
    rol: pick(options.rol, body.rol),
    deporte: pick(options.deporte, body.deporte),
    nivel: pick(options.nivel, body.nivel),
    video: pick(options.video, body.video),
    herramientas: Array.isArray(body.herramientas)
      ? body.herramientas.map(String).filter((h) => (options.herramientas as readonly string[]).includes(h))
      : [],
    objetivo: text(body.objetivo, 1200),
    horas: pick(options.horas, body.horas),
    inversion: pick(options.inversion, body.inversion),
  };
  if (!a.nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email) || a.objetivo.length < 10) return null;
  if (!a.rol || !a.deporte || !a.nivel || !a.video || !a.horas || !a.inversion) return null;
  return a as Application;
}
