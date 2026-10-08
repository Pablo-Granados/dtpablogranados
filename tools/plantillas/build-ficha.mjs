/**
 * Ficha de partido propio (una página). Contenido y generación en un solo archivo.
 * Uso: npm run ficha
 */
import path from 'node:path';
import * as P from './lib.mjs';
import { C } from './lib.mjs';

const meta = {
  titulo: 'Ficha de partido propio',
  subtitulo: 'Del partido a una página',
  autor: 'Pablo Granados',
  version: 'Versión 1',
};

const intro = [
  'Un informe post-partido sirve si el cuerpo técnico lo lee en cinco minutos y sale con una decisión para la semana. Si no cabe en una página, todavía no sabés qué querés decir.',
  'Esta ficha ordena lo que pasó, lo que cambia y qué clips mostrar. Tiene espacio para escribir a mano y una versión editable en hoja de cálculo.',
];

const reglas = [
  { t: 'Una pregunta', d: 'Antes de mirar, escribí qué querías saber del partido. Todo lo demás se ordena a partir de eso.' },
  { t: 'Tres hallazgos como máximo', d: 'Cada uno con su minuto. Si tenés siete, elegiste mal: dejá los tres que cambian algo.' },
  { t: 'Una decisión', d: 'Qué se entrena en la semana y cómo vas a saber si funcionó. Sin decisión no hay informe, hay descripción.' },
  { t: 'Cinco clips', d: 'Los que prueban los hallazgos. Más clips no convencen más: cansan.' },
];

const campos = {
  datos: ['Rival', 'Fecha', 'Competencia / jornada', 'Resultado', 'Analista'],
  pregunta: 'La pregunta del partido',
  hallazgos: 'Qué pasó (máximo 3, con minuto)',
  funciono: 'Qué funcionó',
  corregir: 'Qué corregir',
  numeros: 'Números clave',
  decision: 'La decisión de la semana',
  clips: 'Clips para mostrar',
};

const ejemplo = {
  contexto: 'Ejemplo ilustrativo. Los datos no son de un partido real.',
  datos: ['Rival: Equipo de ejemplo', 'Fecha: sábado', 'Competencia: Liga, jornada 8', 'Resultado: 2-3', 'Analista: —'],
  pregunta: '¿Por qué concedimos tres goles en transición si veníamos controlando la posesión?',
  hallazgos: [
    ['Tres de los goles salen de pérdidas en zona media con el ala derecha alta.', '12\' · 24\' · 31\''],
    ['El cierre del carril central llega tarde: el pivote queda lejos de la pelota.', '12\' · 31\''],
    ['Con el portero-jugador generamos 4 remates y no sufrimos goles a arco vacío.', '36\' a 39\''],
  ],
  funciono: ['Ataque organizado: 2-2 con pivote móvil.', 'Salida del portero-jugador con 3 opciones de pase.'],
  corregir: ['Pérdidas en zona media: criterio de reacción.', 'Equilibrio cuando sube el ala derecha.'],
  numeros: [['Remates', '14 vs 9'], ['Pérdidas en zona media', '11'], ['Goles en transición (en contra)', '3'], ['Faltas', '5 vs 7']],
  decision: 'Martes: pérdida en zona media con 4 jugadores. El más cercano presiona y los otros 3 cierran el centro. Objetivo: que en el próximo partido las pérdidas en zona media terminen en remate en contra menos del 25% de las veces.',
  clips: [['12\'', 'Primera pérdida y gol', 'Falta cerrar el centro.'], ['24\'', 'Segunda pérdida', 'Se repite el patrón.'], ['31\'', 'Tercer gol', 'El pivote queda lejos.'], ['18\'', 'Buen cierre', 'Así sí funciona.'], ['37\'', 'Portero-jugador', 'Lo que sostenemos.']],
};

