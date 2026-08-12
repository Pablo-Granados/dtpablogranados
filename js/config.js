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
  // 1) SECCIONES: ahora se controla desde la pestaña "Secciones"
  //    de tu Google Sheet (visible + orden). Esto de acá abajo
  //    es solo un respaldo por si el Sheet no responde.
  // ----------------------------------------------------------
  seccionesFallback: {
    hero: { visible: true, orden: 1 },
    impacto: { visible: true, orden: 2 },
    diagnostico: { visible: true, orden: 3 },
    autoridad: { visible: true, orden: 4 },
    servicios: { visible: true, orden: 5 },
    ebook: { visible: true, orden: 6 },
    futsalhub: { visible: true, orden: 7 },
    pack: { visible: true, orden: 8 },
    cta: { visible: true, orden: 9 },
  },

  // ----------------------------------------------------------
  // 2) EBOOK: datos de venta
  // ----------------------------------------------------------
  ebook: {
    titulo: "Leé el partido",
    subtitulo: "El manual del analista.",
    precio: "",
    checkoutUrl: "https://mpago.la/2pV7xCs",
    imagen: "image/Lep.png",
    bullets: [
      "Sistemas defensivos y ofensivos explicados paso a paso",
      "Ejercicios de entrenamiento listos para aplicar",
      "Cómo armar tu propio análisis de rival",
      "Acceso de por vida a las actualizaciones del ebook"
    ]
  },

  // ----------------------------------------------------------
  // 3) FUTSAL HUB: tu app propia de estadísticas de la ARF
  // ----------------------------------------------------------
  futsalHub: {
    titulo: "Futsal Hub",
    subtitulo: "Toda la liga de futsal de Rosario, en un solo lugar.",
    descripcion: "La plataforma de estadísticas que armé para seguir la Asociación Rosarina de Futsal: resultados en vivo, tabla de posiciones, fixture por jornada, playoffs y el historial completo de cada club.",
    url: "https://futsalrosario.vercel.app/",
    bullets: [
      "Resultados y fixture actualizados por jornada",
      "Tabla de posiciones y llaves de playoffs",
      "Palmarés histórico por club",
      "Guardá tus equipos favoritos y seguilos de cerca"
    ]
  },

  // ----------------------------------------------------------
  // 4) PRIMERA GENERACIÓN: agregá una línea por cada persona
  //    que compró el ebook. Simplemente copiá un bloque { } y
  //    completá los datos. El orden en que los pongas acá es
  //    el orden en que aparecen en la página.
  // ----------------------------------------------------------
  sheetUrl: "https://script.google.com/macros/s/AKfycbyYPcGTiACOr9KeJ1QAPf2y4s4Tnwyk13mpFID9I7aZi5Op3SIYNKF58iNk68AnAJCw/exec"

};