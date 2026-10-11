/**
 * Mail de la mañana con lo que pide atención en el panel. Lo dispara Vercel Cron (vercel.json), todos los días.
 * Vercel manda `Authorization: Bearer <CRON_SECRET>`; sin ese secreto no se ejecuta nada.
 * Para probar sin enviar: GET /api/cron/resumen?sin_enviar=1 con el mismo encabezado.
 */
import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { enviarResumen } from '@/lib/hoy';
import { env, json } from '@/lib/server';

export const prerender = false;

function autorizado(request: Request) {
  const secreto = env('CRON_SECRET');
  const recibido = request.headers.get('authorization') ?? '';
  if (!secreto) return false;
  const esperado = Buffer.from(`Bearer ${secreto}`);
  const dado = Buffer.from(recibido);
  return esperado.length === dado.length && timingSafeEqual(esperado, dado);
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!autorizado(request)) return json(401, { error: 'No autorizado' });
  try {
    return json(200, await enviarResumen({ sinEnviar: url.searchParams.get('sin_enviar') === '1' }));
  } catch (e) {
    console.error('Resumen diario', e);
    return json(500, { error: (e as Error).message });
  }
};
