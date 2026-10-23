/** Guía del panel: manual, plan y seguimiento, y referencia. Se edita desde el panel una vez habilitada la edición. */
import { guia as guiaBase, seccionesGuia } from '@/data/guia';
import { btn, esc, type Data, type Row } from './admin-utils';

export type Doc = { id?: string; seccion: string; titulo: string; contenido: string };

export const guiaIniciales = guiaBase;
export const guiaEditable = (d: Data) => (d.guia?.length ?? 0) > 0;

/** Los documentos a mostrar: los de la base si ya está habilitada la edición, o los iniciales. */
export function guiaActual(d: Data): Doc[] {
  if (d.guia?.length) {
    const rank = (s: string) => {
      const i = (seccionesGuia as readonly string[]).indexOf(s);
      return i < 0 ? 99 : i;
    };
    return [...d.guia].sort((a: Row, b: Row) => rank(a.seccion) - rank(b.seccion) || (a.orden ?? 0) - (b.orden ?? 0)).map((r) => ({ id: r.id, seccion: r.seccion, titulo: r.titulo, contenido: r.contenido ?? '' }));
  }
  return guiaBase.map((g) => ({ ...g }));
}

export const guiaAFila = (g: { seccion: string; titulo: string; contenido: string }, orden: number): Row => ({ seccion: g.seccion, titulo: g.titulo, contenido: g.contenido, orden });

/* ------------------------------ mini-markdown ------------------------------ */
const inline = (s: string) =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code class="bg-line/60 px-1 text-bone">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-bone">$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2" class="text-signal underline underline-offset-2" target="_blank" rel="noopener">$1</a>');

const celdas = (l: string) =>
  l
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());

/** Convierte el texto de un documento en HTML. Soporta títulos, listas, tablas, citas copiables, negrita y código. */
export function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  const parrafo: string[] = [];
  const cerrarParrafo = () => {
    if (parrafo.length) out.push(`<p class="mt-3 leading-relaxed text-mute">${inline(parrafo.join(' '))}</p>`);
    parrafo.length = 0;
  };

  while (i < lines.length) {
    const l = lines[i];

    if (!l.trim()) {
      cerrarParrafo();
      i++;
      continue;
    }
    if (l.startsWith('## ')) {
      cerrarParrafo();
      out.push(`<h3 class="tag mt-8 text-signal">${inline(l.slice(3))}</h3>`);
      i++;
      continue;
    }
    if (l.startsWith('### ')) {
      cerrarParrafo();
      out.push(`<h4 class="mt-5 font-semibold text-bone">${inline(l.slice(4))}</h4>`);
      i++;
      continue;
    }

    // Tabla
    if (l.trim().startsWith('|') && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] ?? '')) {
      cerrarParrafo();
      const cab = celdas(l);
      i += 2;
      const filas: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) filas.push(celdas(lines[i++]));
      out.push(`<div class="mt-4 overflow-x-auto border border-line"><table class="w-full min-w-[28rem] text-left text-sm"><thead class="border-b border-line bg-panel"><tr>${cab.map((c) => `<th class="tag px-3 py-3 font-normal text-faint">${inline(c)}</th>`).join('')}</tr></thead><tbody class="divide-y divide-line">${filas
        .map((f) => `<tr>${f.map((c, k) => `<td class="px-3 py-2.5 align-top ${k === 0 ? 'font-medium text-bone' : 'text-mute'}">${inline(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody></table></div>`);
      continue;
    }

    // Cita: texto para copiar
    if (l.startsWith('>')) {
      cerrarParrafo();
      const bloque: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) bloque.push(lines[i++].replace(/^>\s?/, ''));
      const texto = bloque.join('\n').trim();
      out.push(`<div class="mt-4 border-l-2 border-signal bg-panel p-4"><p class="whitespace-pre-line leading-relaxed text-bone">${inline(texto)}</p><div class="mt-3">${btn('guia-copiar', 'Copiar texto', { texto })}</div></div>`);
      continue;
    }

    // Listas (con un nivel de anidación)
    if (/^\s*(-|\d+\.)\s/.test(l)) {
      cerrarParrafo();
      const ordenada = /^\s*\d+\./.test(l);
      const items: string[] = [];
      while (i < lines.length && /^\s*(-|\d+\.)\s/.test(lines[i])) {
        const m = /^(\s*)(?:-|\d+\.)\s+(.*)$/.exec(lines[i])!;
        const sangria = m[1].length >= 2;
        const texto = m[2].replace(/^\[( |x)\]\s/, (_, x) => (x === 'x' ? '☑ ' : '☐ '));
        items.push(`<li class="${sangria ? 'ml-5 ' : ''}leading-relaxed text-mute">${inline(texto)}</li>`);
        i++;
      }
      out.push(`<${ordenada ? 'ol' : 'ul'} class="mt-3 space-y-1.5 ${ordenada ? 'list-decimal pl-5' : 'list-disc pl-5'} marker:text-faint">${items.join('')}</${ordenada ? 'ol' : 'ul'}>`);
      continue;
    }

    parrafo.push(l.trim());
    i++;
  }
  cerrarParrafo();
  return out.join('\n');
}

