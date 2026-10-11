/**
 * Textos editables: los mensajes de contacto y las 12 semanas del programa.
 * Si las tablas de Supabase están vacías se usan los textos iniciales de src/data (mensajes.ts y programa.ts);
 * cuando se habilita la edición, esos textos se copian a la base y a partir de ahí se editan desde el panel.
 */
import { mensajes as mensajesBase, type Mensaje } from '@/data/mensajes';
import { perfiles, programa as programaBase, type Semana, type TipoClase } from '@/data/programa';
import type { Data, Row } from './admin-utils';

let mensajes: readonly Mensaje[] = mensajesBase;
let programa: readonly Semana[] = programaBase;

export const mensajesActuales = () => mensajes;
export const programaActual = () => programa;
export const programaInicial = programaBase;
export const mensajesIniciales = mensajesBase;

/** ¿Los textos ya viven en la base (y se pueden editar)? */
export const edicionHabilitada = (d: Data, que: 'mensajes' | 'programa') => (d[que]?.length ?? 0) > 0;

const lineas = (t: unknown) =>
  String(t ?? '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
const lista = (t: unknown) =>
  String(t ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

/* ---------- mensajes ---------- */
function filaAMensaje(r: Row): Mensaje {
  const dias = r.seguimiento === 'quitar' ? null : r.seguimiento === 'en días' ? Number(r.dias ?? 0) : undefined;
  return {
    id: r.id,
    titulo: r.titulo,
    paso: r.paso,
    tipos: lista(r.tipos).length ? lista(r.tipos) : undefined,
    origenes: lista(r.origenes).length ? lista(r.origenes) : undefined,
    texto: r.texto,
    avanza: r.avanza || undefined,
    ...(dias === undefined ? {} : { dias }),
  };
}

export function mensajeAFila(m: Mensaje, orden: number): Row {
  return {
    titulo: m.titulo,
    paso: m.paso,
    tipos: m.tipos?.join(', ') ?? null,
    origenes: m.origenes?.join(', ') ?? null,
    texto: m.texto,
    avanza: m.avanza ?? null,
    seguimiento: m.dias === undefined ? 'no cambia' : m.dias === null ? 'quitar' : 'en días',
    dias: typeof m.dias === 'number' ? m.dias : null,
    orden,
  };
}

/* ---------- programa ---------- */
function filaASemana(r: Row): Semana {
  const base = programaBase.find((s) => s.n === r.semana);
  return {
    n: Number(r.semana),
    titulo: r.titulo,
    tipo: r.tipo as TipoClase,
    objetivo: r.objetivo ?? '',
    antes: lineas(r.antes),
    llamada: lineas(r.llamada),
    tarea: r.tarea ?? '',
    entregable: r.entregable ?? '',
    devolucion: lineas(r.devolucion),
    herramientas: lineas(r.herramientas),
    avanza: r.avanza ?? '',
    variantes: Object.fromEntries(perfiles.map((p) => [p.id, r[`var_${p.id}`] ?? base?.variantes[p.id] ?? ''])) as Semana['variantes'],
  };
}

export function semanaAFila(s: Semana): Row {
  return {
    semana: s.n,
    titulo: s.titulo,
    tipo: s.tipo,
    objetivo: s.objetivo,
    antes: s.antes.join('\n'),
    llamada: s.llamada.join('\n'),
    tarea: s.tarea,
    entregable: s.entregable,
    devolucion: s.devolucion.join('\n'),
    herramientas: s.herramientas.join('\n'),
    avanza: s.avanza,
    ...Object.fromEntries(perfiles.map((p) => [`var_${p.id}`, s.variantes[p.id]])),
  };
}

/** Actualiza el catálogo con lo que haya en la base; si no hay nada, vuelve a los textos iniciales. */
export function actualizarCatalogo(d: Data) {
  mensajes = d.mensajes?.length ? [...d.mensajes].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).map(filaAMensaje) : mensajesBase;
  programa = d.programa?.length ? [...d.programa].sort((a, b) => a.semana - b.semana).map(filaASemana) : programaBase;
}
