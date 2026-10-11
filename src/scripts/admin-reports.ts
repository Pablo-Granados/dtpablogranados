/**
 * Vistas de análisis del panel: proyección a la meta, resumen semanal, resultados del contenido,
 * exportación y renovaciones. Son funciones puras: reciben los datos y devuelven HTML o archivos.
 */
import { entrantes, metaTypes, productos, resources, type EntranteOrigen } from '@/data/admin';
import { addDays, addMonths, btn, esc, mesCorto, monthStart, num, pct, shortDate, sumUsd, today, weekStart, type Data, type Row } from './admin-utils';

const stat = (label: string, value: string, sub = '', tone = 'text-bone') =>
  `<div class="border border-line bg-panel p-4"><p class="tag text-faint">${label}</p><p class="display mt-2 text-3xl ${tone}">${value}</p>${sub ? `<p class="mt-1 text-xs text-faint">${sub}</p>` : ''}</div>`;

const bar = (done: number, goal: number) => {
  const p = goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0;
  return `<div class="h-1.5 bg-line" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><div class="h-1.5 bg-signal" style="width:${p}%"></div></div>`;
};

const cobrosDe = (d: Data, ventaId: string) => d.cobros.filter((c) => c.venta_id === ventaId);
const ultimoCobro = (cs: Row[]) => [...cs].sort((a, b) => String(a.vencimiento).localeCompare(String(b.vencimiento))).at(-1);

/** Clientes con plan mensual que siguen activos. */
export const recurrentesActivos = (d: Data) => d.ventas.filter((v) => v.recurrente === true && v.activa !== false);

/** Ingreso mensual recurrente: lo último que paga cada plan activo. */
export function ingresoRecurrente(d: Data) {
  return recurrentesActivos(d).reduce((a, v) => a + Number(ultimoCobro(cobrosDe(d, v.id))?.monto_usd ?? 0), 0);
}

/** Planes activos cuyo último cobro ya está pagado y se acerca el siguiente (a los 25 días). */
export function renovacionesPendientes(d: Data) {
  const t = today();
  return recurrentesActivos(d)
    .map((v) => ({ v, cs: cobrosDe(d, v.id) }))
    .filter(({ cs }) => cs.length && cs.every((c) => c.cobrado_en))
    .map(({ v, cs }) => ({ v, ultimo: ultimoCobro(cs)! }))
    .filter(({ ultimo }) => addDays(String(ultimo.vencimiento), 25) <= t);
}

/* ------------------------------ proyección ------------------------------ */
export type Proy = { nuevos: number; ticket: number };

/** Cobrado por mes (pasado) y proyectado (presente y futuro), para el gráfico de progresión. */
function meses(d: Data) {
  const t = today();
  const inicio = monthStart(t);
  const rec = recurrentesActivos(d);
  const mrr = ingresoRecurrente(d);
  const out: { mes: string; valor: number; futuro: boolean }[] = [];
  for (let i = -5; i <= 3; i++) {
    const m = addMonths(inicio, i);
    const sig = addMonths(m, 1);
    const enMes = (s: unknown) => !!s && String(s) >= m && String(s) < sig;
    const cobrado = sumUsd(d.cobros.filter((c) => enMes(c.cobrado_en)));
    if (i < 0) {
      out.push({ mes: m, valor: cobrado, futuro: false });
      continue;
    }
    const pendientes = d.cobros.filter((c) => !c.cobrado_en && (i === 0 ? String(c.vencimiento) < sig : enMes(c.vencimiento)));
    // Los planes activos sin cobro cargado para ese mes se asumen vigentes
    const sinCargar = i === 0 ? 0 : rec.filter((v) => !pendientes.some((c) => c.venta_id === v.id)).reduce((a, v) => a + Number(ultimoCobro(cobrosDe(d, v.id))?.monto_usd ?? 0), 0);
    out.push({ mes: m, valor: cobrado + sumUsd(pendientes) + sinCargar, futuro: i > 0 });
  }
  void mrr;
  return out;
}

