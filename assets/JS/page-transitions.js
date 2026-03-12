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
  loader.innerHTML = `
    <div class="loader-brand">
      ${logoSrc ? `<img class="loader-logo" src="${logoSrc}" alt="" aria-hidden="true" />` : ''}
      <span class="loader-name">INCLUSIA</span>
    </div>
    <div class="loader-bar-track" aria-hidden="true">
      <div class="loader-bar-fill"></div>
    </div>
  `;
  document.body.prepend(loader);
})();


/* -------------------------------------------------------
   LOADER: se oculta suavemente cuando la página carga
------------------------------------------------------- */
function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

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
