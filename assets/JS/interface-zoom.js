const ZOOM_STORAGE_KEY = 'inclusiaInterfaceZoom';
const MIN_ZOOM = 70;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;
const DEFAULT_ZOOM = 100;

function normalizeZoom(value) {
  const numericValue = Number(value);
  const isValidStep = (numericValue - MIN_ZOOM) % ZOOM_STEP === 0;

  if (
    !Number.isFinite(numericValue) ||
    numericValue < MIN_ZOOM ||
    numericValue > MAX_ZOOM ||
    !isValidStep
  ) {
    return DEFAULT_ZOOM;
  }

  return numericValue;
}

function getSavedZoom() {
  try {
    return normalizeZoom(localStorage.getItem(ZOOM_STORAGE_KEY));
  } catch {
    return DEFAULT_ZOOM;
  }
}

function saveZoom(value) {
  try {
    localStorage.setItem(ZOOM_STORAGE_KEY, String(value));
  } catch {
    // The zoom still works when storage is unavailable or blocked.
  }
}

function applyZoom(value) {
  const normalizedValue = normalizeZoom(value);
  const factor = normalizedValue / 100;
  const root = document.documentElement;

  root.classList.add('interface-zoom-active');
  root.style.setProperty('--interface-zoom-factor', String(factor));
  root.style.setProperty('--interface-zoom-inverse', String(1 / factor));
  root.dataset.interfaceZoom = String(normalizedValue);

  return normalizedValue;
}

function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);

  if (options.className) element.className = options.className;
  if (options.id) element.id = options.id;
  if (options.text) element.textContent = options.text;

  Object.entries(options.attributes || {}).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  return element;
}

function initInterfaceZoom() {
  const menu = document.getElementById('floating-accessibility-menu');
  if (!menu || document.getElementById('interface-zoom-slider')) return;

  const savedZoom = applyZoom(getSavedZoom());
  const container = createElement('li', {
    className: 'interface-zoom-container',
    attributes: { role: 'none' },
  });
  const group = createElement('div', {
    className: 'interface-zoom-control',
    attributes: {
      role: 'group',
      'aria-labelledby': 'interface-zoom-label',
    },
  });
  const heading = createElement('div', { className: 'interface-zoom-heading' });
  const label = createElement('label', {
    id: 'interface-zoom-label',
    text: 'Zoom',
    attributes: { for: 'interface-zoom-slider' },
  });
  const output = createElement('output', {
    id: 'interface-zoom-value',
    text: `${savedZoom} %`,
    attributes: {
      for: 'interface-zoom-slider',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    },
  });
  const controls = createElement('div', { className: 'interface-zoom-controls' });
  const slider = createElement('input', {
    id: 'interface-zoom-slider',
    attributes: {
      type: 'range',
      min: String(MIN_ZOOM),
      max: String(MAX_ZOOM),
      step: String(ZOOM_STEP),
      value: String(savedZoom),
      'aria-label': 'Zoom general de la interfaz',
      'aria-valuetext': `${savedZoom} por ciento`,
    },
  });
  const resetButton = createElement('button', {
    className: 'interface-zoom-reset',
    text: 'Restablecer',
    attributes: {
      type: 'button',
      'aria-label': 'Restablecer zoom al 100 por ciento',
      title: 'Restablecer zoom al 100 %',
    },
  });

  function updateZoom(value, persist = true) {
    const normalizedValue = applyZoom(value);
    slider.value = String(normalizedValue);
    slider.setAttribute('aria-valuetext', `${normalizedValue} por ciento`);
    slider.style.setProperty(
      '--interface-zoom-progress',
      `${((normalizedValue - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%`
    );
    output.textContent = `${normalizedValue} %`;

    if (persist) saveZoom(normalizedValue);
  }

  slider.addEventListener('input', () => updateZoom(slider.value));
  resetButton.addEventListener('click', () => updateZoom(DEFAULT_ZOOM));

  heading.append(label, output);
  controls.append(slider, resetButton);
  group.append(heading, controls);
  container.append(group);

  const textToSpeechSeparator = menu.querySelector('.tts-separator');
  menu.insertBefore(container, textToSpeechSeparator);
  updateZoom(savedZoom, false);
}

applyZoom(getSavedZoom());

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInterfaceZoom);
} else {
  initInterfaceZoom();
}
