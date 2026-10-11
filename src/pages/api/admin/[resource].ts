import type { APIRoute } from 'astro';
import { entrantes, metaTypes, resources, type EntranteOrigen, type Field, type Resource } from '@/data/admin';
import { findTemplate } from '@/data/plantillas';
import { requireAdmin } from '@/lib/admin';
import { json, sb } from '@/lib/server';

export const prerender = false;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Limpia un valor según el tipo del campo. `undefined` = inválido; `null` = vacío permitido. */
function cleanValue(f: Field, raw: unknown): string | number | boolean | null | undefined {
  if (raw === null || raw === undefined || raw === '') return f.required ? undefined : null;
  switch (f.type) {
    case 'number': {
      const n = Number(raw);
      return Number.isFinite(n) && Math.abs(n) < 1e9 ? n : undefined;
    }
    case 'email': {
      const s = String(raw).trim().toLowerCase().slice(0, f.max ?? 160);
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : undefined;
    }
    case 'bool':
      return raw === true || raw === 'true' ? true : raw === false || raw === 'false' ? false : undefined;
    case 'uuid':
      return UUID.test(String(raw)) ? String(raw) : undefined;
    case 'date':
      return DATE.test(String(raw)) ? String(raw) : undefined;
    case 'select':
      return f.options?.includes(String(raw)) ? String(raw) : undefined;
    case 'url': {
      const s = String(raw).trim().slice(0, f.max ?? 500);
      return /^https?:\/\//i.test(s) ? s : undefined;
    }
    default:
      return String(raw).trim().slice(0, f.max ?? 500);
  }
}

/** Arma la fila a guardar. En una edición (`partial`) solo toca los campos enviados. */
function build(resource: Resource, body: Record<string, unknown>, partial: boolean) {
  const row: Record<string, string | number | boolean | null> = {};
  for (const f of resource.fields) {
    // Los campos ocultos los completa la pantalla; si no vienen, queda el valor por defecto de la base
    if ((partial || f.hidden) && !(f.name in body)) continue;
    const v = cleanValue(f, body[f.name] ?? (partial ? undefined : resource.defaults?.[f.name]));
    if (v === undefined) return { error: `Campo inválido: ${f.label}` };
    row[f.name] = v;
  }
  return { row };
}

/** Anota un cambio de estado de un prospecto (alimenta el embudo). Un fallo acá no frena el guardado. */
async function logEstado(contactoId: unknown, estado: unknown) {
  try {
    await sb('POST', 'admin_contacto_log', { contacto_id: contactoId, tipo: 'estado', estado });
  } catch (e) {
    console.error('Historial', e);
  }
}

const duplicado = (status: number) => (status === 409 ? json(409, { error: 'Ya existe un prospecto con ese mail.' }) : null);

const validPk = (resource: Resource, id: string | null) =>
  !!id && (resource.pk === 'id' ? UUID.test(id) : metaTypes.some((m) => m.tipo === id));

/** Contactos que entraron por los formularios de la web, mezclados y ordenados por fecha. */
async function listEntrantes() {
  const origenes = Object.keys(entrantes) as EntranteOrigen[];
  const out: Record<string, unknown>[] = [];
  await Promise.all(
    origenes.map(async (origen) => {
      const r = await sb<Record<string, unknown>[]>('GET', `${origen}?select=*&order=created_at.desc&limit=150`);
      for (const x of r.data ?? []) {
        const s = (k: string) => (x[k] == null ? '' : String(x[k]));
        const resumen: Record<EntranteOrigen, string> = {
          aplicaciones: `${s('rol')} · ${s('deporte')} · ${x.calificada ? 'califica' : 'no califica'}`,
          solicitudes_equipos: `${s('organizacion')} · ${s('necesidad')}`,
          clips: `${s('deporte')} · minuto ${s('minuto')}`,
          diagnosticos: `${s('nivel')} (${s('total')}/100) · ${s('rol')}`,
          plantillas_leads: `${x.plantilla ? `Descargó: ${findTemplate(s('plantilla'))?.name ?? s('plantilla')}` : 'Solo pidió el aviso'}${x.avisos ? ' · quiere avisos' : ''}`,
        };
        const detalle: Record<EntranteOrigen, string[]> = {
          aplicaciones: [`WhatsApp: ${s('whatsapp') || '—'}`, `Video: ${s('video')}`, `Horas: ${s('horas')} · Inversión: ${s('inversion')}`, s('objetivo')],
          solicitudes_equipos: [`WhatsApp: ${s('whatsapp') || '—'}`, `${s('rol')} · ${s('deporte')} · ${s('nivel')}`, s('contexto')],
          clips: [`Clip: ${s('link')}`, s('instagram') ? `Instagram: @${s('instagram')}` : '', s('pregunta')],
          diagnosticos: [`Prioridades: ${Array.isArray(x.prioridades) ? (x.prioridades as string[]).join(', ') : ''}`],
          plantillas_leads: [],
        };
        out.push({
          origen,
          id: x.id,
          fecha: x.created_at,
          nombre: s('nombre') || '(sin nombre)',
          email: s('email'),
          resumen: resumen[origen],
          detalle: detalle[origen].filter(Boolean),
          estado: s('estado') || entrantes[origen].estados[0],
          notas: s('notas'),
        });
      }
    }),
  );
  out.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  return out;
}

