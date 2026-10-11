/** Vista de Mensajes: los textos de contacto, agrupados por paso, con edición cuando está habilitada. */
import { pasos } from '@/data/mensajes';
import { edicionHabilitada, mensajesActuales } from './admin-catalogo';
import { btn, esc, type Data } from './admin-utils';

/** Aviso para pasar los textos iniciales a la base. Se muestra solo mientras la base está vacía. */
export function bannerEdicion(d: Data, que: 'mensajes' | 'programa') {
  if (edicionHabilitada(d, que)) return '';
  return `<div class="mb-6 flex flex-wrap items-center justify-between gap-4 border border-signal/60 bg-signal/5 p-4">
    <p class="max-w-2xl text-sm leading-relaxed text-bone">Estos son los textos iniciales. Para editarlos desde el panel, habilitá la edición: se copian a tu base y, desde ahí, cada cambio queda guardado.</p>
    ${btn('catalogo-habilitar', 'Habilitar edición', { what: que })}
  </div>`;
}

const efecto = (m: { avanza?: string; dias?: number | null }) => (m.avanza ? `Pasa a "${m.avanza}"` : m.dias === undefined ? '' : m.dias === null ? 'Quita el seguimiento' : `Seguimiento en ${m.dias} días`);

export function mensajesView(d: Data) {
  const editable = edicionHabilitada(d, 'mensajes');
  const lista = mensajesActuales();

  const grupos = pasos
    .map((paso) => ({ paso, items: lista.filter((m) => m.paso === paso) }))
    .filter((g) => g.items.length)
    .map(
      (g) => `<section>
        <h3 class="tag text-signal">${esc(g.paso)}</h3>
        <div class="mt-3 grid gap-3 lg:grid-cols-2">${g.items
          .map((m) => {
            const chips = [m.tipos?.length ? `Para: ${m.tipos.join(', ')}` : '', m.origenes?.length ? `Si llegó por: ${m.origenes.join(', ')}` : '', efecto(m)].filter(Boolean);
            return `<article class="border border-line bg-panel p-4">
              <div class="flex items-start justify-between gap-3">
                <p class="font-medium text-bone">${esc(m.titulo)}</p>
                ${editable ? btn('open', 'Editar', { res: 'mensajes', id: m.id }) : ''}
              </div>
              ${chips.length ? `<p class="mt-1 text-xs text-faint">${esc(chips.join(' · '))}</p>` : ''}
              <p class="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-mute">${esc(m.texto)}</p>
            </article>`;
          })
          .join('')}</div>
      </section>`,
    )
    .join('');

  return `${bannerEdicion(d, 'mensajes')}
  <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
    <p class="max-w-2xl text-sm text-mute">Los mensajes que aparecen en la ficha de cada prospecto. Entre llaves van los datos que se completan solos: <code class="text-bone">{nombre}</code>, <code class="text-bone">{organizacion}</code> y <code class="text-bone">{sitio}</code>. Lo que va entre [corchetes] lo completás a mano al enviar.</p>
    ${editable ? '<button type="button" data-action="new" data-res="mensajes" class="bg-signal px-4 py-3 text-sm font-semibold text-ink hover:bg-bone md:py-2">+ Nuevo mensaje</button>' : ''}
  </div>
  <div class="grid gap-8">${grupos}</div>`;
}
