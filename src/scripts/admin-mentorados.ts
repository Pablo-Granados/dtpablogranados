/**
 * Vistas de Mentorados: lista con progreso, ficha de cada persona y resumen de sus 12 semanas.
 * El esqueleto de cada semana sale de src/data/programa.ts; acá se adapta a cada mentorado.
 */
import { perfiles, programa, type Semana } from '@/data/programa';
import { estadosMentorado, estadosSemana, tiposEnlace } from '@/data/admin';
import { addDays, btn, esc, num, shortDate, sumUsd, today, type Data, type Row } from './admin-utils';

export const perfilId = (label: unknown) => perfiles.find((p) => p.label === label)?.id;
export const semanasDe = (d: Data, id: string) => d.semanas.filter((s) => s.mentorado_id === id).sort((a, b) => a.semana - b.semana);
/** Enlaces de un mentorado: los que cargaste y las devoluciones en video que figuran en sus semanas. */
export function enlacesDe(d: Data, id: string): Row[] {
  const propios: Row[] = (d.enlaces ?? []).filter((l) => l.mentorado_id === id).map((l): Row => ({ ...l, propio: true }));
  const devoluciones: Row[] = semanasDe(d, id)
    .filter((s) => s.devolucion_url)
    .map((s): Row => ({ id: 'dev-' + s.id, tipo: 'Devolución', semana: s.semana, titulo: `Devolución de la semana ${s.semana}`, url: s.devolucion_url, propio: false, created_at: '' }));
  return [...propios, ...devoluciones].sort((x, y) => (x.semana ?? 99) - (y.semana ?? 99) || String(x.created_at ?? '').localeCompare(String(y.created_at ?? '')));
}

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const abrir = (url: string) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="tag shrink-0 border border-signal/60 px-2.5 py-2 text-signal hover:bg-signal/10 md:py-1.5">Abrir</a>`;

function filaEnlace(l: Row) {
  return `<li class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 text-sm">
    <span class="min-w-0"><span class="tag mr-2 border border-line-strong px-2 py-0.5 text-faint">${esc(l.tipo)}</span>${l.semana ? `<span class="text-faint">S${l.semana} · </span>` : ''}<span class="text-bone">${esc(l.titulo)}</span> <span class="text-xs text-faint">${esc(host(l.url))}</span></span>
    <span class="flex flex-wrap items-center gap-2">${abrir(l.url)}${btn('enlace-copiar', 'Copiar', { url: l.url })}${l.propio ? btn('del-enlace', 'Eliminar', { id: l.id }) : ''}</span>
  </li>`;
}

/** Todos los enlaces de todos los mentorados, agrupados por persona y con buscador. */
export function enlacesView(d: Data, q: string) {
  const query = q.trim().toLowerCase();
  const grupos = d.mentorados
    .map((m) => ({ m, links: enlacesDe(d, m.id).filter((l) => !query || `${m.nombre} ${l.titulo} ${l.url} ${l.tipo}`.toLowerCase().includes(query)) }))
    .filter((g) => g.links.length);
  const buscador = `<div class="mb-5"><input type="search" data-action="enlaces-q" value="${esc(q)}" placeholder="Buscar por persona, título o enlace" aria-label="Buscar enlaces" class="w-full max-w-md border border-line-strong bg-ink px-3 py-3 text-base text-bone focus:border-signal focus:outline-none md:py-2 md:text-sm" /></div>`;
  if (!grupos.length) return buscador + '<p class="border border-line p-6 text-mute">Todavía no hay enlaces. Cargalos desde la ficha de cada mentorado, en "Entregables y enlaces".</p>';
  return (
    buscador +
    `<div class="grid gap-4 lg:grid-cols-2">${grupos
      .map(
        ({ m, links }) => `<section class="border border-line bg-panel p-5">
          <div class="flex items-center justify-between gap-3"><h3 class="font-medium text-bone">${esc(m.nombre)} <span class="text-sm text-faint">· ${links.length}</span></h3>${btn('ment-open', 'Ficha', { id: m.id })}</div>
          <ul class="mt-2 divide-y divide-line">${links.map(filaEnlace).join('')}</ul>
        </section>`,
      )
      .join('')}</div>`
  );
}

export const esqueleto = (n: number): Semana => programa.find((s) => s.n === n)!;

/** Semana en la que está: la primera pendiente (o la última si ya terminó todas). */
export const semanaActual = (ss: Row[]) => ss.find((s) => s.estado === 'pendiente') ?? ss.at(-1);

export function progreso(ss: Row[]) {
  const hechas = ss.filter((s) => s.estado === 'hecha').length;
  const entregables = ss.filter((s) => s.entregable_en).length;
  return { hechas, entregables, actual: semanaActual(ss), terminadas: ss.length > 0 && ss.every((s) => s.estado !== 'pendiente') };
}

/** Texto inicial del plan de una semana: el esqueleto con la variante del perfil de la persona. */
export function planInicial(n: number, perfil: unknown) {
  const s = esqueleto(n);
  const id = perfilId(perfil);
  return [
    `Objetivo: ${s.objetivo}`,
    id ? `Para este perfil: ${s.variantes[id]}` : '',
    `En la llamada:\n${s.llamada.map((x) => `- ${x}`).join('\n')}`,
    `Tarea: ${s.tarea}`,
    `Entregable: ${s.entregable}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** Las 12 filas de semanas de un mentorado nuevo, con fecha de llamada cada 7 días. */
