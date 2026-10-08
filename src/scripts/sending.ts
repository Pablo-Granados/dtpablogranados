/**
 * Estado "enviando" de los formularios: el botón gira y muestra una barra de progreso,
 * y el mensaje va cambiando para que se note que el envío avanza (los mails tardan unos segundos).
 * Devuelve una función para volver al estado normal si el envío falla.
 */
const SPINNER =
  '<svg class="sending-spinner size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="8" cy="8" r="6" opacity=".25"/><path d="M8 2a6 6 0 0 1 6 6" stroke-linecap="round"/></svg>';

const STEPS: [number, string][] = [
  [0, 'Enviando…'],
  [2500, 'Guardando tus datos…'],
  [5000, 'Preparando tu mail…'],
  [8000, 'Ya casi, no cierres esta página…'],
];

export function startSending(btn: HTMLButtonElement, msg: HTMLElement, label = 'Enviando') {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.classList.add('is-sending', 'relative', 'overflow-hidden');
  btn.innerHTML = `${SPINNER}<span>${label}</span><span class="sending-bar" aria-hidden="true"></span>`;
  msg.className = 'text-sm text-mute';

  const timers = STEPS.map(([ms, text]) => setTimeout(() => (msg.textContent = text), ms));

  return function stop() {
    timers.forEach(clearTimeout);
    btn.disabled = false;
    btn.classList.remove('is-sending');
    btn.innerHTML = original;
  };
}
