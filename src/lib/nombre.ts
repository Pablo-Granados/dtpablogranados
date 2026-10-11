/** Nombre y apellido: los formularios piden los dos para poder identificar a cada persona. */
export const hasFullName = (s: string) => /\S+\s+\S+/.test(s.trim());

/** Primer nombre, para saludar ("Hola Pablo,") sin repetir el apellido. */
export const firstName = (s: string) => s.trim().split(/\s+/)[0] ?? '';
