/**
 * Acceso al panel privado. Solo servidor.
 * Login con mail y contraseña de Supabase Auth. Las cookies guardan los tokens de Supabase
 * y cada pedido se valida contra Supabase; además solo entra el mail del dueño (ADMIN_EMAIL,
 * o GMAIL_USER si no está definido), aunque existan otros usuarios en el proyecto.
 */
import { env, json, ownerEmail } from './server';

export const COOKIE = 'pg_admin';
export const COOKIE_REFRESH = 'pg_admin_r';
const REFRESH_DAYS = 7;

export type Tokens = { access_token: string; refresh_token: string; expires_in: number };

export const allowedEmail = () => (env('ADMIN_EMAIL') ?? ownerEmail()).trim().toLowerCase();

export const adminConfigured = () => !!(env('SUPABASE_URL') && env('SUPABASE_SERVICE_ROLE_KEY') && allowedEmail());

const authUrl = (path: string) => `${env('SUPABASE_URL')!.replace(/\/$/, '')}/auth/v1/${path}`;
const baseHeaders = () => ({ apikey: env('SUPABASE_SERVICE_ROLE_KEY')!, 'Content-Type': 'application/json' });

/** Mail y contraseña contra Supabase Auth. Devuelve los tokens o null si no corresponde. */
export async function passwordLogin(email: string, password: string): Promise<Tokens | null> {
  if (email.trim().toLowerCase() !== allowedEmail()) return null;
  const res = await fetch(authUrl('token?grant_type=password'), {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const t = (await res.json()) as Tokens;
  return t.access_token ? t : null;
}

async function refreshTokens(refresh: string): Promise<Tokens | null> {
  const res = await fetch(authUrl('token?grant_type=refresh_token'), {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) return null;
  const t = (await res.json()) as Tokens;
  return t.access_token ? t : null;
}

/** Evita consultar a Supabase en cada pedido: se recuerda un minuto qué token es válido. */
const seen = new Map<string, number>();

async function validToken(token: string): Promise<boolean> {
  const until = seen.get(token);
  if (until && until > Date.now()) return true;
  seen.delete(token);
  try {
    const res = await fetch(authUrl('user'), { headers: { ...baseHeaders(), Authorization: `Bearer ${token}` } });
    if (!res.ok) return false;
    const u = (await res.json()) as { email?: string };
    if (String(u.email ?? '').toLowerCase() !== allowedEmail()) return false;
  } catch {
    return false;
  }
  if (seen.size > 50) seen.clear();
  seen.set(token, Date.now() + 60_000);
  return true;
}

function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.get('cookie') ?? '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

export async function isAdmin(request: Request): Promise<boolean> {
  if (!adminConfigured()) return false;
  const token = readCookie(request, COOKIE);
  return !!token && (await validToken(token));
}

/**
 * Para la página del panel: si el acceso venció pero queda el token de renovación,
 * pide uno nuevo. Devuelve las cookies a enviar, o null si hay que volver a ingresar.
 */
export async function renewSession(request: Request, secure: boolean): Promise<string[] | null> {
  if (!adminConfigured()) return null;
  const refresh = readCookie(request, COOKIE_REFRESH);
  if (!refresh) return null;
  try {
    const t = await refreshTokens(refresh);
    return t && (await validToken(t.access_token)) ? sessionCookies(t, secure) : null;
  } catch {
    return null;
  }
}

const flags = (secure: boolean) => `Path=/; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`;

/** Cookies de sesión: solo http, mismo sitio y, fuera de localhost, solo https. */
export function sessionCookies(t: Tokens, secure: boolean): string[] {
  return [
    `${COOKIE}=${encodeURIComponent(t.access_token)}; Max-Age=${t.expires_in || 3600}; ${flags(secure)}`,
    `${COOKIE_REFRESH}=${encodeURIComponent(t.refresh_token)}; Max-Age=${REFRESH_DAYS * 24 * 3600}; ${flags(secure)}`,
  ];
}

export const clearCookies = (secure: boolean) => [
  `${COOKIE}=; Max-Age=0; ${flags(secure)}`,
  `${COOKIE_REFRESH}=; Max-Age=0; ${flags(secure)}`,
];

/** Cierra la sesión también en Supabase (mejor esfuerzo). */
export async function revoke(request: Request) {
  const token = readCookie(request, COOKIE);
  if (!token || !adminConfigured()) return;
  seen.delete(token);
  try {
    await fetch(authUrl('logout'), { method: 'POST', headers: { ...baseHeaders(), Authorization: `Bearer ${token}` } });
  } catch {
    /* sin consecuencias: las cookies se borran igual */
  }
}

/**
 * Protege las rutas de la API. Los cambios (POST, PATCH, DELETE) además exigen el encabezado
 * X-Admin, que un sitio ajeno no puede mandar: frena los pedidos falsificados entre sitios.
 */
export async function requireAdmin(request: Request): Promise<Response | null> {
  if (!(await isAdmin(request))) return json(401, { error: 'No autorizado' });
  if (request.method !== 'GET' && request.headers.get('x-admin') !== '1') return json(403, { error: 'Pedido no válido' });
  return null;
}

export const isLocal = (url: URL) => ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
