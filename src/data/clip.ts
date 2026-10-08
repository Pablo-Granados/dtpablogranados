/**
 * Formulario "Análisis de un clip".
 * Lo usan la página (campos) y la API (validación).
 */

export const options = {
  deporte: ['Futsal', 'Fútbol', 'Ambos'],
} as const;

export type ClipRequest = {
  nombre: string;
  email: string;
  instagram: string;
  link: string;
  minuto: string;
  pregunta: string;
  deporte: string;
};

const pick = (list: readonly string[], v: unknown) => (list.includes(String(v)) ? String(v) : null);

/** Acepta solo links http(s). Devuelve null si no es una URL válida. */
function cleanUrl(v: unknown): string | null {
  const raw = String(v ?? '').trim().slice(0, 500);
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return u.hostname.includes('.') ? u.toString() : null;
  } catch {
    return null;
  }
}

/** Valida y limpia lo que llega del navegador. Devuelve null si algo no cierra. */
export function parseClip(body: Record<string, unknown>): ClipRequest | null {
  const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  const link = cleanUrl(body.link);
  const deporte = pick(options.deporte, body.deporte);
  const r = {
    nombre: text(body.nombre, 80),
    email: text(body.email, 160).toLowerCase(),
    instagram: text(body.instagram, 60).replace(/^@/, ''),
    link,
    minuto: text(body.minuto, 40),
    pregunta: text(body.pregunta, 800),
    deporte,
  };
  if (!r.nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email) || !r.link || !r.deporte || r.pregunta.length < 10) return null;
  // El minuto es obligatorio: sin él no se sabe dónde está la jugada
  if (!/\d/.test(r.minuto)) return null;
  // Sin autorización explícita no se guarda: es lo que habilita la publicación
  if (body.autoriza !== true) return null;
  return r as ClipRequest;
}
