const sections = document.querySelectorAll(".hidden");

console.log("Animaciones: secciones encontradas =", sections.length);

// Mostrar el hero inmediatamente
const heroSection = document.getElementById("hero");
if (heroSection && heroSection.classList.contains("hidden")) {
  heroSection.classList.remove("hidden");
  heroSection.classList.add("show");
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove("hidden");
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.15 });

sections.forEach(section => {
  if (section.id !== "hero") {
    observer.observe(section);
  }
});