export const semanasIniciales = (m: Row) =>
  programa.map((s) => ({
    mentorado_id: m.id,
    semana: s.n,
    estado: 'pendiente',
    fecha_llamada: addDays(String(m.inicio), 7 * (s.n - 1)),
    plan: planInicial(s.n, m.perfil),
    tarea: s.tarea,
  }));

/** Resumen listo para mandarle a la persona. */
export function resumenTexto(m: Row, ss: Row[]) {
  const nombre = String(m.nombre).trim().split(/\s+/)[0];
  const lineas = ss
    .filter((s) => s.estado !== 'pendiente' || s === semanaActual(ss))
    .map((s) => {
      const e = esqueleto(s.semana);
      const estado = s.estado === 'hecha' ? `hecha${s.fecha_llamada ? ` (${shortDate(s.fecha_llamada)})` : ''}` : s.estado === 'saltada' ? 'saltada' : `próxima${s.fecha_llamada ? ` (${shortDate(s.fecha_llamada)}${s.hora_llamada ? ` ${s.hora_llamada}` : ''})` : ''}`;
      const extra = [s.entregable_en ? 'entregable recibido' : s.estado === 'hecha' ? 'entregable pendiente' : '', s.devolucion_url ? `devolución: ${s.devolucion_url}` : ''].filter(Boolean).join(' · ');
      return `Semana ${s.semana} · ${e.titulo} — ${estado}${extra ? ` · ${extra}` : ''}`;
    });
  const sig = semanaActual(ss);
  const p = progreso(ss);
  return [
    `Hola ${nombre}, te dejo el resumen de tu avance en Sistema Propio.`,
    '',
    `Llevás ${p.hechas} de ${ss.length} semanas y ${p.entregables} entregables.`,
    '',
    ...lineas,
    '',
    sig && sig.estado === 'pendiente' && sig.tarea ? `Para la próxima: ${sig.tarea}` : '',
  ]
    .filter((l, i, a) => l !== '' || a[i - 1] !== '')
    .join('\n')
    .trim();
}

const claseSemana = (estado: string, actual: boolean, seleccionada: boolean) =>
  [
    estado === 'hecha' ? 'border-signal bg-signal text-ink' : estado === 'saltada' ? 'border-[#ff7a7a]/50 text-[#ff7a7a]' : actual ? 'border-signal text-signal' : 'border-line-strong text-faint',
    seleccionada ? 'outline outline-2 outline-offset-2 outline-bone' : '',
  ].join(' ');

/** Tira con las 12 semanas. En la ficha cada una se puede elegir. */
function tira(ss: Row[], seleccionada?: number) {
  const act = semanaActual(ss);
  return `<div class="flex flex-wrap gap-1.5">${ss
    .map((s) => {
      const cls = `grid h-9 min-w-9 place-items-center border text-xs font-semibold ${claseSemana(s.estado, act?.id === s.id && s.estado === 'pendiente', seleccionada === s.semana)}`;
      return seleccionada === undefined
        ? `<span class="${cls}" title="Semana ${s.semana}">${s.semana}</span>`
        : `<button type="button" data-action="ment-semana" data-n="${s.semana}" class="${cls}" title="${esc(esqueleto(s.semana).titulo)}">${s.semana}</button>`;
    })
    .join('')}</div>`;
}

