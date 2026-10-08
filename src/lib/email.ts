/**
 * Plantilla de los mails transaccionales. Solo servidor.
 * HTML con tablas y estilos en línea: es lo único que renderiza igual en Gmail, Outlook y el celular.
 */

const INK = '#0b0d10';
const SIGNAL = '#00f2ff';
const BODY_TEXT = '#1c2026';
const MUTE = '#5d646d';
const SANS = "Arial,Helvetica,sans-serif";
const MONO = "'Courier New',Courier,monospace";

export const mailP = (html: string) =>
  `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.6;color:${BODY_TEXT}">${html}</p>`;

export const mailH2 = (text: string) =>
  `<h2 style="margin:32px 0 12px;font-family:${SANS};font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:${MUTE};font-weight:700">${text}</h2>`;

/** Botón principal: cian sobre tinta, el mismo acento que la web. */
export const mailButton = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="background:${INK};border-left:4px solid ${SIGNAL}">
    <a href="${href}" style="display:inline-block;padding:14px 22px;font-family:${SANS};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none">${label} &rarr;</a>
  </td></tr></table>`;

/** Bloque destacado con borde cian (prioridades, notas). */
export const mailCallout = (inner: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px"><tr>
    <td style="background:#f3f6f7;border-left:4px solid ${SIGNAL};padding:16px 18px;font-family:${SANS};font-size:15px;line-height:1.55;color:${BODY_TEXT}">${inner}</td>
  </tr></table>`;

type Layout = {
  /** URL base del sitio (para el logo). */
  site: string;
  /** Texto que se ve en la lista de la bandeja de entrada, antes de abrir el mail. */
  preheader: string;
  /** Etiqueta chica sobre el título. */
  kicker: string;
  title: string;
  /** HTML del cuerpo. */
  body: string;
};

export function emailLayout({ site, preheader, kicker, title, body }: Layout) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#e9ecee">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e9ecee"><tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px">

      <!-- Cabecera -->
      <tr><td style="background:${INK};padding:28px 32px 32px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:12px"><img src="${site}/media/dtpablogranados.png" width="36" height="36" alt="" style="display:block;border:0"></td>
          <td style="font-family:${SANS};font-size:14px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#edebe6">Pablo Granados</td>
        </tr></table>
        <div style="margin-top:36px;font-family:${MONO};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${SIGNAL}">${kicker}</div>
        <div style="margin-top:10px;font-family:'Arial Narrow',${SANS};font-size:34px;line-height:1.05;font-weight:800;color:#edebe6">${title}</div>
      </td></tr>
      <tr><td style="background:${SIGNAL};height:4px;line-height:4px;font-size:0">&nbsp;</td></tr>

      <!-- Cuerpo -->
      <tr><td style="background:#ffffff;padding:32px">${body}</td></tr>

      <!-- Pie -->
      <tr><td style="background:${INK};padding:22px 32px;font-family:${SANS};font-size:13px;line-height:1.6;color:#9aa0a8">
        <span style="color:#edebe6;font-weight:700">Del partido a la decisión.</span><br>
        <a href="${site}" style="color:#9aa0a8">${site.replace(/^https?:\/\//, '')}</a> &nbsp;·&nbsp; @dtpablogranados
      </td></tr>

    </table>
  </td></tr></table>
</body></html>`;
}
