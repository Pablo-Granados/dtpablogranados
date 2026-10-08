import type { APIRoute } from 'astro';
import { areas, questions, roles, scoreAnswers, type AreaId } from '@/data/diagnostico';
import { emailLayout, mailButton, mailCallout, mailH2, mailP } from '@/lib/email';
import { env, esc, json, ownerEmail, sendMail, supabaseInsert } from '@/lib/server';

/** Esta ruta corre en el servidor (Vercel), no se genera como HTML estático. */
export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'JSON inválido' });
  }

  // Bots: si completaron el campo oculto, respondemos OK y no hacemos nada.
  if (body.web) return json(200, { ok: true });

  const nombre = String(body.nombre ?? '').trim().slice(0, 80);
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 160);
  const rol = String(body.rol ?? '');
  const respuestas = Array.isArray(body.respuestas) ? body.respuestas.map(Number) : [];
  const utm = typeof body.utm === 'object' && body.utm ? body.utm : {};

  if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !(roles as readonly string[]).includes(rol)) {
    return json(400, { error: 'Datos incompletos' });
  }

  // El puntaje se recalcula acá: no confiamos en lo que manda el navegador.
  let result;
  try {
    result = scoreAnswers(respuestas);
  } catch {
    return json(400, { error: 'Respuestas inválidas' });
  }

  // 1. Guardar en Supabase
  try {
    const saved = await supabaseInsert('diagnosticos', {
      nombre,
      email,
      rol,
      respuestas,
      puntajes: result.scores,
      total: result.total,
      nivel: result.level.name,
      prioridades: result.priorities,
      utm,
    });
    if (!saved) return json(500, { error: 'No se pudo guardar' });
  } catch (e) {
    return json(500, { error: (e as Error).message });
  }

  // 2. Mails (el lead ya quedó guardado, así que no se pierde si fallan)
  const site = env('SITE_URL') ?? url.origin;
  const plantilla = `${site}/plantillas/informe-rival-1-pagina.pdf`;

  const bars = (Object.keys(areas) as AreaId[])
    .map((id) => {
      const v = result.scores[id];
      const prio = result.priorities.includes(id);
      return `<tr>
        <td style="padding:7px 14px 7px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${prio ? '#0b0d10' : '#5d646d'};font-weight:${prio ? 700 : 400};white-space:nowrap">${areas[id].label}</td>
        <td style="padding:7px 0;width:100%"><div style="background:#e3e7ea;height:8px"><div style="background:${prio ? '#0b0d10' : '#a9b0b7'};height:8px;width:${v}%"></div></div></td>
        <td style="padding:7px 0 7px 14px;font-family:'Courier New',monospace;font-size:14px;color:#0b0d10">${v}</td>
      </tr>`;
    })
    .join('');

  const prios = result.priorities
    .map(
      (id, i) =>
        mailCallout(`<div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5d646d">Prioridad ${i + 1}</div>
        <div style="font-size:19px;font-weight:700;margin:4px 0 8px">${areas[id].label}</div>
        <div>${areas[id].tip}</div>
        <div style="margin-top:10px"><strong>Primer paso:</strong> ${areas[id].firstStep}</div>`),
    )
    .join('');

  const html = emailLayout({
    site,
    preheader: `Tu nivel: ${result.level.name} (${result.total}/100). Acá están tus prioridades y la plantilla.`,
    kicker: 'Diagnóstico del analista',
    title: result.level.name,
    body: `
      ${mailP(`Hola ${esc(nombre)}, este es el resultado de tu diagnóstico.`)}
      <div style="margin:0 0 6px;font-family:'Arial Narrow',Arial,sans-serif;font-size:56px;line-height:1;font-weight:800;color:#0b0d10">${result.total}<span style="font-size:22px;color:#5d646d;font-weight:400"> / 100</span></div>
      ${mailP(result.level.text)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 8px">${bars}</table>
      ${mailH2('Por dónde empezar')}
      ${prios}
      ${mailH2('Tu plantilla')}
      ${mailP('Es la estructura de informe de rival que uso: todo en una página, pensada para que el cuerpo técnico la lea en 5 minutos.')}
      ${mailButton(plantilla, 'Descargar la plantilla')}
      ${mailP(`Si querés trabajar estas áreas sobre tus propios partidos y con acompañamiento, eso es lo que hacemos en <a href="${site}/mentoria" style="color:#0b0d10;font-weight:700">Sistema Propio</a>. Y si tenés alguna duda sobre tu resultado, respondé este mail: lo leo yo.`)}
      ${mailP('Pablo Granados')}`,
  });

  try {
    await Promise.all([
      sendMail({ to: email, subject: `Tu diagnóstico: ${result.level.name}`, html }),
      // Aviso para vos
      sendMail({
        to: ownerEmail(),
        fromName: 'Web',
        replyTo: email,
        subject: `Nuevo diagnóstico: ${nombre} (${rol}) · ${result.total}/100`,
        text: [
          `${nombre} <${email}> · ${rol}`,
          `Nivel: ${result.level.name} (${result.total}/100)`,
          `Prioridades: ${result.priorities.map((p) => areas[p].label).join(', ')}`,
          '',
          ...questions.map((q, i) => `${i + 1}. ${q.text}\n   → ${q.options[respuestas[i]]}`),
          '',
          `UTM: ${JSON.stringify(utm)}`,
        ].join('\n'),
      }),
    ]);
  } catch (err) {
    console.error('Email', err);
    return json(502, { error: 'No se pudo enviar el email' });
  }

  return json(200, { ok: true });
};
