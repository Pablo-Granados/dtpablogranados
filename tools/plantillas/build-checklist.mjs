/**
 * Checklist semanal de análisis. Contenido y generación en un solo archivo.
 * Uso: npm run checklist
 */
import path from 'node:path';
import * as P from './lib.mjs';
import { C } from './lib.mjs';

const meta = {
  titulo: 'Checklist semanal de análisis',
  subtitulo: 'Que el proceso no dependa del tiempo que sobre',
  autor: 'Pablo Granados',
  version: 'Versión 1',
};

const intro = [
  'El análisis no se hace por falta de ganas sino por falta de lugar en la semana. Cuando no tiene un día y un tiempo, pasa a ser lo que se hace si sobra, y nunca sobra.',
  'Esta checklist organiza la semana de un analista que trabaja con un partido por fin de semana. Si tu calendario es otro, la última página explica cómo adaptarla.',
];

const reglas = [
  { t: 'Pensá hacia atrás desde el partido', d: 'Lo que necesita el cuerpo técnico el jueves define qué hacés el miércoles. Armá la semana desde la entrega, no desde el lunes.' },
  { t: 'Una tarea, un bloque', d: 'Cada tarea tiene su día, su duración y su entregable. Si no sabés qué tiene que existir al terminar, la tarea no está definida.' },
  { t: 'Si no entra, sacá', d: 'No comprimas. Una tarea hecha a medias confunde más que una tarea ausente. Para eso está la versión mínima.' },
  { t: 'Registrá lo que se cayó', d: 'Anotar qué tarea no se hizo y por qué es lo único que mejora la semana siguiente.' },
];

/** Semana tipo: partido el fin de semana. */
const semana = [
  { dia: 'Lunes', tarea: 'Cerrar el partido anterior: revisar los clips marcados y completar la ficha', min: 60, entrega: 'Ficha de partido (1 página)' },
  { dia: 'Martes', tarea: 'Reunión con el cuerpo técnico: presentar 3 clips y proponer la decisión de entrenamiento', min: 45, entrega: '3 clips y una decisión' },
  { dia: 'Miércoles', tarea: 'Scouting del rival: ver 1 o 2 partidos con el mapa de observación', min: 90, entrega: 'Mapa del rival completado' },
  { dia: 'Jueves', tarea: 'Informe de rival: sintetizar en una página y elegir 5 clips', min: 75, entrega: 'Informe de rival + 5 clips' },
  { dia: 'Viernes', tarea: 'Presentar el informe (10 minutos) y preparar el panel del partido', min: 45, entrega: 'Presentación hecha y panel listo' },
  { dia: 'Día del partido', tarea: 'Registrar en vivo solo lo esencial con el panel de codificación', min: 30, entrega: 'Marcas del partido' },
  { dia: 'Día siguiente', tarea: 'Codificar lo esencial mientras está fresco y dejar los clips marcados', min: 30, entrega: 'Clips para el lunes' },
];

const minima = [
  { dia: 'Lunes', tarea: 'Completar la ficha del partido anterior', min: 45, entrega: 'Ficha (1 página)' },
  { dia: 'Miércoles', tarea: 'Ver un partido del rival con 2 fases del mapa de observación', min: 60, entrega: 'Hallazgos del rival' },
  { dia: 'Jueves', tarea: 'Informe de rival de una página con 3 clips', min: 60, entrega: 'Informe + 3 clips' },
  { dia: 'Viernes', tarea: 'Presentarlo al cuerpo técnico', min: 15, entrega: 'Presentación hecha' },
];

const adaptar = [
  ['Partido a mitad de semana', 'El lunes y el martes se comprimen: hacé la ficha el día siguiente y el scouting con lo que tengas. Es el momento de usar la versión mínima.'],
  ['Dos partidos por semana', 'El segundo partido tiene su propio informe de rival, pero la ficha del primero queda en 30 minutos y con una sola decisión.'],
  ['Trabajás menos horas', 'Fijá el tiempo disponible, pasalo a la versión mínima y sumá tareas de a una, recién cuando la mínima se cumple tres semanas seguidas.'],
  ['Sin rival conocido a tiempo', 'Dejá el scouting para lo que sabés del rival (los últimos partidos) y usá el tiempo en reforzar la decisión propia.'],
];

