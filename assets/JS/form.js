function initForm() {
  const form = document.querySelector('form[action*="formspree"]');

  if (!form) {
    console.log("Formulario no encontrado");
    return;
  }

  if (typeof Swal === 'undefined') {
    console.warn("SweetAlert no cargó, usando alert()");
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const statusElement = document.getElementById('form-status');
  const formStartedAt = Date.now();
  const minimumFillTimeMs = 1500;
  const submitCooldownMs = 15000;
  const lastSubmitStorageKey = 'inclusia:last-form-submit';
  const allowedTipos = new Set([
    '',
    'donar',
    'aliado',
    'voluntariado',
    'experiencia',
    'informacion',
    'otro'
  ]);
  const endpointUrl = new URL(form.action, window.location.href);
  const expectedEndpoint = 'https://formspree.io/f/xzbywokn';
  let isSubmitting = false;

  function cleanSwalClasses() {
    document.body.classList.remove('swal2-shown', 'swal2-height-auto');
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';

    setTimeout(() => {
      document.body.classList.remove('swal2-shown', 'swal2-height-auto');
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '';

      const swalContainers = document.querySelectorAll('.swal2-container');
      swalContainers.forEach((container) => {
        if (!container.querySelector('.swal2-popup')) {
          container.remove();
        }
      });
    }, 100);
  }

  function normalizeSpaces(value) {
    return value.replace(/\s+/g, ' ').trim();
  }

  function normalizeMessage(value) {
    return value.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  }

  function normalizeEmail(value) {
    return value.trim().toLowerCase();
  }

  function setStatus(message) {
    if (statusElement) {
      statusElement.textContent = message;
    }
  }

  function getStoredLastSubmitTime() {
    try {
      const value = window.localStorage.getItem(lastSubmitStorageKey);
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    } catch (error) {
      return 0;
    }
  }

  function storeLastSubmitTime(timestamp) {
    try {
      window.localStorage.setItem(lastSubmitStorageKey, String(timestamp));
    } catch (error) {
      // Ignorar fallos de almacenamiento local.
    }
  }

  function getRemainingCooldownMs() {
    const elapsed = Date.now() - getStoredLastSubmitTime();
    return Math.max(0, submitCooldownMs - elapsed);
  }

  function setSubmittingState(submitting) {
    isSubmitting = submitting;

    if (!submitButton) {
      return;
    }

    if (!submitButton.dataset.submitLabel) {
      submitButton.dataset.submitLabel = submitButton.textContent.trim();
    }

    submitButton.disabled = submitting;
    submitButton.setAttribute('aria-disabled', String(submitting));
    submitButton.setAttribute('aria-busy', String(submitting));
    submitButton.textContent = submitting ? 'Enviando...' : submitButton.dataset.submitLabel;
  }

  function focusFirstInvalidField() {
    const invalidField = Object.keys(validations)
      .map((fieldName) => form[fieldName])
      .find((field) => field && field.classList.contains('input-error'));

    invalidField?.focus();
  }

  function getNormalizedValues() {
    const normalizedTipo = normalizeSpaces(String(form.tipo?.value || ''));

    return {
      nombre: normalizeSpaces(String(form.nombre?.value || '')),
      correo: normalizeEmail(String(form.correo?.value || '')),
      tipo: allowedTipos.has(normalizedTipo) ? normalizedTipo : '',
      mensaje: normalizeMessage(String(form.mensaje?.value || ''))
    };
  }

  const validations = {
    nombre: {
      validate: (value) => {
        if (!value) {
          return "El nombre es requerido";
        }
        if (value.length < 3) {
          return "El nombre debe tener al menos 3 caracteres";
        }
        if (!/^[\p{L}\s]+$/u.test(value)) {
          return "El nombre solo puede contener letras y espacios";
        }
        return "";
      },
      errorElement: document.getElementById("error-nombre")
    },
    correo: {
      validate: (value) => {
        if (!value) {
          return "El correo electrónico es requerido";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value) || value.length > 120) {
          return "Ingresa un correo electrónico válido";
        }
        return "";
      },
      errorElement: document.getElementById("error-correo")
    },
    mensaje: {
      validate: (value) => {
        if (!value) {
          return "El mensaje es requerido";
        }
        if (value.length < 10) {
          return "El mensaje debe tener al menos 10 caracteres";
        }
        if (value.length > 500) {
          return "El mensaje no puede exceder 500 caracteres";
        }
        return "";
      },
      errorElement: document.getElementById("error-mensaje")
    }
  };

  function showError(fieldName, message) {
    const validation = validations[fieldName];
    const errorElement = validation?.errorElement;
    const inputElement = form[fieldName];

    if (!inputElement) {
      return;
    }

    inputElement.setAttribute('aria-invalid', message ? 'true' : 'false');

    if (message) {
      inputElement.classList.add("input-error");
    } else {
      inputElement.classList.remove("input-error");
    }

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = message ? "block" : "none";
    }
  }

  function validateForm(values) {
    let hasErrors = false;

    Object.keys(validations).forEach((fieldName) => {
      const error = validations[fieldName].validate(values[fieldName]);
      if (error) {
        hasErrors = true;
      }
      showError(fieldName, error);
    });

    return !hasErrors;
  }

  function syncNormalizedValues(values) {
    form.nombre.value = values.nombre;
    form.correo.value = values.correo;
    form.tipo.value = values.tipo;
    form.mensaje.value = values.mensaje;
  }

  function buildSafeFormData(values) {
    const safeFormData = new FormData();
    safeFormData.append('nombre', values.nombre);
    safeFormData.append('correo', values.correo);
    safeFormData.append('mensaje', values.mensaje);

    if (values.tipo) {
      safeFormData.append('tipo', values.tipo);
    }

    return safeFormData;
  }

  Object.keys(validations).forEach((fieldName) => {
    const inputElement = form[fieldName];
    if (!inputElement) {
      return;
    }

    const validateCurrentField = () => {
      const values = getNormalizedValues();
      const error = validations[fieldName].validate(values[fieldName]);
      showError(fieldName, error);
    };

    inputElement.addEventListener("blur", () => {
      const values = getNormalizedValues();
      if (fieldName === 'nombre' || fieldName === 'correo' || fieldName === 'mensaje') {
        inputElement.value = values[fieldName];
      }
      validateCurrentField();
    });

    inputElement.addEventListener("input", validateCurrentField);

    if (fieldName === 'correo') {
      inputElement.addEventListener('change', () => {
        inputElement.value = normalizeEmail(inputElement.value);
        validateCurrentField();
      });
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (endpointUrl.href !== expectedEndpoint || endpointUrl.origin !== 'https://formspree.io') {
      setStatus("No pudimos conectar con el servidor. Por favor intenta más tarde.");
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: "error",
          title: "Error de conexión",
          html: "No pudimos conectar con el servidor. Por favor intenta más tarde.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#0066cc",
          allowOutsideClick: false,
          didClose: cleanSwalClasses
        });
      } else {
        alert("No pudimos conectar con el servidor. Por favor intenta más tarde.");
      }
      return;
    }

    const remainingCooldownMs = getRemainingCooldownMs();
    if (remainingCooldownMs > 0) {
      setStatus("Espera unos segundos antes de enviar el formulario nuevamente.");
      return;
    }

    if (Date.now() - formStartedAt < minimumFillTimeMs) {
      setStatus("Espera un momento y revisa la información antes de enviar.");
      return;
    }

    const normalizedValues = getNormalizedValues();
    syncNormalizedValues(normalizedValues);

    const isValid = validateForm(normalizedValues);

    if (!isValid) {
      setStatus("Por favor revisa los campos y completa la información correctamente.");
      focusFirstInvalidField();

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: "error",
          title: "Errores en el formulario",
          html: "Por favor revisa los campos y completa la información correctamente.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#0066cc",
          allowOutsideClick: false,
          didClose: cleanSwalClasses
        });
      } else {
        alert("Por favor revisa los campos y completa la información correctamente.");
      }
      return;
    }

    setSubmittingState(true);
    setStatus("Enviando mensaje...");

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: "Enviando mensaje...",
        html: "Por favor espera mientras procesamos tu información.",
        allowOutsideClick: () => !Swal.isLoading(),
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    }

    const formData = buildSafeFormData(normalizedValues);

    fetch(endpointUrl.href, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json"
      }
    })
      .then((response) => {
        if (response.ok) {
          storeLastSubmitTime(Date.now());
          setStatus("Gracias por contactarnos. Muy pronto te responderemos.");

          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: "success",
              title: "¡Mensaje enviado!",
              html: "Gracias por contactarnos. <br> Muy pronto te responderemos.",
              confirmButtonText: "Genial",
              confirmButtonColor: "#0066cc",
              allowOutsideClick: false,
              allowEscapeKey: false,
              didClose: () => {
                cleanSwalClasses();
                form.reset();
                Object.keys(validations).forEach((fieldName) => {
                  showError(fieldName, "");
                });
                setSubmittingState(false);
              }
            });
          } else {
            alert("¡Mensaje enviado! Gracias por contactarnos. Muy pronto te responderemos.");
            form.reset();
            Object.keys(validations).forEach((fieldName) => {
              showError(fieldName, "");
            });
            setSubmittingState(false);
          }
        } else {
          setStatus("Hubo un problema al enviar tu mensaje. Por favor intenta nuevamente.");
          setSubmittingState(false);

          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: "error",
              title: "Error al enviar",
              html: "Hubo un problema al enviar tu mensaje. Por favor intenta nuevamente.",
              confirmButtonText: "Intentar de nuevo",
              confirmButtonColor: "#0066cc",
              allowOutsideClick: false,
              didClose: cleanSwalClasses
            });
          } else {
            alert("Hubo un problema al enviar tu mensaje. Por favor intenta nuevamente.");
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setStatus("No pudimos conectar con el servidor. Por favor intenta más tarde.");
        setSubmittingState(false);

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: "error",
            title: "Error de conexión",
            html: "No pudimos conectar con el servidor. Por favor intenta más tarde.",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#0066cc",
            allowOutsideClick: false,
            didClose: cleanSwalClasses
          });
        } else {
          alert("No pudimos conectar con el servidor. Por favor intenta más tarde.");
        }
      });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initForm);
} else {
  initForm();
}

document.addEventListener('click', () => {
  if (!document.querySelector('.swal2-popup')) {
    document.body.classList.remove('swal2-shown', 'swal2-height-auto');
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';
  }
});