export const GET: APIRoute = async ({ request, params }) => {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    if (params.resource === 'entrantes') return json(200, { rows: await listEntrantes() });

    const resource = resources[params.resource as keyof typeof resources];
    if (!resource) return json(404, { error: 'No existe' });

    let query = `${resource.table}?select=*&order=${resource.order}&limit=1000`;
    if (resource.key === 'registro') {
      const since = new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString().slice(0, 10);
      query += `&fecha=gte.${since}`;
    }
    const r = await sb<unknown[]>('GET', query);
    if (!r.ok) return json(500, { error: 'No se pudo leer' });
    return json(200, { rows: r.data ?? [] });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
};

export const POST: APIRoute = async ({ request, params }) => {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const resource = resources[params.resource as keyof typeof resources];
  const isNota = params.resource === 'notas';
  if (!isNota && (!resource || resource.key === 'metas' || resource.readonly)) return json(404, { error: 'No existe' });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'JSON inválido' });
  }

  // Nota con fecha en el historial de un prospecto
  if (isNota) {
    const contacto = String(body.contacto_id ?? '');
    const texto = String(body.texto ?? '').trim().slice(0, 1500);
    if (!UUID.test(contacto) || !texto) return json(400, { error: 'Escribí la nota' });
    try {
      const r = await sb<Record<string, unknown>[]>('POST', 'admin_contacto_log', { contacto_id: contacto, tipo: 'nota', texto });
      return r.ok && r.data?.[0] ? json(200, { row: r.data[0] }) : json(500, { error: 'No se pudo guardar la nota' });
    } catch (e) {
      return json(500, { error: (e as Error).message });
    }
  }

  const built = build(resource!, body, false);
  if ('error' in built) return json(400, { error: built.error });

  try {
    const r = await sb<Record<string, unknown>[]>('POST', resource!.table, built.row);
    if (!r.ok || !r.data?.[0]) return duplicado(r.status) ?? json(500, { error: 'No se pudo guardar' });
    if (resource!.key === 'contactos') await logEstado(r.data[0].id, r.data[0].estado);
    return json(200, { row: r.data[0] });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
};

export const PATCH: APIRoute = async ({ request, params, url }) => {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'JSON inválido' });
  }

  try {
    // Estado y notas de un contacto que entró por un formulario
    if (params.resource === 'entrantes') {
      const origen = String(body.origen) as EntranteOrigen;
      const cfg = entrantes[origen];
      const id = String(body.id ?? '');
      if (!cfg || !UUID.test(id)) return json(400, { error: 'Datos inválidos' });

      const patch: Record<string, string> = {};
      if ('estado' in body) {
        if (!cfg.estados.includes(String(body.estado))) return json(400, { error: 'Estado inválido' });
        patch.estado = String(body.estado);
      }
      if ('notas' in body) patch.notas = String(body.notas ?? '').slice(0, 1500);
      if (!Object.keys(patch).length) return json(400, { error: 'Nada para cambiar' });

      const r = await sb('PATCH', `${origen}?id=eq.${id}`, patch);
      return r.ok ? json(200, { ok: true }) : json(500, { error: 'No se pudo guardar' });
    }

    const resource = resources[params.resource as keyof typeof resources];
    const id = url.searchParams.get('id');
    if (!resource || resource.readonly || !validPk(resource, id)) return json(400, { error: 'Datos inválidos' });

    const built = build(resource, body, true);
    if ('error' in built) return json(400, { error: built.error });
    if (!Object.keys(built.row).length) return json(400, { error: 'Nada para cambiar' });

    // Para el historial: estado anterior del prospecto
    const before = resource.key === 'contactos' && 'estado' in built.row ? await sb<{ estado: string }[]>('GET', `admin_contactos?id=eq.${id}&select=estado`) : null;

    const r = await sb<Record<string, unknown>[]>('PATCH', `${resource.table}?${resource.pk}=eq.${encodeURIComponent(id!)}`, built.row);
    if (!r.ok || !r.data?.[0]) return duplicado(r.status) ?? json(500, { error: 'No se pudo guardar' });
    if (before && before.data?.[0]?.estado !== r.data[0].estado) await logEstado(id, r.data[0].estado);
    return json(200, { row: r.data[0] });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
};

export const DELETE: APIRoute = async ({ request, params, url }) => {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const id = url.searchParams.get('id');

  // Solo se borran las notas, no los cambios de estado del historial
  if (params.resource === 'notas') {
    if (!id || !UUID.test(id)) return json(400, { error: 'Datos inválidos' });
    try {
      const r = await sb('DELETE', `admin_contacto_log?id=eq.${id}&tipo=eq.nota`);
      return r.ok ? json(200, { ok: true }) : json(500, { error: 'No se pudo borrar' });
    } catch (e) {
      return json(500, { error: (e as Error).message });
    }
  }

  const resource = resources[params.resource as keyof typeof resources];
  if (!resource || resource.key === 'metas' || resource.readonly || !validPk(resource, id)) return json(400, { error: 'Datos inválidos' });

  try {
    // Una venta con pagos cobrados no se borra: primero hay que eliminar esos cobros
    if (resource.key === 'ventas') {
      const paid = await sb<unknown[]>('GET', `admin_cobros?venta_id=eq.${id}&cobrado_en=not.is.null&select=id&limit=1`);
      if (!paid.ok) return json(500, { error: 'No se pudo verificar la venta' });
      if (paid.data?.length) return json(409, { error: 'Esta venta tiene pagos cobrados. Eliminá primero esos cobros.' });
    }
    const r = await sb('DELETE', `${resource.table}?${resource.pk}=eq.${encodeURIComponent(id!)}`);
    return r.ok ? json(200, { ok: true }) : json(500, { error: 'No se pudo borrar' });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
};
