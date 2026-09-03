// ============================================
// NAVBAR - INCLUSIA
// ============================================

import { isMotionReduced } from './reduce-motion.js';

const hamburgerBtn = document.getElementById("hamburger-menu");
const navMenu      = document.getElementById("nav-menu");
const navRight     = document.getElementById("nav-right");
const navOverlay   = document.getElementById("nav-overlay");

// ---------- ABRIR / CERRAR ----------
function closeMenu() {
  if (!navRight) return;
  navRight.classList.remove("active");
  hamburgerBtn?.classList.remove("active");
  hamburgerBtn?.setAttribute("aria-expanded", "false");
  navOverlay?.classList.remove("active");
  document.body.classList.remove("menu-open");

  // Cerrar todos los dropdowns
  document.querySelectorAll(".dropdown.active").forEach(d => {
    d.classList.remove("active");
    d.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
  });

  hamburgerBtn?.focus();
}

function openMenu() {
  if (!navRight) return;
  navRight.classList.add("active");
  hamburgerBtn?.classList.add("active");
  hamburgerBtn?.setAttribute("aria-expanded", "true");
  navOverlay?.classList.add("active");
  document.body.classList.add("menu-open");

  // Foco en primer link del menu
  setTimeout(() => {
    const firstLink = navRight.querySelector(".nav-links a, .nav-links button");
    firstLink?.focus();
  }, 350);
}

// ---------- HAMBURGER (abre Y cierra) ----------
hamburgerBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  navRight?.classList.contains("active") ? closeMenu() : openMenu();
});

// ---------- OVERLAY CIERRA ----------
navOverlay?.addEventListener("click", closeMenu);

// ---------- ESCAPE CIERRA ----------
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navRight?.classList.contains("active")) {
    closeMenu();
  }
});

// ---------- LINKS NORMALES CIERRAN EL MENU ----------
navMenu?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => closeMenu());
});

// ---------- FOCUS TRAP ----------
navRight?.addEventListener("keydown", (e) => {
  if (e.key !== "Tab" || !navRight.classList.contains("active")) return;

  const focusable = Array.from(navRight.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(el => el.offsetParent !== null); // solo elementos visibles

  if (focusable.length === 0) return;
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
});

// ---------- SMOOTH SCROLL ----------
function smoothScrollTo(target, duration = 900) {
  const start    = window.pageYOffset;
  const distance = target.getBoundingClientRect().top + start;
  let startTime  = null;

  if (isMotionReduced()) {
    window.scrollTo(0, distance);
    return;
  }

  function step(now) {
    if (isMotionReduced()) {
      window.scrollTo(0, distance);
      return;
    }

    if (!startTime) startTime = now;
    const t = Math.min((now - startTime) / duration, 1);
    const ease = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
    window.scrollTo(0, start + (distance - start) * ease);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('.nav-links > li:not(.dropdown) > a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      smoothScrollTo(target, 1000);
      closeMenu();
    }
  });
});

// ---------- DROPDOWN ----------
document.querySelectorAll(".dropdown").forEach(dropdown => {
  const toggle = dropdown.querySelector(".dropdown-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();

    const isOpen = dropdown.classList.contains("active");

    // Cerrar otros dropdowns
    document.querySelectorAll(".dropdown.active").forEach(d => {
      if (d !== dropdown) {
        d.classList.remove("active");
        d.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
      }
    });

    dropdown.classList.toggle("active", !isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
  });

  // Teclado: Enter/Space/ArrowDown
  toggle.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); toggle.click();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      dropdown.classList.contains("active")
        ? dropdown.querySelector(".dropdown-menu a")?.focus()
        : toggle.click();
    }
  });

  // Navegacion con flechas dentro del submenu
  const subLinks = [...dropdown.querySelectorAll(".dropdown-menu a")];
  subLinks.forEach((link, i) => {
    link.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); (subLinks[i+1] ?? subLinks[0]).focus(); }
      if (e.key === "ArrowUp")   { e.preventDefault(); (subLinks[i-1] ?? toggle).focus(); }
      if (e.key === "Escape")    { e.preventDefault(); dropdown.classList.remove("active"); toggle.setAttribute("aria-expanded","false"); toggle.focus(); }
    });
    link.addEventListener("click", () => {
      dropdown.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      closeMenu();
    });
  });
});

