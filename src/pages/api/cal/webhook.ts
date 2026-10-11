/**
 * Webhook de Cal.com: cada reserva, reprogramación o cancelación se registra sola en el panel.
 *  - Si el mail es de un mentorado activo, la llamada se asigna a su próxima semana pendiente.
 *  - Si no, la persona queda como prospecto (o se anota en el que ya existe) y se agenda el seguimiento.
 * Se valida con la firma que Cal.com agrega (CAL_WEBHOOK_SECRET). Sin firma válida no se acepta nada.
 */
import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env, json, sb } from '@/lib/server';

export const prerender = false;

const TZ = 'America/Argentina/Buenos_Aires';
const fechaLocal = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const horaLocal = (iso: string) => new Intl.DateTimeFormat('es-AR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
const corto = (iso: string) => `${fechaLocal(iso).slice(8, 10)}/${fechaLocal(iso).slice(5, 7)} ${horaLocal(iso)}`;
const q = encodeURIComponent;

function firmaValida(raw: string, firma: string | null) {
  const secreto = env('CAL_WEBHOOK_SECRET');
  if (!secreto || !firma) return false;
  const esperado = Buffer.from(createHmac('sha256', secreto).update(raw).digest('hex'));
  const recibido = Buffer.from(firma.trim());
  return esperado.length === recibido.length && timingSafeEqual(esperado, recibido);
}

type Row = Record<string, unknown>;
const primero = async (path: string) => (await sb<Row[]>('GET', path)).data?.[0];

async function anotarEstado(contactoId: unknown, estado: string) {
  await sb('POST', 'admin_contacto_log', { contacto_id: contactoId, tipo: 'estado', estado });
}

async function reservar(p: Row, anteriorUid: string) {
  const uid = String(p.uid);
  const inicio = String(p.startTime ?? '');
  if (!inicio) return;
  const asistente = ((p.attendees as Row[] | undefined) ?? [])[0] ?? {};
  const email = String(asistente.email ?? '').trim().toLowerCase();
  const nombre = String(asistente.name ?? '').trim();
  const evento = String(p.eventTitle ?? p.title ?? p.type ?? 'Reserva');
  const fecha = fechaLocal(inicio);
  const hora = horaLocal(inicio);

  // ¿Ya la teníamos? (reintentos de Cal.com o reprogramación)
  const previa = (await primero(`admin_reservas?uid=eq.${q(uid)}&select=id`)) ?? (anteriorUid ? await primero(`admin_reservas?uid=eq.${q(anteriorUid)}&select=id`) : undefined);

  const mentorado = email ? await primero(`admin_mentorados?email=ilike.${q(email)}&estado=eq.activo&select=id,nombre`) : undefined;
  let contactoId: unknown = null;

  if (mentorado) {
    // Llamada de mentoría: la reprogramada reemplaza a la anterior; la nueva toma la próxima semana pendiente sin reserva
    const mia =
      (anteriorUid ? await primero(`admin_mentorado_semanas?cal_uid=eq.${q(anteriorUid)}&select=id`) : undefined) ??
      (await primero(`admin_mentorado_semanas?cal_uid=eq.${q(uid)}&select=id`)) ??
      (await primero(`admin_mentorado_semanas?mentorado_id=eq.${mentorado.id}&estado=eq.pendiente&cal_uid=is.null&order=semana.asc&limit=1&select=id`));
    if (mia) await sb('PATCH', `admin_mentorado_semanas?id=eq.${mia.id}`, { fecha_llamada: fecha, hora_llamada: hora, cal_uid: uid });
  } else if (!previa) {
    // Reserva de alguien que todavía no es mentorado: entra al CRM
    const seguimiento = fecha;
    const nota = `Reservó en Cal.com: ${evento} · ${corto(inicio)}`;
    const existente = email ? await primero(`admin_contactos?email=ilike.${q(email)}&select=id,estado`) : undefined;
    if (existente) {
      contactoId = existente.id;
      const patch: Row = { proximo_seguimiento: seguimiento };
      if (['Por contactar', 'Contactado'].includes(String(existente.estado))) patch.estado = 'Respondió';
      await sb('PATCH', `admin_contactos?id=eq.${existente.id}`, patch);
      if (patch.estado) await anotarEstado(existente.id, 'Respondió');
    } else {
      const nuevo = await sb<Row[]>('POST', 'admin_contactos', {
        nombre: nombre || email || 'Reserva sin nombre',
        email: email || null,
        tipo: 'Entrenador o analista',
        canal: 'Mail',
        estado: 'Respondió',
        origen: 'Cal.com',
        proximo_seguimiento: seguimiento,
      });
      contactoId = nuevo.data?.[0]?.id ?? null;
      if (contactoId) await anotarEstado(contactoId, 'Respondió');
    }
    if (contactoId) await sb('POST', 'admin_contacto_log', { contacto_id: contactoId, tipo: 'nota', texto: nota });
  }

  const fila = { uid, evento, nombre: nombre || null, email: email || null, inicio, estado: previa && anteriorUid ? 'reprogramada' : 'confirmada', mentorado_id: mentorado?.id ?? null, ...(contactoId ? { contacto_id: contactoId } : {}) };
  if (previa) await sb('PATCH', `admin_reservas?id=eq.${previa.id}`, fila);
  else await sb('POST', 'admin_reservas', fila);
}

async function cancelar(uid: string) {
  await sb('PATCH', `admin_reservas?uid=eq.${q(uid)}`, { estado: 'cancelada' });
  // Si era una llamada de mentoría, queda la fecha planeada pero sin hora ni reserva
  await sb('PATCH', `admin_mentorado_semanas?cal_uid=eq.${q(uid)}`, { cal_uid: null, hora_llamada: null });
}

export const POST: APIRoute = async ({ request }) => {
  const raw = await request.text();
  if (!firmaValida(raw, request.headers.get('x-cal-signature-256'))) return json(401, { error: 'Firma inválida' });

  let evento: { triggerEvent?: string; payload?: Row };
  try {
    evento = JSON.parse(raw);
  } catch {
    return json(400, { error: 'JSON inválido' });
  }

  const tipo = String(evento.triggerEvent ?? '');
  const p = evento.payload ?? {};
  if (tipo === 'PING' || !p.uid) return json(200, { ok: true });

  try {
    if (tipo === 'BOOKING_CANCELLED') await cancelar(String(p.uid));
    else if (tipo === 'BOOKING_CREATED') await reservar(p, '');
    else if (tipo === 'BOOKING_RESCHEDULED') await reservar(p, String(p.rescheduleUid ?? ''));
  } catch (e) {
    // Un 500 hace que Cal.com reintente más tarde
    console.error('Cal webhook', tipo, e);
    return json(500, { error: 'No se pudo registrar' });
  }
  return json(200, { ok: true });
};
