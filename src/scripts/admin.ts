/**
 * Pantalla del panel privado: resumen con metas, contactos, tareas y contenido.
 * Las tablas y formularios salen del esquema de src/data/admin.ts.
 */
import { mensajes, pasos, type Mensaje } from '@/data/mensajes';
import { entrantes, etapasEmbudo, metaTypes, origenesContacto, plazosSeguimiento, productos, resources, type EntranteOrigen, type Field, type Producto, type Resource, type ResourceKey } from '@/data/admin';

import { enlacesView, mentoradoFichaView, mentoradosView, planInicial, progreso, resumenTexto, semanaActual, semanasDe, semanasIniciales } from './admin-mentorados';
import { programaView, type ProgramaFiltro } from './admin-programa';
import { contenidoResultadosView, agruparPersonas, datosView, exportar, proyeccionView, renovacionesPendientes, semanaInicial, semanaView, type Proy } from './admin-reports';
import { addDays, addMonths, btn, esc, fechaHora, iso, monthStart, num, pct, shortDate, sumUsd, today, weekStart, type Row } from './admin-utils';
type Tab = 'hoy' | 'resumen' | 'embudo' | 'proyeccion' | 'semana' | 'contactos' | 'ventas' | 'tareas' | 'contenido' | 'datos' | 'programa' | 'mentorados' | 'enlaces';

const root = document.querySelector<HTMLElement>('[data-app]')!;
const view = root.querySelector<HTMLElement>('[data-view]')!;
const toastEl = root.querySelector<HTMLElement>('[data-toast]')!;
const dialog = root.querySelector<HTMLDialogElement>('[data-dialog]')!;
const form = dialog.querySelector<HTMLFormElement>('[data-form]')!;
const confirmDialog = root.querySelector<HTMLDialogElement>('[data-confirm]')!;
const ficha = root.querySelector<HTMLDialogElement>('[data-ficha]')!;
const fichaBody = ficha.querySelector<HTMLElement>('[data-ficha-body]')!;
let fichaId = '';
const mentDlg = root.querySelector<HTMLDialogElement>('[data-mentorado]')!;
const mentBody = mentDlg.querySelector<HTMLElement>('[data-mentorado-body]')!;
let mentId = '';
let mentSemana = 1;
let mentFiltro = 'activos';
let enlacesQuery = '';

/** Pregunta antes de borrar, con un modal propio (el confirm del navegador puede estar bloqueado). */
type OpcionesConfirmar = { titulo?: string; verbo?: string; boton?: string; peligro?: boolean };

function confirmar(nombre: string, aviso = 'Esta acción no se puede deshacer.', op: OpcionesConfirmar = {}): Promise<boolean> {
  const set = (sel: string, texto: string) => (confirmDialog.querySelector<HTMLElement>(sel)!.textContent = texto);
  set('[data-confirm-title]', op.titulo ?? '¿Estás seguro?');
  set('[data-confirm-verb]', op.verbo ?? 'eliminar');
  set('[data-confirm-name]', nombre);
  set('[data-confirm-note]', aviso);
  const ok = confirmDialog.querySelector<HTMLElement>('[data-confirm-ok]')!;
  ok.textContent = op.boton ?? 'Sí, eliminar';
  ok.className = `px-4 py-2.5 text-sm font-semibold text-ink hover:bg-bone ${op.peligro === false ? 'bg-signal' : 'bg-[#ff7a7a]'}`;
  confirmDialog.returnValue = '';
  return new Promise((resolve) => {
    confirmDialog.addEventListener('close', () => resolve(confirmDialog.returnValue === 'ok'), { once: true });
    confirmDialog.showModal();
  });
}

/** Nombre legible de una fila, para el mensaje de confirmación. */
function nombreDe(key: ResourceKey, row?: Row): string {
  if (!row) return 'este elemento';
  const ventaDe = (id: string) => data.ventas.find((v) => v.id === id);
  switch (key) {
    case 'cobros':
      return `${row.concepto} (USD ${num(Number(row.monto_usd))}) de ${ventaDe(row.venta_id)?.cliente ?? 'la venta'}`;
    case 'ventas':
      return `${row.cliente} · ${row.producto}`;
    case 'tareas':
    case 'contenido':
      return String(row.titulo);
    case 'contactos':
    case 'mentorados':
      return String(row.nombre);
    default:
      return 'este elemento';
  }
}

const data: Record<ResourceKey | 'entrantes', Row[]> = { tareas: [], contenido: [], contactos: [], registro: [], metas: [], ventas: [], cobros: [], historial: [], mentorados: [], semanas: [], enlaces: [], reservas: [], entrantes: [] };
let tab: Tab = 'hoy';
let contactSub: 'prospectos' | 'entrantes' | 'personas' = 'prospectos';
let personasQuery = '';
let progFiltro: ProgramaFiltro = { perfil: 'todos', tipo: 'todos' };

/** Menú en dos niveles: grupos arriba y, dentro del grupo activo, sus secciones. */
const grupos: readonly { id: string; label: string; tabs: readonly (readonly [Tab, string])[] }[] = [
  { id: 'dia', label: 'Hoy', tabs: [['hoy', 'Hoy'], ['semana', 'Semana'], ['resumen', 'Metas']] },
  { id: 'vender', label: 'Vender', tabs: [['embudo', 'Embudo'], ['contactos', 'Contactos'], ['ventas', 'Ventas'], ['proyeccion', 'Proyección']] },
  { id: 'contenido', label: 'Contenido', tabs: [['contenido', 'Calendario']] },
  { id: 'mentoria', label: 'Mentoría', tabs: [['mentorados', 'Mentorados'], ['enlaces', 'Enlaces'], ['programa', 'Programa']] },
  { id: 'gestion', label: 'Gestión', tabs: [['tareas', 'Tareas'], ['datos', 'Datos']] },
];
const ultimaPestana: Record<string, Tab> = {};
let semanaWs = semanaInicial();
const proy: Proy = { nuevos: 3, ticket: 350 };
const filters = { tareas: 'abiertas', contenido: 'todas', contactos: 'activos', ventas: 'saldo' };

let toastTimer: number | undefined;
function say(message: string, error = false) {
  toastEl.textContent = message;
  toastEl.className = `m-0 inset-auto bottom-6 left-1/2 max-w-[calc(100vw-2rem)] -translate-x-1/2 border bg-panel px-5 py-3 text-sm shadow-2xl ${error ? 'border-[#ff7a7a] text-[#ff7a7a]' : 'border-signal text-bone'}`;
  // Se vuelve a abrir para quedar por encima de un modal que se haya abierto después
  if (toastEl.matches(':popover-open')) toastEl.hidePopover();
  toastEl.showPopover();
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.matches(':popover-open') && toastEl.hidePopover(), error ? 5000 : 3000);
}

async function api<T = Row>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Admin': '1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) {
    location.href = '/admin';
    throw new Error('Sesión vencida');
  }
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Algo salió mal');
  return json;
}

async function reload(key: ResourceKey | 'entrantes') {
  data[key] = (await api<{ rows: Row[] }>(key)).rows;
}

/* ------------------------------ metas ------------------------------ */
const periodStart = (periodo: string) => (periodo === 'mes' ? monthStart(today()) : weekStart(today()));
const cobradoMes = () => sumUsd(data.cobros.filter((c) => c.cobrado_en && String(c.cobrado_en) >= monthStart(today())));
const cobrosDe = (ventaId: string) => data.cobros.filter((c) => c.venta_id === ventaId);

/** Ventas e ingresos se calculan solos; el resto se suma de los registros manuales. */
const actual = (m: Row) => {
  if (m.tipo === 'ingresos') return cobradoMes();
  if (m.tipo === 'ventas') return data.ventas.filter((v) => String(v.fecha) >= monthStart(today())).length;
  return data.registro.filter((r) => r.tipo === m.tipo && String(r.fecha) >= periodStart(m.periodo)).reduce((a, r) => a + Number(r.cantidad), 0);
};

function metasView() {
  const order = metaTypes.map((m) => m.tipo as string);
  const metas = [...data.metas].sort((a, b) => order.indexOf(a.tipo) - order.indexOf(b.tipo));
  if (!metas.length) return '<p class="text-mute">No hay metas cargadas. Ejecutá supabase/admin.sql en Supabase.</p>';

  return `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${metas
    .map((m) => {
      const cfg = metaTypes.find((t) => t.tipo === m.tipo);
      const done = actual(m);
      const goal = Number(m.objetivo);
      const pct = goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0;
      const buttons = cfg?.auto
        ? `<button type="button" data-action="tab" data-tab="ventas" class="border border-line-strong px-3 py-1.5 text-sm text-bone hover:border-signal">Ver ventas</button>`
        : (cfg?.paso ?? []).map((n) => `<button type="button" data-action="log" data-tipo="${esc(m.tipo)}" data-n="${n}" class="border border-line-strong px-3 py-1.5 text-sm text-bone hover:border-signal">+${n}</button>`).join('');
      return `<article class="border border-line bg-panel p-5">
        <p class="tag text-faint">${esc(m.etiqueta)} · ${m.periodo === 'mes' ? 'este mes' : 'esta semana'}</p>
        <p class="display mt-3 text-4xl text-bone">${num(done)}<span class="text-xl text-faint"> / ${num(goal)}</span></p>
        <div class="mt-3 h-1.5 bg-line" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div class="h-1.5 bg-signal" style="width:${pct}%"></div></div>
        <div class="mt-4 flex flex-wrap items-center gap-2">${buttons}
          <button type="button" data-action="edit-meta" data-id="${esc(m.tipo)}" class="tag ml-auto text-faint hover:text-bone">Meta</button>
        </div>
      </article>`;
    })
    .join('')}</div>`;
}

type Item = { html: string; buttons: string };

/** Todo lo que pide atención hoy, agrupado por tipo. */
function hoyData() {
  const t = today();
  const ventaDe = (id: string) => data.ventas.find((v) => v.id === id);

  const seguir: Item[] = data.contactos
    .filter((c) => c.proximo_seguimiento && c.proximo_seguimiento <= t && !['Cliente', 'Descartado'].includes(c.estado))
    .map((c) => ({
      html: `<strong>${esc(c.nombre)}</strong> <span class="text-mute">· ${esc(c.organizacion || c.tipo)} · ${esc(c.estado)} · ${shortDate(c.proximo_seguimiento)}</span>`,
      buttons: btn('open', 'Abrir', { res: 'contactos', id: c.id }) + btn('snooze-contacto', '+3 días', { id: c.id }),
    }));

  const tareas: Item[] = data.tareas
    .filter((x) => x.estado !== 'hecha' && x.fecha_limite && x.fecha_limite <= t)
    .map((x) => ({
      html: `${esc(x.titulo)} <span class="text-mute">· ${shortDate(x.fecha_limite)}</span>`,
      buttons: btn('open', 'Abrir', { res: 'tareas', id: x.id }) + btn('hecha-tarea', 'Hecha', { id: x.id }),
    }));

  const piezas: Item[] = data.contenido
    .filter((c) => c.fecha && c.fecha <= t && c.estado !== 'publicada')
    .map((c) => ({
      html: `${esc(c.titulo)} <span class="text-mute">· ${shortDate(c.fecha)} · ${esc(c.estado)}</span>`,
      buttons: btn('open', 'Abrir', { res: 'contenido', id: c.id }) + btn('publicada', 'Publicada', { id: c.id }),
    }));

  const cobros: Item[] = data.cobros
    .filter((c) => !c.cobrado_en && c.vencimiento <= t)
    .map((c) => {
      const v = ventaDe(c.venta_id);
      return {
        html: `<strong>${esc(v?.cliente ?? 'Cliente')}</strong> <span class="text-mute">· ${esc(c.concepto)} · USD ${num(Number(c.monto_usd))} · ${c.vencimiento < t ? 'vencido' : 'vence hoy'} ${shortDate(c.vencimiento)}</span>`,
        buttons: btn('cobro-msg', 'Mensaje', { id: c.id }) + btn('open', 'Editar', { res: 'cobros', id: c.id }) + btn('cobrado', 'Cobrado', { id: c.id }),
      };
    });

  const nuevos: Item[] = data.entrantes
    .filter((e) => e.estado === entrantes[e.origen as EntranteOrigen]?.estados[0])
    .map((e) => ({
      html: `<strong>${esc(e.nombre)}</strong> <span class="text-mute">· ${esc(entrantes[e.origen as EntranteOrigen].label)} · ${shortDate(e.fecha)}</span>`,
      buttons: btn('goto-entrantes', 'Ver', {}),
    }));

  const renovar: Item[] = renovacionesPendientes(data).map(({ v, ultimo }) => ({
    html: `<strong>${esc(v.cliente)}</strong> <span class="text-mute">· ${esc(v.producto)} · último pago ${shortDate(ultimo.vencimiento)}</span>`,
    buttons: btn('generar-cobro', 'Generar cobro', { id: v.id }) + btn('baja-venta', 'Dar de baja', { id: v.id }),
  }));

  // Mentoría: llamadas que tocan, entregables sin recibir y llamadas de control
  const mentoria: Item[] = [];
  for (const m of data.mentorados.filter((x) => x.estado === 'activo')) {
    const ss = semanasDe(data, m.id);
    const sig = ss.find((s) => s.estado === 'pendiente');
    if (sig?.fecha_llamada && String(sig.fecha_llamada) <= t) {
      mentoria.push({
        html: `<strong>${esc(m.nombre)}</strong> <span class="text-mute">· llamada de la semana ${sig.semana} · ${shortDate(sig.fecha_llamada)}</span>`,
        buttons: btn('ment-open', 'Abrir', { id: m.id }) + btn('ment-hecha', 'Hecha', { id: sig.id }),
      });
    }
    for (const s of ss.filter((x) => x.estado === 'hecha' && !x.entregable_en && x.fecha_llamada && String(x.fecha_llamada) <= addDays(t, -7))) {
      mentoria.push({
        html: `<strong>${esc(m.nombre)}</strong> <span class="text-mute">· entregable de la semana ${s.semana} sin recibir${''}</span>`,
        buttons: btn('ment-open', 'Abrir', { id: m.id }) + btn('ment-recibido', 'Recibido', { id: s.id }),
      });
    }
  }
  for (const m of data.mentorados.filter((x) => x.estado === 'terminado' && x.control_fecha && String(x.control_fecha) <= t)) {
    mentoria.push({
      html: `<strong>${esc(m.nombre)}</strong> <span class="text-mute">· llamada de control (${shortDate(m.control_fecha)})</span>`,
      buttons: btn('ment-open', 'Abrir', { id: m.id }) + btn('ment-control-hecha', 'Hecha', { id: m.id }),
    });
  }

  // Reservas de Cal.com de hoy y de mañana
  const mañana = addDays(t, 1);
  const reservas: Item[] = data.reservas
    .filter((r) => r.estado !== 'cancelada' && [t, mañana].includes(iso(new Date(r.inicio))))
    .sort((a, b) => String(a.inicio).localeCompare(String(b.inicio)))
    .map((r) => ({
      html: `<strong>${new Date(r.inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}</strong> <span class="text-mute">${iso(new Date(r.inicio)) === t ? 'hoy' : 'mañana'} · ${esc(r.nombre || r.email || 'Reserva')} · ${esc(r.evento)}</span>`,
      buttons: r.mentorado_id ? btn('ment-open', 'Abrir', { id: r.mentorado_id }) : r.contacto_id ? btn('open', 'Abrir', { res: 'contactos', id: r.contacto_id }) : '',
    }));

  return { reservas, seguir, cobros, renovar, mentoria, tareas, piezas, nuevos };
}

