import type { APIRoute } from 'astro';
import { findTemplate, templates } from '@/data/plantillas';
import { emailLayout, mailButton, mailCallout, mailP } from '@/lib/email';
import { env, esc, json, sendMail, supabaseInsert } from '@/lib/server';

export const prerender = false;

/**
 * Descarga de una plantilla (con `plantilla`) o solo suscripción al aviso (sin `plantilla`).
 * Los archivos salen de src/data/plantillas.ts, nunca del navegador.
 */
export const POST: APIRoute = async ({ request, url }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'JSON inválido' });
  }

  // Campo trampa para bots
  if (body.web) return json(200, { ok: true, files: [] });

  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 160);
  const nombre = String(body.nombre ?? '').trim().slice(0, 80);
  const avisos = body.avisos === true;
  const slug = body.plantilla ? String(body.plantilla) : null;
  const utm = typeof body.utm === 'object' && body.utm ? body.utm : {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: 'Email inválido' });

  const template = slug ? findTemplate(slug) : null;
  if (slug && !template) return json(404, { error: 'Plantilla no disponible' });
  // Sin plantilla, el único motivo para dejar el mail es que quiera el aviso
  if (!template && !avisos) return json(400, { error: 'Datos incompletos' });

  try {
    const saved = await supabaseInsert('plantillas_leads', {
      email,
      nombre: nombre || null,
      plantilla: template?.slug ?? null,
      avisos,
      utm,
    });
    if (!saved) return json(500, { error: 'No se pudo guardar' });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }

  const site = env('SITE_URL') ?? url.origin;
  const host = site.replace(/^https?:\/\//, '');
  const otras = templates.filter((t) => t.slug !== template?.slug);
  const hola = nombre ? `Hola ${esc(nombre)},` : 'Hola,';

  const html = template
    ? emailLayout({
        site,
        preheader: `Tu plantilla: ${template.name}. PDF y hoja de cálculo.`,
        kicker: `Plantilla ${template.n} · gratis`,
        title: template.name,
        body: [
          mailP(hola),
          mailP(`Acá están los archivos de <strong>${esc(template.name)}</strong>: ${esc(template.tagline.toLowerCase())}.`),
          ...template.files.map((f) => mailButton(`${site}${f.href}`, f.label)),
          mailCallout(
            `Hay ${otras.length} plantillas más, gratis: ${otras.map((o) => esc(o.name)).join(', ')}. Están todas en <a href="${site}/plantillas" style="color:#0b0d10;font-weight:700">${host}/plantillas</a>.${avisos ? ' Te aviso cuando sume una nueva.' : ''}`,
          ),
          mailP('Si algo no se entiende o querés contarme cómo te fue, respondé este mail: lo leo yo.'),
          mailP('Pablo Granados'),
        ].join(''),
      })
    : emailLayout({
        site,
        preheader: 'Listo, te aviso cuando haya una plantilla nueva.',
        kicker: 'Plantillas gratuitas',
        title: 'Te aviso',
        body: [
          mailP(hola),
          mailP('Anotado. Te escribo cuando sume una plantilla nueva.'),
          mailCallout(`Mientras tanto, las ${templates.length} plantillas que ya están son gratis: <a href="${site}/plantillas" style="color:#0b0d10;font-weight:700">${host}/plantillas</a>.`),
          mailP('Pablo Granados'),
        ].join(''),
  });

  try {
    await sendMail({
      to: email,
      subject: template ? `Tu plantilla: ${template.name}` : 'Te aviso cuando haya plantillas nuevas',
      html,
    });
  } catch (e) {
    // El contacto ya quedó guardado y la descarga se entrega igual en pantalla
    console.error('Email', e);
  }

  return json(200, { ok: true, files: template?.files ?? [] });
};
