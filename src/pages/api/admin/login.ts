import type { APIRoute } from 'astro';
import { adminConfigured, isLocal, passwordLogin, sessionCookies } from '@/lib/admin';
import { json } from '@/lib/server';

export const prerender = false;

/** Freno básico contra adivinar la contraseña: 5 intentos fallidos por minuto por instancia. */
let fails: number[] = [];

export const POST: APIRoute = async ({ request, url }) => {
  if (!adminConfigured()) return json(500, { error: 'Falta configurar el panel' });

  const now = Date.now();
  fails = fails.filter((t) => now - t < 60_000);
  if (fails.length >= 5) return json(429, { error: 'Demasiados intentos. Esperá un minuto.' });

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'JSON inválido' });
  }

  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');
  if (!email || !password || password.length > 200) return json(400, { error: 'Completá mail y contraseña' });

  try {
    const tokens = await passwordLogin(email, password);
    if (!tokens) {
      fails.push(now);
      return json(401, { error: 'Mail o contraseña incorrectos' });
    }
    const res = json(200, { ok: true });
    for (const c of sessionCookies(tokens, !isLocal(url))) res.headers.append('Set-Cookie', c);
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch {
    return json(500, { error: 'No se pudo ingresar' });
  }
};
