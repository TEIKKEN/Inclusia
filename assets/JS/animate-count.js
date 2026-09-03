/**
 * Animación de conteo ascendente — utilidad genérica, separada a
 * propósito de dónde vienen los datos (ver mapa-impacto.js, que la
 * usa para animar "reportes registrados" / "ciudades representadas").
 *
 * Usa la misma fuente de verdad que el resto del sitio para saber
 * si hay que reducir movimiento (assets/JS/reduce-motion.js), en vez
 * de reimplementar la comprobación: si está activa —por el
 * interruptor del sitio o por `prefers-reduced-motion` del sistema,
 * `isMotionReduced()` ya combina las dos— el número se pinta directo,
 * sin animar.
 */

import { isMotionReduced } from './reduce-motion.js';

const DEFAULT_DURATION_MS = 1500;

export function animateCount(el, target, { duration = DEFAULT_DURATION_MS } = {}) {
  if (!el) return;

  if (isMotionReduced() || target === 0) {
    el.textContent = String(target);
    return;
  }

  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    el.textContent = String(Math.round(eased * target));
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
