// ============================================
// NAV ENHANCE - INCLUSIA
// Mejoras progresivas del nav. NO reemplaza a navbar.js:
// navbar.js sigue manejando hamburguesa, dropdown y focus trap.
// Aquí solo se agrega:
//   1. Estado "is-scrolled" del navbar (blur + sombra al bajar).
//   2. Indicador de seccion activa con IntersectionObserver.
// Todo es aditivo: si algo falla, el nav sigue funcionando igual.
// ============================================

const navbar = document.querySelector(".navbar");

// ---------- 1. ESTADO AL HACER SCROLL ----------
// El navbar arranca plano sobre el hero y gana blur + sombra al bajar.
const SCROLL_THRESHOLD = 8;

function initScrollState() {
  if (!navbar) return;

  let ticking = false;

  function applyScrollState() {
    navbar.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(applyScrollState);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pageshow", applyScrollState);
  applyScrollState(); // estado correcto si la pagina carga ya scrolleada
}

// ---------- 2. SECCION ACTIVA ----------
// Solo se observan anclas cuyo destino existe EN ESTA pagina.
// En las subpaginas los links son "../#proposito": el id no existe
// aqui, asi que se ignoran solos y manda el aria-current="page" del HTML.

function initActiveSection() {
  if (!navbar) return;

  const navLinks = Array.from(
    navbar.querySelectorAll('.nav-links a[href*="#"], .nav-links-desktop a[href*="#"]')
  );

  // Pares [link, seccion] validos dentro de esta pagina
  const pairs = [];

  navLinks.forEach(link => {
    const href = link.getAttribute("href") || "";
    const hash = href.split("#")[1];
    if (!hash) return;

    const section = document.getElementById(hash);
    if (section) pairs.push({ link, section });
  });

  if (pairs.length === 0) return;

  // Orden de aparicion en el documento, para elegir la seccion mas alta
  const orderedIds = pairs.map(pair => pair.section.id);
  const visibleIds = new Set();

  function setActive(activeId) {
    pairs.forEach(({ link, section }) => {
      const isActive = section.id === activeId;
      link.classList.toggle("is-active", isActive);

      // aria-current solo en el item realmente activo.
      // No se toca si el HTML ya lo marca como pagina actual.
      if (link.getAttribute("aria-current") === "page") return;

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleIds.add(entry.target.id);
        } else {
          visibleIds.delete(entry.target.id);
        }
      });

      // La seccion visible que aparece primero en el documento
      const activeId = orderedIds.find(id => visibleIds.has(id));
      if (activeId) setActive(activeId);
    },
    {
      // Banda de deteccion en el tercio superior de la pantalla:
      // la seccion se marca activa cuando su contenido esta realmente leyendose.
      rootMargin: "-25% 0px -65% 0px",
      threshold: 0
    }
  );

  pairs.forEach(({ section }) => observer.observe(section));
}

function init() {
  initScrollState();
  initActiveSection();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
