// HAMBURGER MENU TOGGLE
const hamburgerBtn = document.getElementById("hamburger-menu");
const navMenu = document.getElementById("nav-menu");
const navRight = document.querySelector(".nav-right");

if (hamburgerBtn && navMenu && navRight) {
  hamburgerBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    navRight.classList.toggle("active");
    hamburgerBtn.classList.toggle("active");
    hamburgerBtn.setAttribute("aria-expanded", 
      hamburgerBtn.getAttribute("aria-expanded") === "false" ? "true" : "false"
    );
  });

  // Close menu when clicking on a link
  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      navRight.classList.remove("active");
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!hamburgerBtn.contains(e.target) && !navRight.contains(e.target)) {
      navMenu.classList.remove("active");
      navRight.classList.remove("active");
      hamburgerBtn.classList.remove("active");
      hamburgerBtn.setAttribute("aria-expanded", "false");
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

// Close dropdowns when clicking outside - MÁS ROBUSTO
document.addEventListener("click", e => {
  dropdowns.forEach(dropdown => {
    // Si el click NO está dentro del dropdown, ciérralo
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});

// Close dropdowns with Escape key
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove("active");
    });
  }
});

// Close dropdown when a submenu link is clicked
document.querySelectorAll(".dropdown-menu a").forEach(link => {
  link.addEventListener("click", () => {
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove("active");
    });
  });
});
