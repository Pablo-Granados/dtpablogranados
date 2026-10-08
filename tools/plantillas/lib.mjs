/**
 * Piezas comunes de las plantillas (PDF con pdfkit y hojas con exceljs).
 * Cada plantilla define su contenido y arma sus páginas con estas funciones.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const outDir = path.resolve(here, '../../public/plantillas');
fs.mkdirSync(outDir, { recursive: true });

export const C = { INK: '#0b0d10', SIGNAL: '#00f2ff', TEXT: '#1c2026', MUTE: '#5d646d', LINE: '#d9dde1', SOFT: '#f1f6f7' };

/* ------------------------------ PDF ------------------------------ */
export function createPdf(file, meta) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 56, bottom: 64, left: 52, right: 52 },
    bufferPages: true,
    info: { Title: `${meta.titulo} · ${meta.autor}`, Author: meta.autor },
  });
  doc.pipe(fs.createWriteStream(file));
  const L = doc.page.margins.left;
  const W = doc.page.width;
  const CW = W - L - doc.page.margins.right;
  const ctx = { doc, L, W, CW, meta };
  ctx.bottom = () => doc.page.height - doc.page.margins.bottom;
  ctx.need = (h) => {
    if (doc.y + h > ctx.bottom()) doc.addPage();
  };
  return ctx;
}

/** Portada con banda oscura. Deja el cursor listo para el texto. */
export function cover({ doc, L, W, CW, meta }, kicker) {
  doc.rect(0, 0, W, 270).fill(C.INK);
  doc.rect(0, 270, W, 4).fill(C.SIGNAL);
  doc.fillColor('#edebe6').font('Helvetica-Bold').fontSize(10).text('PABLO GRANADOS', L, 52, { characterSpacing: 2 });
  doc.fillColor(C.SIGNAL).font('Helvetica').fontSize(9).text(kicker.toUpperCase(), L, 120, { characterSpacing: 1.5 });
  doc.fillColor('#edebe6').font('Helvetica-Bold').fontSize(38).text(meta.titulo.toUpperCase(), L, 140, { width: CW, lineGap: -4 });
  doc.fillColor('#9aa0a8').font('Helvetica').fontSize(14).text(meta.subtitulo, L, doc.y + 8, { width: CW });
  doc.fillColor('#6b717a').fontSize(9).text(meta.version, L, 244);
  doc.y = 306;
}

export function para({ doc, L, CW }, text, { size = 12, color = C.TEXT, gap = 0.8 } = {}) {
  doc.fillColor(color).font('Helvetica').fontSize(size).text(text, L, doc.y, { width: CW, lineGap: 3 });
  doc.moveDown(gap);
}

export function label({ doc, L }, text) {
  doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(9).text(text.toUpperCase(), L, doc.y, { characterSpacing: 1.5 });
  doc.moveDown(0.6);
}

export function steps(ctx, list) {
  const { doc, L, CW } = ctx;
  list.forEach((p, i) => {
    ctx.need(40);
    const y = doc.y;
    doc.rect(L, y + 1, 18, 18).fill(C.INK);
    doc.fillColor(C.SIGNAL).font('Helvetica-Bold').fontSize(10).text(String(i + 1), L, y + 5, { width: 18, align: 'center' });
    doc.fillColor(C.TEXT).font('Helvetica').fontSize(11).text(p, L + 30, y + 2, { width: CW - 30, lineGap: 2 });
    doc.y = Math.max(doc.y, y + 22) + 8;
  });
}

/** Barra oscura de sección. */
export function bar(ctx, text) {
  const { doc, L, CW } = ctx;
  ctx.need(70);
  const y = doc.y;
  doc.rect(L, y, CW, 26).fill(C.INK);
  doc.rect(L, y, 5, 26).fill(C.SIGNAL);
  doc.fillColor('#edebe6').font('Helvetica-Bold').fontSize(12).text(text.toUpperCase(), L + 16, y + 8, { characterSpacing: 1 });
  doc.y = y + 38;
}

export function field({ doc, L, CW }, name, text) {
  doc.fillColor(C.MUTE).font('Helvetica-Bold').fontSize(7.5).text(name.toUpperCase(), L + 14, doc.y, { characterSpacing: 1, width: CW - 14 });
  doc.fillColor(C.TEXT).font('Helvetica').fontSize(10).text(text, L + 14, doc.y + 1, { width: CW - 14, lineGap: 1.5 });
  doc.moveDown(0.35);
}

