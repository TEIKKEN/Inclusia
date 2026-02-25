/**
 * Navegación por teclado avanzada para mejorar la accesibilidad
 * Maneja dropdown menus, menú de accesibilidad y formularios
 */

// Manejo de navegación por teclado en dropdowns
class KeyboardNavigation {
  constructor() {
    this.currentFocus = -1;
    this.init();
  }

  init() {
    this.handleDropdownNavigation();
    this.handleAccessibilityMenuNavigation();
    this.handleFormEnhancements();
    this.addKeyboardEventListeners();
  }

  // Navegación en dropdown del navbar
  handleDropdownNavigation() {
    const dropdownTriggers = document.querySelectorAll('[role="menuitem"][aria-haspopup="true"]');
    
    dropdownTriggers.forEach(trigger => {
      const submenu = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!submenu) return;

      const submenuItems = submenu.querySelectorAll('[role="menuitem"]');

      // Eventos del trigger
      trigger.addEventListener('keydown', (e) => {
        switch(e.key) {
          case 'ArrowDown':
          case 'Enter':
          case ' ':
            e.preventDefault();
            this.openDropdown(trigger, submenu, submenuItems);
            break;
          case 'Escape':
            this.closeDropdown(trigger, submenu);
            break;
        }
      });

      // Eventos de los items del submenu
      submenuItems.forEach((item, index) => {
        item.addEventListener('keydown', (e) => {
          switch(e.key) {
            case 'ArrowDown':
              e.preventDefault();
              this.focusNextItem(submenuItems, index);
              break;
            case 'ArrowUp':
              e.preventDefault();
              this.focusPrevItem(submenuItems, index);
              break;
            case 'Escape':
              e.preventDefault();
              this.closeDropdown(trigger, submenu);
              trigger.focus();
              break;
            case 'Tab':
              this.closeDropdown(trigger, submenu);
              break;
          }
        });
      });

      // Cerrar con click fuera
      document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !submenu.contains(e.target)) {
          this.closeDropdown(trigger, submenu);
        }
      });
    });
  }

  // Navegación en menú de accesibilidad flotante
  handleAccessibilityMenuNavigation() {
    const accessibilityBtn = document.getElementById('floating-accessibility-btn');
    const accessibilityMenu = document.getElementById('floating-accessibility-menu');
    
    if (!accessibilityBtn || !accessibilityMenu) return;

    const menuItems = accessibilityMenu.querySelectorAll('[role="menuitem"]');

    accessibilityBtn.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
          e.preventDefault();
          this.openAccessibilityMenu(accessibilityBtn, accessibilityMenu, menuItems);
          break;
        case 'Escape':
          this.closeAccessibilityMenu(accessibilityBtn, accessibilityMenu);
          break;
      }
    });

    menuItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        switch(e.key) {
          case 'ArrowDown':
            e.preventDefault();
            this.focusNextItem(menuItems, index);
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.focusPrevItem(menuItems, index);
            break;
          case 'Escape':
            e.preventDefault();
            this.closeAccessibilityMenu(accessibilityBtn, accessibilityMenu);
            accessibilityBtn.focus();
            break;
          case 'Tab':
            if (!e.shiftKey && index === menuItems.length - 1) {
              this.closeAccessibilityMenu(accessibilityBtn, accessibilityMenu);
            } else if (e.shiftKey && index === 0) {
              this.closeAccessibilityMenu(accessibilityBtn, accessibilityMenu);
            }
            break;
        }
      });
    });
  }

  // Mejoras para formularios
  handleFormEnhancements() {
    const form = document.querySelector('form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Validación en tiempo real con ARIA
      input.addEventListener('blur', () => {
        this.validateInput(input);
      });

      input.addEventListener('input', () => {
        // Limpiar error si el usuario está escribiendo
        if (input.getAttribute('aria-invalid') === 'true') {
          this.clearInputError(input);
        }
      });
    });
  }

  // Eventos globales de teclado
  addKeyboardEventListeners() {
    // Manejo global de Escape para cerrar modales/menus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Cerrar todos los dropdowns abiertos
        const openDropdowns = document.querySelectorAll('.dropdown.active');
        openDropdowns.forEach(dropdown => {
          dropdown.classList.remove('active');
          const trigger = dropdown.querySelector('[aria-haspopup="true"]');
          if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
          }
        });

        // Cerrar menú de accesibilidad
        const accessibilityMenu = document.getElementById('floating-accessibility-menu');
        if (accessibilityMenu && !accessibilityMenu.hidden) {
          this.closeAccessibilityMenu(
            document.getElementById('floating-accessibility-btn'),
            accessibilityMenu
          );
        }
      }
    });
  }

  // Métodos de utilidad para dropdowns
  openDropdown(trigger, submenu, items) {
    trigger.setAttribute('aria-expanded', 'true');
    trigger.closest('.dropdown').classList.add('active');
    
    // Enfocar primer item
    if (items.length > 0) {
      items[0].focus();
      items[0].tabIndex = 0;
      items.forEach((item, index) => {
        if (index > 0) item.tabIndex = -1;
      });
    }
  }

  closeDropdown(trigger, submenu) {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.closest('.dropdown').classList.remove('active');
    
    // Resetear tabindex
    const items = submenu.querySelectorAll('[role="menuitem"]');
    items.forEach(item => {
      item.tabIndex = -1;
    });
  }

  // Métodos para menú de accesibilidad
  openAccessibilityMenu(button, menu, items) {
    button.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    
    if (items.length > 0) {
      items[0].focus();
      items[0].tabIndex = 0;
      items.forEach((item, index) => {
        if (index > 0) item.tabIndex = -1;
      });
    }
  }

  closeAccessibilityMenu(button, menu) {
    button.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    
    // Resetear tabindex
    const items = menu.querySelectorAll('[role="menuitem"]');
    items.forEach(item => {
      item.tabIndex = -1;
    });
  }

  // Navegación entre items de menu
  focusNextItem(items, currentIndex) {
    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    items[currentIndex].tabIndex = -1;
    items[nextIndex].tabIndex = 0;
    items[nextIndex].focus();
  }

  focusPrevItem(items, currentIndex) {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    items[currentIndex].tabIndex = -1;
    items[prevIndex].tabIndex = 0;
    items[prevIndex].focus();
  }

  // Validación de formulario con ARIA
  validateInput(input) {
    const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
    const isRequired = input.hasAttribute('required');
    const value = input.value.trim();

    let isValid = true;
    let errorMessage = '';

    // Validaciones básicas
    if (isRequired && !value) {
      isValid = false;
      errorMessage = 'Este campo es obligatorio.';
    } else if (input.type === 'email' && value && !this.isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Ingrese un correo electrónico válido.';
    }

    // Actualizar estados ARIA
    input.setAttribute('aria-invalid', !isValid);
    
    if (errorElement) {
      if (!isValid) {
        errorElement.textContent = errorMessage;
        errorElement.setAttribute('aria-live', 'assertive');
      } else {
        errorElement.textContent = '';
        errorElement.removeAttribute('aria-live');
      }
    }

    return isValid;
  }

  clearInputError(input) {
    input.setAttribute('aria-invalid', 'false');
    const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.removeAttribute('aria-live');
    }
  }

  // Validador de email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new KeyboardNavigation();
  });
} else {
  new KeyboardNavigation();
}

// Export para uso en otros módulos si es necesario
export default KeyboardNavigation;