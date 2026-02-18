// FLOATING ACCESSIBILITY BUTTON HANDLER
document.addEventListener('DOMContentLoaded', () => {
  const floatingBtn = document.getElementById('floating-accessibility-btn');
  const floatingMenu = document.getElementById('floating-accessibility-menu');

  if (floatingBtn && floatingMenu) {
    // Toggle menu
    floatingBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = floatingMenu.hidden;
      floatingMenu.hidden = !isHidden;
      floatingBtn.setAttribute('aria-expanded', !isHidden);
    });

    // Handle theme/contrast selection
    floatingMenu.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const theme = btn.parentElement.dataset.theme;

        // Remove all theme classes
        document.body.classList.remove(
          'theme-soft',
          'theme-dark',
          'theme-colorblind',
          'theme-high-contrast'
        );

        // Apply selected theme
        if (theme !== 'default') {
          document.body.classList.add(`theme-${theme}`);
        }

        // Close menu
        floatingMenu.hidden = true;
        floatingBtn.setAttribute('aria-expanded', false);

        // Save theme
        localStorage.setItem('selectedTheme', theme);
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!floatingBtn.contains(e.target) && !floatingMenu.contains(e.target)) {
        floatingMenu.hidden = true;
        floatingBtn.setAttribute('aria-expanded', false);
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        floatingMenu.hidden = true;
        floatingBtn.setAttribute('aria-expanded', false);
      }
    });

    // Restore saved theme on page load
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && savedTheme !== 'default') {
      document.body.classList.add(`theme-${savedTheme}`);
    }
  }
});
