/* =====================================================
   HERO CAROUSEL â€” INCLUSIA (JavaScript)
   - Crossfade via aria-hidden + opacity (CSS).
   - Autoplay con pausa/reanudaciÃ³n explÃ­cita.
   - Barras de progreso animadas por CSS custom property.
   - Accesible: teclado, ARIA, lector de pantalla.
   - Sin dependencias externas. Soporta mÃºltiples carruseles.
   ===================================================== */

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clampIndex(index, total) {
  if (total <= 0) return 0;
  if (index < 0) return total - 1;
  if (index >= total) return 0;
  return index;
}

function getSlideTitle(slideEl) {
  const heading = slideEl?.querySelector('h2, h3');
  return heading?.textContent?.trim() || '';
}

function initCarousel(root) {
  const viewport    = root.querySelector('.hero-carousel__viewport');
  const track       = root.querySelector('.hero-carousel__track');
  const slides      = Array.from(root.querySelectorAll('.hero-carousel__slide'));
  const btnPrev     = root.querySelector('[data-carousel-prev]');
  const btnNext     = root.querySelector('[data-carousel-next]');
  const indicators  = Array.from(root.querySelectorAll('[data-carousel-to]'));
  const statusEl    = root.querySelector('[data-carousel-status]');
  const pauseBtn    = root.querySelector('[data-carousel-toggle]');

  if (!viewport || !track || slides.length === 0) return;

  let currentIndex      = 0;
  let autoplayTimer     = null;
  let isPausedByContext = false; // hover / focus
  let isManuallyPaused  = false; // botÃ³n explÃ­cito

  const total           = slides.length;
  const autoplayEnabled = (root.dataset.autoplay || '').toLowerCase() === 'true'
                          && !prefersReducedMotion();
  const interval        = Math.max(2500, Number(root.dataset.interval || 6000));

  // Inyectar la duraciÃ³n de progreso como variable CSS en cada indicador
  indicators.forEach(btn => btn.style.setProperty('--progress-duration', `${interval}ms`));

  // ----------------------------
  // Actualizar UI / ARIA
  // ----------------------------
  function update(nextIndex, { announce = true } = {}) {
    currentIndex = clampIndex(nextIndex, total);

    // Slides: aria-hidden controla el fade (CSS: opacity 0 / 1)
    slides.forEach((slide, idx) => {
      slide.setAttribute('aria-hidden', idx === currentIndex ? 'false' : 'true');
    });

    // Indicadores: aria-selected + tabindex + resetear animaciÃ³n de progreso
    indicators.forEach((btn, idx) => {
      const selected = idx === currentIndex;
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      btn.tabIndex = selected ? 0 : -1;

      // Reiniciar animaciÃ³n CSS forzando un reflow
      const prog = btn.querySelector('.hero-carousel__progress');
      if (prog) {
        prog.style.animation = 'none';
        void prog.offsetHeight; // forzar reflow
        prog.style.animation  = '';
      }
    });

    // Anuncio para lectores de pantalla
    if (statusEl && announce) {
      const title      = getSlideTitle(slides[currentIndex]);
      const humanIndex = currentIndex + 1;
      statusEl.textContent = title
        ? `Diapositiva ${humanIndex} de ${total}: ${title}.`
        : `Diapositiva ${humanIndex} de ${total}.`;
    }
  }

  // Estado inicial (sin anunciar)
  update(0, { announce: false });

  // ----------------------------
  // NavegaciÃ³n
  // ----------------------------
  function goNext() { update(currentIndex + 1); }
  function goPrev() { update(currentIndex - 1); }

  btnNext?.addEventListener('click', () => { stopAutoplay(); goNext(); });
  btnPrev?.addEventListener('click', () => { stopAutoplay(); goPrev(); });

  indicators.forEach(btn => {
    btn.addEventListener('click', () => {
      const to = Number(btn.dataset.carouselTo);
      if (Number.isNaN(to)) return;
      stopAutoplay();
      update(to);
    });

    // Enter / Espacio ya disparan click en <button>, aseguramos consistencia
    btn.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Flechas / Home / End en el viewport
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); stopAutoplay(); goNext(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); stopAutoplay(); goPrev(); }
    if (e.key === 'Home')       { e.preventDefault(); stopAutoplay(); update(0); }
    if (e.key === 'End')        { e.preventDefault(); stopAutoplay(); update(total - 1); }
  });

  // ----------------------------
  // BotÃ³n de pausa / reanudar
  // ----------------------------
  pauseBtn?.addEventListener('click', () => {
    isManuallyPaused = !isManuallyPaused;

    pauseBtn.setAttribute('aria-pressed', isManuallyPaused ? 'true' : 'false');
    pauseBtn.setAttribute(
      'aria-label',
      isManuallyPaused ? 'Reanudar reproducci\u00f3n autom\u00e1tica' : 'Pausar reproducci\u00f3n autom\u00e1tica'
    );

    root.classList.toggle('hero-carousel--paused', isManuallyPaused);

    if (isManuallyPaused) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // ----------------------------
  // Autoplay
  // ----------------------------
  function startAutoplay() {
    if (!autoplayEnabled || autoplayTimer || isManuallyPaused) return;
    autoplayTimer = window.setInterval(() => {
      if (isPausedByContext || isManuallyPaused) return;
      update(currentIndex + 1, { announce: false });
    }, interval);
  }

  function pauseByContext()  { isPausedByContext = true; }
  function resumeByContext() { isPausedByContext = false; }

  function stopAutoplay() {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Pausa al pasar el ratÃ³n o al enfocarse con teclado
  root.addEventListener('mouseenter', pauseByContext);
  root.addEventListener('mouseleave', resumeByContext);
  root.addEventListener('focusin',    pauseByContext);
  root.addEventListener('focusout',   resumeByContext);

  // En tÃ¡ctil: pausa al iniciar interacciÃ³n
  root.addEventListener('pointerdown', pauseByContext);

  // ----------------------------
  // Touch / Swipe
  // ----------------------------
  let touchStartX = 0;
  const SWIPE_THRESHOLD = 50;

  viewport.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  viewport.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      stopAutoplay();
      if (diff > 0) goNext(); else goPrev();
    }
  });

  startAutoplay();
}

// Init: soporta mÃºltiples carruseles en la misma pÃ¡gina
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-carousel]').forEach(root => initCarousel(root));
});