// Cerrar dropdown al clicar fuera
document.addEventListener("click", e => {
  if (!e.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown.active").forEach(d => {
      d.classList.remove("active");
      d.querySelector(".dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });
  }
});

// ============================================
// MEGA-MENÚ DE ESCRITORIO (≥1024px) — "Quiénes somos"
// Patrón "disclosure" (no menu/menuitem, a diferencia del acordeón
// móvil de arriba): el trigger es un botón con aria-expanded, el
// panel es contenido normal alcanzable con Tab en orden de documento
// — el brief pide explícitamente Tab, no navegación con flechas tipo
// menú. aria-expanded es el único origen de verdad de "abierto"; el
// CSS (ver layout.css) solo lee ese atributo, no :hover/:focus-within
// por su cuenta, para que hover, foco y Escape nunca queden
// desincronizados entre sí.
// ============================================

// "Hover intent": cerrar recién después de este retraso, no al
// instante. Sin esto, el mouseleave del trigger cierra el panel en
// cuanto el cursor sale del botón — y como el panel empieza más abajo
// (al ras de la barra, no del botón), casi cualquier trayectoria real
// hacia él cruza un par de píxeles que no son ni trigger ni panel, y
// el menú se cierra antes de llegar. Si el mouse reentra (al trigger
// o al panel) dentro de este margen, el cierre se cancela.
const MEGAMENU_CLOSE_DELAY = 300;

document.querySelectorAll(".megamenu-item").forEach(item => {
  const trigger = item.querySelector(".megamenu-trigger");
  const panel = item.querySelector(".megamenu-panel");
  if (!trigger || !panel) return;

  const open  = () => trigger.setAttribute("aria-expanded", "true");
  const close = () => trigger.setAttribute("aria-expanded", "false");

  // Evita que el refoco al trigger que hace Escape (más abajo) dispare
  // "focusin" y reabra el panel que Escape acaba de cerrar.
  let suppressReopen = false;
  let closeTimer = null;

  const cancelClose = () => {
    if (closeTimer === null) return;
    clearTimeout(closeTimer);
    closeTimer = null;
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer = setTimeout(close, MEGAMENU_CLOSE_DELAY);
  };

  item.addEventListener("mouseenter", () => {
    cancelClose();
    open();
  });
  item.addEventListener("mouseleave", scheduleClose);

  item.addEventListener("focusin", () => {
    cancelClose();
    if (!suppressReopen) open();
  });
  item.addEventListener("focusout", e => {
    // El foco sí sale de forma precisa (no hay "gap" que cruzar como
    // con el mouse), así que aquí cierra al instante — solo el hover
    // necesita el margen de gracia.
    if (!item.contains(e.relatedTarget)) close();
  });

  // No es un toggle: mouseenter ya abre el panel antes de que el click
  // llegue a dispararse, así que un toggle aquí lo cerraría de
  // inmediato en cuanto un usuario con mouse hace clic. Clic siempre
  // abre (idempotente); cerrar es cosa de mouseleave/focusout/Escape.
  trigger.addEventListener("click", e => {
    e.preventDefault();
    cancelClose();
    open();
  });

  item.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      cancelClose();
      suppressReopen = true;
      close();
      trigger.focus();
      setTimeout(() => { suppressReopen = false; }, 0);
    }
  });
});

document.addEventListener("click", e => {
  if (!e.target.closest(".megamenu-item")) {
    document.querySelectorAll(".megamenu-trigger[aria-expanded='true']").forEach(t => {
      t.setAttribute("aria-expanded", "false");
    });
  }
});

// Si la ventana cruza el breakpoint de 1024px, cierra tanto el panel
// off-canvas como cualquier mega-menú abierto: a un lado del cruce el
// panel queda display:none (ver layout.css) y a foco atrapado dentro
// de un elemento invisible; al otro lado el trigger del mega-menú
// deja de existir en la barra.
const desktopBreakpoint = window.matchMedia("(min-width: 1024px)");
desktopBreakpoint.addEventListener("change", () => {
  closeMenu();
  document.querySelectorAll(".megamenu-trigger[aria-expanded='true']").forEach(t => {
    t.setAttribute("aria-expanded", "false");
  });
});

console.log("INCLUSIA navbar.js listo");
