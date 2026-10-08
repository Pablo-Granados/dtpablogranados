/**
 * Genera public/plantillas/mapa-de-observacion.pdf y .xlsx a partir de mapa.mjs.
 * Uso: npm install && npm run mapa
 */
import path from 'node:path';
import { meta, intro, pasos, fases, ejemplo, cierre } from './mapa.mjs';
import * as P from './lib.mjs';
import { C } from './lib.mjs';

/* ------------------------------ PDF ------------------------------ */
function buildPdf(file) {
  const ctx = P.createPdf(file, meta);
  const { doc, L, CW } = ctx;

  P.cover(ctx, 'Plantilla gratuita · Futsal y fútbol');
  P.para(ctx, intro[0]);
  P.para(ctx, intro[1], { size: 11, color: C.MUTE, gap: 1.6 });
  P.label(ctx, 'Cómo usarlo');
  P.steps(ctx, pasos);

  doc.addPage();
  fases.forEach((f, fi) => {
    P.bar(ctx, `${String(fi + 1).padStart(2, '0')}  ${f.nombre}`);
    f.principios.forEach((p) => {
      const h = doc.heightOfString(p.pregunta + p.buscar + p.indicador, { width: CW - 14 }) + 70;
      ctx.need(h);
      const top = doc.y;
      doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(12).text(p.nombre, L + 14, top, { width: CW - 14 });
      doc.moveDown(0.25);
      P.field(ctx, 'Pregunta', p.pregunta);
      P.field(ctx, 'Qué buscar en el video', p.buscar);
      P.field(ctx, 'Indicador de ejemplo', p.indicador);
      doc.rect(L, top, 2, doc.y - top - 4).fill(C.LINE);
      doc.y += 6;
    });
    doc.moveDown(0.6);
  });

  doc.addPage();
  P.label(ctx, 'Ejemplo de una fase observada');
  doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(22).text(ejemplo.fase, L, doc.y, { width: CW });
  doc.fillColor(C.MUTE).font('Helvetica').fontSize(10).text(ejemplo.contexto, { width: CW });
  doc.moveDown(1);
  ejemplo.filas.forEach((r) => {
    ctx.need(110);
    const y = doc.y;
    doc.rect(L, y, CW, 1).fill(C.LINE);
    doc.y = y + 10;
    doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(12).text(r.principio, L, doc.y, { continued: true })
      .fillColor(r.se === 'No se cumple' ? '#b3261e' : '#8a6d00').fontSize(10).text(`   ${r.se.toUpperCase()}`);
    doc.moveDown(0.3);
    doc.fillColor(C.MUTE).font('Helvetica').fontSize(9.5).text(`Minutos: ${r.evidencia}`, L, doc.y, { width: CW });
    doc.fillColor(C.TEXT).fontSize(11).text(r.nota, L, doc.y + 3, { width: CW, lineGap: 2 });
    doc.moveDown(1);
  });
  P.callout(ctx, 'La decisión', ejemplo.decision);

  P.closing(ctx, { titulo: cierre.siguiente, texto: cierre.texto, url: cierre.url });
  P.finish(ctx);
}

/* ------------------------------ XLSX ------------------------------ */
async function buildXlsx(file) {
  const wb = P.workbook(meta);
  P.guideSheet(wb, meta, intro, pasos, 'En la hoja "Mapa", completá las columnas F, G y H. La columna F tiene un menú desplegable.');

  const ws = wb.addWorksheet('Mapa', { views: [{ state: 'frozen', ySplit: 1, xSplit: 2 }] });
  ws.columns = [
    { header: 'Fase', width: 22 },
    { header: 'Principio', width: 26 },
    { header: 'Pregunta de observación', width: 46 },
    { header: 'Qué buscar en el video', width: 52 },
    { header: 'Indicador de ejemplo', width: 36 },
    { header: '¿Se cumple?', width: 14 },
    { header: 'Minutos / evidencia', width: 24 },
    { header: 'Decisión de entrenamiento', width: 40 },
  ];
  P.styleHeader(ws.getRow(1));

  let row = 2;
  fases.forEach((f, fi) => {
    f.principios.forEach((p) => {
      const rr = ws.getRow(row);
      rr.values = [f.nombre, p.nombre, p.pregunta, p.buscar, p.indicador, '', '', ''];
      rr.alignment = P.wrap;
      rr.height = 62;
      rr.getCell(1).font = { bold: true };
      rr.getCell(2).font = { bold: true };
      const shade = fi % 2 === 0 ? 'FFF7F8F9' : 'FFFFFFFF';
      for (let c = 1; c <= 8; c++) {
        const cell = rr.getCell(c);
        cell.fill = P.fillOf(shade);
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFD9DDE1' } } };
      }
      rr.getCell(6).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Sí,Parcial,No"'], showErrorMessage: true, errorTitle: 'Elegí una opción', error: 'Usá Sí, Parcial o No.' };
      rr.getCell(6).alignment = { vertical: 'top', horizontal: 'center' };
      row++;
    });
  });
  const last = row - 1;
  ws.addConditionalFormatting({
    ref: `F2:F${last}`,
    rules: [
      { type: 'cellIs', operator: 'equal', formulae: ['"Sí"'], style: P.cf('FFCDEFD3') },
      { type: 'cellIs', operator: 'equal', formulae: ['"Parcial"'], style: P.cf('FFFFEFB3') },
      { type: 'cellIs', operator: 'equal', formulae: ['"No"'], style: P.cf('FFF8CFCB') },
    ],
  });
  ws.autoFilter = { from: 'A1', to: `H${last}` };

  const rs = wb.addWorksheet('Resumen');
  rs.columns = [{ header: 'Fase', width: 26 }, { header: 'Sí', width: 8 }, { header: 'Parcial', width: 10 }, { header: 'No', width: 8 }, { header: 'Sin completar', width: 16 }];
  P.styleHeader(rs.getRow(1));
  fases.forEach((f, i) => {
    const n = i + 2;
    const count = (v) => ({ formula: `COUNTIFS(Mapa!$A$2:$A$${last},A${n},Mapa!$F$2:$F$${last},${v})` });
    rs.getRow(n).values = [f.nombre, count('"Sí"'), count('"Parcial"'), count('"No"'), count('""')];
  });
  rs.getCell(`A${fases.length + 4}`).value = 'Priorizá las fases con más "No" y "Parcial": ahí está la decisión de la semana.';
  rs.getCell(`A${fases.length + 4}`).font = { italic: true, color: { argb: 'FF5D646D' } };

  await wb.xlsx.writeFile(file);
}

const pdf = path.join(P.outDir, 'mapa-de-observacion.pdf');
const xlsx = path.join(P.outDir, 'mapa-de-observacion.xlsx');
buildPdf(pdf);
await buildXlsx(xlsx);
console.log('Listo: mapa-de-observacion');