/* ------------------------------ PDF ------------------------------ */
function buildPdf(file) {
  const ctx = P.createPdf(file, meta);
  const { doc, L, CW } = ctx;

  P.cover(ctx, 'Plantilla gratuita · Futsal y fútbol');
  P.para(ctx, intro[0]);
  P.para(ctx, intro[1], { size: 11, color: C.MUTE, gap: 1.6 });
  P.label(ctx, 'Cuatro reglas');
  reglas.forEach((r) => {
    ctx.need(60);
    doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(11.5).text(r.t, L, doc.y, { width: CW });
    doc.fillColor(C.TEXT).font('Helvetica').fontSize(10.5).text(r.d, { width: CW, lineGap: 2 });
    doc.moveDown(0.6);
  });

  /* Ficha en blanco: una sola página. Posiciones absolutas para que nunca se desborde. */
  doc.addPage();
  let y = 44;
  doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(18).text('FICHA DE PARTIDO', L, y, { characterSpacing: 1 });
  doc.rect(L, y + 24, 40, 3).fill(C.SIGNAL);
  y = 90;

  const tag = (t, x, yy, w) => doc.fillColor(C.MUTE).font('Helvetica-Bold').fontSize(7).text(t.toUpperCase(), x, yy, { width: w, characterSpacing: 1, lineBreak: false });
  const head8 = (t, yy) => doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(8).text(t.toUpperCase(), L, yy, { characterSpacing: 1.3, lineBreak: false });

  // Datos en dos filas de tres
  const colW = CW / 3;
  campos.datos.forEach((d, i) => {
    const x = L + (i % 3) * colW;
    const yy = y + Math.floor(i / 3) * 34;
    tag(d, x, yy, colW - 10);
    P.writeLine(doc, x, yy + 24, colW - 14);
  });
  y += 76;

  head8(campos.pregunta, y);
  P.writeLine(doc, L, y + 28, CW);
  y += 48;

  head8(campos.hallazgos, y);
  for (let i = 0; i < 3; i++) {
    const yy = y + 14 + i * 28;
    doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(10).text(String(i + 1), L, yy + 8, { lineBreak: false });
    P.writeLine(doc, L + 14, yy + 22, CW - 110);
    tag('Minuto / clip', L + CW - 86, yy + 12, 86);
    P.writeLine(doc, L + CW - 86, yy + 22, 86);
  }
  y += 14 + 3 * 28 + 14;

  const half = (CW - 20) / 2;
  [campos.funciono, campos.corregir].forEach((t, k) => {
    const x = L + k * (half + 20);
    doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(8).text(t.toUpperCase(), x, y, { characterSpacing: 1.3, lineBreak: false });
    P.writeLine(doc, x, y + 28, half);
    P.writeLine(doc, x, y + 50, half);
  });
  y += 72;

  head8(campos.numeros, y);
  const nw = (CW - 3 * 10) / 4;
  for (let i = 0; i < 4; i++) {
    const x = L + i * (nw + 10);
    doc.lineWidth(0.8).strokeColor(C.LINE).rect(x, y + 14, nw, 44).stroke();
    tag('Indicador', x + 6, y + 19, nw - 12);
  }
  y += 78;

  // La decisión: caja destacada
  doc.rect(L, y, CW, 92).fill(C.SOFT);
  doc.rect(L, y, 5, 92).fill(C.SIGNAL);
  doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(8).text(campos.decision.toUpperCase(), L + 18, y + 12, { characterSpacing: 1.3, lineBreak: false });
  [40, 62, 84].forEach((off) => P.writeLine(doc, L + 18, y + off, CW - 36));
  y += 112;

  head8(campos.clips, y);
  for (let i = 0; i < 5; i++) {
    const yy = y + 14 + i * 24;
    P.box(doc, L, yy + 4, 10);
    tag('Min', L + 18, yy + 8, 30);
    P.writeLine(doc, L + 42, yy + 16, 38);
    tag('Qué mostrar y qué decir', L + 92, yy + 8, 170);
    P.writeLine(doc, L + 252, yy + 16, CW - 252);
  }

  /* Ejemplo */
  doc.addPage();
  P.label(ctx, 'Ejemplo de ficha completa');
  doc.fillColor(C.MUTE).font('Helvetica').fontSize(10).text(ejemplo.contexto, L, doc.y, { width: CW });
  doc.moveDown(0.8);
  doc.fillColor(C.TEXT).font('Helvetica').fontSize(10).text(ejemplo.datos.join('   ·   '), L, doc.y, { width: CW, lineGap: 3 });
  doc.moveDown(0.8);
  P.callout(ctx, campos.pregunta, ejemplo.pregunta);
  P.bar(ctx, campos.hallazgos);
  ejemplo.hallazgos.forEach(([t, min], i) => {
    ctx.need(40);
    doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(11).text(`${i + 1}.  `, L, doc.y, { continued: true }).font('Helvetica').fillColor(C.TEXT).text(t, { width: CW });
    doc.fillColor(C.MUTE).fontSize(9).text(`Minuto: ${min}`, L + 18, doc.y, { width: CW - 18 });
    doc.moveDown(0.6);
  });
  doc.moveDown(0.3);
  const yh = doc.y;
  const w2 = (CW - 20) / 2;
  [['Qué funcionó', ejemplo.funciono], ['Qué corregir', ejemplo.corregir]].forEach(([t, list], k) => {
    const x = L + k * (w2 + 20);
    doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(9).text(t.toUpperCase(), x, yh, { width: w2, characterSpacing: 1.2 });
    let yy = yh + 14;
    list.forEach((item) => {
      doc.fillColor(C.TEXT).font('Helvetica').fontSize(10).text(`• ${item}`, x, yy, { width: w2, lineGap: 1.5 });
      yy = doc.y + 4;
    });
    doc.y = Math.max(doc.y, yy);
  });
  doc.y += 14;
  P.label(ctx, campos.numeros);
  doc.fillColor(C.TEXT).font('Helvetica').fontSize(10).text(ejemplo.numeros.map(([n, v]) => `${n}: ${v}`).join('   ·   '), L, doc.y, { width: CW, lineGap: 3 });
  doc.moveDown(1);
  P.callout(ctx, campos.decision, ejemplo.decision);
  P.label(ctx, campos.clips);
  ejemplo.clips.forEach(([min, que, msg]) => {
    ctx.need(18);
    doc.fillColor(C.TEXT).font('Helvetica').fontSize(10).text(`${min}  ·  ${que}  ·  ${msg}`, L, doc.y, { width: CW });
    doc.moveDown(0.3);
  });

  doc.moveDown(1.2);
  P.closing(ctx, {
    titulo: 'Hay más plantillas gratis',
    texto: 'Mapa de observación, panel de codificación y checklist semanal, en la web. Y si querés que revise tus fichas con vos, eso es lo que hacemos en Sistema Propio: dtpablogranados.vercel.app/mentoria',
    url: 'dtpablogranados.vercel.app/plantillas',
  });
  P.finish(ctx);
}

