/**
 * ============================================================
 *  MAIN.JS — Lógica de la página
 *  (el contenido editable vive en config.js, no acá)
 * ============================================================
 */

const WHATSAPP_NUMBER = "5493416287921";

function contactWhatsApp(planName) {
  const message = `Hola, quiero más información sobre el plan ${planName}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

/* ------------------------------------------------------------
   1) NAV: cambia de estilo al scrollear
------------------------------------------------------------ */
function initNavScroll() {
  const nav = document.getElementById("navbar");
  const ctaBtn = document.getElementById("nav-cta");
  if (!nav) return;

  const onScroll = () => {
    const scrolled = window.scrollY > 80;
    nav.classList.toggle("scrolled", scrolled);
    nav.classList.toggle("not-scrolled", !scrolled);
    if (ctaBtn) ctaBtn.classList.toggle("force-visible", scrolled);
  };
  window.addEventListener("scroll", onScroll);
  onScroll();
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    const show = window.scrollY > 600;
    btn.classList.toggle("opacity-0", !show);
    btn.classList.toggle("pointer-events-none", !show);
    btn.classList.toggle("translate-y-4", !show);
  });
}

/* ------------------------------------------------------------
   2) REVEAL: elementos aparecen al entrar en pantalla
------------------------------------------------------------ */
function initRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("active");
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ------------------------------------------------------------
   3) ACORDEÓN (sección Diagnóstico: "Qué te ofrezco")
------------------------------------------------------------ */
function initAccordion(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panel = trigger.nextElementSibling;
      const isOpen = panel.classList.contains("open");

      // cierra los demás paneles del mismo contenedor
      container.querySelectorAll(".accordion-panel.open").forEach((p) => p.classList.remove("open"));
      container.querySelectorAll("[data-accordion-trigger] .chevron").forEach((c) => c.classList.remove("rotate-90", "text-accent"));

      if (!isOpen) {
        panel.classList.add("open");
        trigger.querySelector(".chevron")?.classList.add("rotate-90", "text-accent");
      }
    });
  });
}

/* ------------------------------------------------------------
   4) CARRUSEL genérico (usado en "Soluciones Tácticas")
------------------------------------------------------------ */
function initCarousel(trackId, btnLeftId, btnRightId) {
  const track = document.getElementById(trackId);
  const btnLeft = document.getElementById(btnLeftId);
  const btnRight = document.getElementById(btnRightId);
  if (!track) return;

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 10;
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 10;
    if (btnLeft) btnLeft.style.opacity = atStart ? "0" : "1";
    if (btnLeft) btnLeft.style.pointerEvents = atStart ? "none" : "auto";
    if (btnRight) btnRight.style.opacity = atEnd ? "0" : "1";
    if (btnRight) btnRight.style.pointerEvents = atEnd ? "none" : "auto";
  };

  const scrollByCard = (dir) => {
    const card = track.querySelector(".snap-item");
    if (!card) return;
    const gap = 24;
    const cardWidth = card.offsetWidth + gap;
    track.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  };

  btnLeft?.addEventListener("click", () => scrollByCard("left"));
  btnRight?.addEventListener("click", () => scrollByCard("right"));
  track.addEventListener("scroll", updateArrows);
  window.addEventListener("resize", updateArrows);

  track.querySelectorAll(".snap-item").forEach((card) => {
    card.addEventListener("click", () => card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }));
  });

  setTimeout(updateArrows, 100);
  setTimeout(updateArrows, 600);
}

function loadJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = "jsonp_cb_" + Math.random().toString(36).slice(2);
    window[callbackName] = (data) => {
      resolve(data);
      delete window[callbackName];
      script.remove();
    };
    const script = document.createElement("script");
    script.src = `${url}${url.includes("?") ? "&" : "?"}callback=${callbackName}`;
    script.onerror = () => {
      reject(new Error("No se pudo cargar (JSONP)"));
      delete window[callbackName];
      script.remove();
    };
    document.body.appendChild(script);
  });
}

async function loadSiteData() {
  const CACHE_KEY = "dtpg_site_data";
  const CACHE_MS = 5 * 60 * 1000;

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts < CACHE_MS) return parsed.data;
    }
  } catch (e) {}

  const data = await loadJsonp(SITE_CONFIG.sheetUrl);

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (e) {}

  return data;
}



/* ------------------------------------------------------------
   5) EBOOK: pinta la sección de venta desde config.js
------------------------------------------------------------ */
function renderEbook() {
  const cfg = SITE_CONFIG.ebook;
  const root = document.getElementById("ebook-content");
  if (!root || !cfg) return;

  const bullets = cfg.bullets.map(b => `
    <li class="flex items-start gap-3 text-sm md:text-base text-white/70 font-medium">
      <span class="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0"></span>
      ${b}
    </li>
  `).join("");

  root.innerHTML = `
    <div class="reveal sport-card p-8 md:p-12 bg-gradient-to-br from-card-dark to-[#0a0a0a] border-accent/20">
      <div class="grid md:grid-cols-[180px_1fr] gap-8 items-start mb-8">
        <img src="${cfg.imagen}" alt="${cfg.titulo}" class="w-full max-w-[180px] mx-auto md:mx-0 rounded-lg shadow-2xl" />
        <div>
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Ebook</span>
          <h3 class="mt-4 text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">${cfg.titulo}</h3>
          <p class="mt-4 text-white/50 font-medium italic">${cfg.subtitulo}</p>
        </div>
      </div>
      <ul class="mt-2 space-y-4">${bullets}</ul>
      <div class="mt-10 flex items-center justify-between gap-6 flex-wrap">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-3xl font-black italic text-accent">${cfg.precio}</span>
          ${cfg.precioRegular ? `<span class="text-base text-white/30 line-through font-bold">${cfg.precioRegular}</span>` : ""}
        </div>
        
        <a href="checkout.html"
           class="bg-accent text-black px-10 py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-white transition-all inline-flex items-center gap-3">
          Quiero mi ejemplar
        </a>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------
   6) FUTSAL HUB: pinta la sección destacada de producto propio
