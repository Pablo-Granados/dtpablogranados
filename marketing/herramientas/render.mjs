/**
 * Convierte las piezas del plan en imágenes PNG con la marca (usa el Microsoft Edge o Chrome instalado, sin abrir ventanas).
 *   node marketing/herramientas/render.mjs                 todas las semanas
 *   node marketing/herramientas/render.mjs --semana 1      solo una semana
 *   node marketing/herramientas/render.mjs --pieza s01-f1  solo una pieza (feed o reel)
 *   node marketing/herramientas/render.mjs --forzar        vuelve a generar aunque ya existan
 * Las imágenes quedan en marketing/piezas/ (no se suben a git: se regeneran cuando quieras).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { semanas } from './datos/index.mjs';
import { archivoHistoria, archivoPortadaReel, archivoSlide } from './lib.mjs';
import { html, TAM } from '../plantillas/diseno.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const marketing = path.resolve(aqui, '..');
const repo = path.resolve(marketing, '..');
const salida = path.join(marketing, 'piezas');

const args = process.argv.slice(2);
const val = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const soloSemana = val('--semana') ? Number(val('--semana')) : null;
const soloPieza = val('--pieza');
const forzar = args.includes('--forzar');

/** Busca un navegador basado en Chromium ya instalado. */
function navegador() {
  const candidatos = [
    process.env.NAVEGADOR,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const ok = candidatos.find((c) => fs.existsSync(c));
  if (!ok) throw new Error('No encontré Edge ni Chrome. Definí la ruta en la variable NAVEGADOR.');
  return ok;
}

const ctx = {
  fuentes: pathToFileURL(path.join(marketing, 'plantillas', 'fuentes')).href,
  logo: pathToFileURL(path.join(repo, 'public', 'media', 'dtpablogranados.png')).href,
  imagen: (ruta) => pathToFileURL(path.join(repo, 'public', ruta)).href,
};

/** Lista de trabajos: { archivo, tipo, layout, props, indice, total } */
function trabajos() {
  const lista = [];
  for (const s of semanas) {
    if (soloSemana && s.n !== soloSemana) continue;
    for (const p of s.piezas) {
      if (soloPieza && p.id !== soloPieza) continue;
      if (p.formato === 'reel') {
        lista.push({ archivo: archivoPortadaReel(s, p), tipo: 'reel', props: p.portada });
      } else {
        p.slides.forEach(([layout, props], i) => lista.push({ archivo: archivoSlide(s, p, i + 1), tipo: 'feed', layout, props, indice: i + 1, total: p.slides.length }));
      }
    }
    if (soloPieza) continue;
    for (const d of s.stories) d.frames.forEach((f, i) => lista.push({ archivo: archivoHistoria(s, d, i + 1), tipo: 'historia', layout: f.layout, props: f }));
  }
  return lista;
}

const exe = navegador();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'marketing-'));

function capturar(trabajo, n) {
  return new Promise((resolve, reject) => {
    const destino = path.join(salida, trabajo.archivo);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    const pagina = path.join(tmp, `p${n}.html`);
    fs.writeFileSync(pagina, html({ ...trabajo, ctx }), 'utf8');
    const { ancho, alto } = trabajo.tipo === 'feed' ? TAM.feed : TAM.historia;
    const proc = spawn(exe, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--allow-file-access-from-files', '--no-first-run', `--user-data-dir=${path.join(tmp, 'perfil' + (n % 4))}`, `--window-size=${ancho},${alto}`, `--screenshot=${destino}`, pathToFileURL(pagina).href], { stdio: 'ignore' });
    const limite = setTimeout(() => proc.kill(), 30000);
    proc.on('exit', () => {
      clearTimeout(limite);
      fs.existsSync(destino) ? resolve() : reject(new Error(`No se generó ${trabajo.archivo}`));
    });
  });
}

const todos = trabajos();
const pendientes = todos.filter((t) => forzar || !fs.existsSync(path.join(salida, t.archivo)));
console.log(`${todos.length} imágenes en el plan, ${pendientes.length} por generar.`);

// Cuatro a la vez, cada uno con su propio perfil del navegador (así no se bloquean entre sí)
const cola = [...pendientes.entries()];
let hechas = 0;
const fallas = [];
// Un perfil por obrero para evitar bloqueos
await Promise.all([0, 1, 2, 3].map((id) => (async () => {
  while (cola.length) {
    const [i, t] = cola.shift();
    const copia = { ...t };
    try {
      await capturar(copia, id + 4 * i);
      hechas++;
      if (hechas % 25 === 0) console.log(`  ${hechas}/${pendientes.length}`);
    } catch {
      fallas.push(t.archivo);
    }
  }
})()));

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Listo: ${hechas} imágenes generadas en marketing/piezas/.${fallas.length ? ` Fallaron ${fallas.length}: ${fallas.join(', ')}` : ''}`);