/* ------------------------------ lista ------------------------------ */
export function mentoradosView(d: Data, filtro: string) {
  let lista = d.mentorados;
  if (filtro === 'activos') lista = lista.filter((m) => m.estado === 'activo');
  else if (filtro !== 'todos') lista = lista.filter((m) => m.estado === filtro);

  const filtroSel = `<select data-action="ment-filtro" aria-label="Filtro" class="border border-line-strong bg-ink px-3 py-2.5 text-base text-bone focus:border-signal focus:outline-none md:py-2 md:text-sm">${[['activos', 'Activos'], ['todos', 'Todos'], ...estadosMentorado.map((e) => [e, e])]
    .map(([v, l]) => `<option value="${v}"${v === filtro ? ' selected' : ''}>${l}</option>`)
    .join('')}</select>`;

  const cards = lista
    .map((m) => {
      const ss = semanasDe(d, m.id);
      const p = progreso(ss);
      const prox = ss.find((s) => s.estado === 'pendiente' && s.fecha_llamada);
      const vencida = prox && String(prox.fecha_llamada) < today();
      return `<article data-action="ment-open" data-id="${esc(m.id)}" class="cursor-pointer border border-line bg-panel p-5 transition-colors hover:border-signal/60">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p class="text-lg font-medium text-bone">${esc(m.nombre)}</p>
            <p class="mt-1 text-sm text-mute">${esc(m.perfil || 'Sin perfil')}${m.cohorte === 'Fundadora' ? ' · <span class="text-signal">Cohorte fundadora</span>' : ''}</p>
          </div>
          <span class="tag border px-2.5 py-1 ${m.estado === 'activo' ? 'border-signal/60 text-signal' : 'border-line-strong text-faint'}">${esc(m.estado)}</span>
        </div>
        <div class="mt-4">${tira(ss)}</div>
        <p class="mt-3 text-sm text-faint">${p.hechas} de ${ss.length || 12} semanas · ${p.entregables} entregables${enlacesDe(d, m.id).length ? ` · ${enlacesDe(d, m.id).length} enlaces` : ''}${prox ? ` · próxima llamada <span class="${vencida ? 'text-[#ff7a7a]' : 'text-bone'}">S${prox.semana} ${shortDate(prox.fecha_llamada)}${prox.hora_llamada ? ` ${esc(prox.hora_llamada)}` : ''}</span>${prox.cal_uid ? ' <span class="text-signal">· reservada</span>' : ''}` : ''}</p>
        ${m.trabado ? `<p class="mt-3 border-l-2 border-[#ff7a7a] pl-3 text-sm text-bone"><span class="text-[#ff7a7a]">Trabado:</span> ${esc(m.trabado)}</p>` : ''}
      </article>`;
    })
    .join('');

  const activos = d.mentorados.filter((m) => m.estado === 'activo').length;
  return `<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-3">${filtroSel}<span class="text-sm text-faint">${activos} activo${activos === 1 ? '' : 's'} de ${d.mentorados.length}</span></div>
    <button type="button" data-action="ment-nuevo" class="bg-signal px-4 py-3 text-sm font-semibold text-ink hover:bg-bone md:py-2">+ Nuevo mentorado</button>
  </div>
  ${cards ? `<div class="grid gap-4 lg:grid-cols-2">${cards}</div>` : '<p class="border border-line p-6 text-mute">Todavía no hay mentorados. Cuando alguien entre a Sistema Propio, creá su ficha acá y se arman sus 12 semanas a partir del esqueleto.</p>'}`;
}

/* ------------------------------ ficha ------------------------------ */
const caja = 'w-full border border-line-strong bg-ink px-3 py-2.5 text-base text-bone focus:border-signal focus:outline-none';

