/**
 * Panel de codificación (futsal). Contenido y generación en un solo archivo.
 * Uso: npm run panel
 */
import path from 'node:path';
import * as P from './lib.mjs';
import { C } from './lib.mjs';

const meta = {
  titulo: 'Panel de codificación',
  subtitulo: 'Capturar lo que importa, no todo',
  autor: 'Pablo Granados',
  version: 'Versión 1',
};

const intro = [
  'Codificar todo es la forma más rápida de no analizar nada. Un panel sirve cuando cada botón responde una pregunta que ya tenías antes de abrir el video.',
  'Este panel parte del mapa de observación, está pensado para futsal y se adapta a fútbol cambiando zonas y estructuras. Sirve en Nacsport, LongoMatch o en una hoja de cálculo.',
];

const reglas = [
  { t: 'Una pregunta, un panel', d: 'Armá el panel según la pregunta del partido, no según todo lo que podés medir. Si la pregunta es la transición defensiva, no abras categorías de pelota parada.' },
  { t: 'Pocas categorías', d: 'Entre 6 y 10 botones. Con más, codificás tarde, te equivocás de botón y nunca terminás el partido.' },
  { t: 'Describir antes que juzgar', d: 'Los botones registran qué pasó y dónde. La valoración ("bien", "mal") va después, mirando los clips juntos.' },
  { t: 'Descriptores con opciones cerradas', d: 'Zona, resultado y estructura con 3 o 4 valores fijos. Si escribís texto libre, después no podés contar.' },
];

/** categoría → descriptores (nombre: valores) y para qué sirve */
const categorias = [
  {
    nombre: 'Ataque organizado',
    para: 'Cómo construye y llega el equipo con la pelota controlada.',
    pregunta: '¿Cómo y por dónde progresa el equipo, y cómo termina la posesión?',
    desc: [
      ['Estructura', '3-1 · 2-2 · 4-0 · Otra'],
      ['Zona de inicio', 'Propia · Media · Rival'],
      ['Resultado', 'Remate · Pérdida · Falta recibida · Saque'],
    ],
  },
  {
    nombre: 'Defensa organizada',
    para: 'Cómo defiende cuando el rival ataca con la estructura armada.',
    pregunta: '¿Dónde se presiona y qué consigue la presión?',
    desc: [
      ['Tipo', 'Presión alta · Media · Baja · Individual'],
      ['Resultado', 'Recuperación · Falta · Remate recibido · Gol recibido'],
    ],
  },
  {
    nombre: 'Transición ofensiva',
    para: 'Qué hace el equipo en los primeros segundos después de recuperar.',
    pregunta: '¿Ataca rápido o asegura la posesión, y le sirve?',
    desc: [
      ['Zona de recuperación', 'Propia · Media · Rival'],
      ['Decisión', 'Directo · Pausa · Pérdida inmediata'],
      ['Resultado', 'Remate · Falta · Pérdida'],
    ],
  },
  {
    nombre: 'Transición defensiva',
    para: 'Qué hace el equipo en los primeros segundos después de perder.',
    pregunta: '¿Reacciona o se desordena? ¿Dónde pierde la pelota?',
    desc: [
      ['Zona de pérdida', 'Propia · Media · Rival'],
      ['Reacción', 'Presiona · Se repliega · Falta táctica · Tarde'],
      ['Resultado', 'Recupera · Remate recibido · Gol recibido · Se ordena'],
    ],
  },
  {
    nombre: 'Pelota parada',
    para: 'Jugadas de saque con rutina: a favor y en contra.',
    pregunta: '¿Qué rutinas se repiten y qué producen?',
    desc: [
      ['Tipo', 'Saque de banda · Córner · Tiro libre · Saque de meta · Doble penal'],
      ['Lado', 'A favor · En contra'],
      ['Resultado', 'Remate · Gol · Pérdida · Sin continuidad'],
    ],
  },
  {
    nombre: 'Portero-jugador',
    para: 'Períodos con quinto jugador de campo, propios o del rival.',
    pregunta: '¿Cuándo se activa, qué produce y qué riesgo cuesta?',
    desc: [
      ['Lado', 'Propio · Rival'],
      ['Estructura', '3-2 · 4-1 · Otra'],
      ['Resultado', 'Remate · Gol a favor · Gol en contra (arco vacío) · Pérdida'],
    ],
  },
  {
    nombre: 'Remate',
    para: 'Todos los remates, de ambos equipos.',
    pregunta: '¿Desde dónde y cómo se genera cada remate?',
    desc: [
      ['Zona', 'Central cercana · Lateral · Lejana'],
      ['Origen', '1v1 · Pared · Segunda jugada · Pelota parada · Transición'],
      ['Resultado', 'Gol · Atajado · Afuera · Bloqueado · Poste'],
    ],
  },
  {
    nombre: 'Falta',
    para: 'Faltas de ambos equipos y control de acumuladas.',
    pregunta: '¿Dónde y cuándo se faltan? ¿Se llega a las acumuladas con margen?',
    desc: [
      ['Lado', 'Cometida · Recibida'],
      ['Zona', 'Propia · Media · Rival'],
      ['Acumulada', '1 · 2 · 3 · 4 · 5 o más'],
    ],
  },
];

