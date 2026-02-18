// ACCESSIBILITY MENU MOBILE HANDLING
const accessibilityToggle = document.getElementById("accessibility-toggle");
const accessibilityOptions = document.getElementById("accessibility-options");

if (accessibilityToggle && accessibilityOptions) {
  // Toggle menu visibility
  accessibilityToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = accessibilityOptions.hidden;
    accessibilityOptions.hidden = !isHidden;
    accessibilityToggle.setAttribute("aria-expanded", !isHidden);
  });

  // Handle option clicks
  accessibilityOptions.querySelectorAll("li").forEach((option) => {
    option.addEventListener("click", () => {
      const theme = option.dataset.theme;

      // Remove all theme classes
      document.body.classList.remove(
        "theme-soft",
        "theme-dark",
        "theme-colorblind"
      );

      // Apply selected theme
      if (theme !== "default") {
        document.body.classList.add(`theme-${theme}`);
      }

      // Close menu
      accessibilityOptions.hidden = true;
      accessibilityToggle.setAttribute("aria-expanded", false);

      // Update localStorage
      localStorage.setItem("selectedTheme", theme);
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !accessibilityToggle.contains(e.target) &&
      !accessibilityOptions.contains(e.target)
    ) {
      accessibilityOptions.hidden = true;
      accessibilityToggle.setAttribute("aria-expanded", false);
    }
  });

  // Restore saved theme on page load
  const savedTheme = localStorage.getItem("selectedTheme");
  if (savedTheme && savedTheme !== "default") {
    document.body.classList.add(`theme-${savedTheme}`);
  }
}

// Close menu on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && accessibilityOptions) {
    accessibilityOptions.hidden = true;
    if (accessibilityToggle) {
      accessibilityToggle.setAttribute("aria-expanded", false);
    }
  }
});