const sum = (list) => list.reduce((a, t) => a + t.min, 0);
const horas = (min) => (min % 60 === 0 ? `${min / 60} h` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`);

/* ------------------------------ PDF ------------------------------ */
function drawTable(ctx, rows) {
  const { doc, L, CW } = ctx;
  const colDia = 82, colMin = 52, colEnt = 130;
  const colTarea = CW - 20 - colDia - colMin - colEnt;
  rows.forEach((t, i) => {
    doc.font('Helvetica').fontSize(10);
    const h = Math.max(doc.heightOfString(t.tarea, { width: colTarea - 8, lineGap: 1.5 }), doc.heightOfString(t.entrega, { width: colEnt })) + 18;
    ctx.need(h);
    const y = doc.y;
    doc.rect(L, y, CW, 0.7).fill(C.LINE);
    P.box(doc, L, y + 9, 11);
    doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(10).text(t.dia, L + 20, y + 8, { width: colDia - 4 });
    doc.fillColor(C.TEXT).font('Helvetica').fontSize(10).text(t.tarea, L + 20 + colDia, y + 8, { width: colTarea - 8, lineGap: 1.5 });
    doc.fillColor(C.MUTE).fontSize(10).text(`${t.min} min`, L + 20 + colDia + colTarea, y + 8, { width: colMin });
    doc.fillColor(C.TEXT).fontSize(9.5).text(t.entrega, L + 20 + colDia + colTarea + colMin, y + 8, { width: colEnt });
    doc.y = y + h;
  });
  doc.rect(L, doc.y, CW, 0.7).fill(C.LINE);
  doc.y += 12;
}

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

  doc.addPage();
  P.label(ctx, 'La semana tipo');
  doc.fillColor(C.MUTE).font('Helvetica').fontSize(10).text('Partido el fin de semana. Tildá cada bloque al terminarlo.', L, doc.y, { width: CW });
  doc.moveDown(0.8);
  drawTable(ctx, semana);
  P.callout(ctx, 'Tiempo total', `${horas(sum(semana))} por semana. Si no tenés ese tiempo, no recortes cada tarea un poco: pasá a la versión mínima.`);

  doc.addPage();
  P.label(ctx, 'La versión mínima');
  doc.fillColor(C.MUTE).font('Helvetica').fontSize(10).text('Lo imprescindible para que el cuerpo técnico tenga una decisión y un informe cada semana.', L, doc.y, { width: CW });
  doc.moveDown(0.8);
  drawTable(ctx, minima);
  P.callout(ctx, 'Tiempo total', `${horas(sum(minima))} por semana.`);

  P.label(ctx, 'Cómo adaptarla a tu calendario');
  adaptar.forEach(([t, d]) => {
    ctx.need(54);
    doc.fillColor(C.INK).font('Helvetica-Bold').fontSize(11).text(t, L, doc.y, { width: CW });
    doc.fillColor(C.TEXT).font('Helvetica').fontSize(10.5).text(d, { width: CW, lineGap: 2 });
    doc.moveDown(0.6);
  });
  doc.moveDown(0.6);
  P.closing(ctx, {
    titulo: 'Hay más plantillas gratis',
    texto: 'Mapa de observación, panel de codificación y ficha de partido, en la web. Y si querés armar tu semana con acompañamiento, eso es lo que hacemos en Sistema Propio: dtpablogranados.vercel.app/mentoria',
    url: 'dtpablogranados.vercel.app/plantillas',
  });
  P.finish(ctx);
}

/* ------------------------------ XLSX ------------------------------ */
async function buildXlsx(file) {
  const wb = P.workbook(meta);
  P.guideSheet(wb, meta, intro, [
    'En la hoja "Semana" cambiá el estado de cada tarea a medida que la terminás: Pendiente, Hecho o Saltada.',
    'Los totales de abajo calculan solos cuánto tiempo previste, cuánto hiciste y qué porcentaje cumpliste.',
    'Al final de la semana, pasá los totales a la hoja "Registro" y anotá qué se cayó y por qué.',
    'Si no entra todo, usá la hoja "Versión mínima" con el mismo formato.',
  ]);

  const tabla = (name, list) => {
    const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.columns = [
      { header: 'Día', width: 16 }, { header: 'Tarea', width: 64 }, { header: 'Minutos previstos', width: 18 },
      { header: 'Estado', width: 14 }, { header: 'Minutos reales', width: 16 }, { header: 'Entregable', width: 34 },
    ];
    P.styleHeader(ws.getRow(1));
    list.forEach((t, i) => {
      const r = i + 2;
      const row = ws.getRow(r);
      row.values = [t.dia, t.tarea, t.min, 'Pendiente', '', t.entrega];
      row.alignment = P.wrap;
      row.height = 36;
      row.getCell(1).font = { bold: true };
      row.getCell(4).dataValidation = { type: 'list', allowBlank: false, formulae: ['"Pendiente,Hecho,Saltada"'] };
      row.getCell(4).alignment = { vertical: 'top', horizontal: 'center' };
      row.getCell(3).alignment = { vertical: 'top', horizontal: 'center' };
      row.getCell(5).alignment = { vertical: 'top', horizontal: 'center' };
      for (let k = 1; k <= 6; k++) row.getCell(k).border = { bottom: { style: 'thin', color: { argb: 'FFD9DDE1' } } };
    });
    const last = list.length + 1;
    ws.addConditionalFormatting({
      ref: `D2:D${last}`,
      rules: [
        { type: 'cellIs', operator: 'equal', formulae: ['"Hecho"'], style: P.cf('FFCDEFD3') },
        { type: 'cellIs', operator: 'equal', formulae: ['"Saltada"'], style: P.cf('FFF8CFCB') },
      ],
    });
    const t = last + 2;
    ws.getCell(`B${t}`).value = 'Tiempo previsto (min)';
    ws.getCell(`C${t}`).value = { formula: `SUM(C2:C${last})` };
    ws.getCell(`B${t + 1}`).value = 'Tiempo hecho (min)';
    ws.getCell(`C${t + 1}`).value = { formula: `SUMIF(D2:D${last},"Hecho",C2:C${last})` };
    ws.getCell(`B${t + 2}`).value = 'Cumplimiento';
    ws.getCell(`C${t + 2}`).value = { formula: `IF(C${t}=0,0,C${t + 1}/C${t})` };
    ws.getCell(`C${t + 2}`).numFmt = '0%';
    [t, t + 1, t + 2].forEach((x) => {
      ws.getCell(`B${x}`).font = { bold: true };
      ws.getCell(`B${x}`).alignment = { horizontal: 'right' };
      ws.getCell(`C${x}`).alignment = { horizontal: 'center' };
    });
    return ws;
  };
  tabla('Semana', semana);
  tabla('Versión mínima', minima);

  const rg = wb.addWorksheet('Registro', { views: [{ state: 'frozen', ySplit: 1 }] });
  rg.columns = [
    { header: 'Semana', width: 14 }, { header: 'Minutos previstos', width: 18 }, { header: 'Minutos hechos', width: 16 },
    { header: 'Cumplimiento', width: 14 }, { header: 'Qué se cayó', width: 40 }, { header: 'Por qué', width: 40 }, { header: 'Qué cambio la semana próxima', width: 44 },
  ];
  P.styleHeader(rg.getRow(1));
  for (let i = 2; i <= 40; i++) {
    rg.getCell(`D${i}`).value = { formula: `IF(B${i}=0,"",C${i}/B${i})` };
    rg.getCell(`D${i}`).numFmt = '0%';
    rg.getRow(i).alignment = P.wrap;
  }

  await wb.xlsx.writeFile(file);
}

buildPdf(path.join(P.outDir, 'checklist-semanal.pdf'));
await buildXlsx(path.join(P.outDir, 'checklist-semanal.xlsx'));
console.log('Listo: checklist-semanal');
