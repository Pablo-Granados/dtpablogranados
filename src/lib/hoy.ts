/**
 * Resumen de "Hoy" para el mail de la mañana: lo que pide atención en el panel.
 * Son las mismas reglas que la pestaña Hoy de /admin (src/scripts/admin.ts → hoyData); si cambia una, cambiar la otra.
 * Solo servidor.
 */
import { addDays, addMonths } from './fechas';
import { env, esc, sb, sendMail, ownerEmail } from './server';
import { emailLayout, mailButton, mailH2, mailP } from './email';

const TZ = 'America/Argentina/Buenos_Aires';
const fechaAr = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const horaAr = (iso: string) => new Intl.DateTimeFormat('es-AR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
const corta = (s: unknown) => `${String(s).slice(8, 10)}/${String(s).slice(5, 7)}`;
const usd = (n: unknown) => `USD ${Number(n).toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;

type Row = Record<string, unknown>;
export type Seccion = { titulo: string; items: string[] };

const leer = async (path: string): Promise<Row[]> => {
  const r = await sb<Row[]>('GET', path);
  if (!r.ok) throw new Error(`No se pudo leer ${path.split('?')[0]}`);
  return r.data ?? [];
};

/** Calcula las secciones de hoy. `hoy` se puede pasar para probar. */
export async function calcularHoy(hoy = fechaAr(new Date())): Promise<{ hoy: string; secciones: Seccion[]; total: number }> {
  const manana = addDays(hoy, 1);
  const [contactos, cobros, ventas, todosCobros, tareas, contenido, mentorados, semanasHoy, semanasHechas, reservas] = await Promise.all([
    leer(`admin_contactos?select=nombre,organizacion,estado,proximo_seguimiento&proximo_seguimiento=lte.${hoy}&estado=not.in.(Cliente,Descartado)&order=proximo_seguimiento.asc&limit=100`),
    leer(`admin_cobros?select=venta_id,concepto,monto_usd,vencimiento&cobrado_en=is.null&vencimiento=lte.${hoy}&order=vencimiento.asc&limit=100`),
    leer('admin_ventas?select=id,cliente,producto,recurrente,activa&limit=1000'),
    leer('admin_cobros?select=venta_id,vencimiento,cobrado_en&limit=1000'),
    leer(`admin_tareas?select=titulo,fecha_limite&estado=neq.hecha&fecha_limite=lte.${hoy}&order=fecha_limite.asc&limit=100`),
    leer(`admin_contenido?select=titulo,fecha,estado&estado=neq.publicada&fecha=lte.${hoy}&order=fecha.asc&limit=100`),
    leer('admin_mentorados?select=id,nombre,estado,control_fecha&limit=500'),
    leer(`admin_mentorado_semanas?select=mentorado_id,semana,fecha_llamada&estado=eq.pendiente&fecha_llamada=lte.${hoy}&order=semana.asc&limit=500`),
    leer(`admin_mentorado_semanas?select=mentorado_id,semana&estado=eq.hecha&entregable_en=is.null&fecha_llamada=lte.${addDays(hoy, -7)}&limit=500`),
    leer(`admin_reservas?select=nombre,email,evento,inicio&estado=neq.cancelada&inicio=gte.${hoy}T00:00:00-03:00&inicio=lt.${addDays(manana, 1)}T00:00:00-03:00&order=inicio.asc&limit=50`),
  ]);

  const clienteDe = (id: unknown) => String(ventas.find((v) => v.id === id)?.cliente ?? 'Cliente');
  const nombreMent = (id: unknown) => String(mentorados.find((m) => m.id === id)?.nombre ?? 'Mentorado');
  const secciones: Seccion[] = [];
  const agregar = (titulo: string, items: string[]) => items.length && secciones.push({ titulo, items });

  agregar(
    'Reservas de hoy y mañana',
    reservas.map((r) => `<strong>${horaAr(String(r.inicio))}</strong> ${fechaAr(new Date(String(r.inicio))) === hoy ? 'hoy' : 'mañana'} · ${esc(String(r.nombre || r.email || 'Reserva'))} · ${esc(String(r.evento ?? ''))}`),
  );
  agregar(
    'Cobros vencidos o de hoy',
    cobros.map((c) => `<strong>${esc(clienteDe(c.venta_id))}</strong> · ${esc(String(c.concepto))} · ${usd(c.monto_usd)} · ${String(c.vencimiento) < hoy ? 'vencido' : 'vence hoy'} ${corta(c.vencimiento)}`),
  );

  // Planes mensuales activos con todo cobrado y el siguiente cobro a menos de 5 días
  const renovar = ventas
    .filter((v) => v.recurrente === true && v.activa !== false)
    .map((v) => ({ v, cs: todosCobros.filter((c) => c.venta_id === v.id) }))
    .filter(({ cs }) => cs.length > 0 && cs.every((c) => c.cobrado_en))
    .map(({ v, cs }) => ({ v, ultimo: cs.map((c) => String(c.vencimiento)).sort().at(-1)! }))
    .filter(({ ultimo }) => addDays(ultimo, 25) <= hoy);
  agregar('Renovaciones de planes', renovar.map(({ v, ultimo }) => `<strong>${esc(String(v.cliente))}</strong> · ${esc(String(v.producto))} · último pago ${corta(ultimo)} · próximo ${corta(addMonths(ultimo, 1))}`));

  agregar('Seguimientos de prospectos', contactos.map((c) => `<strong>${esc(String(c.nombre))}</strong> · ${esc(String(c.organizacion || c.estado))} · ${esc(String(c.estado))} · ${corta(c.proximo_seguimiento)}`));

  // Mentoría: la llamada que toca por mentorado activo, entregables sin recibir y llamadas de control
  const activos = mentorados.filter((m) => m.estado === 'activo');
  const mentoria: string[] = [];
  for (const m of activos) {
    const s = semanasHoy.find((x) => x.mentorado_id === m.id);
    if (s) mentoria.push(`<strong>${esc(String(m.nombre))}</strong> · llamada de la semana ${s.semana} · ${corta(s.fecha_llamada)}`);
  }
  for (const s of semanasHechas.filter((x) => activos.some((m) => m.id === x.mentorado_id))) mentoria.push(`<strong>${esc(nombreMent(s.mentorado_id))}</strong> · entregable de la semana ${s.semana} sin recibir`);
  for (const m of mentorados.filter((x) => x.estado === 'terminado' && x.control_fecha && String(x.control_fecha) <= hoy)) mentoria.push(`<strong>${esc(String(m.nombre))}</strong> · llamada de control (${corta(m.control_fecha)})`);
  agregar('Mentoría', mentoria);

  agregar('Tareas para hoy o vencidas', tareas.map((t) => `${esc(String(t.titulo))} · ${corta(t.fecha_limite)}`));
  agregar('Contenido para publicar', contenido.map((c) => `${esc(String(c.titulo))} · ${corta(c.fecha)} · ${esc(String(c.estado))}`));

  // Contactos que entraron por los formularios y siguen sin atender
  const nuevos = await Promise.all(
    [
      ['aplicaciones', 'nueva', 'aplicaciones a la mentoría'],
      ['solicitudes_equipos', 'nueva', 'consultas de equipos'],
      ['clips', 'recibido', 'clips'],
      ['diagnosticos', 'nuevo', 'diagnósticos'],
      ['plantillas_leads', 'nuevo', 'descargas de plantillas'],
    ].map(async ([tabla, estado, nombre]) => {
      try {
        return { n: (await leer(`${tabla}?select=id&estado=eq.${estado}&limit=500`)).length, nombre };
      } catch {
        return { n: 0, nombre };
      }
    }),
  );
  agregar('Contactos nuevos sin atender', nuevos.filter((x) => x.n > 0).map((x) => `<strong>${x.n}</strong> ${x.nombre}`));

  return { hoy, secciones, total: secciones.reduce((a, s) => a + s.items.length, 0) };
}

/** Arma y envía el mail. Si no hay nada pendiente no manda nada, salvo que se pida (`forzar`). */
export async function enviarResumen(opciones: { forzar?: boolean; sinEnviar?: boolean } = {}) {
  const { hoy, secciones, total } = await calcularHoy();
  if (opciones.sinEnviar) return { enviado: false, total, secciones: secciones.map((s) => ({ titulo: s.titulo, items: s.items.length })) };
  if (!total && !opciones.forzar) return { enviado: false, total, motivo: 'Sin pendientes' };

  const site = (env('SITE_URL') ?? 'https://pablogranados.com.ar').replace(/\/$/, '');
  const owner = ownerEmail();
  if (!owner) throw new Error('Falta GMAIL_USER');

  const fecha = new Intl.DateTimeFormat('es-AR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${hoy}T12:00:00-03:00`));
  const cuerpo = secciones.length
    ? secciones
        .map(
          (s) => `${mailH2(`${esc(s.titulo)} · ${s.items.length}`)}
          <ul style="margin:0 0 8px;padding-left:18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1c2026">${s.items
            .slice(0, 8)
            .map((i) => `<li style="margin:0 0 6px">${i}</li>`)
            .join('')}${s.items.length > 8 ? `<li style="margin:0 0 6px;color:#5d646d">y ${s.items.length - 8} más en el panel</li>` : ''}</ul>`,
        )
        .join('')
    : mailP('No hay nada pendiente para hoy.');

  await sendMail({
    to: owner,
    fromName: 'Panel',
    subject: total ? `Hoy: ${total} ${total === 1 ? 'cosa' : 'cosas'} para atender` : 'Hoy: sin pendientes',
    html: emailLayout({
      site,
      preheader: total ? `${total} para atender hoy, ${fecha}.` : 'No hay nada pendiente.',
      kicker: fecha,
      title: total ? 'Lo que pide atención hoy' : 'Hoy está al día',
      body: `${cuerpo}${mailButton(`${site}/admin`, 'Abrir el panel')}`,
    }),
  });
  return { enviado: true, total };
}
