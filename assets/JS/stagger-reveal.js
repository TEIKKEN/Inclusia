/**
 * Revela un grupo de elementos en cascada (uno tras otro, con un
 * pequeño intervalo entre cada uno) añadiendo una clase que dispara
 * la transición CSS de cada elemento — mismo patrón que ya usa el
 * sitio para las tarjetas de "Qué hacemos con lo que reportas" (ver
 * scroll-animations.js / STAGGER_GROUP_SELECTOR), aquí como utilidad
 * reutilizable para grupos que no son secciones completas — por
 * ejemplo, los marcadores del mapa de impacto (ver mapa-impacto.js).
 *
 * Con movimiento reducido activo, no hay escalonado: todos los
 * elementos reciben la clase en el mismo tick.
 */

import { isMotionReduced } from './reduce-motion.js';

export function staggerReveal(elements, { className = 'is-visible', delayStep = 90 } = {}) {
  Array.from(elements).forEach((el, index) => {
    const delay = isMotionReduced() ? 0 : index * delayStep;
    setTimeout(() => el.classList.add(className), delay);
  });
}
