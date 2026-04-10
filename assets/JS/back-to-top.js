document.addEventListener("DOMContentLoaded", () => {
  const backToTopLinks = document.querySelectorAll('.footer-nav a[aria-label="Volver arriba"]');

  if (!backToTopLinks.length) {
    return;
  }

  const revealLink = (link) => {
    if (!link.classList.contains("is-visible")) {
      link.classList.add("is-visible");
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealLink(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.25,
      }
    );

    backToTopLinks.forEach((link) => observer.observe(link));
  } else {
    setTimeout(() => {
      backToTopLinks.forEach(revealLink);
    }, 140);
  }

  backToTopLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
});
