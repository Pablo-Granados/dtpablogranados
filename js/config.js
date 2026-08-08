/**
 * ============================================================
 *  CONFIG.JS — Panel de control de la página
 * ============================================================
 *  Acá editás vos: qué secciones se muestran, en qué orden,
 *  los datos del ebook, y la lista de "Primera Generación".
 *  No hace falta tocar ningún otro archivo para estos cambios.
 * ============================================================
 */

const SITE_CONFIG = {

  // ----------------------------------------------------------
  // 1) SECCIONES: prendé/apagá y reordená el contenido del medio
  //    de la página (Hero y Footer siempre quedan fijos).
  //    - visible: true/false → se muestra o se oculta
  //    - orden: número → de menor a mayor, define el orden
  // ----------------------------------------------------------
  secciones: {
    impacto:     { visible: true, orden: 1 },  // "No es mirar partidos..."
    diagnostico: { visible: true, orden: 2 },  // Dolor + Solución
    autoridad:   { visible: true, orden: 3 },  // Trayectoria
    servicios:   { visible: true, orden: 4 },  // Carrusel de soluciones
    ebook:       { visible: false, orden: 5 },  // Venta ebook + Primera Generación
    pack:        { visible: true, orden: 6 },  // Planes estratégicos
    cta:         { visible: true, orden: 7 },  // CTA final WhatsApp
  },

  // ----------------------------------------------------------
  // 2) EBOOK: datos de venta
  // ----------------------------------------------------------
  ebook: {
    titulo: "El Manual del DT de Futsal",
    subtitulo: "Tu primer sistema táctico, de la teoría a la cancha.",
    precio: "$14.999 ARS",
    // TODO: reemplazar por tu link real de checkout de Hotmart
    // Ejemplo real: https://pay.hotmart.com/A12345678B
    checkoutUrl: "https://pay.hotmart.com/TU-PRODUCTO-AQUI",
    imagen: "img/ebook-cover.png", // poné acá tu tapa cuando la tengas
    bullets: [
      "Sistemas defensivos y ofensivos explicados paso a paso",
      "Ejercicios de entrenamiento listos para aplicar",
      "Cómo armar tu propio análisis de rival",
      "Acceso de por vida a las actualizaciones del ebook"
    ]
  },

  // ----------------------------------------------------------
  // 3) PRIMERA GENERACIÓN: agregá una línea por cada persona
  //    que compró el ebook. Simplemente copiá un bloque { } y
  //    completá los datos. El orden en que los pongas acá es
  //    el orden en que aparecen en la página.
  // ----------------------------------------------------------
  primeraGeneracion: [
    // Ejemplo — borrá esta línea de ejemplo cuando cargues la primera real:
    // { nombre: "Juan Pérez", dato: "Club Atlético X — Rosario" },
  ]

};