function chart(d: Data, meta: number) {
  const data = meses(d);
  const W = 640;
  const H = 230;
  const top = 18;
  const base = H - 30;
  const max = Math.max(meta, ...data.map((x) => x.valor), 1) * 1.1;
  const bw = 40;
  const gap = (W - data.length * bw) / (data.length + 1);
  const y = (v: number) => base - (v / max) * (base - top);
  const bars = data
    .map((x, i) => {
      const bx = gap + i * (bw + gap);
      const h = base - y(x.valor);
      return `<rect x="${bx}" y="${y(x.valor)}" width="${bw}" height="${Math.max(h, x.valor > 0 ? 2 : 0)}" fill="#00f2ff" opacity="${x.futuro ? 0.35 : 1}"></rect>
        <text x="${bx + bw / 2}" y="${y(x.valor) - 6}" text-anchor="middle" font-size="11" fill="currentColor">${x.valor ? num(Math.round(x.valor)) : ''}</text>
        <text x="${bx + bw / 2}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#8a919a">${mesCorto(x.mes)}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="w-full text-bone" role="img" aria-label="Cobrado por mes y proyección contra la meta">
    <line x1="0" x2="${W}" y1="${y(meta)}" y2="${y(meta)}" stroke="#ff7a7a" stroke-dasharray="5 5"></line>
    <text x="${W - 4}" y="${y(meta) - 6}" text-anchor="end" font-size="11" fill="#ff7a7a">Meta USD ${num(meta)}</text>
    ${bars}
  </svg>`;
}

/**
 * `conv`: proporción de prospectos contactados que terminan siendo clientes (null si todavía no hay datos).
 */
export function proyeccionView(d: Data, p: Proy, conv: number | null) {
  const metaRow = d.metas.find((m) => m.tipo === 'ingresos');
  const meta = Number(metaRow?.objetivo ?? 2000);
  const t = today();
  const mrr = ingresoRecurrente(d);
  const activos = recurrentesActivos(d).length;
  const cobradoMes = sumUsd(d.cobros.filter((c) => c.cobrado_en && String(c.cobrado_en) >= monthStart(t)));
  const sigMes = addMonths(monthStart(t), 1);
  const porCobrar = sumUsd(d.cobros.filter((c) => !c.cobrado_en && String(c.vencimiento) < sigMes));
  const brecha = Math.max(0, meta - mrr);

  const base = conv && conv > 0 ? conv : 0.05;
  const estimada = !(conv && conv > 0);
  const escenario = (nombre: string, nuevos: number, ticket: number) => {
    const inc = nuevos * ticket;
    const m = inc > 0 ? Math.ceil(brecha / inc) : 0;
    const clientesFinal = activos + nuevos * m;
    const prospectosMes = Math.ceil(nuevos / base);
    return { nombre, nuevos, ticket, meses: m, fecha: m ? addMonths(monthStart(t), m) : monthStart(t), clientesFinal, prospectosMes, porSemana: Math.ceil(prospectosMes / 4.3) };
  };
  const escenarios = [escenario('Cauteloso', 1, p.ticket), escenario('Base', 2, p.ticket), escenario('Ambicioso', 4, p.ticket), escenario('El tuyo', p.nuevos, p.ticket)];

  const precios = ['seguimiento', 'integral', 'medida'].map((id) => productos.find((x) => x.id === id)!);
  const cubren = [...precios.map((x) => ({ nombre: x.nombre + ' (por mes)', precio: x.cobros[0].usd })), { nombre: 'Sesión 1:1 (venta suelta)', precio: 80 }, { nombre: 'Sistema Propio (venta suelta)', precio: 690 }]
    .map((x) => `<tr><td class="px-3 py-3 font-medium text-bone">${esc(x.nombre)}</td><td class="px-3 py-3 text-mute">USD ${num(x.precio)}</td><td class="px-3 py-3 text-bone">${brecha ? Math.ceil(brecha / x.precio) : 0}</td></tr>`)
    .join('');

  const input = (name: string, value: number, label: string, step = '1') =>
    `<label class="grid gap-2 text-sm text-mute">${label}<input type="number" min="0" step="${step}" data-action="proy" data-campo="${name}" value="${value}" class="w-full border border-line-strong bg-ink px-3 py-2.5 text-base text-bone focus:border-signal focus:outline-none" /></label>`;

  return `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    ${stat('Meta mensual', 'USD ' + num(meta))}
    ${stat('Ingreso recurrente', 'USD ' + num(mrr), `${activos} ${activos === 1 ? 'plan activo' : 'planes activos'} · ${pct(mrr, meta)}% de la meta`)}
    ${stat('Cobrado este mes', 'USD ' + num(cobradoMes))}
    ${stat('Falta para la meta', 'USD ' + num(brecha), 'de ingreso mensual recurrente')}
  </div>
  <div class="mt-3">${bar(mrr, meta)}</div>
  <p class="mt-2 text-sm text-faint">Por cobrar con vencimiento hasta fin de este mes: USD ${num(porCobrar)}.</p>

  <section class="mt-8 border border-line p-5 md:p-6">
    <h3 class="tag text-signal">Progresión</h3>
    <p class="mt-1 text-sm text-faint">Cobrado en los últimos meses y proyectado para los próximos (barras más claras), contra tu meta.</p>
    <div class="mt-4">${chart(d, meta)}</div>
  </section>

  <section class="mt-8">
    <h3 class="tag text-signal">Escenarios</h3>
    <p class="mt-1 text-sm text-faint">Cuántos meses tardás en llegar a la meta sumando clientes nuevos con plan mensual. No descuenta bajas.</p>
    <div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">${escenarios
      .map(
        (e, i) => `<article class="border ${i === 3 ? 'border-signal' : 'border-line'} bg-panel p-5">
        <p class="tag ${i === 3 ? 'text-signal' : 'text-faint'}">${e.nombre}</p>
        <p class="display mt-3 text-3xl text-bone">${brecha === 0 ? 'Meta lograda' : e.nuevos > 0 ? `${e.meses} ${e.meses === 1 ? 'mes' : 'meses'}` : '—'}</p>
        <p class="mt-1 text-sm text-mute">${e.nuevos} cliente${e.nuevos === 1 ? '' : 's'} nuevo${e.nuevos === 1 ? '' : 's'} por mes · USD ${num(e.ticket)} c/u</p>
        ${brecha > 0 && e.nuevos > 0 ? `<p class="mt-3 text-sm text-bone">Llegás en <strong>${mesCorto(e.fecha)}</strong> con ${e.clientesFinal} clientes.</p>
        <p class="mt-2 text-xs leading-relaxed text-faint">Con tu conversión ${estimada ? 'estimada (5%)' : `actual (${Math.round(base * 100)}%)`}, necesitás contactar unas ${e.prospectosMes} personas por mes, o ${e.porSemana} por semana.</p>` : ''}
      </article>`,
      )
      .join('')}</div>
    <div class="mt-4 grid gap-4 border border-line p-5 sm:grid-cols-2 md:max-w-xl">
      ${input('nuevos', p.nuevos, 'Probá tu escenario: clientes nuevos por mes')}
      ${input('ticket', p.ticket, 'Ticket mensual por cliente (USD)', '10')}
    </div>
  </section>

  <section class="mt-8">
    <h3 class="tag text-faint">Cuántos hacen falta para cubrir lo que falta (USD ${num(brecha)})</h3>
    <div class="mt-3 overflow-x-auto border border-line"><table class="w-full min-w-[28rem] text-left text-sm">
      <thead class="border-b border-line bg-panel"><tr>${['Producto', 'Precio', 'Cantidad'].map((h) => `<th class="tag px-3 py-3 font-normal text-faint">${h}</th>`).join('')}</tr></thead>
      <tbody class="divide-y divide-line">${cubren}</tbody>
    </table></div>
    <p class="mt-3 text-xs text-faint">Los planes mensuales cubren el ingreso de todos los meses. Las ventas sueltas cuentan una sola vez, por eso hay que repetirlas cada mes.</p>
  </section>`;
}

/* ------------------------------ resumen semanal ------------------------------ */
export function semanaView(d: Data, ws: string) {
  const we = addDays(ws, 6);
  const sig = addDays(ws, 7);
  const t = today();
  const en = (s: unknown) => !!s && String(s).slice(0, 10) >= ws && String(s).slice(0, 10) <= we;
  const enProx = (s: unknown) => !!s && String(s).slice(0, 10) >= sig && String(s).slice(0, 10) <= addDays(sig, 6);

  // Metas de la semana
  const metas = d.metas
    .filter((m) => m.periodo === 'semana')
    .sort((a, b) => metaTypes.findIndex((x) => x.tipo === a.tipo) - metaTypes.findIndex((x) => x.tipo === b.tipo))
    .map((m) => {
      const hecho = d.registro.filter((r) => r.tipo === m.tipo && en(r.fecha)).reduce((a, r) => a + Number(r.cantidad), 0);
      const meta = Number(m.objetivo);
      return `<article class="border border-line bg-panel p-4"><p class="tag text-faint">${esc(m.etiqueta)}</p><p class="display mt-2 text-3xl ${hecho >= meta ? 'text-signal' : 'text-bone'}">${num(hecho)}<span class="text-lg text-faint"> / ${num(meta)}</span></p><div class="mt-3">${bar(hecho, meta)}</div></article>`;
    })
    .join('');

  // Plata
  const cobrado = sumUsd(d.cobros.filter((c) => en(c.cobrado_en)));
  const aCobrar = sumUsd(d.cobros.filter((c) => !c.cobrado_en && en(c.vencimiento)));
  const vencido = sumUsd(d.cobros.filter((c) => !c.cobrado_en && String(c.vencimiento) < (we < t ? we : t)));
  const ventas = d.ventas.filter((v) => en(v.fecha));

  // Prospectos
  const movs = d.historial.filter((h) => h.tipo === 'estado' && en(h.created_at));
  const cuenta = (estado: string) => movs.filter((h) => h.estado === estado).length;
  const nuevosPros = d.contactos.filter((c) => en(c.created_at)).length;
  const entrantesSemana = d.entrantes.filter((e) => en(e.fecha)).length;

  // Contenido
  const piezas = d.contenido.filter((c) => en(c.fecha));
  const publicadas = piezas.filter((c) => c.estado === 'publicada');
  const vistas = publicadas.reduce((a, c) => a + Number(c.vistas ?? 0), 0);

  // La semana que viene
  const seguir = d.contactos.filter((c) => enProx(c.proximo_seguimiento) && !['Cliente', 'Descartado'].includes(c.estado));
  const cobrosProx = d.cobros.filter((c) => !c.cobrado_en && enProx(c.vencimiento));
  const piezasProx = d.contenido.filter((c) => enProx(c.fecha) && c.estado !== 'publicada');

  // Mentoría
  const semanasMent = d.semanas ?? [];
  const nombreMent = (s: Row) => d.mentorados?.find((m) => m.id === s.mentorado_id)?.nombre ?? '';
  const llamadas = semanasMent.filter((s) => s.estado === 'hecha' && en(s.fecha_llamada));
  const entregables = semanasMent.filter((s) => en(s.entregable_en));
  const llamadasProx = semanasMent.filter((s) => s.estado === 'pendiente' && enProx(s.fecha_llamada));

  const lista = (items: string[], vacio: string) =>
    items.length ? `<ul class="mt-3 space-y-2 text-sm text-bone">${items.slice(0, 8).map((i) => `<li>${i}</li>`).join('')}${items.length > 8 ? `<li class="text-faint">y ${items.length - 8} más</li>` : ''}</ul>` : `<p class="mt-3 text-sm text-faint">${vacio}</p>`;

  const bloque = (titulo: string, cuerpo: string) => `<section class="border border-line p-5"><h3 class="tag text-signal">${titulo}</h3>${cuerpo}</section>`;

  return `<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-2">${btn('semana-prev', '← Anterior')}${btn('semana-hoy', 'Esta semana')}${btn('semana-next', 'Siguiente →')}</div>
    <p class="text-sm text-mute">Semana del <strong class="text-bone">${shortDate(ws)}</strong> al <strong class="text-bone">${shortDate(we)}</strong></p>
  </div>

  <h3 class="tag text-faint">Lo hecho contra las metas</h3>
  <div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">${metas || '<p class="text-sm text-faint">No hay metas semanales cargadas.</p>'}</div>

  <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    ${stat('Cobrado en la semana', 'USD ' + num(cobrado))}
    ${stat('Por cobrar de la semana', 'USD ' + num(aCobrar))}
    ${stat('Vencido sin cobrar', 'USD ' + num(vencido), '', vencido > 0 ? 'text-[#ff7a7a]' : 'text-bone')}
    ${stat('Ventas nuevas', String(ventas.length), ventas.map((v) => esc(v.cliente)).join(', '))}
  </div>

  <div class="mt-8 grid gap-4 md:grid-cols-3">
    ${bloque(
      'Prospectos',
      `<p class="mt-3 text-sm text-mute">Nuevos: <strong class="text-bone">${nuevosPros}</strong> · Entraron por la web: <strong class="text-bone">${entrantesSemana}</strong></p>
      <p class="mt-2 text-sm text-mute">Contactados <strong class="text-bone">${cuenta('Contactado')}</strong> · Respondieron <strong class="text-bone">${cuenta('Respondió')}</strong> · Informes <strong class="text-bone">${cuenta('Informe enviado')}</strong> · Propuestas <strong class="text-bone">${cuenta('Propuesta')}</strong> · Clientes <strong class="text-bone">${cuenta('Cliente')}</strong></p>`,
    )}
    ${bloque(
      'Mentoría',
      `<p class="mt-3 text-sm text-mute">Llamadas hechas: <strong class="text-bone">${llamadas.length}</strong> · Entregables recibidos: <strong class="text-bone">${entregables.length}</strong></p>` +
        lista(llamadas.map((s) => `${esc(nombreMent(s))} <span class="text-mute">· semana ${s.semana}</span>`), 'No hubo llamadas esta semana.'),
    )}
    ${bloque(
      'Contenido',
      `<p class="mt-3 text-sm text-mute">Publicadas <strong class="text-bone">${publicadas.length}</strong> de ${piezas.length} planificadas · Vistas cargadas: <strong class="text-bone">${num(vistas)}</strong></p>` +
        lista(
          publicadas.map((c) => `${esc(c.titulo)} <span class="text-mute">· ${c.vistas != null ? num(Number(c.vistas)) + ' vistas' : 'sin resultados'}</span>`),
          'No publicaste nada esta semana.',
        ),
    )}
  </div>

  <h3 class="tag mt-8 text-faint">La semana que viene</h3>
  <div class="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    ${bloque('Llamadas de mentoría', lista(llamadasProx.map((s) => `<strong>${esc(nombreMent(s))}</strong> <span class="text-mute">· semana ${s.semana} · ${shortDate(s.fecha_llamada)}</span>`), 'Ninguna agendada.'))}
    ${bloque('Seguimientos', lista(seguir.map((c) => `<strong>${esc(c.nombre)}</strong> <span class="text-mute">· ${shortDate(c.proximo_seguimiento)}</span>`), 'Ninguno agendado.'))}
    ${bloque('Cobros por vencer', lista(cobrosProx.map((c) => `${esc(d.ventas.find((v) => v.id === c.venta_id)?.cliente ?? '')} <span class="text-mute">· USD ${num(Number(c.monto_usd))} · ${shortDate(c.vencimiento)}</span>`), 'Ninguno.'))}
    ${bloque('Contenido planificado', lista(piezasProx.map((c) => `${esc(c.titulo)} <span class="text-mute">· ${shortDate(c.fecha)}</span>`), 'No hay piezas agendadas.'))}
  </div>`;
}

/* ------------------------------ resultados del contenido ------------------------------ */
const CAMPOS = [
  ['vistas', 'Vistas'],
  ['interacciones', 'Interacciones'],
  ['mensajes', 'Mensajes'],
] as const;

export function contenidoResultadosView(d: Data) {
  const t = today();
  const pendientes = d.contenido
    .filter((c) => c.estado === 'publicada' && c.vistas == null && c.fecha && String(c.fecha) >= addDays(t, -30))
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

  const carga = pendientes.length
    ? `<section class="mb-6 border border-line p-5">
        <h3 class="tag text-signal">Cargar resultados de la semana</h3>
        <p class="mt-1 text-sm text-faint">Piezas publicadas que todavía no tienen resultados. Se guardan al salir de cada campo.</p>
        <ul class="mt-4 divide-y divide-line">${pendientes
          .map(
            (c) => `<li class="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <span class="text-sm text-bone">${esc(c.titulo)} <span class="text-mute">· ${shortDate(c.fecha)} · ${esc(c.canal)}</span></span>
              <span class="grid grid-cols-3 gap-2">${CAMPOS.map(
                ([k, l]) => `<label class="grid gap-1 text-xs text-faint">${l}<input type="number" min="0" inputmode="numeric" data-action="resultado" data-id="${esc(c.id)}" data-campo="${k}" value="${esc(c[k] ?? '')}" class="w-full border border-line-strong bg-ink px-2 py-2 text-base text-bone focus:border-signal focus:outline-none md:w-28" /></label>`,
              ).join('')}</span>
            </li>`,
          )
          .join('')}</ul>
      </section>`
    : '';

  const conDatos = d.contenido.filter((c) => c.vistas != null);
  if (!conDatos.length) return carga;

  const tipos = [...new Set(conDatos.map((c) => c.tipo))];
  const prom = (rows: Row[], k: string) => (rows.length ? rows.reduce((a, c) => a + Number(c[k] ?? 0), 0) / rows.length : 0);
  const filas = tipos
    .map((tipo) => {
      const r = conDatos.filter((c) => c.tipo === tipo);
      return { tipo, n: r.length, vistas: prom(r, 'vistas'), inter: prom(r, 'interacciones'), msgs: r.reduce((a, c) => a + Number(c.mensajes ?? 0), 0) };
    })
    .sort((a, b) => b.vistas - a.vistas);
  const maxVistas = Math.max(...filas.map((f) => f.vistas), 1);
  const top = [...conDatos].sort((a, b) => Number(b.vistas) - Number(a.vistas)).slice(0, 5);

  return `${carga}<section class="mb-6 border border-line p-5">
    <h3 class="tag text-signal">Qué funciona</h3>
    <p class="mt-1 text-sm text-faint">Promedio por tipo de pieza, con los resultados que cargaste.</p>
    <ul class="mt-4 space-y-3">${filas
      .map(
        (f) => `<li class="grid grid-cols-[8rem_1fr] items-center gap-3 sm:grid-cols-[11rem_1fr_13rem]">
          <span class="text-sm text-mute">${esc(f.tipo)}</span>
          <div class="h-7 bg-line/60"><div class="flex h-7 items-center justify-end bg-signal px-2" style="width:${Math.max(6, pct(f.vistas, maxVistas))}%"><span class="text-xs font-semibold text-ink">${num(Math.round(f.vistas))}</span></div></div>
          <span class="col-span-2 text-xs text-faint sm:col-span-1">${f.n} pieza${f.n === 1 ? '' : 's'} · ${num(Math.round(f.inter))} interacc. · ${f.msgs} mensajes</span>
        </li>`,
      )
      .join('')}</ul>
    <h4 class="tag mt-6 text-faint">Las 5 con más vistas</h4>
    <ul class="mt-3 space-y-2 text-sm text-bone">${top.map((c) => `<li>${esc(c.titulo)} <span class="text-mute">· ${num(Number(c.vistas))} vistas · ${esc(c.tipo)}</span></li>`).join('')}</ul>
  </section>`;
}

/* ------------------------------ personas ------------------------------ */
/** Una persona por mail, con todo lo que hizo en la web. */
export function agruparPersonas(entr: Row[]) {
  const map = new Map<string, { email: string; nombre: string; primera: string; ultima: string; acciones: Row[] }>();
  for (const e of entr) {
    const key = String(e.email || e.nombre).toLowerCase();
    const p = map.get(key) ?? { email: e.email, nombre: '', primera: e.fecha, ultima: e.fecha, acciones: [] as Row[] };
    if (!p.nombre && e.nombre && e.nombre !== '(sin nombre)') p.nombre = e.nombre;
    if (e.fecha < p.primera) p.primera = e.fecha;
    if (e.fecha > p.ultima) p.ultima = e.fecha;
    p.acciones.push(e);
    map.set(key, p);
  }
  return [...map.values()].sort((a, b) => String(b.ultima).localeCompare(String(a.ultima)));
}

/* ------------------------------ exportación y copia de seguridad ------------------------------ */
export type Archivo = { nombre: string; mime: string; contenido: string };

const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
// BOM al inicio para que Excel abra bien los acentos
const csv = (cols: string[], rows: unknown[][]) => '﻿' + [cols, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');

export const exportaciones = [
  { id: 'prospectos', titulo: 'Prospectos', detalle: 'Contactos de tu red con estado, origen y seguimiento.' },
  { id: 'personas', titulo: 'Personas de la web', detalle: 'Una fila por mail, con lo que hizo en el sitio.' },
  { id: 'entrantes', titulo: 'Formularios recibidos', detalle: 'Cada formulario, diagnóstico o descarga.' },
  { id: 'mentorados', titulo: 'Mentorados', detalle: 'Avance de cada persona en las 12 semanas.' },
  { id: 'ventas', titulo: 'Ventas y cobros', detalle: 'Una fila por cobro, con su cliente y producto.' },
  { id: 'contenido', titulo: 'Contenido', detalle: 'Calendario y resultados de cada pieza.' },
  { id: 'tareas', titulo: 'Tareas', detalle: 'Pendientes y hechas.' },
] as const;

export function exportar(que: string, d: Data): Archivo | null {
  const fecha = today();
  const mk = (nombre: string, contenido: string): Archivo => ({ nombre: `${nombre}-${fecha}.csv`, mime: 'text/csv;charset=utf-8', contenido });
  switch (que) {
    case 'prospectos':
      return mk('prospectos', csv(['Nombre', 'Organización', 'Mail', 'Tipo', 'Canal', 'Origen', 'Estado', 'Próximo seguimiento', 'Contacto', 'Notas', 'Alta'], d.contactos.map((c) => [c.nombre, c.organizacion, c.email, c.tipo, c.canal, c.origen, c.estado, c.proximo_seguimiento, c.contacto, c.notas, String(c.created_at).slice(0, 10)])));
    case 'personas':
      return mk('personas', csv(['Nombre', 'Mail', 'Primera vez', 'Última vez', 'Movimientos', 'Qué hizo'], agruparPersonas(d.entrantes).map((p) => [p.nombre, p.email, String(p.primera).slice(0, 10), String(p.ultima).slice(0, 10), p.acciones.length, p.acciones.map((a) => `${entrantes[a.origen as EntranteOrigen].label}: ${a.resumen}`).join(' | ')])));
    case 'entrantes':
      return mk('formularios', csv(['Fecha', 'Origen', 'Nombre', 'Mail', 'Resumen', 'Estado', 'Notas'], d.entrantes.map((e) => [String(e.fecha).slice(0, 10), entrantes[e.origen as EntranteOrigen].label, e.nombre, e.email, e.resumen, e.estado, e.notas])));
    case 'ventas':
      return mk('ventas-y-cobros', csv(['Cliente', 'Producto', 'Origen', 'Fecha de la venta', 'Concepto', 'USD', 'Pesos', 'Vence', 'Cobrado el'], d.cobros.map((c) => {
        const v = d.ventas.find((x) => x.id === c.venta_id) ?? {};
        return [v.cliente, v.producto, v.origen, v.fecha, c.concepto, c.monto_usd, c.monto_ars, c.vencimiento, c.cobrado_en];
      })));
    case 'contenido':
      return mk('contenido', csv(['Título', 'Tipo', 'Canal', 'Fecha', 'Estado', 'Enlace', 'Vistas', 'Interacciones', 'Mensajes', 'Comentario', 'Notas'], d.contenido.map((c) => [c.titulo, c.tipo, c.canal, c.fecha, c.estado, c.enlace, c.vistas, c.interacciones, c.mensajes, c.resultado, c.notas])));
    case 'mentorados':
      return mk('mentorados', csv(['Nombre', 'Mail', 'Perfil', 'Cohorte', 'Inicio', 'Estado', 'Equipo', 'Objetivo', 'Trabado', 'Semanas hechas', 'Entregables recibidos', 'Notas'], (d.mentorados ?? []).map((m) => {
        const ss = (d.semanas ?? []).filter((s) => s.mentorado_id === m.id);
        return [m.nombre, m.email, m.perfil, m.cohorte, m.inicio, m.estado, m.equipo, m.objetivo, m.trabado, ss.filter((s) => s.estado === 'hecha').length, ss.filter((s) => s.entregable_en).length, m.notas];
      })));
    case 'tareas':
      return mk('tareas', csv(['Tarea', 'Estado', 'Prioridad', 'Fecha límite', 'Detalle'], d.tareas.map((t) => [t.titulo, t.estado, t.prioridad, t.fecha_limite, t.detalle])));
    case 'backup':
      return { nombre: `panel-copia-${fecha}.json`, mime: 'application/json', contenido: JSON.stringify({ exportado: new Date().toISOString(), tablas: d }, null, 2) };
    default:
      return null;
  }
}

export function datosView(d: Data) {
  const cuentas: Record<string, number> = { prospectos: d.contactos.length, personas: agruparPersonas(d.entrantes).length, entrantes: d.entrantes.length, mentorados: (d.mentorados ?? []).length, ventas: d.cobros.length, contenido: d.contenido.length, tareas: d.tareas.length };
  const total = Object.keys(resources).reduce((a, k) => a + (d[k]?.length ?? 0), 0) + d.entrantes.length;
  return `<section class="border border-line p-5 md:p-6">
    <h3 class="tag text-signal">Copia de seguridad completa</h3>
    <p class="mt-2 max-w-2xl text-sm leading-relaxed text-mute">Un solo archivo con todo lo que hay en el panel (${num(total)} registros): prospectos, ventas, cobros, contenido, tareas, historial y formularios. Guardalo en tu computadora cada tanto.</p>
    <div class="mt-4"><button type="button" data-action="export" data-que="backup" class="bg-signal px-5 py-3 text-sm font-semibold text-ink hover:bg-bone">Descargar copia (JSON)</button></div>
  </section>
  <section class="mt-6">
    <h3 class="tag text-faint">Exportar a planilla (CSV)</h3>
    <ul class="mt-3 grid gap-3 sm:grid-cols-2">${exportaciones
      .map((e) => `<li class="flex items-center justify-between gap-4 border border-line p-4"><div><p class="font-medium text-bone">${e.titulo} <span class="text-faint">· ${cuentas[e.id] ?? 0}</span></p><p class="mt-1 text-xs text-faint">${e.detalle}</p></div>${btn('export', 'Descargar', { que: e.id })}</li>`)
      .join('')}</ul>
    <p class="mt-4 text-xs text-faint">Los CSV abren directo en Excel o Google Sheets. Supabase además guarda sus propias copias automáticas según tu plan.</p>
  </section>`;
}

/* ------------------------------ semana ------------------------------ */
/** Semana que se muestra por defecto: los lunes, la que acaba de terminar. */
export const semanaInicial = () => (new Date().getDay() === 1 ? addDays(weekStart(today()), -7) : weekStart(today()));
