/**
 * Freno de abusos: limita cuántas veces una misma IP puede usar un formulario.
 * Cuenta en Supabase (función rate_hit, ver supabase/seguridad.sql). La IP se guarda solo como huella.
 * Si Supabase falla o la función no existe, deja pasar: un fallo acá nunca debe bloquear un formulario real.
 */
import { createHash } from 'node:crypto';
import { env, json } from './server';

function ip(request: Request): string {
  const f = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return f || request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || '';
}

async function hit(key: string, max: number, ventana: number): Promise<boolean> {
  const url = env('SUPABASE_URL');
  const svc = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !svc) return true;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/rate_hit`, {
      method: 'POST',
      headers: { apikey: svc, Authorization: `Bearer ${svc}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_key: key, p_limit: max, p_window: ventana }),
    });
    if (!res.ok) return true;
    return (await res.json()) !== false;
  } catch {
    return true;
  }
}

/**
 * Devuelve una respuesta 429 si la IP superó el límite, o null si puede seguir.
 * Por defecto: 6 envíos cada 10 minutos en ese formulario y 25 por hora en total.
 */
export async function limitar(request: Request, formulario: string, max = 6, ventana = 600): Promise<Response | null> {
  const direccion = ip(request);
  if (!direccion) return null;
  const huella = createHash('sha256').update(`${env('RATE_SALT') ?? 'pg'}:${direccion}`).digest('hex').slice(0, 24);
  const [propio, total] = await Promise.all([hit(`${formulario}:${huella}`, max, ventana), hit(`todos:${huella}`, 25, 3600)]);
  if (propio && total) return null;
  return json(429, { error: 'Demasiados envíos seguidos. Probá de nuevo en unos minutos.' });
}
