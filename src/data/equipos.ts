/**
 * Formulario de consulta para clubes, cuerpos técnicos y agencias.
 * Lo usan la página (para armar los campos) y la API (para validar).
 */

export const options = {
  necesidad: [
    { id: 'informes', label: 'Informes de rival' },
    { id: 'acompanamiento', label: 'Acompañamiento durante la temporada' },
    { id: 'herramientas', label: 'Herramienta o plataforma a medida' },
    { id: 'no-se', label: 'Todavía no lo sé' },
  ],
  rol: ['Entrenador/a o cuerpo técnico', 'Analista', 'Dirigente', 'Agente o representante', 'Otro'],
  deporte: ['Futsal', 'Fútbol', 'Ambos'],
  nivel: ['Formativo', 'Amateur', 'Semiprofesional', 'Profesional'],
} as const;

export type TeamRequest = {
  nombre: string;
  email: string;
  whatsapp: string;
  organizacion: string;
  rol: string;
  necesidad: string;
  deporte: string;
  nivel: string;
  contexto: string;
};

const pick = (list: readonly string[], v: unknown) => (list.includes(String(v)) ? String(v) : null);

/** Valida y limpia lo que llega del navegador. Devuelve null si algo no cierra. */
export function parseTeamRequest(body: Record<string, unknown>): TeamRequest | null {
  const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  const r = {
    nombre: text(body.nombre, 80),
    email: text(body.email, 160).toLowerCase(),
    whatsapp: text(body.whatsapp, 40),
    organizacion: text(body.organizacion, 120),
    rol: pick(options.rol, body.rol),
    necesidad: pick(options.necesidad.map((n) => n.label), body.necesidad),
    deporte: pick(options.deporte, body.deporte),
    nivel: pick(options.nivel, body.nivel),
    contexto: text(body.contexto, 1500),
  };
  if (!r.nombre || !r.organizacion || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email) || r.contexto.length < 10) return null;
  if (!r.rol || !r.necesidad || !r.deporte || !r.nivel) return null;
  return r as TeamRequest;
}
