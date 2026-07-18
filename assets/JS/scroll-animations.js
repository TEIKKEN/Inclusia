import { isMotionReduced } from './reduce-motion.js';

const REVEAL_SELECTOR = ".section.hidden, .reveal, [data-reveal]";
const STAGGER_GROUP_SELECTOR = [
  ".fundadores-grid",
  ".barriers-grid",
  ".change-grid",
  ".change-pillars",
  ".principles-grid"
].join(", ");

function supportsIntersectionObserver() {
  return "IntersectionObserver" in window;
}

function shouldReduceMotion() {
  return isMotionReduced();
}

function markAsVisible(element) {
  if (!element) {
    return;
  }

  element.classList.remove("hidden");
  element.classList.add("show", "is-visible");
  element.setAttribute("data-reveal-state", "visible");

  if (element.classList.contains("reveal-stagger")) {
    element.classList.add("stagger-visible");
  }

  const nestedStaggerGroups = element.querySelectorAll(".reveal-stagger");
  nestedStaggerGroups.forEach(group => group.classList.add("stagger-visible"));
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  return rect.top <= viewportHeight * 0.92 && rect.bottom >= viewportHeight * 0.08;
}

function normalizeRevealStyle(element) {
  if (!element.classList.contains("reveal")) {
    element.classList.add("reveal");
  }

  const hasRevealVariant =
    element.classList.contains("fade-in") ||
    element.classList.contains("slide-up") ||
    element.classList.contains("zoom-in");

  if (!hasRevealVariant) {
    element.classList.add("slide-up");
  }
}

function setupStaggerGroups() {
  const groups = document.querySelectorAll(STAGGER_GROUP_SELECTOR);

  groups.forEach(group => {
    group.classList.add("reveal-stagger");

    const children = group.querySelectorAll(":scope > *");
    children.forEach((child, index) => {
      child.classList.add("stagger-item");
      child.style.setProperty("--stagger-index", String(index));
    });
  });
}

function revealStandaloneStaggerGroups() {
  const groups = Array.from(document.querySelectorAll(".reveal-stagger")).filter(
    group => !group.closest(".section.hidden")
  );

  if (groups.length === 0) {
    return;
  }

  if (!supportsIntersectionObserver() || shouldReduceMotion()) {
    groups.forEach(group => group.classList.add("stagger-visible"));
    return;
  }

  const staggerObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          entry.target.classList.add("stagger-visible");
          staggerObserver.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: [0, 0.08]
    }
  );

  groups.forEach(group => {
    if (isInViewport(group)) {
      group.classList.add("stagger-visible");
      return;
    }

    staggerObserver.observe(group);
  });
}

function collectRevealTargets() {
  const targets = Array.from(document.querySelectorAll(REVEAL_SELECTOR)).filter(
    element => element.getAttribute("data-reveal-state") !== "visible"
  );

  targets.forEach(normalizeRevealStyle);
  return targets;
}

function observeTargets(targets) {
  if (targets.length === 0) {
    return;
  }

  if (!supportsIntersectionObserver() || shouldReduceMotion()) {
    targets.forEach(markAsVisible);
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          markAsVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: [0, 0.06, 0.18]
    }
  );

  targets.forEach(target => {
    if (isInViewport(target)) {
      markAsVisible(target);
      return;
    }

    observer.observe(target);
  });
}

function initScrollAnimations() {
  setupStaggerGroups();
  revealStandaloneStaggerGroups();
  const targets = collectRevealTargets();

  if (targets.length === 0) {
    return;
  }

  observeTargets(targets);
}

function startRevealEngine() {
  requestAnimationFrame(() => {
    initScrollAnimations();

    // A second pass handles late layout shifts after fonts/images are ready.
    requestAnimationFrame(initScrollAnimations);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startRevealEngine, { once: true });
} else {
  startRevealEngine();
}

window.addEventListener("load", initScrollAnimations, { once: true });
window.addEventListener("pageshow", initScrollAnimations);
window.addEventListener("inclusia:motion-preference-change", event => {
  if (event.detail?.reducedMotion) initScrollAnimations();
});
