const form = document.querySelector("#contact-form");

if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      alert("Por favor completa todos los campos 💙");
      return;
    }

    alert("Gracias por contactarnos. Muy pronto te responderemos 💙");
    form.reset();
  });
}
