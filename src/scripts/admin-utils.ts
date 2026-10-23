/** Utilidades compartidas del panel: formato, fechas y botones. Sin estado ni acceso a la API. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export type Data = Record<string, Row[]>;

export const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const num = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 2 });
export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

const pad = (n: number) => String(n).padStart(2, '0');
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const today = () => iso(new Date());
export const addDays = (s: string, n: number) => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

/** Suma meses conservando el día; si el mes siguiente es más corto, cae en su último día. */
export const addMonths = (s: string, n: number) => {
  const d = parse(s);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return iso(d);
};

/** Lunes de la semana de una fecha. */
export const weekStart = (s: string) => addDays(s, -((parse(s).getDay() + 6) % 7));
export const monthStart = (s: string) => `${s.slice(0, 7)}-01`;
export const shortDate = (s: unknown) => {
  const v = String(s ?? '');
  return /^\d{4}-\d{2}-\d{2}/.test(v) ? `${v.slice(8, 10)}/${v.slice(5, 7)}` : '';
};
export const fechaHora = (s: string) => new Date(s).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
/** "2026-10-01" → "oct 26". */
export const mesCorto = (s: string) => `${MESES[Number(s.slice(5, 7)) - 1]} ${s.slice(2, 4)}`;

/** Lee un CSV (con comillas, comas y saltos de línea dentro de una celda) y devuelve las filas. */
export function parseCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = '';
  let comillas = false;
  const src = texto.replace(/^\ufeff/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (comillas) {
      if (c === '"' && src[i + 1] === '"') {
        celda += '"';
        i++;
      } else if (c === '"') comillas = false;
      else celda += c;
    } else if (c === '"') comillas = true;
    else if (c === ',') {
      fila.push(celda);
      celda = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      fila.push(celda);
      celda = '';
      if (fila.some((x) => x.trim())) filas.push(fila);
      fila = [];
    } else celda += c;
  }
  fila.push(celda);
  if (fila.some((x) => x.trim())) filas.push(fila);
  return filas;
}

export const sumUsd = (rows: Row[]) => rows.reduce((a, c) => a + Number(c.monto_usd), 0);

/** Botón chico de acción. Las acciones que empiezan con "del-" salen en rojo. */
export const btn = (action: string, label: string, attrs: Record<string, string> = {}) =>
  `<button type="button" data-action="${action}" ${Object.entries(attrs).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')} class="tag shrink-0 border px-2.5 py-2 md:py-1.5 ${action.startsWith('del-') ? 'border-[#ff7a7a]/40 text-[#ff7a7a] hover:border-[#ff7a7a] hover:bg-[#ff7a7a]/10' : 'border-line-strong text-faint hover:border-signal hover:text-bone'}">${label}</button>`;
