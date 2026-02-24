// Esperar a que SweetAlert esté disponible
function initForm() {
  const form = document.querySelector('form[action*="formspree"]');

  if (!form) {
    console.log("Formulario no encontrado");
    return;
  }

  if (typeof Swal === 'undefined') {
    console.warn("SweetAlert no cargó, usando alert()");
  }

  // Función para limpiar clases de SweetAlert del body
  function cleanSwalClasses() {
    // Limpieza inmediata
    document.body.classList.remove('swal2-shown', 'swal2-height-auto');
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';
    
    // Limpieza adicional con timeout para asegurar que se aplique
    setTimeout(() => {
      document.body.classList.remove('swal2-shown', 'swal2-height-auto');
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '';
      
      // Remover cualquier elemento residual de SweetAlert
      const swalContainers = document.querySelectorAll('.swal2-container');
      swalContainers.forEach(container => {
        if (!container.querySelector('.swal2-popup')) {
          container.remove();
        }
      });
    }, 100);
  }

  // Validaciones
  const validations = {
    nombre: {
      validate: (value) => {
        if (!value.trim()) {
          return "El nombre es requerido";
        }
        if (value.trim().length < 3) {
          return "El nombre debe tener al menos 3 caracteres";
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return "El nombre solo puede contener letras y espacios";
        }
        return "";
      },
      errorElement: document.getElementById("error-nombre")
    },
    correo: {
      validate: (value) => {
        if (!value.trim()) {
          return "El correo electrónico es requerido";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Ingresa un correo electrónico válido";
        }
        return "";
      },
      errorElement: document.getElementById("error-correo")
    },
    mensaje: {
      validate: (value) => {
        if (!value.trim()) {
          return "El mensaje es requerido";
        }
        if (value.trim().length < 10) {
          return "El mensaje debe tener al menos 10 caracteres";
        }
        if (value.trim().length > 500) {
          return "El mensaje no puede exceder 500 caracteres";
        }
        return "";
      },
      errorElement: document.getElementById("error-mensaje")
    }
  };

  // Función para mostrar error
  function showError(fieldName, message) {
    const errorElement = validations[fieldName].errorElement;
    const inputElement = form[fieldName];
    
    if (errorElement && inputElement) {
      if (message) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
        inputElement.classList.add("input-error");
      } else {
        errorElement.textContent = "";
        errorElement.style.display = "none";
        inputElement.classList.remove("input-error");
      }
    }
  }

  // Validación en tiempo real
  Object.keys(validations).forEach(fieldName => {
    const inputElement = form[fieldName];
    if (inputElement) {
      inputElement.addEventListener("blur", () => {
        const value = inputElement.value;
        const error = validations[fieldName].validate(value);
        showError(fieldName, error);
      });

      inputElement.addEventListener("input", () => {
        const value = inputElement.value;
        const error = validations[fieldName].validate(value);
        if (error) {
          showError(fieldName, error);
        } else {
          showError(fieldName, "");
        }
      });
    }
  });

  // Envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validar todos los campos
    let hasErrors = false;

    Object.keys(validations).forEach(fieldName => {
      const value = form[fieldName].value;
      const error = validations[fieldName].validate(value);
      if (error) {
        showError(fieldName, error);
        hasErrors = true;
      } else {
        showError(fieldName, "");
      }
    });

    // Si hay errores, mostrar alerta y no enviar
    if (hasErrors) {
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

    // Mostrar mensaje de carga
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

    // Enviar el formulario
    const formData = new FormData(form);
    
    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json"
      }
    })
    .then(response => {
      if (response.ok) {
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
              Object.keys(validations).forEach(fieldName => {
                showError(fieldName, "");
              });
            }
          });
        } else {
          alert("¡Mensaje enviado! Gracias por contactarnos. Muy pronto te responderemos.");
          form.reset();
          Object.keys(validations).forEach(fieldName => {
            showError(fieldName, "");
          });
        }
      } else {
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
    .catch(error => {
      console.error("Error:", error);
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

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initForm);
} else {
  initForm();
}

// Limpiar clases globalmente como medida de seguridad adicional
document.addEventListener('click', (e) => {
  // Solo limpiar si no hay un modal activo de SweetAlert
  if (!document.querySelector('.swal2-popup')) {
    document.body.classList.remove('swal2-shown', 'swal2-height-auto');
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';
  }
});