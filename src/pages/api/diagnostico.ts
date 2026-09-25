import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { areas, questions, roles, scoreAnswers, type AreaId } from '@/data/diagnostico';

/** Esta ruta corre en el servidor (Vercel), no se genera como HTML estático. */
export const prerender = false;

const env = (key: string) => process.env[key] ?? (import.meta.env[key] as string | undefined);

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

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
  const supabaseUrl = env('SUPABASE_URL');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return json(500, { error: 'Falta configurar Supabase' });

  const insert = await fetch(`${supabaseUrl}/rest/v1/diagnosticos`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      nombre,
      email,
      rol,
      respuestas,
      puntajes: result.scores,
      total: result.total,
      nivel: result.level.name,
      prioridades: result.priorities,
      utm,
    }),
  });
  if (!insert.ok) {
    console.error('Supabase', insert.status, await insert.text());
    return json(500, { error: 'No se pudo guardar' });
  }

  // 2. Enviar el email (Gmail con contraseña de aplicación)
  const user = env('GMAIL_USER');
  const pass = env('GMAIL_APP_PASSWORD');
  if (!user || !pass) return json(500, { error: 'Falta configurar el email' });

  const site = env('SITE_URL') ?? url.origin;
  const plantilla = `${site}/plantillas/informe-rival-1-pagina.pdf`;
  const mentoria = `${site}/#mentoria`;

  const bars = (Object.keys(areas) as AreaId[])
    .map((id) => {
      const v = result.scores[id];
      const prio = result.priorities.includes(id);
      return `<tr>
        <td style="padding:6px 12px 6px 0;color:${prio ? '#111' : '#666'};font-weight:${prio ? 700 : 400}">${areas[id].label}</td>
        <td style="padding:6px 0;width:100%"><div style="background:#e6e6e6;height:8px"><div style="background:${prio ? '#111' : '#999'};height:8px;width:${v}%"></div></div></td>
        <td style="padding:6px 0 6px 12px;font-family:monospace;color:#111">${v}</td>
      </tr>`;
    })
    .join('');

  const prios = result.priorities
    .map(
      (id, i) => `<div style="margin:0 0 20px;padding:16px;border-left:3px solid #111;background:#f6f6f6">
        <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#666">Prioridad ${i + 1}</div>
        <div style="font-size:18px;font-weight:700;margin:4px 0 8px">${areas[id].label}</div>
        <div style="color:#333;line-height:1.5">${areas[id].tip}</div>
        <div style="margin-top:10px;line-height:1.5"><strong>Primer paso:</strong> ${areas[id].firstStep}</div>
      </div>`,
    )
    .join('');

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#111;font-size:15px">
    <p>Hola ${esc(nombre)},</p>
    <p>Este es el resultado de tu diagnóstico del analista.</p>
    <h1 style="font-size:26px;margin:24px 0 8px">${result.level.name}</h1>
    <p style="line-height:1.5;color:#333">${result.level.text}</p>
    <p style="font-family:monospace;color:#666">Total: ${result.total}/100</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0 28px;font-size:14px">${bars}</table>
    <h2 style="font-size:20px;margin:0 0 12px">Por dónde empezar</h2>
    ${prios}
    <h2 style="font-size:20px;margin:28px 0 8px">Tu plantilla</h2>
    <p style="line-height:1.5">Es la estructura de informe de rival que uso: todo en una página, pensada para que el cuerpo técnico la lea en 5 minutos.</p>
    <p><a href="${plantilla}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;text-decoration:none;font-weight:700">Descargar la plantilla</a></p>
    <p style="line-height:1.5;margin-top:28px">Si querés trabajar estas áreas sobre tus propios partidos y con acompañamiento, eso es lo que hacemos en <a href="${mentoria}">Sistema Propio</a>. Y si tenés alguna duda sobre tu resultado, respondé este mail: lo leo yo.</p>
    <p>Pablo Granados</p>
  </div>`;

  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });

  try {
    await transporter.sendMail({
      from: `Pablo Granados <${user}>`,
      to: email,
      replyTo: user,
      subject: `Tu diagnóstico: ${result.level.name}`,
      html,
    });

    // Aviso para vos
    await transporter.sendMail({
      from: `Web <${user}>`,
      to: user,
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
    });
  } catch (err) {
    console.error('Email', err);
    // El lead ya quedó guardado, así que no se pierde aunque falle el mail.
    return json(502, { error: 'No se pudo enviar el email' });
  }

  return json(200, { ok: true });
};
