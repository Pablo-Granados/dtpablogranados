import type { APIRoute } from 'astro';
import { parseApplication, qualify } from '@/data/aplicacion';
import { emailLayout, mailButton, mailP } from '@/lib/email';
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
  if (body.web) return json(200, { ok: true, calificada: false });

  const app = parseApplication(body);
  if (!app) return json(400, { error: 'Datos incompletos' });

  // La calificación se decide acá, no en el navegador
  const q = qualify(app);
  const utm = typeof body.utm === 'object' && body.utm ? body.utm : {};

  try {
    const saved = await supabaseInsert('aplicaciones', { ...app, calificada: q.ok, motivos: q.reasons, utm });
    if (!saved) return json(500, { error: 'No se pudo guardar' });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }

  const site = env('SITE_URL') ?? url.origin;
  const calLink = env('PUBLIC_CAL_LINK');
  const agenda = calLink
    ? `https://cal.com/${calLink}?name=${encodeURIComponent(app.nombre)}&email=${encodeURIComponent(app.email)}`
    : null;

  // Confirmación para quien aplicó
  const cuerpo = q.ok
    ? `${mailP('Recibí tu aplicación a Sistema Propio. La leo antes de la llamada, así no perdemos tiempo en lo que ya me contaste.')}
       ${agenda ? `${mailP('Si todavía no elegiste día y horario, podés hacerlo acá:')}${mailButton(agenda, 'Elegir horario')}` : mailP('En las próximas 24 horas te escribo para coordinar una llamada.')}`
    : `${mailP('Recibí tu aplicación a Sistema Propio. Por lo que me contaste, hoy el programa no es lo que más te va a servir, y prefiero decírtelo ahora.')}
       ${mailP('Mientras tanto, si no lo hiciste, te recomiendo el diagnóstico del analista: son 3 minutos y te dice por dónde empezar. Cuando tu situación cambie, volvé a aplicar y lo vemos.')}
       ${mailButton(`${site}/diagnostico`, 'Hacer el diagnóstico')}`;

  const confirmacion = emailLayout({
    site,
    preheader: q.ok ? 'Recibí tu aplicación. Elegí día y horario para la llamada.' : 'Recibí tu aplicación. Te cuento los próximos pasos.',
    kicker: 'Sistema Propio',
    title: 'Recibí tu aplicación',
    body: `${mailP(`Hola ${esc(app.nombre)},`)}${cuerpo}${mailP('Si tenés alguna duda, respondé este mail.')}${mailP('Pablo Granados')}`,
  });

  try {
    await Promise.all([
      // Aviso para vos, con todo lo necesario para preparar la llamada
      sendMail({
        to: ownerEmail(),
        fromName: 'Web',
        replyTo: app.email,
        subject: `${q.ok ? '✅' : '⏸'} Aplicación Sistema Propio: ${app.nombre} (${app.rol}, ${app.deporte})`,
        text: [
          `${app.nombre} <${app.email}>  WhatsApp: ${app.whatsapp || '—'}`,
          `Rol: ${app.rol} · ${app.deporte} · ${app.nivel}`,
          `Video de su equipo: ${app.video}`,
          `Herramientas: ${app.herramientas.join(', ') || '—'}`,
          `Horas por semana: ${app.horas}`,
          `Inversión: ${app.inversion}`,
          '',
          'Qué quiere resolver en 3 meses:',
          app.objetivo,
          '',
          q.ok ? 'CALIFICA: se le mostró la agenda.' : `NO CALIFICA por: ${q.reasons.join(', ')}.`,
          `UTM: ${JSON.stringify(utm)}`,
        ].join('\n'),
      }),
      sendMail({ to: app.email, subject: 'Recibí tu aplicación a Sistema Propio', html: confirmacion }),
    ]);
  } catch (e) {
    // La aplicación ya quedó guardada: no la perdemos aunque falle el mail
    console.error('Email', e);
  }

  return json(200, { ok: true, calificada: q.ok });
};
