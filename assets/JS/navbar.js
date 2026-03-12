// ============================================
// NAVBAR - INCLUSIA
// ============================================

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

// ---------- RESIZE: cierra en desktop ----------
window.addEventListener("resize", () => {
  if (navRight?.classList.contains("active") && window.innerWidth > 768) {
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

  function step(now) {
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

console.log("INCLUSIA navbar.js listo");