------------------------------------------------------------ */
function renderFutsalHub() {
  const cfg = SITE_CONFIG.futsalHub;
  const root = document.getElementById("futsalhub-content");
  if (!root || !cfg) return;

  const bullets = cfg.bullets.map(b => `
    <li class="flex items-start gap-3 text-sm md:text-base text-white/70 font-medium">
      <span class="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0"></span>
      ${b}
    </li>
  `).join("");

  root.innerHTML = `
    <div class="reveal sport-card border-accent/30 bg-gradient-to-br from-accent/10 via-card-dark to-card-dark overflow-hidden">
      <div class="grid lg:grid-cols-2 items-center">

        <div class="p-8 md:p-14 lg:p-16">
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Producto propio</span>
          <h2 class="mt-4 text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-[0.9]">${cfg.titulo}</h2>
          <p class="mt-4 text-white/50 font-medium italic">${cfg.subtitulo}</p>
          <p class="mt-6 text-white/40 text-sm leading-relaxed">${cfg.descripcion}</p>
          <ul class="mt-8 space-y-4">${bullets}</ul>
          <a href="${cfg.url}" target="_blank" rel="noopener"
             class="mt-10 inline-flex items-center gap-3 bg-accent text-black px-10 py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-white transition-all">
            Entrar a Futsal Hub
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        </div>

        <div class="relative h-full min-h-[280px] lg:min-h-[420px] flex items-center justify-center bg-black/30 border-t lg:border-t-0 lg:border-l border-white/5 p-10">
          <div class="absolute inset-0 tactical-bg opacity-40"></div>
          <a href="${cfg.url}" target="_blank" rel="noopener" class="relative w-full max-w-sm sport-card border-white/10 bg-bg-dark/80 backdrop-blur-md overflow-hidden block hover:border-accent/50 transition-colors">
            <div class="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
              <span class="h-2.5 w-2.5 rounded-full bg-tier-elite/60"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-tier-pro/60"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-tier-basic/60"></span>
            </div>
            <div class="p-8 flex flex-col items-center text-center gap-4">
              <img src="image/futsalhub-logo.png" alt="ARF Futsal Hub" class="w-24 h-24 object-contain" />
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Estadísticas en vivo</p>
            </div>
          </a>
        </div>

      </div>
    </div>
  `;
  lucide.createIcons();
}

