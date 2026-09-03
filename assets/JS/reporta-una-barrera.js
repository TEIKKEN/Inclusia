/**
 * Reporta una barrera — desplazamientos internos del hero.
 *
 * Los dos botones del hero llevan a secciones de la misma página
 * (`#mapa-impacto` y `#reportar`). El desplazamiento usa
 * `scrollIntoView({ behavior: 'smooth' })` y respeta las dos formas
 * en que alguien puede pedir menos movimiento:
 *   - la preferencia del sistema (`prefers-reduced-motion: reduce`)
 *   - el interruptor del menú de accesibilidad del sitio, que marca
 *     la clase `.reduce-motion` en <html> (ver reduce-motion.js)
 *
 * El listener va en fase de CAPTURA sobre el documento a propósito:
 * smooth-scroll-global.js registra su propio handler sobre cada
 * `a[href^="#"]`, y la captura corre antes que los handlers del
 * elemento destino. Con `stopPropagation()` el evento nunca llega a
 * ese handler y las dos animaciones no compiten.
 *
 * El offset del navbar sticky ya lo resuelve `scroll-padding-top`
 * en <html> (base.css), que scrollIntoView respeta.
 */

const TRIGGER_SELECTOR = '[data-rb-scroll]';
const systemMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

function prefersReducedMotion() {
  return (
    document.documentElement.classList.contains('reduce-motion') ||
    systemMotionPreference.matches
  );
}

/**
 * Lleva el foco al destino para que el teclado y los lectores de
 * pantalla queden donde quedó la vista, no al principio de la página.
 */
function moveFocusTo(target) {
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }

  target.focus({ preventScroll: true });
}

document.addEventListener(
  'click',
  event => {
    const origin = event.target instanceof Element ? event.target : null;
    const trigger = origin?.closest(TRIGGER_SELECTOR);

    if (!trigger) return;

    const selector = trigger.getAttribute('data-rb-scroll');
    const target = selector ? document.querySelector(selector) : null;

    // Sin destino en esta página, el href del enlace hace su trabajo.
    if (!target) return;

    event.preventDefault();
    event.stopPropagation();

    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start'
    });

    moveFocusTo(target);
  },
  true
);
