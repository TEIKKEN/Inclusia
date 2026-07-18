import { isMotionReduced } from './reduce-motion.js';

// ============================================
// PAGE LOADER - INCLUSIA
// ============================================

/* -------------------------------------------------------
   INYECCIÓN DINÁMICA DEL LOADER
   Se crea el elemento en el DOM automáticamente.
------------------------------------------------------- */
(function injectLoader() {
  const brandImg = document.querySelector('.brand img');
  const logoSrc  = brandImg ? brandImg.src : '';

  const loader = document.createElement('div');
  loader.id = 'page-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-label', 'Cargando INCLUSIA');

  const loaderBrand = document.createElement('div');
  loaderBrand.className = 'loader-brand';

  if (logoSrc) {
    const loaderLogo = document.createElement('img');
    loaderLogo.className = 'loader-logo';
    loaderLogo.src = logoSrc;
    loaderLogo.alt = '';
    loaderLogo.setAttribute('aria-hidden', 'true');
    loaderBrand.appendChild(loaderLogo);
  }

  const loaderName = document.createElement('span');
  loaderName.className = 'loader-name';
  loaderName.textContent = 'INCLUSIA';
  loaderBrand.appendChild(loaderName);

  const loaderBarTrack = document.createElement('div');
  loaderBarTrack.className = 'loader-bar-track';
  loaderBarTrack.setAttribute('aria-hidden', 'true');

  const loaderBarFill = document.createElement('div');
  loaderBarFill.className = 'loader-bar-fill';
  loaderBarTrack.appendChild(loaderBarFill);

  loader.append(loaderBrand, loaderBarTrack);
  document.body.prepend(loader);
})();


/* -------------------------------------------------------
   LOADER: se oculta suavemente cuando la página carga
------------------------------------------------------- */
function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  if (isMotionReduced()) {
    loader.remove();
    return;
  }

  const minDelay = 1100;
  const startTime = performance.now();

  function doHide() {
    const elapsed = performance.now() - startTime;
    const wait = Math.max(0, minDelay - elapsed);
    setTimeout(() => {
      loader.classList.add('loaded');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, wait);
  }

  if (document.readyState === 'complete') {
    doHide();
  } else {
    window.addEventListener('load', doHide, { once: true });
  }
}

hideLoader();

console.log('INCLUSIA page-loader.js listo ✨');
