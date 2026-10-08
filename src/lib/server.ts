/**
 * Utilidades que solo corren en el servidor (rutas de /api).
 * Nunca importar este archivo desde una página o un <script> del navegador.
 */
import nodemailer from 'nodemailer';

export const env = (key: string) => process.env[key] ?? (import.meta.env[key] as string | undefined);

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Inserta una fila en Supabase con la service key. Devuelve true si salió bien. */
export async function supabaseInsert(table: string, row: Record<string, unknown>) {
  const url = env('SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Falta configurar Supabase');

  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) console.error('Supabase', table, res.status, await res.text());
  return res.ok;
}

/** Una sola conexión a Gmail, reutilizada entre envíos (cada conexión nueva suma varios segundos). */
let cached: { key: string; t: ReturnType<typeof nodemailer.createTransport> } | null = null;
function transporter(user: string, pass: string) {
  const key = `${user}:${pass}`;
  if (!cached || cached.key !== key) {
    cached = { key, t: nodemailer.createTransport({ service: 'gmail', pool: true, auth: { user, pass } }) };
  }
  return cached.t;
}

/** Envía un mail desde el Gmail configurado. */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
  replyTo?: string;
}) {
  const user = env('GMAIL_USER');
  const pass = env('GMAIL_APP_PASSWORD');
  if (!user || !pass) throw new Error('Falta configurar el email');

  await transporter(user, pass).sendMail({
    from: `${opts.fromName ?? 'Pablo Granados'} <${user}>`,
    replyTo: opts.replyTo ?? user,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

export const ownerEmail = () => env('GMAIL_USER') ?? '';
