// HAMBURGER MENU TOGGLE
const hamburgerBtn = document.getElementById("hamburger-menu");
const navMenu = document.getElementById("nav-menu");
const navRight = document.querySelector(".nav-right");

function closeMenu() {
  navMenu.classList.remove("active");
  navRight.classList.remove("active");
  hamburgerBtn.classList.remove("active");
  hamburgerBtn.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

function openMenu() {
  navMenu.classList.add("active");
  navRight.classList.add("active");
  hamburgerBtn.classList.add("active");
  hamburgerBtn.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
}

if (hamburgerBtn && navMenu && navRight) {
  hamburgerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navRight.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking on ::before pseudo-element (X button) or menu content area
  navRight.addEventListener("click", (e) => {
    // Si se hace clic en el área del botón X (esquina superior derecha)
    const rect = navRight.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Área aproximada del botón X (esquina superior derecha)
    if (clickX > rect.width - 70 && clickY < 80) {
      closeMenu();
      return;
    }

    // Si se hace clic en el área del contenido del menú (logo/frase) también cerrar
    if (e.target.closest('.menu-content')) {
      closeMenu();
      return;
    }
  });

  // Close menu when clicking on a non-dropdown link
  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      // Solo cerrar el menú si NO es un link dentro de un dropdown Y no es el link principal del dropdown
      if (!link.closest(".dropdown") || link.closest(".dropdown-menu")) {
        closeMenu();
      }
    });
  });

  // Close menu when pressing ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navRight.classList.contains("active")) {
      closeMenu();
    }
  });

  // Prevent body scroll when menu is open
  window.addEventListener("resize", () => {
    if (navRight.classList.contains("active") && window.innerWidth > 768) {
      closeMenu();
    }
  });
}

function smoothScrollTo(target, duration = 900) {
  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // easing suave
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

// Smooth scroll para links internos
document.querySelectorAll(".nav-links > li:not(.dropdown) > a").forEach(link => {
  link.addEventListener("click", e => {
    const sectionId = link.getAttribute("href");
    if (sectionId.startsWith("#")) {
      e.preventDefault();
      const section = document.querySelector(sectionId);
      if (section) {
        smoothScrollTo(section, 1100);
        closeMenu(); // Cerrar menú después del scroll
      }
    }
  });
});

// Dropdown menu functionality
const dropdowns = document.querySelectorAll(".dropdown");

dropdowns.forEach(dropdown => {
  const link = dropdown.querySelector("a");
  
  // Toggle dropdown on click
  link.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close other dropdowns
    dropdowns.forEach(d => {
      if (d !== dropdown) {
        d.classList.remove("active");
      }
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle("active");
  });
});

// Close dropdowns when clicking outside dropdown area (but within menu)
navRight.addEventListener("click", e => {
  // Solo si el click no está dentro de un dropdown
  const clickedDropdown = e.target.closest(".dropdown");
  if (!clickedDropdown) {
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove("active");
    });
  }
});

// Close dropdown when a submenu link is clicked
document.querySelectorAll(".dropdown-menu a").forEach(link => {
  link.addEventListener("click", () => {
    // Cerrar todos los dropdowns
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove("active");
    });
    
    // Cerrar el menú completo
    closeMenu();
  });
});

// ACCESIBILIDAD: Focus trap para el menú
function trapFocus() {
  if (!navRight.classList.contains("active")) return;
  
  const focusableElements = navRight.querySelectorAll(
    'a, button, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  document.addEventListener("keydown", function handleTabKey(e) {
    if (e.key !== "Tab") return;
    
    // Si llegamos al final y presionamos Tab, volver al inicio
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}