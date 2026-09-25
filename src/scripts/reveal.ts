/**
 * Agrega .is-in a los elementos con [data-reveal] cuando entran en pantalla.
 * Una sola vez por elemento. Sin dependencias.
 */
const els = document.querySelectorAll<HTMLElement>('[data-reveal]');

if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
  els.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
  );
  els.forEach((el) => io.observe(el));
}