const errores = [
  'Codificar el partido entero en vivo: se pierde el criterio. Marcá lo esencial y completá viendo el video.',
  'Cambiar el panel cada partido: no podés comparar. Cambialo por temporada o por una pregunta nueva, no por capricho.',
  'Agregar un botón "por si acaso": cada botón extra cuesta tiempo en todos los partidos.',
  'Mezclar descripción y juicio en el mismo botón ("pérdida mala"): después no sabés qué contabas.',
];

const ejemploPasos = [
  'Elegí la pregunta del partido (por ejemplo, la transición defensiva).',
  'Dejá activas solo las categorías relacionadas (en este caso: Transición defensiva, Remate y Falta).',
  'Codificá en vivo solo lo esencial: el momento y la categoría. Los descriptores los completás al revisar el video.',
  'Al terminar, filtrá por resultado: "Gol recibido" y "Remate recibido" son los clips para mostrar.',
];

const cierre = {
  titulo: 'Hay más plantillas gratis',
  texto: 'Mapa de observación, ficha de partido y checklist semanal, en la web. Y si querés armar tu panel con devolución sobre tus partidos, eso es lo que hacemos en Sistema Propio: dtpablogranados.vercel.app/mentoria',
  url: 'dtpablogranados.vercel.app/plantillas',
};

/* ------------------------------ PDF ------------------------------ */
function buildPdf(file) {
  const ctx = P.createPdf(file, meta);
  const { doc, L, CW } = ctx;

  P.cover(ctx, 'Plantilla gratuita · Futsal y fútbol');
  P.para(ctx, intro[0]);
  P.para(ctx, intro[1], { size: 11, color: C.MUTE, gap: 1.6 });
  P.label(ctx, 'Cuatro reglas antes de armar nada');
  reglas.forEach((r) => {
    ctx.need(60);
    doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(11.5).text(r.t, L, doc.y, { width: CW });
    doc.fillColor(C.TEXT).font('Helvetica').fontSize(10.5).text(r.d, { width: CW, lineGap: 2 });
    doc.moveDown(0.6);
  });

  doc.addPage();
  P.label(ctx, 'El panel');
  doc.fillColor(C.MUTE).font('Helvetica').fontSize(10).text('Cada categoría es un botón. Cada descriptor es una etiqueta con opciones cerradas.', L, doc.y, { width: CW });
  doc.moveDown(1);
  categorias.forEach((c, i) => {
    const h = 40 + c.desc.length * 16 + doc.heightOfString(c.pregunta, { width: CW - 14 });
    ctx.need(h + 20);
    P.bar(ctx, `${String(i + 1).padStart(2, '0')}  ${c.nombre}`);
    const top = doc.y;
    P.field(ctx, 'Responde', c.pregunta);
    c.desc.forEach(([n, v]) => {
      doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(10).text(`${n}: `, L + 14, doc.y, { continued: true, width: CW - 14 })
        .fillColor(C.TEXT).font('Helvetica').text(v);
      doc.moveDown(0.15);
    });
    doc.rect(L, top, 2, doc.y - top).fill(C.LINE);
    doc.y += 12;
  });

  doc.addPage();
  P.label(ctx, 'Cómo cargarlo en tu herramienta');
  P.para(ctx, 'En Nacsport y herramientas similares, cada categoría es un botón y los descriptores son las etiquetas que se agregan a cada clip. En LongoMatch, cada categoría lleva sus etiquetas. En una hoja de cálculo, usá la hoja "Registro" de esta plantilla: ya trae los menús desplegables.', { size: 11 });
  P.label(ctx, 'Un partido, paso a paso');
  P.steps(ctx, ejemploPasos);
  doc.moveDown(0.6);
  P.label(ctx, 'Errores que se repiten');
  errores.forEach((e) => {
    ctx.need(40);
    const y = doc.y;
    doc.rect(L, y + 6, 8, 1.5).fill(C.SIGNAL);
    doc.fillColor(C.TEXT).font('Helvetica').fontSize(10.5).text(e, L + 18, y, { width: CW - 18, lineGap: 2 });
    doc.moveDown(0.5);
  });
  doc.moveDown(0.8);
  P.closing(ctx, cierre);
  P.finish(ctx);
}

