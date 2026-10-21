/**
 * Egresados de Sistema Propio que aceptaron aparecer en /egresados.
 * Para sumar a alguien: agregar un bloque acá, con su permiso. Mientras la lista esté vacía, la página no se indexa.
 */

export type Egresado = {
  nombre: string;
  /** Ej: "Entrenador", "Analista". */
  rol: string;
  /** Equipo o club, si quiere mostrarlo. */
  equipo?: string;
  /** Ej: "Camada diciembre 2026". */
  camada: string;
  /** Una frase suya sobre el programa. Solo con su permiso. */
  frase?: string;
  /** Usuario de Instagram, sin @. */
  instagram?: string;
};

export const egresados: Egresado[] = [];