/* ------------------------------ XLSX ------------------------------ */
async function buildXlsx(file) {
  const wb = P.workbook(meta);
  P.guideSheet(wb, meta, intro, [
    'Completá la hoja "Ficha" después de revisar el partido, en unos 20 minutos.',
    'Escribí primero la pregunta del partido y la decisión. Recién después los hallazgos que la respaldan.',
    'Copiá la hoja "Ficha" para cada partido y renombrala con el rival. En "Historial" guardás un renglón por partido.',
  ], 'La hoja "Ejemplo" muestra una ficha completa con datos ilustrativos.');

  const ficha = (name, filled) => {
    const ws = wb.addWorksheet(name, { views: [{ showGridLines: false }] });
    ws.columns = [{ width: 24 }, { width: 28 }, { width: 70 }, { width: 18 }, { width: 18 }];
    ws.mergeCells('A1:E1');
    ws.getCell('A1').value = 'FICHA DE PARTIDO';
    ws.getCell('A1').font = { bold: true, size: 18 };
    ws.getRow(1).height = 30;
    let r = 3;
    const sec = (t) => {
      ws.mergeCells(`A${r}:E${r}`);
      const c = ws.getCell(`A${r}`);
      c.value = t.toUpperCase();
      Object.assign(c, P.head);
      ws.getRow(r).height = 22;
      r++;
    };
    const line = (a, b, c, d, e) => {
      const row = ws.getRow(r);
      row.values = [a, b, c ?? '', d ?? '', e ?? ''];
      row.alignment = P.wrap;
      row.height = 34;
      row.getCell(1).font = { bold: true, color: { argb: 'FF5D646D' } };
      [3, 4, 5].forEach((k) => (row.getCell(k).border = { bottom: { style: 'thin', color: { argb: 'FFB8BEC5' } } }));
      r++;
    };
    const f = filled ? ejemplo : null;

    sec('Datos');
    campos.datos.forEach((d, i) => line('', d, f ? f.datos[i].split(': ')[1] : ''));
    r++;
    sec(campos.pregunta);
    line('', 'Qué querías saber', f?.pregunta);
    r++;
    sec(campos.hallazgos);
    for (let i = 0; i < 3; i++) line('', `Hallazgo ${i + 1}`, f?.hallazgos[i][0], f?.hallazgos[i][1]);
    r++;
    sec(`${campos.funciono} · ${campos.corregir}`);
    for (let i = 0; i < 2; i++) line('Funcionó', `${i + 1}`, f?.funciono[i]);
    for (let i = 0; i < 2; i++) line('Corregir', `${i + 1}`, f?.corregir[i]);
    r++;
    sec(campos.numeros);
    for (let i = 0; i < 4; i++) line('', `Indicador ${i + 1}`, f?.numeros[i][0], f?.numeros[i][1]);
    r++;
    sec(campos.decision);
    line('', 'Qué se entrena y cómo sabemos si funcionó', f?.decision);
    ws.getRow(r - 1).height = 70;
    r++;
    sec(campos.clips);
    for (let i = 0; i < 5; i++) line('', `Clip ${i + 1}`, f ? `${f.clips[i][1]}. ${f.clips[i][2]}` : '', f?.clips[i][0]);
    return ws;
  };
  ficha('Ficha', false);
  ficha('Ejemplo', true);

  const hs = wb.addWorksheet('Historial', { views: [{ state: 'frozen', ySplit: 1 }] });
  hs.columns = [
    { header: 'Fecha', width: 12 }, { header: 'Rival', width: 24 }, { header: 'Resultado', width: 12 },
    { header: 'Hallazgo principal', width: 50 }, { header: 'Decisión de la semana', width: 50 },
    { header: '¿Se aplicó?', width: 14 }, { header: '¿Funcionó en el partido siguiente?', width: 30 },
  ];
  P.styleHeader(hs.getRow(1));
  for (let i = 2; i <= 60; i++) {
    hs.getCell(`F${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Sí,Parcial,No"'] };
    hs.getCell(`G${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Sí,Parcial,No,Todavía no se sabe"'] };
  }
  hs.addConditionalFormatting({
    ref: 'F2:G60',
    rules: [
      { type: 'cellIs', operator: 'equal', formulae: ['"Sí"'], style: P.cf('FFCDEFD3') },
      { type: 'cellIs', operator: 'equal', formulae: ['"Parcial"'], style: P.cf('FFFFEFB3') },
      { type: 'cellIs', operator: 'equal', formulae: ['"No"'], style: P.cf('FFF8CFCB') },
    ],
  });

  await wb.xlsx.writeFile(file);
}

buildPdf(path.join(P.outDir, 'ficha-de-partido.pdf'));
await buildXlsx(path.join(P.outDir, 'ficha-de-partido.xlsx'));
console.log('Listo: ficha-de-partido');