const hoyCount = () => Object.values(hoyData()).reduce((a, l) => a + l.length, 0);

function hoyBlock(title: string, items: Item[], empty: string, tabTo?: Tab) {
  const shown = items.slice(0, 8);
  return `<section class="border border-line p-5">
    <div class="flex items-baseline justify-between gap-3">
      <h3 class="tag text-signal">${title}${items.length ? ` <span class="text-faint">· ${items.length}</span>` : ''}</h3>
      ${tabTo ? `<button type="button" data-action="tab" data-tab="${tabTo}" class="tag text-faint hover:text-bone">Ver todo</button>` : ''}
    </div>
    ${shown.length
      ? `<ul class="mt-4 space-y-3">${shown.map((i) => `<li class="flex flex-wrap items-center justify-between gap-3 text-sm leading-snug text-bone"><span class="min-w-0">${i.html}</span><span class="flex shrink-0 gap-2">${i.buttons}</span></li>`).join('')}</ul>${items.length > shown.length ? `<p class="mt-3 text-sm text-faint">y ${items.length - shown.length} más</p>` : ''}`
      : `<p class="mt-4 text-sm text-faint">${empty}</p>`}
  </section>`;
}

function hoyView() {
  const h = hoyData();
  const metaSemana = (tipo: string) => {
    const m = data.metas.find((x) => x.tipo === tipo);
    return m ? ` · ${num(actual(m))}/${num(Number(m.objetivo))}` : '';
  };
  const big = (q: string, label: string, sub = '') =>
    `<button type="button" data-action="quick" data-q="${q}" class="flex min-h-16 flex-col items-start justify-center border border-line-strong bg-panel px-4 py-3 text-left text-bone hover:border-signal"><span class="font-semibold">${label}</span>${sub ? `<span class="text-xs text-faint">${sub}</span>` : ''}</button>`;
  const lunes = new Date().getDay() === 1;

  return `<div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
    ${big('mensaje', '+1 Mensaje', 'enviado' + metaSemana('mensajes'))}
    ${big('respuesta', '+1 Respuesta', 'conversación' + metaSemana('conversaciones'))}
    ${big('cobro', 'Registrar cobro', 'marcar uno cobrado')}
    ${big('venta', 'Nueva venta')}
    ${big('prospecto', 'Nuevo prospecto')}
  </div>
  ${lunes ? `<div class="mb-6 flex flex-wrap items-center justify-between gap-3 border border-signal/60 bg-signal/5 p-4"><p class="text-sm text-bone">Es lunes: mirá cómo cerró la semana pasada y qué viene.</p>${btn('tab', 'Ver resumen semanal', { tab: 'semana' })}</div>` : ''}
  <p class="mb-5 text-mute">${hoyCount() ? 'Esto es lo que pide atención hoy.' : 'No hay nada pendiente para hoy.'}</p>
  <div class="grid gap-4 md:grid-cols-2">
    ${hoyBlock('Reservas de hoy y mañana', h.reservas, 'No hay reservas para hoy ni mañana.')}
    ${hoyBlock('Seguimientos', h.seguir, 'Nadie para seguir hoy.', 'contactos')}
    ${hoyBlock('Cobros vencidos o de hoy', h.cobros, 'No hay cobros vencidos.', 'ventas')}
    ${hoyBlock('Renovaciones de planes', h.renovar, 'Ningún plan para renovar todavía.', 'ventas')}
    ${hoyBlock('Mentoría', h.mentoria, 'Sin llamadas ni entregables pendientes.', 'mentorados')}
    ${hoyBlock('Tareas para hoy o vencidas', h.tareas, 'Sin tareas vencidas.', 'tareas')}
    ${hoyBlock('Contenido para publicar', h.piezas, 'No hay piezas atrasadas ni para hoy.', 'contenido')}
    ${hoyBlock('Contactos nuevos sin atender', h.nuevos, 'No hay contactos nuevos.')}
  </div>`;
}

function resumenView() {
  const recientes = data.registro.slice(0, 8);
  const label = (tipo: string) => metaTypes.find((m) => m.tipo === tipo)?.etiqueta ?? tipo;

  return `${metasView()}
  <section class="mt-8">
    <h3 class="tag text-faint">Últimos registros</h3>
    ${recientes.length
      ? `<ul class="mt-3 divide-y divide-line border-y border-line">${recientes
          .map((r) => `<li class="flex items-center justify-between gap-4 py-2.5 text-sm"><span class="text-bone">${shortDate(r.fecha)} · ${esc(label(r.tipo))}: <strong>${num(Number(r.cantidad))}</strong>${r.nota ? ` <span class="text-mute">· ${esc(r.nota)}</span>` : ''}</span><button type="button" data-action="del-registro" data-id="${esc(r.id)}" class="tag text-[#ff7a7a] hover:underline">Borrar</button></li>`)
          .join('')}</ul>`
      : '<p class="mt-3 text-sm text-faint">Todavía no registraste nada. Usá los botones de cada meta.</p>'}
  </section>`;
}

/* ------------------------------ seguimiento automático ------------------------------ */
/** Fecha del próximo seguimiento según el estado al que pasa el prospecto. Vacío = no cambia. */
function seguimientoPara(estado: string): Row {
  if (!(estado in plazosSeguimiento)) return {};
  const dias = plazosSeguimiento[estado];
  return { proximo_seguimiento: dias == null ? null : addDays(today(), dias) };
}

const seguimientoTexto = (patch: Row) =>
  patch.proximo_seguimiento ? ` Próximo seguimiento: ${shortDate(patch.proximo_seguimiento)}.` : 'proximo_seguimiento' in patch ? ' Sin seguimiento pendiente.' : '';

/* ------------------------------ embudo ------------------------------ */

/** Etapa más avanzada que alcanzó cada prospecto, mirando su estado actual y su historial. */
function etapas() {
  const best = new Map<string, number>();
  for (const c of data.contactos) best.set(c.id, Math.max(0, etapasEmbudo.indexOf(c.estado)));
  for (const h of data.historial) {
    const i = etapasEmbudo.indexOf(h.estado);
    if (h.tipo === 'estado' && i >= 0 && best.has(h.contacto_id)) best.set(h.contacto_id, Math.max(best.get(h.contacto_id)!, i));
  }
  return data.contactos.map((c) => ({ c, idx: best.get(c.id) ?? 0 }));
}

const consejos = [
  '',
  'Estás mandando pocos mensajes: el cuello de botella es el volumen.',
  'Casi nadie responde: revisá el primer mensaje y el momento en que lo mandás.',
  'Responden pero no avanzan: ofrecé el informe de cortesía más rápido.',
  'Reciben el informe pero no hay propuesta: proponé en la misma conversación.',
  'Reciben la propuesta pero no compran: revisá el precio, la oferta y el seguimiento posterior.',
];

/** Proporción de prospectos contactados que llegaron a cliente (null si hay pocos datos). */
function conversionContactadoCliente() {
  const rows = etapas();
  const contactados = rows.filter((r) => r.idx >= 1).length;
  return contactados >= 5 ? rows.filter((r) => r.idx >= etapasEmbudo.length - 1).length / contactados : null;
}

function embudoView() {
  const rows = etapas();
  if (!rows.length) return '<p class="border border-line p-6 text-mute">Todavía no cargaste prospectos. Sumalos en Contactos → Prospectos y acá vas a ver por dónde se cae la gente.</p>';

  const counts = etapasEmbudo.map((_, k) => rows.filter((r) => r.idx >= k).length);
  const total = counts[0];
  const clientes = counts[etapasEmbudo.length - 1];
  const descartados = data.contactos.filter((c) => c.estado === 'Descartado').length;
  const activos = data.contactos.filter((c) => !['Cliente', 'Descartado'].includes(c.estado)).length;

  // El paso más flojo, solo si hay volumen suficiente para que el dato diga algo
  let peor = -1;
  for (let k = 1; k < counts.length; k++) {
    if (counts[k - 1] < 5) continue;
    if (peor < 0 || pct(counts[k], counts[k - 1]) < pct(counts[peor], counts[peor - 1])) peor = k;
  }

  const stat = (label: string, value: string) =>
    `<div class="border border-line bg-panel p-4"><p class="tag text-faint">${label}</p><p class="display mt-2 text-3xl text-bone">${value}</p></div>`;

  const bars = etapasEmbudo
    .map((nombre, k) => {
      const w = Math.max(pct(counts[k], total), counts[k] ? 6 : 0);
      const paso = k > 0 ? pct(counts[k], counts[k - 1]) : null;
      const flojo = k === peor;
      return `<li class="grid grid-cols-[6.5rem_1fr] items-center gap-3 sm:grid-cols-[9rem_1fr_9rem]">
        <span class="text-sm ${flojo ? 'text-[#ff7a7a]' : 'text-mute'}">${esc(nombre)}</span>
        <div class="h-9 bg-line/60"><div class="flex h-9 items-center justify-end px-3 ${flojo ? 'bg-[#ff7a7a]/70' : 'bg-signal'} transition-all" style="width:${w}%;opacity:${1 - k * 0.1}"><span class="text-sm font-semibold text-ink">${counts[k]}</span></div></div>
        <span class="col-span-2 text-xs text-faint sm:col-span-1 sm:text-sm">${paso === null ? '100% del total' : `<span class="${flojo ? 'text-[#ff7a7a]' : 'text-bone'}">${paso}%</span> pasa del paso anterior`}</span>
      </li>`;
    })
    .join('');

  const porTipo = [...new Set(data.contactos.map((c) => c.tipo))]
    .map((tipo) => {
      const r = rows.filter((x) => x.c.tipo === tipo);
      const n = (k: number) => r.filter((x) => x.idx >= k).length;
      return `<tr><td class="px-3 py-3 font-medium text-bone">${esc(tipo)}</td><td class="px-3 py-3 text-mute">${r.length}</td><td class="px-3 py-3 text-mute">${n(1)}</td><td class="px-3 py-3 text-mute">${n(2)}</td><td class="px-3 py-3 text-bone">${n(5)}</td><td class="px-3 py-3 text-mute">${pct(n(5), r.length)}%</td></tr>`;
    })
    .join('');

  return `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">${stat('Prospectos', String(total))}${stat('En juego', String(activos))}${stat('Clientes', String(clientes))}${stat('Conversión total', pct(clientes, total) + '%')}</div>
  <section class="mt-6 border border-line p-5 md:p-6">
    <h3 class="tag text-signal">Por dónde avanza la gente</h3>
    <ul class="mt-5 space-y-3">${bars}</ul>
    <p class="mt-5 text-sm text-faint">Descartados: ${descartados}. Cada barra cuenta a quienes llegaron a esa etapa o más allá.</p>
    ${peor > 0 ? `<p class="mt-4 border-l-2 border-[#ff7a7a] pl-4 text-sm leading-relaxed text-bone"><strong class="text-[#ff7a7a]">Donde más se cae:</strong> de ${esc(etapasEmbudo[peor - 1])} a ${esc(etapasEmbudo[peor])} (${pct(counts[peor], counts[peor - 1])}%). ${consejos[peor]}</p>` : '<p class="mt-4 text-sm text-faint">Con 5 o más prospectos en una etapa, el panel te marca el paso más flojo.</p>'}
  </section>
  <section class="mt-6">
    <h3 class="tag text-faint">Por tipo de contacto</h3>
    <div class="mt-3 overflow-x-auto border border-line"><table class="w-full min-w-[34rem] text-left text-sm">
      <thead class="border-b border-line bg-panel"><tr>${['Tipo', 'Prospectos', 'Contactados', 'Respondieron', 'Clientes', 'Conversión'].map((h) => `<th class="tag px-3 py-3 font-normal text-faint">${h}</th>`).join('')}</tr></thead>
      <tbody class="divide-y divide-line">${porTipo}</tbody>
    </table></div>
  </section>`;
}

