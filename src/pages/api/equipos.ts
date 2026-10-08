import type { APIRoute } from 'astro';
import { parseTeamRequest } from '@/data/equipos';
import { emailLayout, mailCallout, mailP } from '@/lib/email';
import { env, esc, json, ownerEmail, sendMail, supabaseInsert } from '@/lib/server';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'JSON inválido' });
  }

  // Campo trampa para bots
  if (body.web) return json(200, { ok: true });

  const req = parseTeamRequest(body);
  if (!req) return json(400, { error: 'Datos incompletos' });

  const utm = typeof body.utm === 'object' && body.utm ? body.utm : {};

  try {
    const saved = await supabaseInsert('solicitudes_equipos', { ...req, utm });
    if (!saved) return json(500, { error: 'No se pudo guardar' });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }

  const site = env('SITE_URL') ?? url.origin;
  const confirmacion = emailLayout({
    site,
    preheader: `Recibí tu consulta sobre ${req.organizacion}. Te respondo en 24 horas.`,
    kicker: 'Clubes y agencias',
    title: 'Recibí tu consulta',
    body: [
      mailP(`Hola ${esc(req.nombre)},`),
      mailP(
        `Recibí lo que me contaste sobre <strong>${esc(req.organizacion)}</strong>. Lo leo con atención y te respondo personalmente dentro de las 24 horas, con preguntas concretas o con una propuesta.`,
      ),
      mailCallout(
        `<strong>Mientras tanto:</strong> si querés sumar algo (un partido de ejemplo, un informe actual, el calendario), respondé este mail.`,
      ),
      mailP('Pablo Granados'),
    ].join(''),
  });

  try {
    await Promise.all([
      // Aviso para vos. Responder a este mail le contesta directo a quien consultó.
      sendMail({
        to: ownerEmail(),
        fromName: 'Web',
        replyTo: req.email,
        subject: `Equipos: ${req.organizacion} (${req.necesidad})`,
        text: [
          `${req.nombre} <${req.email}>  WhatsApp: ${req.whatsapp || '—'}`,
          `Organización: ${req.organizacion}`,
          `Rol: ${req.rol} · ${req.deporte} · ${req.nivel}`,
          `Necesita: ${req.necesidad}`,
          '',
          'Contexto:',
          req.contexto,
          '',
          `UTM: ${JSON.stringify(utm)}`,
        ].join('\n'),
      }),
      sendMail({ to: req.email, subject: 'Recibí tu consulta', html: confirmacion }),
    ]);
  } catch (e) {
    // La consulta ya quedó guardada: no se pierde aunque falle el mail
    console.error('Email', e);
  }

  return json(200, { ok: true });
};