/** Bloque con borde cian. */
export function callout(ctx, name, text) {
  const { doc, L, CW } = ctx;
  const h = doc.heightOfString(text, { width: CW - 36, lineGap: 2 }) + 44;
  ctx.need(h + 10);
  const y = doc.y;
  doc.rect(L, y, CW, h).fill(C.SOFT);
  doc.rect(L, y, 5, h).fill(C.SIGNAL);
  doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(8).text(name.toUpperCase(), L + 20, y + 14, { characterSpacing: 1.5 });
  doc.fillColor(C.TEXT).font('Helvetica').fontSize(11).text(text, L + 20, y + 28, { width: CW - 36, lineGap: 2 });
  doc.y = y + h + 16;
}

/** Cuadrito para tildar a mano. */
export function box(doc, x, y, size = 11) {
  doc.lineWidth(1).strokeColor(C.INK).rect(x, y, size, size).stroke();
}

/** Línea para escribir a mano. */
export function writeLine(doc, x, y, w) {
  doc.lineWidth(0.6).strokeColor('#b8bec5').moveTo(x, y).lineTo(x + w, y).stroke();
}

export function closing(ctx, { titulo, texto, url }) {
  const { doc, L, CW } = ctx;
  ctx.need(130);
  doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(14).text(titulo, L, doc.y, { width: CW });
  doc.moveDown(0.6);
  doc.fillColor(C.TEXT).font('Helvetica').fontSize(11).text(texto, { width: CW, lineGap: 3 });
  doc.moveDown(0.4);
  doc.fillColor(C.INK).font('Helvetica-Bold').text(url, { link: `https://${url}`, underline: true });
}

export function finish({ doc, L, CW, meta }) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    if (i > 0) {
      doc.fillColor(C.MUTE).font('Helvetica').fontSize(8)
        .text(`${meta.autor}  ·  ${meta.titulo}`, L, doc.page.height - 40, { width: CW / 2, lineBreak: false, height: 12 })
        .text(`${i + 1} / ${range.count}`, L + CW / 2, doc.page.height - 40, { width: CW / 2, align: 'right', lineBreak: false, height: 12 });
    }
  }
  doc.end();
}

/* ------------------------------ Hojas de cálculo ------------------------------ */
export const head = {
  font: { bold: true, color: { argb: 'FFEDEBE6' }, name: 'Calibri', size: 11 },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B0D10' } },
  alignment: { vertical: 'middle', wrapText: true },
};
export const wrap = { vertical: 'top', wrapText: true };
export const fillOf = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
export const cf = (argb) => ({ fill: { type: 'pattern', pattern: 'solid', bgColor: { argb } } });

export function workbook(meta) {
  const wb = new ExcelJS.Workbook();
  wb.creator = meta.autor;
  wb.created = new Date();
  return wb;
}

/** Hoja "Cómo usarla": título, intro y pasos. */
export function guideSheet(wb, meta, intro, pasos, extra) {
  const g = wb.addWorksheet('Cómo usarla', { views: [{ showGridLines: false }] });
  g.columns = [{ width: 4 }, { width: 100 }];
  g.getCell('B2').value = meta.titulo.toUpperCase();
  g.getCell('B2').font = { bold: true, size: 20, name: 'Calibri' };
  g.getCell('B3').value = `${meta.subtitulo} · ${meta.autor}`;
  g.getCell('B3').font = { color: { argb: 'FF5D646D' }, size: 11 };
  let r = 5;
  intro.forEach((t) => {
    g.getCell(`B${r}`).value = t;
    g.getCell(`B${r}`).alignment = wrap;
    g.getRow(r).height = 34;
    r++;
  });
  r++;
  g.getCell(`B${r}`).value = 'CÓMO USARLA';
  g.getCell(`B${r}`).font = { bold: true, size: 10, color: { argb: 'FF5D646D' } };
  r++;
  pasos.forEach((p, i) => {
    g.getCell(`B${r}`).value = `${i + 1}. ${p}`;
    g.getCell(`B${r}`).alignment = wrap;
    g.getRow(r).height = 32;
    r++;
  });
  if (extra) {
    r++;
    g.getCell(`B${r}`).value = extra;
    g.getCell(`B${r}`).font = { italic: true, color: { argb: 'FF5D646D' } };
    g.getCell(`B${r}`).alignment = wrap;
    g.getRow(r).height = 32;
  }
  return g;
}

export function styleHeader(row) {
  row.height = 28;
  row.eachCell((c) => Object.assign(c, head));
}