/* ------------------------------ ventas y cobros ------------------------------ */
function ventasView() {
  const t = today();
  const pendientes = data.cobros.filter((c) => !c.cobrado_en);
  const vencido = sumUsd(pendientes.filter((c) => c.vencimiento < t));
  const proximos = sumUsd(pendientes.filter((c) => c.vencimiento >= t && c.vencimiento <= addDays(t, 30)));
  const stat = (label: string, value: number, warn = false) =>
    `<div class="border border-line bg-panel p-4"><p class="tag text-faint">${label}</p><p class="display mt-2 text-3xl ${warn && value > 0 ? 'text-[#ff7a7a]' : 'text-bone'}">USD ${num(value)}</p></div>`;

  let ventas = data.ventas;
  // Con saldo: lo que falta cobrar y los planes mensuales activos (para generar el cobro siguiente)
  if (filters.ventas === 'saldo') ventas = ventas.filter((v) => cobrosDe(v.id).some((c) => !c.cobrado_en) || (v.recurrente === true && v.activa !== false));

  const cards = ventas
    .map((v) => {
      const cs = cobrosDe(v.id);
      const total = sumUsd(cs);
      const cobrado = sumUsd(cs.filter((c) => c.cobrado_en));
      const lines = cs
        .map((c) => {
          const paid = !!c.cobrado_en;
          const estado = paid
            ? `<span class="text-signal">Cobrado ${shortDate(c.cobrado_en)}</span>`
            : c.vencimiento < t
              ? `<span class="text-[#ff7a7a]">Vencido ${shortDate(c.vencimiento)}</span>`
              : `<span class="text-mute">Vence ${shortDate(c.vencimiento)}</span>`;
          const ars = c.monto_ars != null ? ` · $${num(Number(c.monto_ars))}` : '';
          return `<li class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5 text-sm">
            <span class="text-bone">${esc(c.concepto)} <span class="text-mute">· USD ${num(Number(c.monto_usd))}${ars}</span></span>
            <span class="flex flex-wrap items-center gap-3">${estado}${paid ? '' : btn('cobro-msg', 'Mensaje', { id: c.id })}${paid ? '' : btn('cobrado', 'Cobrado', { id: c.id })}${btn('open', 'Editar', { res: 'cobros', id: c.id })}${btn('del-cobro', 'Eliminar', { id: c.id })}</span>
          </li>`;
        })
        .join('');
      return `<article class="border border-line bg-panel p-5">
        <div class="flex flex-wrap items-baseline justify-between gap-3">
          <div><p class="font-medium text-bone">${esc(v.cliente)} <span class="text-mute">· ${esc(v.producto)}</span></p>
            <p class="mt-1 text-sm text-faint">${shortDate(v.fecha)}${v.origen ? ` · ${esc(v.origen)}` : ''} · cobrado USD ${num(cobrado)} de ${num(total)}${v.recurrente === true ? (v.activa === false ? ' · <span class="text-[#ff7a7a]">De baja</span>' : ' · <span class="text-signal">Se renueva cada mes</span>') : ''}</p></div>
          <span class="flex flex-wrap gap-2">${v.recurrente === true ? (v.activa === false ? btn('reactivar-venta', 'Reactivar', { id: v.id }) : btn('baja-venta', 'Dar de baja', { id: v.id })) : ''}${(String(v.producto).startsWith('Sistema Propio') ? (data.mentorados.find((x) => x.venta_id === v.id) ? btn('ment-open', 'Ver mentorado', { id: data.mentorados.find((x) => x.venta_id === v.id)!.id }) : btn('nuevo-mentorado', 'Crear mentorado', { id: v.id })) : '') + btn('open', 'Editar venta', { res: 'ventas', id: v.id })}${btn('del-venta', 'Eliminar venta', { id: v.id })}</span>
        </div>
        <ul class="mt-3 divide-y divide-line border-t border-line">${lines || '<li class="py-3 text-sm text-faint">Sin cobros cargados.</li>'}</ul>
        ${cs.length && cs.every((c) => c.cobrado_en) ? (v.recurrente === true && v.activa !== false ? `<div class="mt-3">${btn('generar-cobro', '+ Generar cobro del mes siguiente', { id: v.id })}</div>` : '') : `<div class="mt-3">${btn('new-cobro', '+ Agregar cobro', { id: v.id })}</div>`}
      </article>`;
    })
    .join('');

  return `<div class="grid gap-4 sm:grid-cols-3">${stat('Cobrado este mes', cobradoMes())}${stat('Vencido sin cobrar', vencido, true)}${stat('A cobrar en 30 días', proximos)}</div>
  <div class="mb-4 mt-6 flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-3">${filterSelect('ventas', [['saldo', 'Con saldo por cobrar'], ['todas', 'Todas']])}</div>
    <button type="button" data-action="new-venta" class="bg-signal px-4 py-2 text-sm font-semibold text-ink hover:bg-bone">+ Nueva venta</button>
  </div>
  ${cards ? `<div class="grid gap-4">${cards}</div>` : '<p class="border border-line p-6 text-mute">No hay ventas para mostrar. Usá "Nueva venta".</p>'}
  ${origenesView()}`;
}

