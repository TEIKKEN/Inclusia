const DEFAULT_ERROR_MESSAGE =
  'Debes autorizar el tratamiento de tus datos personales para enviar el formulario.';

export function createPrivacyConsentValidation(form, options = {}) {
  const checkbox = form?.querySelector('#autorizacion-datos');
  const group = checkbox?.closest('.privacy-consent');
  const errorElement = form?.querySelector('#error-autorizacion-datos');
  const errorMessage = options.errorMessage || DEFAULT_ERROR_MESSAGE;
  let validationAttempted = false;

  function setError(message) {
    if (!checkbox) return;

    checkbox.setAttribute('aria-invalid', message ? 'true' : 'false');
    checkbox.classList.toggle('input-error', Boolean(message));
    group?.classList.toggle('is-invalid', Boolean(message));

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = message ? 'block' : 'none';
    }
  }

  function validate({ focus = false } = {}) {
    validationAttempted = true;
    const isValid = Boolean(checkbox?.checked);

    setError(isValid ? '' : errorMessage);

    if (!isValid && focus) checkbox?.focus();

    return isValid;
  }

  function appendToFormData(formData) {
    if (!checkbox?.checked) return;

    const policyUrl = new URL(checkbox.dataset.policyUrl, document.baseURI).href;
    formData.set(
      'autorizacion_tratamiento_datos',
      'Sí. Autorización previa, expresa e informada conforme a la Ley 1581 de 2012.'
    );
    formData.set('politica_tratamiento_datos', policyUrl);
    formData.set('fecha_autorizacion', new Date().toISOString());
  }

  function reset() {
    validationAttempted = false;
    setError('');
  }

  checkbox?.addEventListener('change', () => {
    if (checkbox.checked || validationAttempted) validate();
  });

  checkbox?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    checkbox.click();
  });

  return {
    field: checkbox,
    validate,
    appendToFormData,
    reset
  };
}
