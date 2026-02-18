// Función global de smooth scroll reutilizable
export function smoothScrollTo(target, duration = 900) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  
  if (!targetElement) return;

  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // easing suave - mismo que en navbar.js
    const ease = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    window.scrollTo(0, startPosition + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

// Aplicar smooth scroll a TODOS los links que apunten a IDs
document.addEventListener('DOMContentLoaded', () => {
  // Seleccionar todos los enlaces y botones con href que apunte a IDs
  const scrollLinks = document.querySelectorAll('a[href^="#"], button[data-scroll]');

  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      let targetId;

      // Para links <a href="#id">
      if (link.tagName === 'A') {
        targetId = link.getAttribute('href');
      }
      // Para botones con data-scroll="#id"
      else if (link.tagName === 'BUTTON' && link.hasAttribute('data-scroll')) {
        targetId = link.getAttribute('data-scroll');
      }

      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          smoothScrollTo(targetElement, 1100);
        }
      }
    });
  });
});

console.log("✨ Smooth scroll global activado");
