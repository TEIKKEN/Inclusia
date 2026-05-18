const SECTION_SELECTOR = "#main-content .section:not(#hero)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
const sections = Array.from(document.querySelectorAll(SECTION_SELECTOR));

sections.forEach((section) => {
  if (section.hasAttribute("data-story-init")) {
    return;
  }

  section.setAttribute("data-story-init", "true");

  const revealTargets = [];
  const heading = section.querySelector("h2, h3");
  if (heading) {
    revealTargets.push(heading);
  }

  const paragraphs = Array.from(section.querySelectorAll(":scope > p"));
  paragraphs.forEach((paragraph) => revealTargets.push(paragraph));

  const actionButtons = Array.from(section.querySelectorAll(".donation-actions a"));
  actionButtons.forEach((button) => revealTargets.push(button));

  const form = section.querySelector("form");
  if (form) {
    revealTargets.push(form);
  }

  revealTargets.forEach((node, index) => {
    node.classList.add("reveal");
    const delay = Math.min(index, 6) * 120;
    node.style.setProperty("--reveal-delay", `${delay}ms`);
    node.style.setProperty("--reveal-duration", "700ms");
  });
});

if (!prefersReducedMotion && sections.length) {
  const activeSections = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSections.add(entry.target);
        } else {
          activeSections.delete(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: [0, 0.15],
    }
  );

  sections.forEach((section) => observer.observe(section));

  let ticking = false;

  const updateParallax = () => {
    ticking = false;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportCenter = viewportHeight / 2;
    const amplitude = window.innerWidth < 768 ? 8 : 14;

    activeSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = (sectionCenter - viewportCenter) / viewportHeight;
      const offset = distance * amplitude;
      section.style.setProperty("--story-parallax", `${offset.toFixed(2)}px`);
    });
  };

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  requestUpdate();
}