/** De dónde vienen las ventas: cantidad y dinero por origen. */
function origenesView() {
  if (!data.ventas.length) return '';
  const grupos = new Map<string, Row[]>();
  for (const v of data.ventas) grupos.set(v.origen || 'Sin dato', [...(grupos.get(v.origen || 'Sin dato') ?? []), v]);
  const filas = [...grupos.entries()]
    .map(([origen, vs]) => {
      const cs = vs.flatMap((v) => cobrosDe(v.id));
      return { origen, n: vs.length, total: sumUsd(cs), cobrado: sumUsd(cs.filter((c) => c.cobrado_en)) };
    })
    .sort((a, b) => b.total - a.total);
  return `<section class="mt-8">
    <h3 class="tag text-faint">De dónde vienen las ventas</h3>
    <div class="mt-3 overflow-x-auto border border-line"><table class="w-full min-w-[26rem] text-left text-sm">
      <thead class="border-b border-line bg-panel"><tr>${['Origen', 'Ventas', 'Total USD', 'Cobrado USD'].map((h) => `<th class="tag px-3 py-3 font-normal text-faint">${h}</th>`).join('')}</tr></thead>
      <tbody class="divide-y divide-line">${filas.map((f) => `<tr><td class="px-3 py-3 font-medium text-bone">${esc(f.origen)}</td><td class="px-3 py-3 text-mute">${f.n}</td><td class="px-3 py-3 text-mute">${num(f.total)}</td><td class="px-3 py-3 text-bone">${num(f.cobrado)}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>`;
}

/* ------------------------------ tablas genéricas ------------------------------ */
function cell(res: Resource, f: Field, row: Row) {
  const v = row[f.name];
  if (f.type === 'select' && f.name === 'estado') {
    return `<select data-action="estado" data-res="${res.key}" data-id="${esc(row.id)}" class="border border-line-strong bg-ink px-2 py-1 text-sm text-bone focus:border-signal focus:outline-none">${f.options!
      .map((o) => `<option value="${esc(o)}"${o === v ? ' selected' : ''}>${esc(o)}</option>`)
      .join('')}</select>`;
  }
  if (f.type === 'date') return esc(shortDate(v));
  return esc(v);
}

function table(res: Resource, rows: Row[], extraFirstCol?: (r: Row) => string) {
  const cols = res.fields.filter((f) => f.list);
  if (!rows.length) return `<p class="border border-line p-6 text-mute">No hay ${res.label.toLowerCase()} para mostrar. Usá "Agregar".</p>`;
  return `<div class="overflow-x-auto border border-line"><table class="w-full min-w-[40rem] text-left text-sm">
    <thead class="border-b border-line bg-panel"><tr>
      ${extraFirstCol ? '<th class="w-10 px-3 py-3"></th>' : ''}
      ${cols.map((f) => `<th class="tag px-3 py-3 font-normal text-faint">${esc(f.label)}</th>`).join('')}
    </tr></thead>
    <tbody class="divide-y divide-line">${rows
      .map(
        (r) => `<tr data-action="edit" data-res="${res.key}" data-id="${esc(r.id)}" class="cursor-pointer hover:bg-panel/70">
          ${extraFirstCol ? `<td class="px-3 py-3">${extraFirstCol(r)}</td>` : ''}
          ${cols.map((f, i) => `<td class="px-3 py-3 ${i === 0 ? 'font-medium text-bone' : 'text-mute'}">${cell(res, f, r)}</td>`).join('')}
        </tr>`,
      )
      .join('')}</tbody></table></div>`;
}

const toolbar = (res: Resource, filterHtml: string) =>
  `<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-3">${filterHtml}</div>
    <button type="button" data-action="new" data-res="${res.key}" class="bg-signal px-4 py-2 text-sm font-semibold text-ink hover:bg-bone">+ Agregar ${res.singular}</button>
  </div>`;

const filterSelect = (name: keyof typeof filters, options: [string, string][]) =>
  `<select data-action="filter" data-name="${name}" aria-label="Filtro" class="border border-line-strong bg-ink px-3 py-2 text-sm text-bone focus:border-signal focus:outline-none">${options
    .map(([v, l]) => `<option value="${esc(v)}"${filters[name] === v ? ' selected' : ''}>${esc(l)}</option>`)
    .join('')}</select>`;

/* ------------------------------ pestañas ------------------------------ */
function tareasView() {
  const res = resources.tareas;
  let rows = data.tareas;
  if (filters.tareas === 'abiertas') rows = rows.filter((r) => r.estado !== 'hecha');
  else if (filters.tareas !== 'todas') rows = rows.filter((r) => r.estado === filters.tareas);
  return (
    toolbar(res, filterSelect('tareas', [['abiertas', 'Abiertas'], ['todas', 'Todas'], ['hecha', 'Hechas']])) +
    table(res, rows, (r) => `<input type="checkbox" data-action="toggle-tarea" data-id="${esc(r.id)}" ${r.estado === 'hecha' ? 'checked' : ''} class="size-4 accent-[#00f2ff]" aria-label="Marcar como hecha" />`)
  );
}

function contenidoView() {
  const res = resources.contenido;
  const rows = filters.contenido === 'todas' ? data.contenido : data.contenido.filter((r) => r.estado === filters.contenido);
  const resumen = res.fields.find((f) => f.name === 'estado')!.options!.map((e) => `${e}: ${data.contenido.filter((r) => r.estado === e).length}`).join(' · ');
  return (
    contenidoResultadosView(data) +
    toolbar(res, filterSelect('contenido', [['todas', 'Todas'], ...res.fields.find((f) => f.name === 'estado')!.options!.map((o): [string, string] => [o, o])])) +
    `<p class="mb-4 text-sm text-faint">${esc(resumen)}</p>` +
    table(res, rows)
  );
}

/** Una persona por mail, con todo lo que hizo en la web (descargas, diagnóstico, consultas). */
const personas = () => agruparPersonas(data.entrantes);

const prospectoDe = (email: string) => (email ? data.contactos.find((c) => String(c.email ?? '').toLowerCase() === email.toLowerCase()) : undefined);

function prospectoBtn(p: { email: string }) {
  const ya = prospectoDe(p.email);
  return ya
    ? `<span class="mr-3 text-sm text-faint">Ya está en prospectos (${esc(ya.estado)})</span>${btn('open', 'Abrir prospecto', { res: 'contactos', id: ya.id })}`
    : btn('to-prospect', 'Pasar a prospectos', { email: p.email });
}

async function toProspect(email: string) {
  const ya = prospectoDe(email);
  if (ya) return void say('Ese mail ya está en prospectos.', true);
  const p = personas().find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!p) return;
  const origenes = [...new Set(p.acciones.map((a) => entrantes[a.origen as EntranteOrigen].label))].join(', ');
  const esClub = p.acciones.some((a) => a.origen === 'solicitudes_equipos');
  const estado = 'Respondió'; // escribió él primero
  try {
    await api('contactos', 'POST', {
      nombre: p.nombre || email,
      email: p.email,
      tipo: esClub ? 'Club local' : 'Entrenador o analista',
      canal: 'Mail',
      estado,
      origen: p.acciones.some((a) => a.origen === 'plantillas_leads') ? 'Plantillas' : p.acciones.some((a) => a.origen === 'diagnosticos') ? 'Diagnóstico' : 'Formulario web',
      notas: `Entró por: ${origenes}. ${p.acciones.map((a) => a.resumen).join(' | ')}`.slice(0, 1500),
      ...seguimientoPara(estado),
    });
    await Promise.all([reload('contactos'), reload('historial')]);
    render();
    say('Agregado a prospectos.' + seguimientoTexto(seguimientoPara(estado)));
  } catch (err) {
    say((err as Error).message, true);
  }
}

function personasView() {
  const q = personasQuery.trim().toLowerCase();
  const all = personas();
  const rows = q ? all.filter((p) => `${p.nombre} ${p.email}`.toLowerCase().includes(q)) : all;
  const search = `<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <input type="search" data-action="personas-q" value="${esc(personasQuery)}" placeholder="Buscar por nombre o mail" aria-label="Buscar personas" class="w-full max-w-sm border border-line-strong bg-ink px-3 py-2 text-sm text-bone focus:border-signal focus:outline-none" />
    <p class="text-sm text-faint">${rows.length} de ${all.length}</p>
  </div>`;
  if (!rows.length) return search + '<p class="border border-line p-6 text-mute">No hay personas para mostrar.</p>';
  return (
    search +
    `<ul class="divide-y divide-line border-y border-line">${rows
      .map((p) => {
        const detalle = p.acciones
          .map((a) => `<li class="flex flex-wrap items-baseline gap-x-3 text-sm"><span class="text-faint">${shortDate(a.fecha)}</span><span class="tag text-signal">${esc(entrantes[a.origen as EntranteOrigen].label)}</span><span class="text-bone">${esc(a.resumen)}</span></li>`)
          .join('');
        const resumen = [...new Set(p.acciones.map((a) => entrantes[a.origen as EntranteOrigen].label))].join(' · ');
        return `<li><details>
          <summary class="flex cursor-pointer list-none flex-wrap items-baseline gap-x-4 gap-y-1 py-4 [&::-webkit-details-marker]:hidden">
            <span class="font-medium text-bone">${esc(p.nombre || '(sin nombre)')}</span>
            <span class="text-sm text-mute">${esc(p.email)}</span>
            <span class="text-sm text-faint">${esc(resumen)}</span>
            <span class="ml-auto text-sm text-faint">${p.acciones.length} ${p.acciones.length === 1 ? 'movimiento' : 'movimientos'} · último ${shortDate(p.ultima)}</span>
          </summary>
          <ul class="grid gap-2 pb-3">${detalle}</ul>
          <div class="pb-5">${prospectoBtn(p)}</div>
        </details></li>`;
      })
      .join('')}</ul>`
  );
}

function contactosView() {
  const sub = (id: typeof contactSub, label: string, n: number) =>
    `<button type="button" data-action="contact-sub" data-sub="${id}" class="border px-4 py-2 text-sm ${contactSub === id ? 'border-signal bg-signal/10 text-bone' : 'border-line-strong text-mute hover:text-bone'}">${label} <span class="text-faint">${n}</span></button>`;
  const head = `<div class="mb-5 flex flex-wrap gap-2">${sub('personas', 'Personas (por mail)', personas().length)}${sub('prospectos', 'Prospectos (mi red)', data.contactos.length)}${sub('entrantes', 'Entrantes (formularios)', data.entrantes.length)}</div>`;

  if (contactSub === 'personas') return head + personasView();

  if (contactSub === 'prospectos') {
    const res = resources.contactos;
    let rows = data.contactos;
    if (filters.contactos === 'activos') rows = rows.filter((r) => !['Cliente', 'Descartado'].includes(r.estado));
    else if (filters.contactos !== 'todos') rows = rows.filter((r) => r.estado === filters.contactos);
    const estados = res.fields.find((f) => f.name === 'estado')!.options!;
    return head + toolbar(res, filterSelect('contactos', [['activos', 'Activos'], ['todos', 'Todos'], ...estados.map((o): [string, string] => [o, o])])) + table(res, rows);
  }

  if (!data.entrantes.length) return `${head}<p class="border border-line p-6 text-mute">Todavía no entró nadie por los formularios.</p>`;
  return (
    head +
    `<ul class="divide-y divide-line border-y border-line">${data.entrantes
      .map((e) => {
        const cfg = entrantes[e.origen as EntranteOrigen];
        return `<li><details class="group">
          <summary class="flex cursor-pointer list-none flex-wrap items-baseline gap-x-4 gap-y-1 py-4 [&::-webkit-details-marker]:hidden">
            <span class="tag w-40 shrink-0 text-signal">${esc(cfg.label)}</span>
            <span class="font-medium text-bone">${esc(e.nombre)}</span>
            <span class="text-sm text-mute">${esc(e.resumen)}</span>
            <span class="ml-auto text-sm text-faint">${shortDate(e.fecha)} · ${esc(e.estado)}</span>
          </summary>
          <div class="grid gap-4 pb-6 pl-0 md:pl-44">
            <p class="text-sm text-mute">${esc(e.email)}</p>
            ${(e.detalle as string[]).map((d) => `<p class="text-sm leading-relaxed text-bone">${esc(d)}</p>`).join('')}
            <div class="flex flex-wrap items-center gap-3">
              <label class="text-sm text-mute">Estado
                <select data-action="entrante-estado" data-origen="${esc(e.origen)}" data-id="${esc(e.id)}" class="ml-2 border border-line-strong bg-ink px-2 py-1 text-sm text-bone focus:border-signal focus:outline-none">
                  ${cfg.estados.map((s) => `<option value="${esc(s)}"${s === e.estado ? ' selected' : ''}>${esc(s)}</option>`).join('')}
                </select>
              </label>
            </div>
            <label class="grid gap-2 text-sm text-mute">Notas
              <textarea rows="3" maxlength="1500" data-notas="${esc(e.origen)}:${esc(e.id)}" class="w-full border border-line-strong bg-ink px-3 py-2 text-base text-bone focus:border-signal focus:outline-none">${esc(e.notas)}</textarea>
            </label>
            <div><button type="button" data-action="entrante-notas" data-origen="${esc(e.origen)}" data-id="${esc(e.id)}" class="border border-line-strong px-4 py-2 text-sm text-bone hover:border-signal">Guardar notas</button></div>
          </div>
        </details></li>`;
      })
      .join('')}</ul>`
  );
}

/** Dibuja el menú. Los números marcan lo que está sin atender. */
function renderTabs(hoy: number, nuevos: number) {
  const nav = root.querySelector<HTMLElement>('[data-tabs]')!;
  const activo = grupos.find((g) => g.tabs.some(([id]) => id === tab))!;
  ultimaPestana[activo.id] = tab;

  const badge = (n: number) => (n ? `<span class="ml-2 bg-signal px-1.5 py-0.5 text-xs font-semibold text-ink">${n}</span>` : '');
  const cuenta: Record<string, number> = { dia: hoy, vender: nuevos };
  const subCuenta: Record<string, number> = { hoy, contactos: nuevos };

  const principal = grupos
    .map((g) => `<button type="button" data-group="${g.id}" class="shrink-0 border px-4 py-3 text-sm transition-colors md:py-2.5 ${g.id === activo.id ? 'border-signal bg-signal/10 text-bone' : 'border-line-strong text-mute hover:text-bone'}">${esc(g.label)}${badge(cuenta[g.id] ?? 0)}</button>`)
    .join('');
  const secundario = activo.tabs.length > 1
    ? `<div class="flex gap-5 overflow-x-auto border-b border-line px-1">${activo.tabs
        .map(([id, label]) => `<button type="button" data-tab="${id}" class="-mb-px shrink-0 border-b-2 py-3 text-sm transition-colors md:py-2.5 ${id === tab ? 'border-signal text-bone' : 'border-transparent text-mute hover:text-bone'}">${esc(label)}${badge(subCuenta[id] ?? 0)}</button>`)
        .join('')}</div>`
    : '';
  nav.innerHTML = `<div class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">${principal}</div>${secundario}`;
}

function render() {
  view.innerHTML = { hoy: hoyView, resumen: resumenView, embudo: embudoView, proyeccion: () => proyeccionView(data, proy, conversionContactadoCliente()), semana: () => semanaView(data, semanaWs), contactos: contactosView, ventas: ventasView, tareas: tareasView, contenido: contenidoView, datos: () => datosView(data), programa: () => programaView(progFiltro), mentorados: () => mentoradosView(data, mentFiltro), enlaces: () => enlacesView(data, enlacesQuery) }[tab]();
  const n = hoyCount();
  // Aviso de contactos nuevos sin atender, también en el título de la ventana
  const nuevos = data.entrantes.filter((e) => e.estado === entrantes[e.origen as EntranteOrigen]?.estados[0]).length;
  renderTabs(n, nuevos);
  document.title = nuevos + n ? `(${nuevos + n}) Panel` : 'Panel';
  if (mentDlg.open && mentId) renderMentorado();
}

