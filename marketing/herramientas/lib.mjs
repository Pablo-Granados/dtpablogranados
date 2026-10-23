/** Utilidades compartidas por el generador de documentos y el renderizador de piezas. */
import { hashtags } from './datos/comun.mjs';

export const DIAS = { lun: 0, mar: 1, 'mié': 2, jue: 3, vie: 4, 'sáb': 5, dom: 6 };
export const NOMBRE_DIA = { lun: 'Lunes', mar: 'Martes', 'mié': 'Miércoles', jue: 'Jueves', vie: 'Viernes', 'sáb': 'Sábado', dom: 'Domingo' };

const pad = (n) => String(n).padStart(2, '0');

/** Fecha de una pieza: el lunes de la semana más el desfase del día. Devuelve { iso, corta }. */
export function fechaDe(semana, dia) {
  const [y, m, d] = semana.inicio.split('-').map(Number);
  const f = new Date(Date.UTC(y, m - 1, d + (DIAS[dia] ?? 0)));
  const iso = `${f.getUTCFullYear()}-${pad(f.getUTCMonth() + 1)}-${pad(f.getUTCDate())}`;
  return { iso, corta: `${pad(f.getUTCDate())}/${pad(f.getUTCMonth() + 1)}` };
}

export const formatoLabel = { carrusel: 'Carrusel', imagen: 'Imagen', reel: 'Reel' };

/** Hashtags de una pieza: 3 base + los del pilar (reels llevan menos). */
export function hashtagsDe(pieza) {
  if (pieza.hashtags) return pieza.hashtags;
  const lista = [...hashtags.base, ...(hashtags[pilarClave(pieza.pilar)] ?? [])];
  return lista.slice(0, pieza.formato === 'reel' ? 5 : 7);
}
const pilarClave = (p) => p;

/** Texto alternativo automático de una diapositiva a partir de lo que dice. */
export function altDiapositiva(layout, p, i, total) {
  const pos = total > 1 ? `Diapositiva ${i} de ${total}. ` : '';
  const base = `${pos}Fondo oscuro con letras blancas y acento cian. `;
  switch (layout) {
    case 'portada':
      return `${base}Título: «${p.titulo}». ${p.sub ?? ''}`.trim();
    case 'punto':
      return `${base}Punto ${p.n}: «${p.titulo}». ${p.texto}`.trim();
    case 'lista':
      return `${base}«${p.titulo}»: ${p.items.join('; ')}.`;
    case 'dato':
      return `${base}Dato destacado «${p.valor}». ${p.texto}`.trim();
    case 'cita':
      return `${base}Frase: «${p.texto}»`;
    case 'captura':
      return `${pos}Captura de pantalla: ${p.pie}. Título sobre la imagen: «${p.titulo}».`;
    case 'cta':
      return `${base}Cierre: «${p.titulo}». ${p.texto ?? ''} Botón: ${p.boton}.`.replace(/\s+/g, ' ').trim();
    default:
      return `${base}${p.titulo ?? ''}`.trim();
  }
}

/** Texto alternativo automático de una historia (9:16). */
export function altHistoria(f, i, total) {
  const pos = total > 1 ? `Historia ${i} de ${total}. ` : '';
  const base = `${pos}Fondo oscuro con letras blancas y acento cian. `;
  switch (f.layout) {
    case 'texto':
      return `${base}«${f.titulo}». ${f.texto ?? ''}`.trim();
    case 'lista':
      return `${base}«${f.titulo}»: ${f.items.join('; ')}.`;
    case 'encuesta':
      return `${base}Pregunta: «${f.titulo}». Opciones de la encuesta: ${f.opciones.join(' o ')}.`;
    case 'pregunta':
      return `${base}«${f.titulo}». Espacio para el sticker de preguntas.`;
    case 'cuenta':
      return `${base}«${f.titulo}». Fecha: ${f.fecha}.`;
    case 'captura':
      return `${pos}Captura de pantalla: ${f.pie}. Título: «${f.titulo}».`;
    case 'cta':
      return `${base}«${f.titulo}». ${f.texto ?? ''} Enlace: ${f.enlace}.`.replace(/\s+/g, ' ').trim();
    default:
      return `${base}${f.titulo ?? ''}`.trim();
  }
}

export const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Nombre de archivo de una diapositiva de feed. */
export const archivoSlide = (semana, pieza, i) => `semana-${pad(semana.n)}/${pieza.id}-${pad(i)}.png`;
export const archivoPortadaReel = (semana, pieza) => `semana-${pad(semana.n)}/${pieza.id}-portada.png`;
export const archivoHistoria = (semana, dia, i) => `semana-${pad(semana.n)}/historias/${dia.dia}-${i}.png`;
