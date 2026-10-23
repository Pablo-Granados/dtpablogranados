/**
 * Genera los documentos del plan a partir de los datos:
 *   marketing/calendario/semana-XX.md   plan completo de cada semana (feed, reel e historias)
 *   marketing/calendario/resumen.md     las 14 semanas en una tabla
 *   marketing/calendario/calendario-panel.csv   para importar en el panel (Contenido → Importar)
 * Uso: node marketing/herramientas/generar.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { semanas, palabrasClave } from './datos/index.mjs';
import { altDiapositiva, altHistoria, archivoHistoria, archivoPortadaReel, archivoSlide, fechaDe, formatoLabel, hashtagsDe, NOMBRE_DIA } from './lib.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const salida = path.join(raiz, 'calendario');
fs.mkdirSync(salida, { recursive: true });

const pad = (n) => String(n).padStart(2, '0');
const cita = (t) => t.split('\n').map((l) => `> ${l}`.trimEnd()).join('\n');
const describir = (layout, p) => {
  switch (layout) {
    case 'portada': return `**${p.titulo}**${p.sub ? ` · ${p.sub}` : ''}`;
    case 'punto': return `**${p.n}. ${p.titulo}** · ${p.texto}`;
    case 'lista': return `**${p.titulo}** · ${p.items.join(' · ')}`;
    case 'dato': return `**${p.valor}** · ${p.texto}`;
    case 'cita': return `**${p.texto}**`;
    case 'captura': return `**${p.titulo}** · imagen: ${p.img.split('/').pop()} · pie: ${p.pie}`;
    case 'cta': return `**${p.titulo}**${p.texto ? ` · ${p.texto}` : ''} · botón: ${p.boton}`;
    default: return p.titulo ?? '';
  }
};

function docPieza(semana, pieza) {
  const f = fechaDe(semana, pieza.dia);
  const L = [];
  L.push(`### ${NOMBRE_DIA[pieza.dia]} ${f.corta} · ${pieza.hora} · ${formatoLabel[pieza.formato]} · ${pieza.pilar}`);
  L.push('');
  L.push(`**${pieza.titulo}**${pieza.condicional ? '  ⚠️ CONDICIONAL' : ''}`);
  L.push('');
  L.push(`- **Objetivo:** ${pieza.objetivo}`);
  L.push(`- **Gancho (primera línea):** ${pieza.gancho}`);
  L.push(`- **Llamado a la acción:** ${pieza.cta}`);
  if (pieza.condicional) L.push(`- **Atención:** ${pieza.alternativa}`);
  L.push('');

  if (pieza.formato === 'reel') {
    L.push('#### Guion (voz sobre video)');
    L.push('');
    L.push('| Tiempo | Voz en off | En pantalla |');
    L.push('|---|---|---|');
    for (const g of pieza.guion) L.push(`| ${g.t} | ${g.voz} | ${g.pantalla} |`);
    L.push('');
    L.push(`**Portada del reel (9:16):** «${pieza.portada.titulo}» · archivo: \`piezas/${archivoPortadaReel(semana, pieza)}\``);
    L.push('');
  } else {
    L.push(`#### ${pieza.formato === 'imagen' ? 'Imagen' : 'Diapositivas'} (1080 × 1350, formato 4:5)`);
    L.push('');
    pieza.slides.forEach(([layout, p], i) => {
      const n = i + 1;
      L.push(`${n}. ${describir(layout, p)}`);
      L.push(`   - Archivo: \`piezas/${archivoSlide(semana, pieza, n)}\``);
      L.push(`   - Texto alternativo: ${pieza.alts?.[i] ?? altDiapositiva(layout, p, n, pieza.slides.length)}`);
    });
    L.push('');
  }

  L.push('#### Caption (copiar y pegar)');
  L.push('');
  L.push('```');
  L.push(pieza.caption);
  L.push('');
  L.push(hashtagsDe(pieza).join(' '));
  L.push('```');
  L.push('');
  L.push('#### Texto alternativo general');
  L.push('');
  L.push(cita(pieza.alt));
  L.push('');
  L.push(`**Tip de producción:** ${pieza.tip}`);
  L.push('');
  L.push('---');
  L.push('');
  return L.join('\n');
}

function docHistorias(semana) {
  const L = [];
  L.push('## Historias (9:16, 1080 × 1920)');
  L.push('');
  L.push('Zona segura: dejá libres los primeros 250 px de arriba y los últimos 340 px de abajo (los tapa la interfaz de Instagram). Los stickers interactivos se agregan en la app.');
  L.push('');
  for (const d of semana.stories) {
    const f = fechaDe(semana, d.dia);
    L.push(`### ${NOMBRE_DIA[d.dia]} ${f.corta}`);
    L.push('');
    L.push(`**Objetivo:** ${d.objetivo}`);
    L.push('');
    d.frames.forEach((fr, i) => {
      const n = i + 1;
      L.push(`${n}. **${fr.titulo}**${fr.texto ? ` · ${fr.texto}` : ''}${fr.items ? ` · ${fr.items.join(' · ')}` : ''}${fr.opciones ? ` · opciones: ${fr.opciones.join(' / ')}` : ''}${fr.pie ? ` · pie: ${fr.pie}` : ''}`);
      if (fr.sticker) L.push(`   - Sticker: ${fr.sticker}`);
      if (fr.enlace) L.push(`   - Enlace: ${fr.enlace}`);
      L.push(`   - Archivo: \`piezas/${archivoHistoria(semana, d, n)}\``);
      L.push(`   - Texto alternativo: ${altHistoria(fr, n, d.frames.length)}`);
    });
    L.push('');
  }
  L.push('**Fines de semana:** sábado y domingo son libres. Subí algo espontáneo (un partido que viste, una respuesta de la cajita de preguntas, una captura del proceso). Si no tenés ganas, descansá: la constancia se mide por semana, no por día.');
  L.push('');
  return L.join('\n');
}

/* ---------------- un documento por semana ---------------- */
for (const s of semanas) {
  const fin = fechaDe(s, 'dom');
  const ini = fechaDe(s, 'lun');
  const partes = [];
  partes.push(`# Semana ${s.n}: ${s.tema}`);
  partes.push('');
  partes.push(`**${ini.corta} al ${fin.corta}** · Fase: ${s.fase}`);
  partes.push('');
  partes.push(`- **Objetivo de la semana:** ${s.objetivo}`);
  partes.push(`- **Qué medir:** ${s.meta}`);
  partes.push('');
  partes.push('## Resumen de la semana');
  partes.push('');
  partes.push('| Día | Hora | Formato | Pilar | Pieza |');
  partes.push('|---|---|---|---|---|');
  for (const p of [...s.piezas].sort((a, b) => ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].indexOf(a.dia) - ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].indexOf(b.dia))) {
    partes.push(`| ${NOMBRE_DIA[p.dia]} ${fechaDe(s, p.dia).corta} | ${p.hora} | ${formatoLabel[p.formato]} | ${p.pilar} | ${p.titulo}${p.condicional ? ' ⚠️' : ''} |`);
  }
  partes.push('');
  partes.push('## Feed y reel');
  partes.push('');
  const orden = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
  for (const p of [...s.piezas].sort((a, b) => orden.indexOf(a.dia) - orden.indexOf(b.dia))) partes.push(docPieza(s, p));
  partes.push(docHistorias(s));
  fs.writeFileSync(path.join(salida, `semana-${pad(s.n)}.md`), partes.join('\n'));
}