/* ------------------------------ vista ------------------------------ */
export function guiaView(d: Data, seleccion: string, consulta: string) {
  const docs = guiaActual(d);
  const editable = guiaEditable(d);
  const q = consulta.trim().toLowerCase();
  const visibles = q ? docs.filter((x) => `${x.titulo} ${x.contenido}`.toLowerCase().includes(q)) : docs;
  const actual = docs.find((x) => x.titulo === seleccion) ?? visibles[0] ?? docs[0];

  const banner = editable
    ? ''
    : `<div class="mb-6 flex flex-wrap items-center justify-between gap-4 border border-signal/60 bg-signal/5 p-4"><p class="max-w-2xl text-sm leading-relaxed text-bone">Esta es la guía inicial. Para editarla y sumar tus propios documentos, habilitá la edición: se copia a tu base y desde ahí cada cambio queda guardado.</p>${btn('catalogo-habilitar', 'Habilitar edición', { what: 'guia' })}</div>`;

  const nav = seccionesGuia
    .map((s) => {
      const items = visibles.filter((x) => x.seccion === s);
      if (!items.length) return '';
      return `<div><p class="tag text-faint">${esc(s)}</p><ul class="mt-2 grid gap-1">${items
        .map((x) => `<li><button type="button" data-action="guia-doc" data-titulo="${esc(x.titulo)}" class="w-full border-l-2 px-3 py-2.5 text-left text-sm transition-colors md:py-2 ${x.titulo === actual?.titulo ? 'border-signal bg-signal/10 text-bone' : 'border-line text-mute hover:text-bone'}">${esc(x.titulo)}</button></li>`)
        .join('')}</ul></div>`;
    })
    .join('');

  const cuerpo = actual
    ? `<article class="border border-line bg-panel p-5 md:p-8">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div><p class="tag text-signal">${esc(actual.seccion)}</p><h2 class="display mt-2 text-3xl text-bone md:text-4xl">${esc(actual.titulo)}</h2></div>
          ${editable && actual.id ? btn('open', 'Editar', { res: 'guia', id: actual.id }) : ''}
        </div>
        <div class="mt-2">${renderMarkdown(actual.contenido)}</div>
      </article>`
    : '<p class="border border-line p-6 text-mute">No hay documentos que coincidan con la búsqueda.</p>';

  return `${banner}
  <div class="grid gap-6 lg:grid-cols-[17rem_1fr]">
    <aside class="grid content-start gap-5">
      <input type="search" data-action="guia-q" value="${esc(consulta)}" placeholder="Buscar en la guía" aria-label="Buscar en la guía" class="w-full border border-line-strong bg-ink px-3 py-3 text-base text-bone focus:border-signal focus:outline-none md:py-2 md:text-sm" />
      ${nav || '<p class="text-sm text-faint">Sin resultados.</p>'}
      ${editable ? '<div><button type="button" data-action="new" data-res="guia" class="border border-line-strong px-3 py-2.5 text-sm text-bone hover:border-signal">+ Nuevo documento</button></div>' : ''}
    </aside>
    ${cuerpo}
  </div>`;
}
