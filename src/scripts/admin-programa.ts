/** Vista del panel con la hoja de ruta de Sistema Propio: 12 semanas, tipos de clase y variantes por perfil. */
import { condiciones, etapasPrograma, onboarding, perfiles, tiposClase, type Perfil, type Semana, type TipoClase } from '@/data/programa';
import { edicionHabilitada, programaActual } from './admin-catalogo';
import { bannerEdicion } from './admin-textos';
import { btn, esc, type Data } from './admin-utils';

export type ProgramaFiltro = { perfil: Perfil | 'todos'; tipo: TipoClase | 'todos' };

const colorTipo: Record<TipoClase, string> = {
  Orientación: 'border-signal/60 text-signal',
  Concepto: 'border-line-strong text-bone',
  'Taller de herramienta': 'border-signal/60 text-signal',
  'Producción de informe': 'border-line-strong text-bone',
  Datos: 'border-line-strong text-bone',
  Comunicación: 'border-line-strong text-bone',
  Cierre: 'border-signal/60 text-signal',
};

const lista = (items: readonly string[]) => `<ul class="mt-2 space-y-1.5 text-sm leading-snug text-mute">${items.map((i) => `<li class="flex gap-2"><span class="text-faint" aria-hidden="true">–</span><span>${esc(i)}</span></li>`).join('')}</ul>`;
const bloque = (titulo: string, cuerpo: string) => `<div><h4 class="tag text-faint">${titulo}</h4>${cuerpo}</div>`;

function tarjeta(s: Semana, f: ProgramaFiltro, d: Data) {
  const fila = d.programa?.find((r) => r.semana === s.n);
  const variantes =
    f.perfil === 'todos'
      ? `<div class="mt-5 border border-line p-4"><h4 class="tag text-signal">Cómo cambia según el perfil</h4><dl class="mt-3 grid gap-3 text-sm">${perfiles
          .map((p) => `<div class="grid gap-1 sm:grid-cols-[13rem_1fr] sm:gap-4"><dt class="text-bone">${esc(p.label)}</dt><dd class="text-mute">${esc(s.variantes[p.id])}</dd></div>`)
          .join('')}</dl></div>`
      : `<div class="mt-5 border border-signal/60 bg-signal/5 p-4"><h4 class="tag text-signal">Para: ${esc(perfiles.find((p) => p.id === f.perfil)!.label)}</h4><p class="mt-2 text-sm leading-relaxed text-bone">${esc(s.variantes[f.perfil])}</p></div>`;

  return `<details class="group border border-line bg-panel">
    <summary class="grid cursor-pointer list-none gap-2 p-4 md:grid-cols-[4.5rem_1fr_auto] md:items-center md:gap-4 md:p-5 [&::-webkit-details-marker]:hidden">
      <span class="display text-3xl text-signal">S${s.n}</span>
      <span>
        <span class="block font-medium text-bone">${esc(s.titulo)}</span>
        <span class="mt-1 block text-sm text-faint">Entregable: ${esc(s.entregable)}</span>
      </span>
      <span class="tag w-fit border px-2.5 py-1 ${colorTipo[s.tipo]}">${esc(s.tipo)}</span>
    </summary>
    <div class="border-t border-line p-4 md:p-6">
      <p class="text-base leading-relaxed text-bone">${esc(s.objetivo)}</p>
      <div class="mt-5 grid gap-5 md:grid-cols-2">
        ${bloque('Antes de la llamada', lista(s.antes))}
        ${bloque('En la llamada (45 min)', lista(s.llamada))}
        ${bloque('Tarea de la semana', `<p class="mt-2 text-sm leading-snug text-mute">${esc(s.tarea)}</p>`)}
        ${bloque('Qué mirar en la devolución en video', lista(s.devolucion))}
        ${bloque('Herramientas y material', lista(s.herramientas))}
        ${bloque('Para pasar a la semana siguiente', `<p class="mt-2 text-sm leading-snug text-bone">${esc(s.avanza)}</p>`)}
      </div>
      ${variantes}
      ${edicionHabilitada(d, 'programa') && fila ? `<div class="mt-5">${btn('open', 'Editar esta semana', { res: 'programa', id: fila.id })}</div>` : ''}
    </div>
  </details>`;
}

function onboardingView() {
  const pasos = onboarding
    .map(
      (o) => `<div class="border border-line bg-panel p-4"><p class="tag text-signal">${esc(o.cuando)}</p><h4 class="mt-2 font-medium text-bone">${esc(o.titulo)}</h4>${lista(o.items)}</div>`,
    )
    .join('');
  return `<details class="group mt-6 border border-signal/40 bg-panel">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-4 md:p-5 [&::-webkit-details-marker]:hidden">
      <span><span class="tag block text-signal">Antes de la semana 1</span><span class="mt-1 block font-medium text-bone">Onboarding y condiciones</span></span>
      <span class="font-mono text-signal transition-transform group-open:rotate-45" aria-hidden="true">+</span>
    </summary>
    <div class="border-t border-line p-4 md:p-6">
      <div class="grid gap-3 md:grid-cols-2">${pasos}</div>
      <div class="mt-5 border border-line p-4"><h4 class="tag text-faint">Condiciones del programa (se envían antes del primer pago)</h4>${lista(condiciones)}</div>
    </div>
  </details>`;
}

export function programaView(f: ProgramaFiltro, d: Data) {
  const select = (name: string, label: string, valor: string, opciones: readonly { v: string; l: string }[]) =>
    `<label class="grid gap-2 text-sm text-mute">${label}<select data-action="${name}" class="border border-line-strong bg-ink px-3 py-2.5 text-base text-bone focus:border-signal focus:outline-none">${opciones.map((o) => `<option value="${esc(o.v)}"${o.v === valor ? ' selected' : ''}>${esc(o.l)}</option>`).join('')}</select></label>`;

  const semanas = programaActual().filter((s) => f.tipo === 'todos' || s.tipo === f.tipo);

  const mapa = etapasPrograma
    .map(
      (e) => `<li class="border border-line bg-panel p-4"><p class="tag text-signal">${e.semanas.length === 1 ? `Semana ${e.semanas[0]}` : `Semanas ${e.semanas[0]}–${e.semanas.at(-1)}`}</p><p class="mt-2 text-sm font-medium text-bone">${esc(e.titulo)}</p></li>`,
    )
    .join('');

  return `${bannerEdicion(d, 'programa')}<p class="max-w-3xl text-mute">Tu hoja de ruta de las 12 semanas: qué prepararte, qué hacer en cada llamada, qué revisar en la devolución y cómo cambia según quién sea la persona. Es solo para vos; no se muestra en la web.</p>
  <ol class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">${mapa}</ol>
  ${onboardingView()}
  <div class="mt-6 grid gap-4 sm:grid-cols-2 md:max-w-2xl">
    ${select('programa-perfil', 'Ver para el perfil', f.perfil, [{ v: 'todos', l: 'Todos los perfiles' }, ...perfiles.map((p) => ({ v: p.id, l: p.label }))])}
    ${select('programa-tipo', 'Tipo de clase', f.tipo, [{ v: 'todos', l: 'Todos los tipos' }, ...tiposClase.map((t) => ({ v: t, l: t }))])}
  </div>
  <div class="mt-6 grid gap-3">${semanas.length ? semanas.map((s) => tarjeta(s, f, d)).join('') : '<p class="border border-line p-6 text-mute">No hay semanas de ese tipo.</p>'}</div>`;
}