/* ------------------------------ XLSX ------------------------------ */
async function buildXlsx(file) {
  const wb = P.workbook(meta);
  P.guideSheet(wb, meta, intro, [
    'En la hoja "Panel" está el diseño: categorías, descriptores y para qué sirve cada una. Copialo a tu software o usalo tal cual.',
    'En la hoja "Registro" anotás cada jugada: minuto, categoría y descriptores. Los menús desplegables evitan escribir distinto lo mismo.',
    'La hoja "Resumen" cuenta sola cuántas jugadas hay de cada categoría y cuántas terminaron en cada resultado.',
  ], 'Para otro partido, copiá la hoja "Registro" y renombrala con el rival.');

  /* Panel */
  const pn = wb.addWorksheet('Panel', { views: [{ state: 'frozen', ySplit: 1 }] });
  pn.columns = [{ header: 'Categoría (botón)', width: 24 }, { header: 'Responde', width: 46 }, { header: 'Descriptor', width: 22 }, { header: 'Opciones', width: 60 }];
  P.styleHeader(pn.getRow(1));
  let r = 2;
  categorias.forEach((c, ci) => {
    c.desc.forEach(([n, v], di) => {
      const row = pn.getRow(r);
      row.values = [di === 0 ? c.nombre : '', di === 0 ? c.pregunta : '', n, v];
      row.alignment = P.wrap;
      row.height = di === 0 ? 34 : 20;
      row.getCell(1).font = { bold: true };
      for (let k = 1; k <= 4; k++) {
        row.getCell(k).fill = P.fillOf(ci % 2 === 0 ? 'FFF7F8F9' : 'FFFFFFFF');
        row.getCell(k).border = { bottom: { style: 'hair', color: { argb: 'FFD9DDE1' } } };
      }
      r++;
    });
  });

  /* Listas para los menús */
  const lists = wb.addWorksheet('Listas', { state: 'hidden' });
  lists.getColumn(1).values = ['Categoría', ...categorias.map((c) => c.nombre)];
  const tiempos = ['1T', '2T', 'Prórroga'];
  lists.getColumn(2).values = ['Tiempo', ...tiempos];
  const zonas = ['Propia', 'Media', 'Rival'];
  lists.getColumn(3).values = ['Zona', ...zonas];
  const resultados = ['Remate', 'Gol', 'Pérdida', 'Falta', 'Recuperación', 'Remate recibido', 'Gol recibido', 'Sin continuidad'];
  lists.getColumn(4).values = ['Resultado', ...resultados];
  const lados = ['A favor', 'En contra'];
  lists.getColumn(5).values = ['Lado', ...lados];

  /* Registro */
  const rg = wb.addWorksheet('Registro', { views: [{ state: 'frozen', ySplit: 1 }] });
  rg.columns = [
    { header: 'Min', width: 8 },
    { header: 'Tiempo', width: 10 },
    { header: 'Categoría', width: 24 },
    { header: 'Lado', width: 12 },
    { header: 'Zona', width: 12 },
    { header: 'Descriptor (estructura, tipo, origen)', width: 34 },
    { header: 'Resultado', width: 20 },
    { header: 'Jugadores', width: 20 },
    { header: 'Nota / clip', width: 40 },
  ];
  P.styleHeader(rg.getRow(1));
  const ROWS = 200;
  for (let i = 2; i <= ROWS + 1; i++) {
    rg.getCell(`B${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['Listas!$B$2:$B$4'] };
    rg.getCell(`C${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [`Listas!$A$2:$A$${categorias.length + 1}`] };
    rg.getCell(`D${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['Listas!$E$2:$E$3'] };
    rg.getCell(`E${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['Listas!$C$2:$C$4'] };
    rg.getCell(`G${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['Listas!$D$2:$D$9'] };
    rg.getRow(i).getCell(1).alignment = { horizontal: 'center' };
  }
  rg.autoFilter = { from: 'A1', to: `I${ROWS + 1}` };

  /* Resumen */
  const rs = wb.addWorksheet('Resumen');
  rs.columns = [{ header: 'Categoría', width: 26 }, { header: 'Jugadas', width: 12 }, ...resultados.slice(0, 7).map((x) => ({ header: x, width: 16 }))];
  P.styleHeader(rs.getRow(1));
  categorias.forEach((c, i) => {
    const n = i + 2;
    const row = [c.nombre, { formula: `COUNTIF(Registro!$C$2:$C$${ROWS + 1},A${n})` }];
    resultados.slice(0, 7).forEach((res) => row.push({ formula: `COUNTIFS(Registro!$C$2:$C$${ROWS + 1},$A${n},Registro!$G$2:$G$${ROWS + 1},"${res}")` }));
    rs.getRow(n).values = row;
  });
  rs.getCell(`A${categorias.length + 4}`).value = 'Filtrá la hoja "Registro" por resultado (por ejemplo, "Gol recibido") para armar los clips del informe.';
  rs.getCell(`A${categorias.length + 4}`).font = { italic: true, color: { argb: 'FF5D646D' } };

  await wb.xlsx.writeFile(file);
}

buildPdf(path.join(P.outDir, 'panel-de-codificacion.pdf'));
await buildXlsx(path.join(P.outDir, 'panel-de-codificacion.xlsx'));
console.log('Listo: panel-de-codificacion');