/* ------------------------------ formulario ------------------------------ */
function fieldInput(f: Field, v: unknown) {
  const val = v == null ? '' : String(v);
  const cls = 'w-full border border-line-strong bg-ink px-3 py-2.5 text-base text-bone focus:border-signal focus:outline-none';
  if (f.type === 'select')
    return `<select name="${f.name}" class="${cls}">${f.options!.map((o) => `<option value="${esc(o)}"${o === val ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  if (f.type === 'longtext') return `<textarea name="${f.name}" rows="4" maxlength="${f.max ?? 1500}" class="${cls}">${esc(val)}</textarea>`;
  const type = f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text';
  return `<input name="${f.name}" type="${type}" ${f.type === 'number' ? 'step="any"' : ''} value="${esc(val)}" maxlength="${f.max ?? 300}" placeholder="${f.type === 'url' ? 'https://…' : esc(f.placeholder ?? '')}" class="${cls}" />`;
}

function openForm(res: Resource, id?: string, parent?: string) {
  const row = id ? data[res.key].find((r) => String(r[res.pk]) === id) : undefined;
  const values: Row = row ?? { ...(res.defaults ?? {}), ...(res.key === 'registro' ? { fecha: today() } : {}), ...(res.key === 'cobros' ? { vencimiento: today() } : {}), ...(res.key === 'mentorados' ? { inicio: today() } : {}) };

  form.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <h2 class="display text-3xl text-bone">${id ? 'Editar' : 'Agregar'} ${esc(res.singular)}</h2>
      <button type="button" data-close class="tag text-signal hover:text-bone" aria-label="Cerrar">Cerrar</button>
    </div>
    ${res.fields
      .filter((f) => !f.hidden)
      .map((f) => `<label class="grid gap-2 text-sm text-mute">${esc(f.label)}${f.required ? '' : ' <span class="text-faint">(opcional)</span>'}${fieldInput(f, values[f.name])}</label>`)
      .join('')}
    <p data-form-msg class="min-h-5 text-sm text-signal" role="status"></p>
    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
      <div class="flex flex-wrap items-center gap-4">${id && res.key !== 'metas' ? '<button type="button" data-delete class="text-sm text-[#ff7a7a] hover:underline">Eliminar</button>' : ''}${id && res.key === 'contactos' && !['Cliente', 'Descartado'].includes(values.estado) ? '<button type="button" data-to-client class="text-sm text-signal hover:underline">Pasar a cliente</button>' : ''}</div>
      <button type="submit" class="bg-signal px-6 py-3 font-semibold text-ink hover:bg-bone disabled:opacity-60">Guardar</button>
    </div>`;

  form.dataset.res = res.key;
  form.dataset.id = id ?? '';
  form.dataset.parent = parent ?? row?.venta_id ?? row?.mentorado_id ?? '';
  dialog.showModal();
  form.querySelector<HTMLElement>('input,select,textarea')?.focus();
}

form.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('[data-close]')) dialog.close();
  if (t.closest('[data-delete]')) void removeCurrent();
  if (t.closest('[data-to-client]')) toClient();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (form.dataset.res === 'venta-nueva') return void submitVenta();
  if (form.dataset.res === 'mentorado-nuevo') return void submitMentoradoNuevo();
  const res = resources[form.dataset.res as ResourceKey];
  const id = form.dataset.id || '';
  const msg = form.querySelector<HTMLElement>('[data-form-msg]')!;
  const btn = form.querySelector<HTMLButtonElement>('button[type=submit]')!;

  const body: Row = {};
  for (const f of res.fields) {
    if (f.hidden) {
      if (f.name === 'venta_id' || f.name === 'mentorado_id') body[f.name] = form.dataset.parent ?? '';
      continue;
    }
    const v = (form.elements.namedItem(f.name) as HTMLInputElement | null)?.value ?? '';
    if (f.required && !v.trim()) {
      msg.textContent = `Falta completar: ${f.label}.`;
      return;
    }
    body[f.name] = f.type === 'number' && v !== '' ? Number(v) : v;
  }

  if (res.key === 'mentorados' && !id && !body.control_fecha && body.inicio) body.control_fecha = addDays(String(body.inicio), 7 * 12 + 30);
  let aviso = '';
  if (res.key === 'contactos') {
    // Si cambió el estado y no tocaste la fecha, el próximo seguimiento se agenda solo
    const prev = id ? data.contactos.find((r) => r.id === id) : undefined;
    const cambio = !prev || prev.estado !== body.estado;
    const fechaIgual = prev ? String(prev.proximo_seguimiento ?? '') === String(body.proximo_seguimiento ?? '') : !body.proximo_seguimiento;
    if (cambio && fechaIgual) {
      const auto = seguimientoPara(String(body.estado));
      Object.assign(body, auto);
      aviso = seguimientoTexto(auto);
    }
  }

  btn.disabled = true;
  msg.textContent = 'Guardando…';
  try {
    if (res.key === 'mentorados' && !id) {
      const v = data.ventas.find((x) => x.id === form.dataset.parent);
      body.contacto_id = await asegurarProspecto({ nombre: String(body.nombre), email: String(body.email ?? ''), origen: v?.origen, contactoId: v?.contacto_id });
      await Promise.all([reload('contactos'), reload('historial')]);
    }
    const out = await api<{ row?: Row }>(id ? `${res.key}?id=${encodeURIComponent(id)}` : res.key, id ? 'PATCH' : 'POST', body);
    if (res.key === 'contactos') await reload('historial');
    // Un mentorado nuevo arranca con sus 12 semanas armadas a partir del esqueleto
    let nuevoMentorado = '';
    if (res.key === 'mentorados' && !id && out.row) {
      await api('semanas', 'POST', semanasIniciales(out.row));
      await reload('semanas');
      nuevoMentorado = out.row.id;
    }
    await reload(res.key);
    dialog.close();
    render();
    say('Guardado.' + aviso);
    if (nuevoMentorado) {
      tab = 'mentorados';
      render();
      openMentorado(nuevoMentorado);
    }
  } catch (err) {
    say((err as Error).message, true);
    msg.textContent = '';
  } finally {
    btn.disabled = false;
  }
});

async function removeCurrent() {
  const res = resources[form.dataset.res as ResourceKey];
  const id = form.dataset.id;
  if (!id) return;
  const row = data[res.key].find((r) => String(r[res.pk]) === id);
  if (!(await confirmar(nombreDe(res.key, row)))) return;
  try {
    await api(`${res.key}?id=${encodeURIComponent(id)}`, 'DELETE');
    await reload(res.key);
    if (res.key === 'ventas') await reload('cobros');
    if (res.key === 'mentorados') {
      await reload('semanas');
      if (mentDlg.open) mentDlg.close();
    }
    dialog.close();
    render();
    say('Eliminado.');
  } catch (err) {
    say((err as Error).message, true);
  }
}

/** Eliminar directo desde la lista de ventas, con confirmación. */
async function removeDirect(key: 'ventas' | 'cobros', id: string) {
  if (key === 'ventas' && cobrosDe(id).some((c) => c.cobrado_en)) {
    say('Esta venta tiene pagos cobrados. Eliminá primero esos cobros.', true);
    return;
  }
  const row = data[key].find((r) => r.id === id);
  const aviso = key === 'ventas' ? 'Se eliminan también sus cobros pendientes. Esta acción no se puede deshacer.' : undefined;
  if (!(await confirmar(nombreDe(key, row), aviso))) return;
  try {
    await api(`${key}?id=${encodeURIComponent(id)}`, 'DELETE');
    await Promise.all([reload('ventas'), reload('cobros')]);
    render();
    say('Eliminado.');
  } catch (err) {
    say((err as Error).message, true);
  }
}

/* ------------------------------ venta nueva ------------------------------ */
const fieldCls = 'w-full border border-line-strong bg-ink px-3 py-2.5 text-base text-bone focus:border-signal focus:outline-none';

function toClient() {
  const c = data.contactos.find((r) => r.id === form.dataset.id);
  if (!c) return;
  dialog.close();
  openVenta({ contactoId: c.id, cliente: c.nombre, origen: c.origen });
}

function openVenta(prefill?: { contactoId: string; cliente: string; origen?: string; mentoradoId?: string; productoId?: string }) {
  const first = productos[0];
  form.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <h2 class="display text-3xl text-bone">Nueva venta</h2>
      <button type="button" data-close class="tag text-signal hover:text-bone" aria-label="Cerrar">Cerrar</button>
    </div>
    <label class="grid gap-2 text-sm text-mute">Cliente<input name="cliente" maxlength="120" value="${esc(prefill?.cliente ?? '')}" class="${fieldCls}" /></label>
    <label class="grid gap-2 text-sm text-mute">Producto
      <select name="producto_id" class="${fieldCls}">${productos.map((p) => `<option value="${esc(p.id)}">${esc(p.nombre)}</option>`).join('')}</select>
    </label>
    <label class="grid gap-2 text-sm text-mute">Nombre del producto <span class="text-faint">(solo si es personalizada)</span><input name="producto_nombre" maxlength="120" class="${fieldCls}" /></label>
    <div class="grid gap-5 sm:grid-cols-2">
      <label class="grid gap-2 text-sm text-mute">Total en USD<input name="total" type="number" step="any" value="${first.cobros.reduce((a, c) => a + c.usd, 0)}" class="${fieldCls}" /></label>
      <label class="grid gap-2 text-sm text-mute">Total en pesos <span class="text-faint">(opcional, un solo pago)</span><input name="total_ars" type="number" step="any" class="${fieldCls}" /></label>
    </div>
    <label class="grid gap-2 text-sm text-mute">Fecha de la venta<input name="fecha" type="date" value="${today()}" class="${fieldCls}" /></label>
    <label class="grid gap-2 text-sm text-mute">Cómo llegó el cliente <span class="text-faint">(opcional)</span>
      <select name="origen" class="${fieldCls}"><option value="">—</option>${origenesContacto.map((o) => `<option value="${esc(o)}"${o === prefill?.origen ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>
    </label>
    <label class="flex items-center gap-3 text-sm text-mute"><input name="recurrente" type="checkbox" class="size-4 accent-[#00f2ff]" ${first.recurrente ? 'checked' : ''} /> Se cobra todos los meses (plan mensual)</label>
    <label class="flex items-center gap-3 text-sm text-mute"><input name="cobrado" type="checkbox" class="size-4 accent-[#00f2ff]" /> Ya cobré el primer pago</label>
    <p class="text-sm text-faint" data-plan></p>
    <p data-form-msg class="min-h-5 text-sm text-signal" role="status"></p>
    <div class="flex justify-end border-t border-line pt-5">
      <button type="submit" class="bg-signal px-6 py-3 font-semibold text-ink hover:bg-bone disabled:opacity-60">Guardar venta</button>
    </div>`;
  form.dataset.res = 'venta-nueva';
  form.dataset.id = '';
  form.dataset.parent = prefill?.contactoId ?? '';
  form.dataset.mentorado = prefill?.mentoradoId ?? '';
  if (prefill?.productoId) {
    (form.elements.namedItem('producto_id') as HTMLSelectElement).value = prefill.productoId;
    field('total').value = String(productoDe().cobros.reduce((a, c) => a + c.usd, 0));
  }
  showPlan();
  dialog.showModal();
  form.querySelector<HTMLElement>('input')?.focus();
}

const productoDe = () => productos.find((p) => p.id === (form.elements.namedItem('producto_id') as HTMLSelectElement).value) as Producto;
const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;

/** Reparte el total entre los cobros sugeridos del producto; el último absorbe el redondeo. */
function planCobros(p: Producto, total: number) {
  const base = p.cobros;
  const baseTotal = base.reduce((a, c) => a + c.usd, 0);
  if (base.length === 1) return [{ ...base[0], usd: total }];
  const k = baseTotal > 0 ? total / baseTotal : 1;
  const out = base.map((c) => ({ ...c, usd: Math.round(c.usd * k * 100) / 100 }));
  out[out.length - 1].usd = Math.round((total - out.slice(0, -1).reduce((a, c) => a + c.usd, 0)) * 100) / 100;
  return out;
}

function showPlan() {
  const total = Number(field('total').value);
  const el = form.querySelector<HTMLElement>('[data-plan]');
  if (!el) return;
  el.textContent = total > 0 ? 'Cobros: ' + planCobros(productoDe(), total).map((c) => `${c.concepto} USD ${num(c.usd)}`).join(' · ') + '. Se pueden editar después.' : '';
}

form.addEventListener('change', (e) => {
  if (form.dataset.res !== 'venta-nueva') return;
  const name = (e.target as HTMLInputElement).name;
  if (name === 'producto_id') {
    const p = productoDe();
    field('total').value = String(p.cobros.reduce((a, c) => a + c.usd, 0) || '');
    field('total_ars').value = p.ars ? String(p.ars) : '';
    field('recurrente').checked = !!p.recurrente;
  }
  showPlan();
});
form.addEventListener('input', (e) => {
  if (form.dataset.res === 'venta-nueva' && (e.target as HTMLInputElement).name === 'total') showPlan();
});

async function submitVenta() {
  const msg = form.querySelector<HTMLElement>('[data-form-msg]')!;
  const btn = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const p = productoDe();
  const cliente = field('cliente').value.trim();
  const total = Number(field('total').value);
  const ars = field('total_ars').value === '' ? null : Number(field('total_ars').value);
  const fecha = field('fecha').value;
  const nombre = p.id === 'personalizada' ? field('producto_nombre').value.trim() : p.nombre;

  if (!cliente) return void (msg.textContent = 'Falta el cliente.');
  if (!nombre) return void (msg.textContent = 'Falta el nombre del producto.');
  if (!(total > 0)) return void (msg.textContent = 'Falta el total en USD.');
  if (!fecha) return void (msg.textContent = 'Falta la fecha.');

  btn.disabled = true;
  msg.textContent = 'Guardando…';
  try {
    const { row } = await api<{ row: Row }>('ventas', 'POST', { cliente, producto: nombre, fecha, origen: (form.elements.namedItem('origen') as HTMLSelectElement).value || null, recurrente: field('recurrente').checked, activa: true, contacto_id: form.dataset.parent || null });
    const cobros = planCobros(p, total);
    for (const [i, c] of cobros.entries()) {
      await api('cobros', 'POST', {
        venta_id: row.id,
        concepto: c.concepto,
        monto_usd: c.usd,
        monto_ars: cobros.length === 1 ? ars : null,
        vencimiento: addDays(fecha, c.dias),
        cobrado_en: i === 0 && field('cobrado').checked ? today() : null,
      });
    }
    // La venta cierra al prospecto: pasa a Cliente y deja de aparecer en los seguimientos
    if (form.dataset.parent) {
      await api(`contactos?id=${encodeURIComponent(form.dataset.parent)}`, 'PATCH', { estado: 'Cliente', ...seguimientoPara('Cliente') });
      await Promise.all([reload('contactos'), reload('historial')]);
    }
    await Promise.all([reload('ventas'), reload('cobros')]);
    dialog.close();
    tab = 'ventas';
    render();
    say('Venta guardada.');
    if (form.dataset.mentorado) {
      // Venta creada desde la ficha de un mentorado que todavía no tenía: queda vinculada
      await api(`mentorados?id=${encodeURIComponent(form.dataset.mentorado)}`, 'PATCH', { venta_id: row.id, ...(form.dataset.parent ? { contacto_id: form.dataset.parent } : {}) });
      await reload('mentorados');
      render();
    } else if (nombre.startsWith('Sistema Propio')) void ofrecerMentorado(row.id, cliente);
  } catch (err) {
    say((err as Error).message, true);
    msg.textContent = '';
    await Promise.all([reload('ventas'), reload('cobros')]).catch(() => undefined);
  } finally {
    btn.disabled = false;
  }
}

/* ------------------------------ renovaciones y mensajes de cobro ------------------------------ */
const ultimoCobroDe = (ventaId: string) => [...cobrosDe(ventaId)].sort((a, b) => String(a.vencimiento).localeCompare(String(b.vencimiento))).at(-1);

/** Crea el cobro del mes siguiente de un plan mensual. */
async function generarCobro(ventaId: string) {
  const ultimo = ultimoCobroDe(ventaId);
  if (!ultimo) return;
  const n = Number(/^Mes (\d+)/.exec(String(ultimo.concepto))?.[1] ?? cobrosDe(ventaId).length) + 1;
  try {
    await api('cobros', 'POST', {
      venta_id: ventaId,
      concepto: `Mes ${n}`,
      monto_usd: Number(ultimo.monto_usd),
      monto_ars: null,
      vencimiento: addMonths(String(ultimo.vencimiento), 1),
      cobrado_en: null,
    });
    await reload('cobros');
    render();
    say(`Cobro generado: vence el ${shortDate(addMonths(String(ultimo.vencimiento), 1))}.`);
  } catch (err) {
    say((err as Error).message, true);
  }
}

/** Recordatorio de pago listo para pegar. Sin datos de pago: esos los mandás vos. */
function mensajeCobro(cobro: Row) {
  const v = data.ventas.find((x) => x.id === cobro.venta_id);
  const t = today();
  const cuando = cobro.vencimiento < t ? `venció el ${shortDate(cobro.vencimiento)}` : cobro.vencimiento === t ? 'vence hoy' : `vence el ${shortDate(cobro.vencimiento)}`;
  const monto = cobro.monto_ars != null ? `USD ${num(Number(cobro.monto_usd))} (equivalente a $${num(Number(cobro.monto_ars))})` : `USD ${num(Number(cobro.monto_usd))}`;
  const nombre = String(v?.cliente ?? '').trim().split(/\s+/)[0];
  return `Hola ${nombre}, ¿cómo estás? Te escribo por el pago de ${cobro.concepto} de ${v?.producto ?? 'el servicio'} (${monto}), que ${cuando}.\n\nCuando lo hagas, mandame el comprobante así lo registro. ¡Gracias!`;
}

/** Cobros pendientes para marcar como cobrados con un toque (pensado para el celular). */
function openCobroRapido() {
  const t = today();
  const pend = data.cobros.filter((c) => !c.cobrado_en).sort((a, b) => String(a.vencimiento).localeCompare(String(b.vencimiento)));
  form.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <h2 class="display text-3xl text-bone">Registrar cobro</h2>
      <button type="button" data-close class="tag text-signal hover:text-bone" aria-label="Cerrar">Cerrar</button>
    </div>
    ${pend.length
      ? `<ul class="divide-y divide-line border-y border-line">${pend
          .map((c) => {
            const v = data.ventas.find((x) => x.id === c.venta_id);
            const venc = c.vencimiento < t ? `<span class="text-[#ff7a7a]">vencido ${shortDate(c.vencimiento)}</span>` : `vence ${shortDate(c.vencimiento)}`;
            return `<li class="flex items-center justify-between gap-3 py-3"><span class="text-sm text-bone"><strong>${esc(v?.cliente ?? '')}</strong> <span class="text-mute">· ${esc(c.concepto)} · USD ${num(Number(c.monto_usd))} · ${venc}</span></span><button type="button" data-action="cobrado" data-id="${esc(c.id)}" class="min-h-11 shrink-0 bg-signal px-4 text-sm font-semibold text-ink hover:bg-bone">Cobrado</button></li>`;
          })
          .join('')}</ul>`
      : '<p class="text-mute">No hay cobros pendientes.</p>'}`;
  form.dataset.res = 'cobro-rapido';
  form.dataset.id = '';
  form.dataset.parent = '';
  dialog.showModal();
}

/* ------------------------------ mentorados: alta conectada ------------------------------ */
/** Deja a la persona como prospecto en estado Cliente: usa el que ya existe (por mail) o crea uno nuevo. */
async function asegurarProspecto(p: { nombre: string; email?: string; origen?: string | null; contactoId?: string | null }): Promise<string> {
  const email = (p.email ?? '').trim().toLowerCase();
  const ya = (p.contactoId ? data.contactos.find((c) => c.id === p.contactoId) : undefined) ?? (email ? data.contactos.find((c) => String(c.email ?? '').toLowerCase() === email) : undefined);
  if (ya) {
    if (ya.estado !== 'Cliente') await api(`contactos?id=${encodeURIComponent(ya.id)}`, 'PATCH', { estado: 'Cliente', ...seguimientoPara('Cliente') });
    return ya.id;
  }
  const r = await api<{ row: Row }>('contactos', 'POST', { nombre: p.nombre, email: email || null, tipo: 'Entrenador o analista', canal: email ? 'Mail' : 'Otro', estado: 'Cliente', origen: p.origen || null });
  return r.row.id;
}

const productoSistema = (cohorte: string) => productos.find((p) => p.id === (cohorte === 'Fundadora' ? 'fundadora' : 'sistema'))!;
const totalSistema = (cohorte: string) => productoSistema(cohorte).cobros.reduce((a, c) => a + c.usd, 0);

function openMentoradoNuevo() {
  const perfilesOpts = ['', ...resources.mentorados.fields.find((f) => f.name === 'perfil')!.options!];
  form.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <h2 class="display text-3xl text-bone">Nuevo mentorado</h2>
      <button type="button" data-close class="tag text-signal hover:text-bone" aria-label="Cerrar">Cerrar</button>
    </div>
    <p class="text-sm leading-relaxed text-faint">Al guardar se crean juntos: su prospecto (como cliente), su venta con las cuotas y sus 12 semanas.</p>
    <label class="grid gap-2 text-sm text-mute">Nombre y apellido<input name="nombre" maxlength="120" class="${fieldCls}" /></label>
    <label class="grid gap-2 text-sm text-mute">Mail <span class="text-faint">(evita duplicados en prospectos)</span><input name="email" type="email" maxlength="160" class="${fieldCls}" /></label>
    <div class="grid gap-5 sm:grid-cols-2">
      <label class="grid gap-2 text-sm text-mute">Perfil<select name="perfil" class="${fieldCls}">${perfilesOpts.map((o) => `<option value="${esc(o)}">${esc(o || '—')}</option>`).join('')}</select></label>
      <label class="grid gap-2 text-sm text-mute">Cohorte<select name="cohorte" class="${fieldCls}"><option>Estándar</option><option>Fundadora</option></select></label>
    </div>
    <div class="grid gap-5 sm:grid-cols-2">
      <label class="grid gap-2 text-sm text-mute">Primera llamada<input name="inicio" type="date" value="${today()}" class="${fieldCls}" /></label>
      <label class="grid gap-2 text-sm text-mute">Fecha de la venta<input name="fecha" type="date" value="${today()}" class="${fieldCls}" /></label>
    </div>
    <div class="grid gap-5 sm:grid-cols-2">
      <label class="grid gap-2 text-sm text-mute">Total en USD<input name="total" type="number" step="any" value="${totalSistema('Estándar')}" class="${fieldCls}" /></label>
      <label class="grid gap-2 text-sm text-mute">Cómo llegó <span class="text-faint">(opcional)</span><select name="origen" class="${fieldCls}"><option value="">—</option>${origenesContacto.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></label>
    </div>
    <label class="flex items-center gap-3 text-sm text-mute"><input name="cobrado" type="checkbox" class="size-4 accent-[#00f2ff]" /> Ya cobré el primer pago</label>
    <label class="grid gap-2 text-sm text-mute">Equipo y video con los que trabaja <span class="text-faint">(opcional)</span><input name="equipo" maxlength="200" class="${fieldCls}" /></label>
    <label class="grid gap-2 text-sm text-mute">Resultado que quiere en la semana 12 <span class="text-faint">(opcional)</span><textarea name="objetivo" rows="3" maxlength="1500" class="${fieldCls}"></textarea></label>
    <p class="text-sm text-faint" data-plan></p>
    <p data-form-msg class="min-h-5 text-sm text-signal" role="status"></p>
    <div class="flex justify-end border-t border-line pt-5">
      <button type="submit" class="bg-signal px-6 py-3 font-semibold text-ink hover:bg-bone disabled:opacity-60">Crear mentorado</button>
    </div>`;
  form.dataset.res = 'mentorado-nuevo';
  form.dataset.id = '';
  form.dataset.parent = '';
  showPlanMentorado();
  dialog.showModal();
  form.querySelector<HTMLElement>('input')?.focus();
}

function showPlanMentorado() {
  const total = Number(field('total').value);
  const el = form.querySelector<HTMLElement>('[data-plan]');
  if (!el) return;
  const cuotas = planCobros(productoSistema(field('cohorte').value), total);
  el.textContent = total > 0 ? 'Cobros: ' + cuotas.map((c) => `${c.concepto} USD ${num(c.usd)}`).join(' · ') + '. Se pueden editar después en Ventas.' : '';
}

form.addEventListener('change', (e) => {
  if (form.dataset.res !== 'mentorado-nuevo') return;
  if ((e.target as HTMLInputElement).name === 'cohorte') field('total').value = String(totalSistema(field('cohorte').value));
  showPlanMentorado();
});
form.addEventListener('input', (e) => {
  if (form.dataset.res === 'mentorado-nuevo' && (e.target as HTMLInputElement).name === 'total') showPlanMentorado();
});

async function submitMentoradoNuevo() {
  const msg = form.querySelector<HTMLElement>('[data-form-msg]')!;
  const boton = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const sel = (n: string) => (form.elements.namedItem(n) as HTMLSelectElement).value;
  const nombre = field('nombre').value.trim();
  const email = field('email').value.trim();
  const cohorte = sel('cohorte');
  const total = Number(field('total').value);
  const inicio = field('inicio').value;
  const fecha = field('fecha').value;

  if (!/\S+\s+\S+/.test(nombre)) return void (msg.textContent = 'Escribí nombre y apellido.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return void (msg.textContent = 'Revisá el mail.');
  if (!(total > 0)) return void (msg.textContent = 'Falta el total en USD.');
  if (!inicio || !fecha) return void (msg.textContent = 'Faltan las fechas.');
  if (data.mentorados.some((m) => email && String(m.email ?? '').toLowerCase() === email.toLowerCase())) return void (msg.textContent = 'Ya hay un mentorado con ese mail.');

  boton.disabled = true;
  msg.textContent = 'Creando…';
  try {
    const origen = sel('origen') || null;
    const prospecto = await asegurarProspecto({ nombre, email, origen });
    const producto = productoSistema(cohorte);
    const { row: venta } = await api<{ row: Row }>('ventas', 'POST', { cliente: nombre, producto: producto.nombre, fecha, origen, recurrente: false, activa: true, contacto_id: prospecto });
    const cobros = planCobros(producto, total);
    for (const [i, c] of cobros.entries()) {
      await api('cobros', 'POST', { venta_id: venta.id, concepto: c.concepto, monto_usd: c.usd, monto_ars: null, vencimiento: addDays(fecha, c.dias), cobrado_en: i === 0 && field('cobrado').checked ? today() : null });
    }
    const { row: m } = await api<{ row: Row }>('mentorados', 'POST', {
      nombre,
      email: email || null,
      perfil: sel('perfil') || null,
      cohorte,
      inicio,
      estado: 'activo',
      equipo: field('equipo').value.trim() || null,
      objetivo: (form.elements.namedItem('objetivo') as HTMLTextAreaElement).value.trim() || null,
      control_fecha: addDays(inicio, 7 * 12 + 30),
      venta_id: venta.id,
      contacto_id: prospecto,
    });
    await api('semanas', 'POST', semanasIniciales(m));
    await Promise.all([reload('contactos'), reload('historial'), reload('ventas'), reload('cobros'), reload('mentorados'), reload('semanas')]);
    dialog.close();
    tab = 'mentorados';
    render();
    openMentorado(m.id);
    say(`Listo: prospecto (cliente), venta con ${cobros.length} cobros y 12 semanas.`);
  } catch (err) {
    say((err as Error).message, true);
    msg.textContent = '';
    await Promise.all([reload('contactos'), reload('ventas'), reload('cobros'), reload('mentorados'), reload('semanas')]).catch(() => undefined);
    render();
  } finally {
    boton.disabled = false;
  }
}

/** Ficha de mentorado a partir de una venta que ya existe. */
function crearMentoradoDesdeVenta(ventaId: string) {
  const v = data.ventas.find((x) => x.id === ventaId);
  if (!v) return;
  const existente = data.mentorados.find((m) => m.venta_id === v.id);
  if (existente) return void openMentorado(existente.id);
  openForm(resources.mentorados, undefined, v.id);
  const c = data.contactos.find((x) => x.id === v.contacto_id);
  (form.elements.namedItem('nombre') as HTMLInputElement).value = c?.nombre ?? v.cliente;
  if (c?.email) (form.elements.namedItem('email') as HTMLInputElement).value = c.email;
  if (String(v.producto).includes('Fundadora')) (form.elements.namedItem('cohorte') as HTMLSelectElement).value = 'Fundadora';
}

async function ofrecerMentorado(ventaId: string, cliente: string) {
  const si = await confirmar(cliente, 'Se arma con sus 12 semanas a partir del esqueleto y queda vinculada a esta venta.', { titulo: '¿Crear su ficha de mentorado?', verbo: 'crear la ficha de mentorado de', boton: 'Sí, crear ficha', peligro: false });
  if (si) crearMentoradoDesdeVenta(ventaId);
}

/* ------------------------------ enlaces de entregables ------------------------------ */
async function agregarEnlace() {
  const campo = (n: string) => mentBody.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-enlace="${n}"]`)!;
  const titulo = campo('titulo').value.trim();
  const url = campo('url').value.trim();
  if (!titulo) return void say('Falta el título del enlace.', true);
  if (!/^https?:\/\/\S+/i.test(url)) return void say('El enlace tiene que empezar con http:// o https://', true);
  try {
    await api('enlaces', 'POST', { mentorado_id: mentId, titulo, url, tipo: campo('tipo').value, semana: campo('semana').value === '' ? null : Number(campo('semana').value) });
    await reload('enlaces');
    render();
    say('Enlace agregado.');
  } catch (err) {
    say((err as Error).message, true);
  }
}

async function borrarEnlace(id: string) {
  const l = data.enlaces.find((x) => x.id === id);
  if (!(await confirmar(l?.titulo ?? 'este enlace'))) return;
  try {
    await api(`enlaces?id=${encodeURIComponent(id)}`, 'DELETE');
    await reload('enlaces');
    render();
    say('Enlace eliminado.');
  } catch (err) {
    say((err as Error).message, true);
  }
}

/* ------------------------------ mentorados ------------------------------ */
function renderMentorado() {
  const html = mentoradoFichaView(data, mentId, mentSemana);
  if (!html) return void mentDlg.close();
  const scroll = mentDlg.scrollTop;
  mentBody.innerHTML = html;
  mentDlg.scrollTop = scroll;
}

function openMentorado(id: string) {
  mentId = id;
  mentSemana = semanaActual(semanasDe(data, id))?.semana ?? 1;
  renderMentorado();
  if (!mentDlg.open) mentDlg.showModal();
}

mentDlg.addEventListener('close', () => (mentId = ''));

/** Guarda un cambio de una semana y, si ya están todas hechas, pasa al mentorado a "terminado". */
async function mentPatch(semanaId: string, patch: Row) {
  await patchField('semanas', semanaId, patch);
  const s = data.semanas.find((x) => x.id === semanaId);
  const m = s && data.mentorados.find((x) => x.id === s.mentorado_id);
  if (m && m.estado === 'activo') {
    const ss = semanasDe(data, m.id);
    if (progreso(ss).terminadas) {
      await patchField('mentorados', m.id, { estado: 'terminado' });
      say('Completó las 12 semanas: pasó a terminado. Agendá la llamada de control.');
    }
  }
}

async function eliminarMentorado(id: string) {
  const m = data.mentorados.find((x) => x.id === id);
  if (!(await confirmar(`${m?.nombre ?? 'este mentorado'} y sus 12 semanas`, 'Se borra todo lo que cargaste de sus semanas. Esta acción no se puede deshacer.'))) return;
  try {
    await api(`mentorados?id=${encodeURIComponent(id)}`, 'DELETE');
    await Promise.all([reload('mentorados'), reload('semanas')]);
    mentDlg.close();
    render();
    say('Eliminado.');
  } catch (err) {
    say((err as Error).message, true);
  }
}

/* ------------------------------ ficha del prospecto ------------------------------ */
const fieldBox = 'w-full border border-line-strong bg-ink px-3 py-2.5 text-base text-bone focus:border-signal focus:outline-none';

/** Abre la ficha para los prospectos y el formulario común para el resto. */
function openRecord(res: Resource, id?: string) {
  if (res.key === 'contactos' && id) openFicha(id);
  else openForm(res, id);
}

const sitioBase = () => (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ? '[link de la web]' : location.origin);

/** Completa los {tokens} del mensaje con los datos del prospecto. */
function llenar(texto: string, c: Row) {
  const nombre = String(c.nombre ?? '').trim().split(/\s+/)[0] ?? '';
  return texto.replaceAll('{nombre}', nombre).replaceAll('{organizacion}', c.organizacion || 'tu equipo').replaceAll('{sitio}', sitioBase());
}

const PREFIJO_ENVIADO = 'Mensaje enviado: ';
const enviadosDe = (id: string) =>
  new Set(data.historial.filter((h) => h.contacto_id === id && h.tipo === 'nota' && String(h.texto).startsWith(PREFIJO_ENVIADO)).map((h) => String(h.texto).slice(PREFIJO_ENVIADO.length)));

const aplica = (m: Mensaje, c: Row) => (!m.tipos || m.tipos.includes(c.tipo)) && (!m.origenes || m.origenes.includes(c.origen));

/** El próximo mensaje a mandar: el primero del paso actual que todavía no se envió. */
function sugerido(c: Row): Mensaje | undefined {
  const lista = mensajes.filter((m) => m.paso === c.estado && aplica(m, c));
  const hechos = enviadosDe(c.id);
  return lista.find((m) => !hechos.has(m.titulo)) ?? lista[0];
}

const efectoTexto = (m: Mensaje) =>
  m.avanza ? `Al marcarlo como enviado pasa a "${m.avanza}" y se agenda el seguimiento.` : m.dias === undefined ? '' : m.dias === null ? 'Al marcarlo como enviado se quita el seguimiento.' : `Al marcarlo como enviado el seguimiento queda en ${m.dias} días.`;

function mensajeBlock(m: Mensaje, c: Row, hechos: Set<string>) {
  const texto = llenar(m.texto, c);
  const rows = Math.min(14, Math.max(5, texto.split('\n').length + 1 + Math.floor(texto.length / 90)));
  return `<div class="border border-line p-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="font-medium text-bone">${esc(m.titulo)}</p>
      ${hechos.has(m.titulo) ? '<span class="tag text-signal">Ya enviado</span>' : ''}
    </div>
    <textarea data-msg-text="${esc(m.id)}" rows="${rows}" class="mt-3 ${fieldBox}">${esc(texto)}</textarea>
    <p class="mt-2 text-xs text-faint">${esc(efectoTexto(m))}</p>
    <div class="mt-3 flex flex-wrap gap-2">${btn('ficha-copiar', 'Copiar', { msg: m.id })}${btn('ficha-enviado', 'Copiar y marcar como enviado', { msg: m.id })}</div>
  </div>`;
}


function renderFicha() {
  const c = data.contactos.find((r) => r.id === fichaId);
  if (!c) return void ficha.close();
  const scroll = ficha.scrollTop;
  const sug = sugerido(c);
  const hechos = enviadosDe(c.id);
  const estados = resources.contactos.fields.find((f) => f.name === 'estado')!.options!;
  const log = data.historial.filter((h) => h.contacto_id === c.id).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  const aplicables = mensajes.filter((m) => aplica(m, c) && m !== sug);
  const info = [c.email, c.contacto, c.origen ? `Llegó por ${c.origen}` : ''].filter(Boolean).map((x) => esc(x)).join(' · ');

  fichaBody.innerHTML = `
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="display text-3xl text-bone md:text-4xl">${esc(c.nombre)}</h2>
        <p class="mt-1 text-mute">${esc([c.organizacion, c.tipo, c.canal].filter(Boolean).join(' · '))}</p>
        ${info ? `<p class="mt-1 text-sm text-faint">${info}</p>` : ''}
        ${c.notas ? `<p class="mt-3 whitespace-pre-line border-l-2 border-line-strong pl-3 text-sm text-mute">${esc(c.notas)}</p>` : ''}
      </div>
      <button type="button" data-action="ficha-cerrar" class="tag text-signal hover:text-bone">Cerrar</button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="grid gap-2 text-sm text-mute">Estado
        <select data-action="ficha-estado" class="${fieldBox}">${estados.map((o) => `<option value="${esc(o)}"${o === c.estado ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>
      </label>
      <label class="grid gap-2 text-sm text-mute">Próximo seguimiento
        <input type="date" data-action="ficha-fecha" value="${esc(c.proximo_seguimiento ?? '')}" class="${fieldBox}" />
      </label>
    </div>
    <div class="flex flex-wrap gap-2">
      ${btn('ficha-editar', 'Editar datos', {})}
      ${['Cliente', 'Descartado'].includes(c.estado) ? '' : btn('ficha-cliente', 'Pasar a cliente', {})}
      ${data.mentorados.some((m) => m.contacto_id === c.id) ? btn('ment-open', 'Ver mentorado', { id: data.mentorados.find((m) => m.contacto_id === c.id)!.id }) : ''}
    </div>

    <section>
      <h3 class="tag text-signal">Mensaje sugerido para este paso</h3>
      <div class="mt-3">${sug ? mensajeBlock(sug, c, hechos) : '<p class="border border-line p-4 text-sm text-faint">No hay un mensaje para este estado. Podés usar los de abajo.</p>'}</div>
      ${aplicables.length ? `<details class="mt-4"><summary class="tag cursor-pointer text-faint hover:text-bone">Todos los mensajes (${aplicables.length})</summary>
        <div class="mt-3 grid gap-3">${pasos.map((p) => aplicables.filter((m) => m.paso === p)).filter((l) => l.length).map((l) => `<div><p class="tag mb-2 text-faint">${esc(l[0].paso)}</p><div class="grid gap-3">${l.map((m) => mensajeBlock(m, c, hechos)).join('')}</div></div>`).join('')}</div>
      </details>` : ''}
    </section>

    <section>
      <h3 class="tag text-signal">Notas e historial</h3>
      <label class="mt-3 grid gap-2 text-sm text-mute">Nueva nota
        <textarea data-ficha-nota rows="3" maxlength="1500" placeholder="Qué se habló, qué quedó pendiente…" class="${fieldBox}"></textarea>
      </label>
      <div class="mt-3">${btn('ficha-nota', 'Agregar nota', {})}</div>
      ${log.length
        ? `<ul class="mt-5 divide-y divide-line border-y border-line">${log
            .map((h) => `<li class="flex items-start gap-3 py-3 text-sm"><span class="w-28 shrink-0 text-faint">${esc(fechaHora(h.created_at))}</span><span class="grow whitespace-pre-line ${h.tipo === 'nota' ? 'text-bone' : 'text-signal'}">${h.tipo === 'nota' ? esc(h.texto) : `Pasó a ${esc(h.estado)}`}</span>${h.tipo === 'nota' ? btn('del-nota', 'Eliminar', { id: h.id }) : ''}</li>`)
            .join('')}</ul>`
        : '<p class="mt-4 text-sm text-faint">Todavía no hay movimientos.</p>'}
    </section>`;
  ficha.scrollTop = scroll;
}

function openFicha(id: string) {
  fichaId = id;
  renderFicha();
  if (!ficha.open) ficha.showModal();
}

ficha.addEventListener('close', () => (fichaId = ''));

async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    // Sin permiso del portapapeles: copia con un campo temporal dentro del modal
    const t = document.createElement('textarea');
    t.value = texto;
    (document.querySelector('dialog[open]') ?? document.body).append(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  }
}

const textoDe = (id: string) => ficha.querySelector<HTMLTextAreaElement>(`[data-msg-text="${id}"]`)?.value ?? '';

async function enviarMensaje(id: string) {
  const c = data.contactos.find((r) => r.id === fichaId);
  const m = mensajes.find((x) => x.id === id);
  if (!c || !m) return;
  await copiar(textoDe(id));
  try {
    await api('notas', 'POST', { contacto_id: c.id, texto: PREFIJO_ENVIADO + m.titulo });
    let patch: Row = {};
    if (m.avanza && c.estado !== m.avanza) patch = { estado: m.avanza, ...seguimientoPara(m.avanza) };
    else if (m.dias !== undefined) patch = { proximo_seguimiento: m.dias === null ? null : addDays(today(), m.dias) };
    if (Object.keys(patch).length) await api(`contactos?id=${encodeURIComponent(c.id)}`, 'PATCH', patch);
    await Promise.all([reload('contactos'), reload('historial')]);
    render();
    renderFicha();
    say('Mensaje copiado y registrado.' + seguimientoTexto(patch));
  } catch (err) {
    say((err as Error).message, true);
  }
}

async function cambiarContacto(patch: Row, aviso: string) {
  try {
    await api(`contactos?id=${encodeURIComponent(fichaId)}`, 'PATCH', patch);
    await Promise.all([reload('contactos'), reload('historial')]);
    render();
    renderFicha();
    say(aviso + seguimientoTexto(patch));
  } catch (err) {
    say((err as Error).message, true);
    renderFicha();
  }
}

async function agregarNota() {
  const area = ficha.querySelector<HTMLTextAreaElement>('[data-ficha-nota]');
  const texto = area?.value.trim() ?? '';
  if (!texto) return void say('Escribí la nota.', true);
  try {
    await api('notas', 'POST', { contacto_id: fichaId, texto });
    await reload('historial');
    renderFicha();
    say('Nota guardada.');
  } catch (err) {
    say((err as Error).message, true);
  }
}

async function borrarNota(id: string) {
  const nota = data.historial.find((h) => h.id === id);
  if (!(await confirmar(String(nota?.texto ?? 'esta nota').slice(0, 80)))) return;
  try {
    await api(`notas?id=${encodeURIComponent(id)}`, 'DELETE');
    await reload('historial');
    renderFicha();
    say('Nota eliminada.');
  } catch (err) {
    say((err as Error).message, true);
  }
}

/* ------------------------------ acciones ------------------------------ */
async function logMeta(tipo: string, cantidad: number) {
  try {
    await api('registro', 'POST', { fecha: today(), tipo, cantidad });
    await reload('registro');
    render();
    say('Registrado.');
  } catch (err) {
    say((err as Error).message, true);
  }
}

async function patchField(key: ResourceKey, id: string, patch: Row) {
  try {
    await api(`${key}?id=${encodeURIComponent(id)}`, 'PATCH', patch);
    await reload(key);
    render();
  } catch (err) {
    say((err as Error).message, true);
    render();
  }
}

root.addEventListener('click', async (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action],[data-logout]');
  if (!el) return;

  if (el.hasAttribute('data-logout')) {
    await fetch('/api/admin/logout', { method: 'POST', headers: { 'X-Admin': '1' } });
    location.href = '/';
    return;
  }

  const action = el.dataset.action;
  // Un clic sobre un control dentro de una fila no debe abrir la edición
  if (action === 'edit' && (e.target as HTMLElement).closest('select,input,button,a')) return;

  switch (action) {
    case 'tab':
      tab = el.dataset.tab as Tab;
      render();
      break;
    case 'contact-sub':
      contactSub = el.dataset.sub as typeof contactSub;
      render();
      break;
    case 'new':
      openForm(resources[el.dataset.res as ResourceKey]);
      break;
    case 'edit':
      openRecord(resources[el.dataset.res as ResourceKey], el.dataset.id);
      break;
    case 'open':
      openRecord(resources[el.dataset.res as ResourceKey], el.dataset.id);
      break;
    case 'ficha-cerrar':
      ficha.close();
      break;
    case 'ficha-copiar':
      await copiar(textoDe(el.dataset.msg!));
      say('Mensaje copiado.');
      break;
    case 'ficha-enviado':
      await enviarMensaje(el.dataset.msg!);
      break;
    case 'ficha-nota':
      await agregarNota();
      break;
    case 'del-nota':
      await borrarNota(el.dataset.id!);
      break;
    case 'ficha-editar': {
      const id = fichaId;
      ficha.close();
      openForm(resources.contactos, id);
      break;
    }
    case 'ficha-cliente': {
      const c = data.contactos.find((r) => r.id === fichaId);
      ficha.close();
      if (c) openVenta({ contactoId: c.id, cliente: c.nombre, origen: c.origen });
      break;
    }
    case 'semana-prev':
      semanaWs = addDays(semanaWs, -7);
      render();
      break;
    case 'semana-next':
      semanaWs = addDays(semanaWs, 7);
      render();
      break;
    case 'semana-hoy':
      semanaWs = weekStart(today());
      render();
      break;
    case 'export': {
      const file = exportar(el.dataset.que!, data);
      if (!file) break;
      const url = URL.createObjectURL(new Blob([file.contenido], { type: file.mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = file.nombre;
      a.click();
      URL.revokeObjectURL(url);
      say('Descarga lista: ' + file.nombre);
      break;
    }
    case 'generar-cobro':
      await generarCobro(el.dataset.id!);
      break;
    case 'baja-venta':
      await patchField('ventas', el.dataset.id!, { activa: false });
      say('Plan dado de baja. No se generan más cobros.');
      break;
    case 'reactivar-venta':
      await patchField('ventas', el.dataset.id!, { activa: true });
      say('Plan reactivado.');
      break;
    case 'cobro-msg': {
      const c = data.cobros.find((x) => x.id === el.dataset.id);
      if (c) {
        await copiar(mensajeCobro(c));
        say('Mensaje de cobro copiado.');
      }
      break;
    }
    case 'quick': {
      const q = el.dataset.q;
      if (q === 'mensaje') await logMeta('mensajes', 1);
      else if (q === 'respuesta') await logMeta('conversaciones', 1);
      else if (q === 'cobro') openCobroRapido();
      else if (q === 'venta') openVenta();
      else if (q === 'prospecto') openForm(resources.contactos);
      break;
    }
    case 'ment-open':
      openMentorado(el.dataset.id!);
      break;
    case 'ment-cerrar':
      mentDlg.close();
      break;
    case 'ment-semana':
      mentSemana = Number(el.dataset.n);
      renderMentorado();
      break;
    case 'ment-nuevo':
      openMentoradoNuevo();
      break;
    case 'nuevo-mentorado':
      crearMentoradoDesdeVenta(el.dataset.id!);
      break;
    case 'ment-prospecto': {
      const m = data.mentorados.find((x) => x.id === el.dataset.id);
      if (!m) break;
      try {
        const contacto = await asegurarProspecto({ nombre: m.nombre, email: m.email });
        await api(`mentorados?id=${encodeURIComponent(m.id)}`, 'PATCH', { contacto_id: contacto });
        await Promise.all([reload('mentorados'), reload('contactos'), reload('historial')]);
        render();
        say('Prospecto conectado (como cliente).');
      } catch (err) {
        say((err as Error).message, true);
      }
      break;
    }
    case 'ment-venta-nueva': {
      const m = data.mentorados.find((x) => x.id === el.dataset.id);
      if (m) openVenta({ contactoId: m.contacto_id ?? '', cliente: m.nombre, mentoradoId: m.id, productoId: m.cohorte === 'Fundadora' ? 'fundadora' : 'sistema' });
      break;
    }
    case 'enlace-agregar':
      await agregarEnlace();
      break;
    case 'enlace-copiar':
      await copiar(el.dataset.url ?? '');
      say('Enlace copiado.');
      break;
    case 'del-enlace':
      await borrarEnlace(el.dataset.id!);
      break;
    case 'ment-editar':
      openForm(resources.mentorados, mentId);
      break;
    case 'del-mentorado':
      await eliminarMentorado(el.dataset.id!);
      break;
    case 'ment-hecha': {
      const s = data.semanas.find((x) => x.id === el.dataset.id);
      if (!s) break;
      const quien = data.mentorados.find((x) => x.id === s.mentorado_id)?.nombre ?? 'el mentorado';
      const si = await confirmar(`la llamada de la semana ${s.semana} con ${quien}`, 'Queda registrada y pasa a la semana siguiente.', { titulo: '¿Marcar como hecha?', verbo: 'marcar como hecha', boton: 'Sí, marcar como hecha', peligro: false });
      if (!si) break;
      await mentPatch(s.id, { estado: 'hecha', fecha_llamada: s.fecha_llamada ?? today() });
      if (mentId === s.mentorado_id) {
        mentSemana = Math.min(12, s.semana + 1);
        renderMentorado();
      }
      say('Llamada registrada.');
      break;
    }
    case 'ment-agenda': {
      const s = data.semanas.find((x) => x.id === el.dataset.id);
      const m = s && data.mentorados.find((x) => x.id === s.mentorado_id);
      if (!s || !m) break;
      const base = String(import.meta.env.PUBLIC_CAL_MENTORIA_LINK ?? '').trim();
      if (!base) {
        say('Falta la variable PUBLIC_CAL_MENTORIA_LINK (en .env y en Vercel). Después reiniciá o redeployá.', true);
        break;
      }
      const params = new URLSearchParams({ name: m.nombre, ...(m.email ? { email: m.email } : {}), notes: `Semana ${s.semana}` });
      const link = `${base.startsWith('http') ? base : `https://cal.com/${base}`}?${params}`;
      await copiar(`Hola ${String(m.nombre).trim().split(/\s+/)[0]}, para tu llamada de la semana ${s.semana} elegí el horario que mejor te quede: ${link}`);
      say('Mensaje con el link para agendar copiado.');
      break;
    }
    case 'ment-recibido':
      await mentPatch(el.dataset.id!, { entregable_en: today() });
      say('Entregable registrado.');
      break;
    case 'ment-esqueleto': {
      const s = data.semanas.find((x) => x.id === el.dataset.id);
      const m = s && data.mentorados.find((x) => x.id === s.mentorado_id);
      if (!s || !m) break;
      await mentPatch(s.id, { plan: (s.plan ? s.plan + '\n\n— Esqueleto —\n' : '') + planInicial(s.semana, m.perfil) });
      say('Esqueleto agregado al plan.');
      break;
    }
    case 'ment-resumen': {
      const m = data.mentorados.find((x) => x.id === el.dataset.id);
      if (m) {
        await copiar(resumenTexto(m, semanasDe(data, m.id)));
        say('Resumen copiado.');
      }
      break;
    }
    case 'ment-control-hecha':
      await patchField('mentorados', el.dataset.id!, { control_fecha: null });
      say('Llamada de control registrada.');
      break;
    case 'to-prospect':
      await toProspect(el.dataset.email!);
      break;
    case 'del-cobro':
      await removeDirect('cobros', el.dataset.id!);
      break;
    case 'del-venta':
      await removeDirect('ventas', el.dataset.id!);
      break;
    case 'new-venta':
      openVenta();
      break;
    case 'new-cobro':
      openForm(resources.cobros, undefined, el.dataset.id);
      break;
    case 'cobrado':
      await patchField('cobros', el.dataset.id!, { cobrado_en: today() });
      if (dialog.open && form.dataset.res === 'cobro-rapido') dialog.close();
      say('Cobro registrado.');
      break;
    case 'hecha-tarea':
      await patchField('tareas', el.dataset.id!, { estado: 'hecha' });
      break;
    case 'publicada':
      await patchField('contenido', el.dataset.id!, { estado: 'publicada' });
      break;
    case 'snooze-contacto':
      await patchField('contactos', el.dataset.id!, { proximo_seguimiento: addDays(today(), 3) });
      break;
    case 'goto-entrantes':
      tab = 'contactos';
      contactSub = 'entrantes';
      render();
      break;
    case 'edit-meta':
      openForm(resources.metas, el.dataset.id);
      break;
    case 'log':
      await logMeta(el.dataset.tipo!, Number(el.dataset.n));
      break;
    case 'del-registro':
      try {
        await api(`registro?id=${encodeURIComponent(el.dataset.id!)}`, 'DELETE');
        await reload('registro');
        render();
      } catch (err) {
        say((err as Error).message, true);
      }
      break;
    case 'entrante-notas': {
      const { origen, id } = el.dataset;
      const area = view.querySelector<HTMLTextAreaElement>(`[data-notas="${origen}:${id}"]`);
      try {
        await api('entrantes', 'PATCH', { origen, id, notas: area?.value ?? '' });
        const row = data.entrantes.find((r) => r.id === id && r.origen === origen);
        if (row) row.notas = area?.value ?? '';
        say('Notas guardadas.');
      } catch (err) {
        say((err as Error).message, true);
      }
      break;
    }
  }
});

root.addEventListener('change', async (e) => {
  const el = e.target as HTMLElement;
  const action = el.dataset.action;
  const value = (el as HTMLInputElement).value;

  if (action === 'ment-filtro') {
    mentFiltro = value;
    return void render();
  }
  if (action === 'ment-campo') return void (await mentPatch(el.dataset.id!, { [el.dataset.campo!]: value === '' ? null : value }));
  if (action === 'ment-estado') return void (await patchField('mentorados', el.dataset.id!, { estado: value }));
  if (action === 'ment-trabado') return void (await patchField('mentorados', el.dataset.id!, { trabado: value.trim() || null }));
  if (action === 'ment-venta') return void (await patchField('mentorados', el.dataset.id!, { venta_id: value || null }));
  if (action === 'ment-control') return void (await patchField('mentorados', el.dataset.id!, { control_fecha: value || null }));
  if (action === 'programa-perfil' || action === 'programa-tipo') {
    progFiltro = { ...progFiltro, [action === 'programa-perfil' ? 'perfil' : 'tipo']: value } as ProgramaFiltro;
    return void render();
  }
  if (action === 'proy') {
    proy[el.dataset.campo as keyof Proy] = Math.max(0, Number(value) || 0);
    return void render();
  }
  if (action === 'resultado') {
    return void (await patchField('contenido', el.dataset.id!, { [el.dataset.campo!]: value === '' ? null : Number(value) }));
  }
  if (action === 'ficha-estado') return void (await cambiarContacto({ estado: value, ...seguimientoPara(value) }, 'Estado actualizado.'));
  if (action === 'ficha-fecha') return void (await cambiarContacto({ proximo_seguimiento: value || null }, 'Seguimiento actualizado.'));

  if (action === 'filter') {
    filters[el.dataset.name as keyof typeof filters] = value;
    render();
  } else if (action === 'estado') {
    const key = el.dataset.res as ResourceKey;
    const extra = key === 'contactos' ? seguimientoPara(value) : {};
    await patchField(key, el.dataset.id!, { estado: value, ...extra });
    if (key === 'contactos') {
      await reload('historial');
      say('Estado actualizado.' + seguimientoTexto(extra));
    }
  } else if (action === 'toggle-tarea') {
    await patchField('tareas', el.dataset.id!, { estado: (el as HTMLInputElement).checked ? 'hecha' : 'pendiente' });
  } else if (action === 'entrante-estado') {
    try {
      await api('entrantes', 'PATCH', { origen: el.dataset.origen, id: el.dataset.id, estado: value });
      const row = data.entrantes.find((r) => r.id === el.dataset.id && r.origen === el.dataset.origen);
      if (row) row.estado = value;
      say('Estado actualizado.');
    } catch (err) {
      say((err as Error).message, true);
    }
  }
});

root.addEventListener('input', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.dataset.action === 'enlaces-q') {
    enlacesQuery = el.value;
    const caret = el.selectionStart;
    render();
    const next = view.querySelector<HTMLInputElement>('[data-action="enlaces-q"]');
    next?.focus();
    if (caret != null) next?.setSelectionRange(caret, caret);
    return;
  }
  if (el.dataset.action !== 'personas-q') return;
  personasQuery = el.value;
  const caret = el.selectionStart;
  render();
  const next = view.querySelector<HTMLInputElement>('[data-action="personas-q"]');
  next?.focus();
  if (caret != null) next?.setSelectionRange(caret, caret);
});

root.querySelector('[data-tabs]')!.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const g = target.closest<HTMLElement>('[data-group]');
  if (g) {
    const grupo = grupos.find((x) => x.id === g.dataset.group)!;
    tab = ultimaPestana[grupo.id] ?? grupo.tabs[0][0];
    return void render();
  }
  const b = target.closest<HTMLElement>('[data-tab]');
  if (!b) return;
  tab = b.dataset.tab as Tab;
  render();
});

/* ------------------------------ arranque ------------------------------ */
renderTabs(0, 0);
(async () => {
  try {
    await Promise.all((['tareas', 'contenido', 'contactos', 'registro', 'metas', 'ventas', 'cobros', 'historial', 'mentorados', 'semanas', 'enlaces', 'reservas', 'entrantes'] as const).map((k) => reload(k)));
    render();
  } catch (err) {
    view.innerHTML = `<p class="border border-line p-6 text-mute">No se pudo cargar el panel: ${esc((err as Error).message)}. Revisá que ejecutaste supabase/admin.sql en Supabase.</p>`;
  }
})();
