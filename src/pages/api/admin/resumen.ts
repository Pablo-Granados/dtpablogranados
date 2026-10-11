import type { APIRoute } from 'astro';
import { requireAdmin } from '@/lib/admin';
import { enviarResumen } from '@/lib/hoy';
import { json } from '@/lib/server';

export const prerender = false;

/** Desde el panel: manda el mail de Hoy ahora (aunque no haya pendientes), o solo calcula si `sinEnviar`. */
export const POST: APIRoute = async ({ request }) => {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: { sinEnviar?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    /* sin cuerpo: se envía */
  }

  try {
    return json(200, await enviarResumen({ forzar: true, sinEnviar: body.sinEnviar === true }));
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }
};
