import type { APIRoute } from 'astro';
import { parseClip } from '@/data/clip';
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

  const clip = parseClip(body);
  if (!clip) return json(400, { error: 'Datos incompletos' });

  const utm = typeof body.utm === 'object' && body.utm ? body.utm : {};

  try {
    const saved = await supabaseInsert('clips', { ...clip, autoriza: true, utm });
    if (!saved) return json(500, { error: 'No se pudo guardar' });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }

  const site = env('SITE_URL') ?? url.origin;
  const confirmacion = emailLayout({
    site,
    preheader: 'Recibí tu clip. Si lo elijo, lo analizo de manera pública el mes que viene.',
    kicker: 'Análisis de un clip',
    title: 'Recibí tu clip',
    body: [
      mailP(`Hola ${esc(clip.nombre)},`),
      mailP('Recibí tu clip y lo voy a ver. Cada mes elijo los que dejan más enseñanza, así que no se analizan todos.'),
      mailCallout(
        '<strong>Qué pasa ahora:</strong> si tu clip queda elegido, te escribo antes de publicar. El análisis sale de manera pública (Instagram o YouTube) el mes que viene.',
      ),
      mailP('Si querés agregar contexto (el resultado, el momento del partido, qué estaba trabajando tu equipo), respondé este mail.'),
      mailP('Pablo Granados'),
    ].join(''),
  });

  try {
    await Promise.all([
      // Aviso para vos: responder le contesta directo a quien lo mandó
      sendMail({
        to: ownerEmail(),
        fromName: 'Web',
        replyTo: clip.email,
        subject: `Clip para analizar: ${clip.nombre} (${clip.deporte})`,
        text: [
          `${clip.nombre} <${clip.email}>${clip.instagram ? `  ·  @${clip.instagram}` : ''}`,
          `Deporte: ${clip.deporte}`,
          `Clip: ${clip.link}`,
          `Minuto: ${clip.minuto}`,
          '',
          'Qué quiere que analice:',
          clip.pregunta,
          '',
          'Autorizó el análisis y la publicación.',
          `UTM: ${JSON.stringify(utm)}`,
        ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n'),
      }),
      sendMail({ to: clip.email, subject: 'Recibí tu clip', html: confirmacion }),
    ]);
  } catch (e) {
    // El clip ya quedó guardado: no se pierde aunque falle el mail
    console.error('Email', e);
  }

  return json(200, { ok: true });
};