export function mentoradoFichaView(d: Data, id: string, seleccion: number) {
  const m = d.mentorados.find((x) => x.id === id);
  if (!m) return '';
  const ss = semanasDe(d, id);
  const p = progreso(ss);
  const sel = ss.find((s) => s.semana === seleccion) ?? semanaActual(ss);
  const esq = sel ? esqueleto(sel.semana) : undefined;
  const pid = perfilId(m.perfil);

  // Pagos de la venta vinculada
  const venta = d.ventas.find((v) => v.id === m.venta_id);
  const cs = venta ? d.cobros.filter((c) => c.venta_id === venta.id) : [];
  const pend = cs.filter((c) => !c.cobrado_en).sort((a, b) => String(a.vencimiento).localeCompare(String(b.vencimiento)))[0];
  const pagos = venta
    ? `Cobrado USD ${num(sumUsd(cs.filter((c) => c.cobrado_en)))} de ${num(sumUsd(cs))}${pend ? ` · próximo pago ${shortDate(pend.vencimiento)} (USD ${num(Number(pend.monto_usd))})` : ' · sin pagos pendientes'}`
    : 'Sin venta vinculada';

  const ventasOpts = `<option value="">Sin vincular</option>${d.ventas.map((v) => `<option value="${esc(v.id)}"${v.id === m.venta_id ? ' selected' : ''}>${esc(v.cliente)} · ${esc(v.producto)}</option>`).join('')}`;

  const semanaPanel = sel && esq
    ? `<section class="border border-line p-4 md:p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="tag text-signal">Semana ${sel.semana} · ${esc(esq.tipo)}</p>
            <h3 class="mt-1 text-xl font-semibold text-bone">${esc(esq.titulo)}</h3>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            ${sel.estado === 'hecha' ? '' : btn('ment-hecha', 'Marcar llamada hecha', { id: sel.id })}
          </div>
        </div>

        <div class="mt-4 grid gap-4 sm:grid-cols-3">
          <label class="grid gap-2 text-sm text-mute">Estado de la semana
            <select data-action="ment-campo" data-id="${esc(sel.id)}" data-campo="estado" class="${caja}">${estadosSemana.map((e) => `<option value="${e}"${e === sel.estado ? ' selected' : ''}>${e}</option>`).join('')}</select>
          </label>
          <label class="grid gap-2 text-sm text-mute">Fecha de la llamada
            <input type="date" data-action="ment-campo" data-id="${esc(sel.id)}" data-campo="fecha_llamada" value="${esc(sel.fecha_llamada ?? '')}" class="${caja}" />
          </label>
          <label class="grid gap-2 text-sm text-mute">Hora
            <input type="time" data-action="ment-campo" data-id="${esc(sel.id)}" data-campo="hora_llamada" value="${esc(sel.hora_llamada ?? '')}" class="${caja}" />
          </label>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
          ${sel.cal_uid ? '<span class="tag border border-signal/60 px-2.5 py-1 text-signal">Reservada en Cal.com</span>' : '<span class="text-faint">Todavía sin reserva en Cal.com</span>'}
          ${import.meta.env.PUBLIC_CAL_MENTORIA_LINK && sel.estado === 'pendiente' ? btn('ment-agenda', 'Copiar mensaje para que agende', { id: sel.id }) : ''}
        </div>

        <details class="mt-4 border border-line bg-ink/40 p-4">
          <summary class="tag cursor-pointer text-faint hover:text-bone">Esqueleto de la semana${pid ? ' y variante de este perfil' : ''}</summary>
          <p class="mt-3 text-sm text-bone">${esc(esq.objetivo)}</p>
          ${pid ? `<p class="mt-2 text-sm text-signal">${esc(esq.variantes[pid])}</p>` : ''}
          <p class="tag mt-4 text-faint">En la llamada (45 min)</p>
          <ul class="mt-2 space-y-1 text-sm text-mute">${esq.llamada.map((x) => `<li>– ${esc(x)}</li>`).join('')}</ul>
          <p class="tag mt-4 text-faint">Qué mirar en la devolución</p>
          <ul class="mt-2 space-y-1 text-sm text-mute">${esq.devolucion.map((x) => `<li>– ${esc(x)}</li>`).join('')}</ul>
          <div class="mt-4">${btn('ment-esqueleto', 'Agregar el esqueleto al plan', { id: sel.id })}</div>
        </details>

        <label class="mt-4 grid gap-2 text-sm text-mute">Plan para esta persona
          <textarea data-action="ment-campo" data-id="${esc(sel.id)}" data-campo="plan" rows="7" maxlength="4000" class="${caja}">${esc(sel.plan ?? '')}</textarea>
        </label>
        <label class="mt-4 grid gap-2 text-sm text-mute">Lo que se vio en la llamada
          <textarea data-action="ment-campo" data-id="${esc(sel.id)}" data-campo="notas" rows="6" maxlength="4000" placeholder="Qué se trabajó, qué costó, qué decidió…" class="${caja}">${esc(sel.notas ?? '')}</textarea>
        </label>
        <label class="mt-4 grid gap-2 text-sm text-mute">Tarea acordada para la próxima
          <input data-action="ment-campo" data-id="${esc(sel.id)}" data-campo="tarea" maxlength="600" value="${esc(sel.tarea ?? '')}" class="${caja}" />
        </label>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="grid gap-2 text-sm text-mute">Entregable: ${esc(esq.entregable)}
            <div class="flex flex-wrap items-center gap-2">
              <input type="date" data-action="ment-campo" data-id="${esc(sel.id)}" data-campo="entregable_en" value="${esc(sel.entregable_en ?? '')}" aria-label="Entregable recibido el" class="${caja} sm:w-auto" />
              ${sel.entregable_en ? '' : btn('ment-recibido', 'Recibido hoy', { id: sel.id })}
            </div>
          </div>
          <label class="grid gap-2 text-sm text-mute">Enlace a tu devolución en video
            <input type="url" data-action="ment-campo" data-id="${esc(sel.id)}" data-campo="devolucion_url" value="${esc(sel.devolucion_url ?? '')}" placeholder="https://…" class="${caja}" />
          </label>
        </div>
      </section>`
    : '<p class="border border-line p-5 text-mute">Este mentorado todavía no tiene semanas.</p>';

  const filas = ss
    .map((s) => {
      const e = esqueleto(s.semana);
      return `<tr data-action="ment-semana" data-n="${s.semana}" class="cursor-pointer hover:bg-panel/70 ${s.semana === sel?.semana ? 'bg-panel' : ''}">
        <td class="px-3 py-2.5 font-medium text-bone">S${s.semana}</td>
        <td class="px-3 py-2.5 text-mute">${esc(e.titulo)}</td>
        <td class="px-3 py-2.5 ${s.estado === 'hecha' ? 'text-signal' : s.estado === 'saltada' ? 'text-[#ff7a7a]' : 'text-faint'}">${esc(s.estado)}</td>
        <td class="px-3 py-2.5 text-mute">${shortDate(s.fecha_llamada)}</td>
        <td class="px-3 py-2.5 ${s.entregable_en ? 'text-signal' : 'text-faint'}">${s.entregable_en ? shortDate(s.entregable_en) : '—'}</td>
        <td class="px-3 py-2.5">${s.devolucion_url ? `<a href="${esc(s.devolucion_url)}" target="_blank" rel="noopener" class="text-signal hover:underline" onclick="event.stopPropagation()">Ver</a>` : '<span class="text-faint">—</span>'}</td>
      </tr>`;
    })
    .join('');

  return `<div class="flex items-start justify-between gap-4">
      <div>
        <p class="tag text-signal">Mentorado${m.cohorte === 'Fundadora' ? ' · cohorte fundadora' : ''}</p>
        <h2 class="display mt-1 text-3xl text-bone md:text-4xl">${esc(m.nombre)}</h2>
        <p class="mt-1 text-sm text-mute">${esc([m.perfil, m.email, m.inicio ? `desde ${shortDate(m.inicio)}` : ''].filter(Boolean).join(' · '))}</p>
      </div>
      <button type="button" data-action="ment-cerrar" class="tag text-signal hover:text-bone">Cerrar</button>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <label class="grid gap-2 text-sm text-mute">Estado
        <select data-action="ment-estado" data-id="${esc(m.id)}" class="${caja}">${estadosMentorado.map((e) => `<option value="${e}"${e === m.estado ? ' selected' : ''}>${e}</option>`).join('')}</select>
      </label>
      <div class="grid gap-1 text-sm text-mute sm:col-span-2"><span>Avance</span><span class="text-bone">${p.hechas} de ${ss.length || 12} semanas · ${p.entregables} entregables${m.control_fecha ? ` · control el ${shortDate(m.control_fecha)}` : ''}</span><span class="text-xs text-faint">${esc(pagos)}</span></div>
    </div>

    ${m.objetivo ? `<p class="border-l-2 border-line-strong pl-3 text-sm text-mute"><span class="text-bone">Quiere lograr:</span> ${esc(m.objetivo)}</p>` : ''}
    ${m.equipo ? `<p class="text-sm text-mute"><span class="text-bone">Trabaja con:</span> ${esc(m.equipo)}</p>` : ''}

    <label class="grid gap-2 text-sm text-mute">Dónde está trabado hoy
      <input data-action="ment-trabado" data-id="${esc(m.id)}" maxlength="300" value="${esc(m.trabado ?? '')}" placeholder="Si no hay nada, dejalo vacío" class="${caja}" />
    </label>

    <section>
      <h3 class="tag text-faint">Las 12 semanas</h3>
      <div class="mt-3">${tira(ss, sel?.semana)}</div>
    </section>

    ${semanaPanel}

    <section>
      <h3 class="tag text-signal">Entregables y enlaces</h3>
      ${(() => {
        const ls = enlacesDe(d, m.id);
        return ls.length ? `<ul class="mt-3 divide-y divide-line border-y border-line">${ls.map(filaEnlace).join('')}</ul>` : '<p class="mt-3 text-sm text-faint">Todavía no cargaste enlaces. Pegá abajo el de un entregable (Drive, YouTube, etc.).</p>';
      })()}
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <input data-enlace="titulo" maxlength="160" placeholder="Título (ej. Panel de LongoMatch)" aria-label="Título del enlace" class="${caja}" />
        <input data-enlace="url" type="url" placeholder="https://…" aria-label="Enlace" class="${caja}" />
        <select data-enlace="tipo" aria-label="Tipo" class="${caja}">${tiposEnlace.map((t) => `<option>${t}</option>`).join('')}</select>
        <select data-enlace="semana" aria-label="Semana" class="${caja}"><option value="">Sin semana</option>${ss.map((s) => `<option value="${s.semana}"${s.semana === sel?.semana ? ' selected' : ''}>Semana ${s.semana}</option>`).join('')}</select>
      </div>
      <div class="mt-3">${btn('enlace-agregar', 'Agregar enlace')}</div>
    </section>

    <section>
      <h3 class="tag text-signal">Resumen</h3>
      <div class="mt-3 overflow-x-auto border border-line"><table class="w-full min-w-[34rem] text-left text-sm">
        <thead class="border-b border-line bg-panel"><tr>${['Sem.', 'Tema', 'Estado', 'Llamada', 'Entregable', 'Devolución'].map((h) => `<th class="tag px-3 py-3 font-normal text-faint">${h}</th>`).join('')}</tr></thead>
        <tbody class="divide-y divide-line">${filas}</tbody>
      </table></div>
      <div class="mt-3 flex flex-wrap gap-2">${btn('ment-resumen', 'Copiar resumen para enviarle', { id: m.id })}</div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2">
      <label class="grid gap-2 text-sm text-mute">Venta vinculada
        <select data-action="ment-venta" data-id="${esc(m.id)}" class="${caja}">${ventasOpts}</select>
      </label>
      <label class="grid gap-2 text-sm text-mute">Llamada de control (30 días después)
        <input type="date" data-action="ment-control" data-id="${esc(m.id)}" value="${esc(m.control_fecha ?? '')}" class="${caja}" />
      </label>
    </section>
    ${m.notas ? `<p class="whitespace-pre-line border-l-2 border-line-strong pl-3 text-sm text-mute">${esc(m.notas)}</p>` : ''}

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
      <div class="flex flex-wrap gap-2">${btn('ment-editar', 'Editar datos', { id: m.id })}${m.contacto_id && d.contactos.some((c) => c.id === m.contacto_id) ? btn('open', 'Ver prospecto', { res: 'contactos', id: m.contacto_id }) : btn('ment-prospecto', 'Crear prospecto', { id: m.id })}${m.venta_id && d.ventas.some((v) => v.id === m.venta_id) ? '' : btn('ment-venta-nueva', 'Crear venta', { id: m.id })}</div>
      ${btn('del-mentorado', 'Eliminar mentorado', { id: m.id })}
    </div>`;
}
