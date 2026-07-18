const MOTION_STORAGE_KEY = 'inclusiaReduceMotion';
const MOTION_CHANGE_EVENT = 'inclusia:motion-preference-change';
const systemMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

function getSavedPreference() {
  try {
    const savedValue = localStorage.getItem(MOTION_STORAGE_KEY);

    if (savedValue === 'true') return true;
    if (savedValue === 'false') return false;
  } catch {
    // The system preference remains available when storage is blocked.
  }

  return null;
}

function savePreference(enabled) {
  try {
    localStorage.setItem(MOTION_STORAGE_KEY, String(enabled));
  } catch {
    // The control still works for the current page without persistence.
  }
}

export function isMotionReduced() {
  return document.documentElement.classList.contains('reduce-motion');
}

function updateSwitch(enabled) {
  const switchButton = document.getElementById('reduce-motion-switch');
  const status = document.getElementById('reduce-motion-status');

  if (switchButton) switchButton.setAttribute('aria-checked', String(enabled));
  if (status) status.textContent = enabled ? 'Activado' : 'Desactivado';
}

function synchronizeScriptedMotion(enabled) {
  if (window.gsap?.globalTimeline) {
    window.gsap.globalTimeline.timeScale(enabled ? 1000 : 1);
  }

  if (enabled) document.getElementById('page-loader')?.remove();
}

function applyPreference(enabled, { persist = false, notify = true } = {}) {
  const reduced = Boolean(enabled);
  const root = document.documentElement;

  root.classList.toggle('reduce-motion', reduced);
  root.dataset.reduceMotion = String(reduced);

  if (persist) savePreference(reduced);

  updateSwitch(reduced);
  synchronizeScriptedMotion(reduced);

  if (notify) {
    window.dispatchEvent(
      new CustomEvent(MOTION_CHANGE_EVENT, {
        detail: { reducedMotion: reduced },
      })
    );
  }
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

function initMotionControl() {
  const menu = document.getElementById('floating-accessibility-menu');
  if (!menu || document.getElementById('reduce-motion-switch')) return;

  const container = createElement('li', {
    className: 'reduce-motion-container',
    attributes: { role: 'none' },
  });
  const switchButton = createElement('button', {
    id: 'reduce-motion-switch',
    className: 'reduce-motion-switch',
    attributes: {
      type: 'button',
      role: 'switch',
      'aria-checked': String(isMotionReduced()),
      'aria-labelledby': 'reduce-motion-label',
      'aria-describedby': 'reduce-motion-status',
    },
  });
  const copy = createElement('span', { className: 'reduce-motion-copy' });
  const label = createElement('span', {
    id: 'reduce-motion-label',
    className: 'reduce-motion-label',
    text: 'Desactivar animaciones',
  });
  const status = createElement('span', {
    id: 'reduce-motion-status',
    className: 'reduce-motion-status',
    text: isMotionReduced() ? 'Activado' : 'Desactivado',
    attributes: { 'aria-live': 'polite' },
  });
  const visual = createElement('span', {
    className: 'reduce-motion-switch-visual',
    attributes: { 'aria-hidden': 'true' },
  });

  switchButton.addEventListener('click', () => {
    applyPreference(!isMotionReduced(), { persist: true });
  });

  copy.append(label, status);
  switchButton.append(copy, visual);
  container.append(switchButton);

  const textToSpeechSeparator = menu.querySelector('.tts-separator');
  menu.insertBefore(container, textToSpeechSeparator);
}

const savedPreference = getSavedPreference();
applyPreference(savedPreference ?? systemMotionPreference.matches, { notify: false });

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotionControl);
} else {
  initMotionControl();
}

window.addEventListener(
  'load',
  () => synchronizeScriptedMotion(isMotionReduced()),
  { once: true }
);

const handleSystemPreferenceChange = (event) => {
  if (getSavedPreference() === null) applyPreference(event.matches);
};

if (typeof systemMotionPreference.addEventListener === 'function') {
  systemMotionPreference.addEventListener('change', handleSystemPreferenceChange);
} else {
  systemMotionPreference.addListener(handleSystemPreferenceChange);
}