/* ------------------------------------------------------------
   7) PRIMERA GENERACIÓN: pinta la grilla desde config.js
------------------------------------------------------------ */
function renderPrimeraGeneracion(list) {
  const root = document.getElementById("generacion-content");
  if (!root) return;

  list = list || [];

  if (list.length === 0) {

    root.innerHTML = `
      <div class="reveal flex flex-col items-center justify-center text-center py-16 border border-dashed border-white/10 rounded-2xl">
        <p class="text-white/30 font-bold uppercase tracking-widest text-xs">Todavía no hay integrantes cargados</p>
        <p class="text-white/20 text-[10px] mt-2 uppercase tracking-widest">Sé el primero en sumarte comprando el ebook</p>
      </div>
    `;
    root.querySelectorAll(".reveal").forEach((el) => el.classList.add("active"));
    return;
  }

  const buildCard = (p) => {
    const igRow = p.instagram
      ? `<div class="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-white/40">
           <svg class="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
           @${p.instagram}
         </div>`
      : "";

    const cardInner = `
      <img src="${p.imagen}" alt="${p.nombre}" class="w-16 h-16 rounded-full object-cover mx-auto border-2 border-accent/30" />
      <p class="mt-3 text-sm md:text-base font-black uppercase italic tracking-tight text-center">${p.nombre}</p>
      <p class="text-[10px] md:text-xs text-accent/70 font-bold uppercase tracking-widest mt-1 text-center">${p.dato || ""}</p>
      ${igRow}
    `;

    return p.instagram
      ? `<a href="https://instagram.com/${p.instagram}" target="_blank" rel="noopener" class="reveal gen-card block hover:border-accent/50 transition-colors">${cardInner}</a>`
      : `<div class="reveal gen-card">${cardInner}</div>`;
  };

  const PREVIEW_COUNT = 4;
  const previewCards = list.slice(0, PREVIEW_COUNT).map(buildCard).join("");
  const verTodosBtn = list.length > PREVIEW_COUNT
    ? `<button id="generacion-ver-todos" class="mt-6 w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-accent border border-accent/30 hover:bg-accent/10 transition-colors rounded-lg">Ver todos (${list.length})</button>`
    : "";

  root.innerHTML = `
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">${previewCards}</div>
    ${verTodosBtn}
  `;
  root.querySelectorAll(".reveal").forEach((el) => el.classList.add("active"));

  if (list.length > PREVIEW_COUNT) {
    const modal = document.getElementById("generacion-modal");
    const modalContent = document.getElementById("generacion-modal-content");
    const openBtn = document.getElementById("generacion-ver-todos");
    const closeBtn = document.getElementById("generacion-modal-close");
    const backdrop = document.getElementById("generacion-modal-backdrop");

    const openModal = () => {
      modalContent.innerHTML = `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">${list.map(buildCard).join("")}</div>`;
      modalContent.querySelectorAll(".reveal").forEach((el) => el.classList.add("active"));
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.style.overflow = "hidden";
      lucide.createIcons();
    };
    const closeModal = () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
    };

    openBtn?.addEventListener("click", openModal);
    closeBtn?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);
  }
}

function renderOpiniones(list) {
  const root = document.getElementById("opiniones-content");
  if (!root) return;
  list = list || [];

  if (list.length === 0) {
    root.innerHTML = `<p class="text-center text-white/20 text-[10px] uppercase tracking-widest">Todavía no hay opiniones cargadas</p>`;
    return;
  }

  const cards = list.map((o) => {
    const estrellas = Number(o.estrellas) || 0;
    const stars = Array.from({ length: 5 }, (_, i) =>
      `<span style="color:${i < estrellas ? '#00f2ff' : 'rgba(255,255,255,0.15)'}">★</span>`
    ).join("");

    return `
      <div class="reveal gen-card text-left">
        <div class="text-lg mb-2">${stars}</div>
        <p class="text-white/70 text-sm leading-relaxed italic">"${o.comentario || ""}"</p>
        <p class="mt-3 text-[10px] font-black uppercase tracking-widest text-accent/70">${o.nombre || ""}</p>
      </div>
    `;
  }).join("");

  root.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>`;
  root.querySelectorAll(".reveal").forEach((el) => el.classList.add("active"));
}

/* ------------------------------------------------------------
   8) SECCIONES: aplica visibilidad y orden según config.js
------------------------------------------------------------ */
function applySectionConfig() {
  const cfg = SITE_CONFIG.seccionesFallback;
  const container = document.getElementById("dynamic-sections");
  if (!container) return;

  const nodes = Array.from(container.children);

  nodes.forEach((node) => {
    const key = node.dataset.section;
    const rule = cfg[key];
    if (!rule) return;
    node.style.display = rule.visible ? "" : "none";
    node.style.order = rule.orden;
  });

  container.style.display = "flex";
  container.style.flexDirection = "column";

}

/* ------------------------------------------------------------
   INIT
------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", async () => {
  applySectionConfig();
  renderEbook();
  renderFutsalHub();
  initNavScroll();
  initBackToTop();
  initAccordion("#diagnostico-accordion");
  initCarousel("solutions-track", "solutions-left", "solutions-right");
  initRevealObserver();
  lucide.createIcons();

  let generacion = [];
  try {
    const data = await loadSiteData();
        generacion = data.generacion || [];
    renderOpiniones(data.opiniones || []);
  } catch (err) {
    console.error("No se pudo cargar Primera Generación:", err);
  }
  renderPrimeraGeneracion(generacion);

});