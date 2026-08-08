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
      <span class="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Ebook</span>
      <h3 class="mt-4 text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">${cfg.titulo}</h3>
      <p class="mt-4 text-white/50 font-medium italic">${cfg.subtitulo}</p>
      <ul class="mt-8 space-y-4">${bullets}</ul>
      <div class="mt-10 flex items-center justify-between gap-6 flex-wrap">
        <span class="text-3xl font-black italic text-accent">${cfg.precio}</span>
        <a href="${cfg.checkoutUrl}" target="_blank" rel="noopener"
           class="bg-accent text-black px-10 py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-white transition-all inline-flex items-center gap-3">
          Quiero mi ejemplar
        </a>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------
   6) PRIMERA GENERACIÓN: pinta la grilla desde config.js
------------------------------------------------------------ */
function renderPrimeraGeneracion() {
  const list = SITE_CONFIG.primeraGeneracion || [];
  const root = document.getElementById("generacion-content");
  if (!root) return;

  if (list.length === 0) {
    root.innerHTML = `
      <div class="reveal flex flex-col items-center justify-center text-center py-16 border border-dashed border-white/10 rounded-2xl">
        <p class="text-white/30 font-bold uppercase tracking-widest text-xs">Todavía no hay integrantes cargados</p>
        <p class="text-white/20 text-[10px] mt-2 uppercase tracking-widest">Sé el primero en sumarte comprando el ebook</p>
      </div>
    `;
    return;
  }

  const cards = list.map((p) => `
    <div class="reveal gen-card">
      <p class="text-sm md:text-base font-black uppercase italic tracking-tight">${p.nombre}</p>
      <p class="text-[10px] md:text-xs text-accent/70 font-bold uppercase tracking-widest mt-1">${p.dato || ""}</p>
    </div>
  `).join("");

  root.innerHTML = `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">${cards}</div>`;
}

/* ------------------------------------------------------------
   7) SECCIONES: aplica visibilidad y orden según config.js
------------------------------------------------------------ */
function applySectionConfig() {
  const cfg = SITE_CONFIG.secciones;
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
document.addEventListener("DOMContentLoaded", () => {
  applySectionConfig();
  renderEbook();
  renderPrimeraGeneracion();
  initNavScroll();
  initAccordion("#diagnostico-accordion");
  initCarousel("solutions-track", "solutions-left", "solutions-right");
  initRevealObserver();
});