/* ---------------- resumen de las 14 semanas ---------------- */
const R = [];
R.push('# Resumen de las 14 semanas');
R.push('');
R.push('| Semana | Fechas | Fase | Tema | Feed y reel |');
R.push('|---|---|---|---|---|');
for (const s of semanas) {
  R.push(`| [${s.n}](semana-${pad(s.n)}.md) | ${fechaDe(s, 'lun').corta} al ${fechaDe(s, 'dom').corta} | ${s.fase} | ${s.tema} | ${s.piezas.length} piezas |`);
}
R.push('');
R.push('## Palabras clave para pedir por mensaje');
R.push('');
R.push('| Palabra | Para qué sirve |');
R.push('|---|---|');
for (const [k, v] of Object.entries(palabrasClave)) R.push(`| ${k} | ${v} |`);
R.push('');
fs.writeFileSync(path.join(salida, 'resumen.md'), R.join('\n'));

/* ---------------- CSV para el panel ---------------- */
const tipoPanel = (p) => (p.pilar === 'Datos' ? 'Dato de la semana' : p.formato === 'reel' && p.pilar === 'Aprender' ? 'Análisis en 60 s' : p.pilar === 'Detrás' ? 'Detrás de la herramienta' : 'Otro');
const csv = (v) => `"${String(v).replace(/"/g, '""')}"`;
const filas = [['titulo', 'tipo', 'canal', 'fecha', 'estado', 'notas']];
for (const s of semanas) {
  for (const p of s.piezas) {
    const notas = `${formatoLabel[p.formato]} · ${p.pilar} · ${p.hora}\nGancho: ${p.gancho}\nCTA: ${p.cta}\nPlan completo: marketing/calendario/semana-${pad(s.n)}.md${p.condicional ? '\nCONDICIONAL: ' + p.alternativa : ''}`;
    filas.push([`S${pad(s.n)} · ${p.titulo}`, tipoPanel(p), 'Instagram', fechaDe(s, p.dia).iso, 'guion', notas.slice(0, 1400)]);
  }
}
fs.writeFileSync(path.join(salida, 'calendario-panel.csv'), '﻿' + filas.map((f) => f.map(csv).join(',')).join('\r\n'));

console.log(`Listo: ${semanas.length} semanas, ${filas.length - 1} piezas en el CSV.`);
