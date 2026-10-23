/**
 * Diseño de las piezas: cada función devuelve el HTML de una diapositiva (feed 1080×1350) o una historia (1080×1920).
 * La marca sale de src/styles/global.css: fondo #0b0d10, texto #edebe6, acento cian #00f2ff, Archivo / Inter / JetBrains Mono.
 * Para cambiar el estilo de todas las piezas, editá solo este archivo y volvé a correr `npm run marketing:render`.
 */

export const TAM = {
  feed: { ancho: 1080, alto: 1350 },
  historia: { ancho: 1080, alto: 1920 },
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Tamaño del título según su largo, para que siempre entre en pocas líneas. */
const tamTitulo = (texto, grande, medio, chico, minimo) => {
  const n = String(texto).length;
  return n <= 22 ? grande : n <= 34 ? medio : n <= 48 ? chico : minimo;
};

const css = (fuentes, alto) => `
@font-face{font-family:'Archivo';src:url('${fuentes}/archivo.woff2') format('woff2');font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:'Inter';src:url('${fuentes}/inter.woff2') format('woff2');font-weight:100 900}
@font-face{font-family:'Mono';src:url('${fuentes}/jetbrains-mono.woff2') format('woff2');font-weight:100 800}
:root{--ink:#0b0d10;--panel:#12151a;--line:#262b33;--bone:#edebe6;--mute:#9aa0a8;--faint:#6b717a;--signal:#00f2ff}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:${alto}px;background:var(--ink)}
body{position:relative;overflow:hidden;color:var(--bone);font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
.grilla{position:absolute;inset:0;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:90px 90px;opacity:.28}
.brillo{position:absolute;right:-260px;top:-260px;width:760px;height:760px;background:radial-gradient(circle,rgba(0,242,255,.10),transparent 68%)}
.esq{position:absolute;width:44px;height:44px;border-color:var(--signal);border-style:solid;border-width:0}
.esq.a{top:56px;right:56px;border-top-width:5px;border-right-width:5px}
.esq.b{bottom:56px;left:56px;border-bottom-width:5px;border-left-width:5px}
.kicker{font:600 26px 'Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--signal)}
.t{font-family:'Archivo',sans-serif;font-stretch:75%;font-weight:800;text-transform:uppercase;line-height:.95;color:var(--bone)}
.cian{color:var(--signal)}
.barra{width:150px;height:10px;background:var(--signal)}
.mono{font-family:'Mono',monospace}
.pie{position:absolute;left:84px;right:84px;display:flex;align-items:center;justify-content:space-between;font:500 24px 'Mono',monospace;color:var(--mute);letter-spacing:.04em}
.pie .marca{display:flex;align-items:center;gap:18px}
.pie img{width:62px;height:62px;border-radius:50%}
.boton{display:inline-flex;align-items:center;gap:18px;background:var(--signal);color:var(--ink);font:700 30px 'Mono',monospace;letter-spacing:.06em;text-transform:uppercase;padding:26px 38px}
.boton svg{width:34px;height:34px}
`;

const flecha = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

/** Estructura común: fondo, esquinas, pie con el usuario y el contador. */
const pagina = ({ fuentes, logo, tipo, cuerpo, indice, total, handle = '@dtpablogranados', sinPie = false, pieBottom }) => {
  const { alto } = TAM[tipo];
  const contador = total > 1 ? `${String(indice).padStart(2, '0')} / ${String(total).padStart(2, '0')}` : '';
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css(fuentes, alto)}</style></head><body>
  <div class="grilla"></div><div class="brillo"></div><div class="esq a"></div><div class="esq b"></div>
  ${cuerpo}
  ${sinPie ? '' : `<div class="pie" style="bottom:${pieBottom ?? (tipo === 'historia' ? 380 : 70)}px"><div class="marca"><img src="${logo}" alt=""><span>${esc(handle)}</span></div><span>${contador}</span></div>`}
  </body></html>`;
};

/* ============================ FEED ============================ */
const feed = {
  portada: (p) => `<div style="position:absolute;left:84px;right:84px;top:180px;bottom:200px;display:flex;flex-direction:column;justify-content:center;gap:44px">
    <div class="kicker">${esc(p.kicker)}</div>
    <div class="barra"></div>
    <div class="t" style="font-size:${tamTitulo(p.titulo, 160, 136, 112, 94)}px">${esc(p.titulo)}</div>
    ${p.sub ? `<div style="font-size:42px;line-height:1.35;color:var(--mute);max-width:820px">${esc(p.sub)}</div>` : ''}
  </div>`,

  punto: (p) => `<div style="position:absolute;left:84px;right:84px;top:170px;bottom:200px;display:flex;flex-direction:column;justify-content:center;gap:34px">
    <div class="mono cian" style="font-size:120px;font-weight:700;line-height:1">${String(p.n).padStart(2, '0')}</div>
    <div class="t" style="font-size:${tamTitulo(p.titulo, 96, 84, 74, 64)}px">${esc(p.titulo)}</div>
    <div style="font-size:46px;line-height:1.4;color:rgba(237,235,230,.86);max-width:880px">${esc(p.texto)}</div>
  </div>`,

  lista: (p) => `<div style="position:absolute;left:84px;right:84px;top:170px;bottom:200px;display:flex;flex-direction:column;justify-content:center;gap:40px">
    <div class="kicker">${esc(p.kicker ?? '')}</div>
    <div class="t" style="font-size:${tamTitulo(p.titulo, 112, 96, 84, 70)}px">${esc(p.titulo)}</div>
    <div style="display:flex;flex-direction:column;border-top:2px solid var(--line)">${p.items
      .map(
        (it) => `<div style="display:flex;gap:28px;align-items:flex-start;padding:26px 0;border-bottom:2px solid var(--line)"><span style="flex:none;width:18px;height:18px;background:var(--signal);margin-top:20px"></span><span style="font-size:${p.items.length > 4 ? 40 : 46}px;line-height:1.3">${esc(it)}</span></div>`,
      )
      .join('')}</div>
  </div>`,

  dato: (p) => `<div style="position:absolute;left:84px;right:84px;top:170px;bottom:200px;display:flex;flex-direction:column;justify-content:center;gap:36px">
    <div class="kicker">${esc(p.kicker)}</div>
    <div class="t cian" style="font-size:${p.valor.length <= 8 ? 250 : 190}px;line-height:.9">${esc(p.valor)}</div>
    <div style="font-size:50px;line-height:1.35;color:var(--bone);max-width:880px">${esc(p.texto)}</div>
  </div>`,

  cita: (p) => `<div style="position:absolute;left:84px;right:84px;top:170px;bottom:200px;display:flex;flex-direction:column;justify-content:center;gap:48px">
    <div class="kicker">${esc(p.kicker ?? '')}</div>
    <div class="barra"></div>
    <div class="t" style="font-size:${tamTitulo(p.texto, 150, 128, 108, 92)}px">${esc(p.texto.replace(/\.$/, ''))}<span class="cian">.</span></div>
  </div>`,

  captura: (p, ctx) => `<div style="position:absolute;left:84px;right:84px;top:150px;bottom:180px;display:flex;flex-direction:column;gap:34px">
    <div class="kicker">${esc(p.kicker)}</div>
    <div class="t" style="font-size:${tamTitulo(p.titulo, 104, 92, 80, 68)}px">${esc(p.titulo)}</div>
    <div style="flex:1;min-height:0;border:2px solid var(--line-strong,#39404a);background:var(--panel);display:flex;align-items:center;justify-content:center;padding:18px">
      <img src="${ctx.imagen(p.img)}" alt="" style="max-width:100%;max-height:100%;object-fit:contain;display:block">
    </div>
    <div class="mono" style="font-size:24px;color:var(--mute);letter-spacing:.04em">${esc(p.pie)}</div>
  </div>`,

  cta: (p) => `<div style="position:absolute;left:84px;right:84px;top:170px;bottom:200px;display:flex;flex-direction:column;justify-content:center;gap:44px">
    <div class="kicker">Siguiente paso</div>
    <div class="barra"></div>
    <div class="t" style="font-size:${tamTitulo(p.titulo, 140, 118, 100, 84)}px">${esc(p.titulo)}</div>
    ${p.texto ? `<div style="font-size:46px;line-height:1.4;color:var(--mute);max-width:860px">${esc(p.texto)}</div>` : ''}
    <div><span class="boton">${esc(p.boton)}${flecha}</span></div>
  </div>`,
};

/* ============================ HISTORIAS (9:16) ============================ */
/** Zona segura: la interfaz de Instagram tapa unos 250 px de arriba y 340 px de abajo. */
const zona = (inner, extra = '') => `<div style="position:absolute;left:84px;right:84px;top:300px;bottom:420px;display:flex;flex-direction:column;justify-content:center;gap:46px;${extra}">${inner}</div>`;

const historia = {
  texto: (f) =>
    zona(`<div class="kicker" style="font-size:30px">${esc(f.kicker ?? '')}</div><div class="barra"></div>
    <div class="t" style="font-size:${tamTitulo(f.titulo, 170, 146, 122, 100)}px">${esc(f.titulo)}</div>
    ${f.texto ? `<div style="font-size:52px;line-height:1.38;color:rgba(237,235,230,.88)">${esc(f.texto)}</div>` : ''}`),

  lista: (f) =>
    zona(`<div class="kicker" style="font-size:30px">${esc(f.kicker ?? '')}</div>
    <div class="t" style="font-size:${tamTitulo(f.titulo, 130, 112, 96, 80)}px">${esc(f.titulo)}</div>
    <div style="display:flex;flex-direction:column;border-top:2px solid var(--line)">${f.items
      .map((it) => `<div style="display:flex;gap:28px;align-items:flex-start;padding:30px 0;border-bottom:2px solid var(--line)"><span style="flex:none;width:20px;height:20px;background:var(--signal);margin-top:22px"></span><span style="font-size:${f.items.length > 4 ? 44 : 50}px;line-height:1.3">${esc(it)}</span></div>`)
      .join('')}</div>`),

  encuesta: (f) =>
    zona(`<div class="kicker" style="font-size:30px">${esc(f.kicker ?? '')}</div><div class="barra"></div>
    <div class="t" style="font-size:${tamTitulo(f.titulo, 150, 130, 110, 92)}px">${esc(f.titulo)}</div>
    <div style="height:380px"></div>`, 'justify-content:flex-start;padding-top:60px'),

  pregunta: (f) =>
    zona(`<div class="kicker" style="font-size:30px">${esc(f.kicker ?? '')}</div><div class="barra"></div>
    <div class="t" style="font-size:${tamTitulo(f.titulo, 150, 128, 106, 88)}px">${esc(f.titulo)}</div>
    <div style="height:360px"></div>`, 'justify-content:flex-start;padding-top:60px'),

  cuenta: (f) =>
    zona(`<div class="kicker" style="font-size:30px">${esc(f.kicker ?? '')}</div><div class="barra"></div>
    <div class="t" style="font-size:${tamTitulo(f.titulo, 150, 128, 108, 90)}px">${esc(f.titulo)}</div>
    <div class="t cian" style="font-size:150px;margin-top:20px">${esc(f.fecha)}</div>`),

  captura: (f, ctx) =>
    `<div style="position:absolute;left:84px;right:84px;top:280px;bottom:400px;display:flex;flex-direction:column;gap:36px">
      <div class="kicker" style="font-size:30px">${esc(f.kicker ?? '')}</div>
      <div class="t" style="font-size:${tamTitulo(f.titulo, 120, 104, 90, 76)}px">${esc(f.titulo)}</div>
      <div style="flex:1;min-height:0;border:2px solid #39404a;background:var(--panel);display:flex;align-items:center;justify-content:center;padding:20px"><img src="${ctx.imagen(f.img)}" alt="" style="max-width:100%;max-height:100%;object-fit:contain;display:block"></div>
      <div class="mono" style="font-size:26px;color:var(--mute)">${esc(f.pie ?? '')}</div>
    </div>`,

  cta: (f) =>
    zona(`<div class="kicker" style="font-size:30px">${esc(f.kicker ?? '')}</div><div class="barra"></div>
    <div class="t" style="font-size:${tamTitulo(f.titulo, 150, 128, 108, 90)}px">${esc(f.titulo)}</div>
    ${f.texto ? `<div style="font-size:50px;line-height:1.38;color:var(--mute)">${esc(f.texto)}</div>` : ''}
    <div class="mono cian" style="font-size:36px;letter-spacing:.04em">${esc(f.enlace ?? '')}</div>`),
};

/** Portada de un reel (9:16). La parte central (1080×1440) es la que se ve en la grilla del perfil. */
const portadaReel = (p) =>
  `<div style="position:absolute;left:84px;right:84px;top:360px;bottom:560px;display:flex;flex-direction:column;justify-content:center;gap:48px">
    <div class="kicker" style="font-size:30px">${esc(p.kicker)}</div>
    <div class="barra"></div>
    <div class="t" style="font-size:${tamTitulo(p.titulo, 190, 160, 132, 108)}px">${esc(p.titulo)}</div>
  </div>`;

/**
 * Arma el HTML de una pieza.
 * @param tipo 'feed' | 'historia' | 'reel'
 * @param layout nombre del diseño
 * @param ctx { fuentes, logo, imagen(ruta) } rutas absolutas (file://) a fuentes, logo e imágenes
 */
export function html({ tipo, layout, props, indice = 1, total = 1, ctx }) {
  const base = { fuentes: ctx.fuentes, logo: ctx.logo, indice, total };
  if (tipo === 'reel') return pagina({ ...base, tipo: 'historia', cuerpo: portadaReel(props), sinPie: false, total: 1, pieBottom: 440 });
  if (tipo === 'historia') return pagina({ ...base, tipo: 'historia', cuerpo: (historia[layout] ?? historia.texto)(props, ctx), total: 1 });
  return pagina({ ...base, tipo: 'feed', cuerpo: (feed[layout] ?? feed.punto)(props, ctx) });
}
