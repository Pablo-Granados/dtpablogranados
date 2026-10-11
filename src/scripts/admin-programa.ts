/** Vista del panel con la hoja de ruta de Sistema Propio: 12 semanas, tipos de clase y variantes por perfil. */
import { etapasPrograma, perfiles, programa, tiposClase, type Perfil, type Semana, type TipoClase } from '@/data/programa';
import { esc } from './admin-utils';

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

function tarjeta(s: Semana, f: ProgramaFiltro) {
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
    </div>
  </details>`;
}

export function programaView(f: ProgramaFiltro) {
  const select = (name: string, label: string, valor: string, opciones: readonly { v: string; l: string }[]) =>
    `<label class="grid gap-2 text-sm text-mute">${label}<select data-action="${name}" class="border border-line-strong bg-ink px-3 py-2.5 text-base text-bone focus:border-signal focus:outline-none">${opciones.map((o) => `<option value="${esc(o.v)}"${o.v === valor ? ' selected' : ''}>${esc(o.l)}</option>`).join('')}</select></label>`;

  const semanas = programa.filter((s) => f.tipo === 'todos' || s.tipo === f.tipo);

  const mapa = etapasPrograma
    .map(
      (e) => `<li class="border border-line bg-panel p-4"><p class="tag text-signal">${e.semanas.length === 1 ? `Semana ${e.semanas[0]}` : `Semanas ${e.semanas[0]}–${e.semanas.at(-1)}`}</p><p class="mt-2 text-sm font-medium text-bone">${esc(e.titulo)}</p></li>`,
    )
    .join('');

  return `<p class="max-w-3xl text-mute">Tu hoja de ruta de las 12 semanas: qué prepararte, qué hacer en cada llamada, qué revisar en la devolución y cómo cambia según quién sea la persona. Es solo para vos; no se muestra en la web.</p>
  <ol class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">${mapa}</ol>
  <div class="mt-6 grid gap-4 sm:grid-cols-2 md:max-w-2xl">
    ${select('programa-perfil', 'Ver para el perfil', f.perfil, [{ v: 'todos', l: 'Todos los perfiles' }, ...perfiles.map((p) => ({ v: p.id, l: p.label }))])}
    ${select('programa-tipo', 'Tipo de clase', f.tipo, [{ v: 'todos', l: 'Todos los tipos' }, ...tiposClase.map((t) => ({ v: t, l: t }))])}
  </div>
  <div class="mt-6 grid gap-3">${semanas.length ? semanas.map((s) => tarjeta(s, f)).join('') : '<p class="border border-line p-6 text-mute">No hay semanas de ese tipo.</p>'}</div>`;
}
