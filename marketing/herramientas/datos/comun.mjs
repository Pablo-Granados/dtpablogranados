/**
 * Datos comunes del plan de contenido: cuenta, enlaces, hashtags y pilares.
 * Todo lo que se repite en las piezas vive acá, así se cambia en un solo lugar.
 */

export const cuenta = {
  handle: '@dtpablogranados',
  sitio: 'pablogranados.com.ar',
  futsalHub: 'futsalhub.com.ar',
  youtube: 'youtube.com/@dtpablogranados',
};

/** Los cuatro pilares de contenido y para qué sirve cada uno. */
export const pilares = {
  Aprender: { color: 'cian', para: 'Autoridad y alcance: tips de análisis que se guardan y se comparten.' },
  Datos: { color: 'cian', para: 'Alcance en el futsal de Rosario y AFA: lo que muestra Futsal Hub.' },
  Detrás: { color: 'cian', para: 'Confianza de clubes y agencias: cómo construís las herramientas.' },
  Oferta: { color: 'cian', para: 'Conversión: Sistema Propio, sistemas a medida, planes y sesión 1:1.' },
};

/** Grupos de hashtags. Se usan de 5 a 8 por publicación, mezclando uno amplio con varios específicos. */
export const hashtags = {
  base: ['#futsal', '#futsalargentina', '#analisisdefutsal'],
  Aprender: ['#entrenadoresdefutsal', '#analisisdepartidos', '#tacticafutsal', '#videoanalisis'],
  Datos: ['#futsalAFA', '#futsalrosario', '#estadisticasfutsal', '#datosdeportivos'],
  Detrás: ['#analistadefutsal', '#tecnologiadeportiva', '#sistemasdeportivos', '#construyendoenpublico'],
  Oferta: ['#entrenadoresdefutsal', '#mentoria', '#analisisdeportivo', '#entrenadores'],
};

/** Palabras clave para pedir por mensaje. Cada una sirve para medir qué pieza trae consultas. */
export const palabrasClave = {
  DIAGNOSTICO: 'Te mando el link al diagnóstico gratis.',
  PLANTILLA: 'Te mando la plantilla que corresponda.',
  CLUB: 'Te cuento cómo trabajo con clubes y agencias.',
  COHORTE: 'Te cuento cómo es la próxima cohorte de Sistema Propio.',
  CLIP: 'Te explico cómo mandar un clip para analizar.',
};

/** Imágenes reales del sitio que se pueden usar en las piezas (capturas de los casos). */
export const capturas = {
  fhPartidos: '/media/futsalhub-partidos.png',
  fhTabla: '/media/futsalhub-tabla.png',
  fhHistorial: '/media/futsalhub-historial.png',
  fhRachas: '/media/futsalhub-rachas.png',
  fhPenales: '/media/futsalhub-penales.png',
  fhPlanificacion: '/media/futsalhub-planificacion.png',
  fhMapaCalor: '/media/futsalhub-mapa-de-calor.png',
  laaPortada: '/media/laasports-portada.png',
  laaAtletas: '/media/laasports-atletas.png',
  laaObjetivos: '/media/laasports-objetivos.png',
  laaPresencia: '/media/laasports-presencia.png',
  laaQuienes: '/media/laasports-quienes-somos.png',
};

/** Texto estándar para sumar al final de las captions según el objetivo de la pieza. */
export const cierres = {
  guardar: 'Guardá este post para tenerlo a mano.',
  compartir: 'Mandáselo a alguien del cuerpo técnico que lo necesite.',
  bio: 'El link está en la bio.',
};
