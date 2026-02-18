const toggle = document.getElementById("accessibility-toggle");
const menu = document.getElementById("accessibility-options");
const options = menu.querySelectorAll("li");

toggle.addEventListener("click", () => {
  const expanded = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", !expanded);
  menu.hidden = expanded;
});

options.forEach(option => {
  option.addEventListener("click", () => {
    const theme = option.dataset.theme;

    document.body.classList.remove(
      "theme-soft",
      "theme-dark",
      "theme-colorblind"
    );

    if (theme !== "default") {
      document.body.classList.add(`theme-${theme}`);
    }

    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  });
});
