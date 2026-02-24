// TEXT-TO-SPEECH ACCESSIBILITY HANDLER
class AccessibilityTextToSpeech {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isSupported = this.checkSupport();
    this.isListening = false;
    this.currentUtterance = null;
    this.isSpeakingOnPage = false;
    this.isFocusMode = false; // Nuevo: modo de lectura por foco
    this.allText = '';
    this.selectedVoice = null;
    this.lastFocusedElement = null;
    
    if (this.isSupported) {
      this.init();
    } else {
      console.warn('Web Speech API no soportada en este navegador');
      this.disableButton();
    }
  }

  checkSupport() {
    const synth = window.speechSynthesis;
    if (!synth) {
      console.error('window.speechSynthesis no disponible');
      return false;
    }

    // Test if we can create a SpeechUtterance
    try {
      new SpeechSynthesisUtterance('test');
      console.log('✅ Web Speech API está disponible');
      return true;
    } catch (e) {
      console.error('Error al crear SpeechUtterance:', e);
      return false;
    }
  }

  init() {
    const ttsButton = document.getElementById('toggle-text-to-speech-btn');
    if (ttsButton) {
      ttsButton.addEventListener('click', () => this.toggleTextToSpeech());
      // Doble clic para cambiar de modo
      ttsButton.addEventListener('dblclick', () => this.toggleReadingMode());
      console.log('✅ TTS button listener agregado');
    } else {
      console.warn('⚠️ TTS button no encontrado');
    }

    // Inicializar listeners para lectura por foco
    this.initFocusReading();

    // Load voices immediately
    this.loadVoices();
    
    // Also reload voices when they change (Chrome specific)
    this.synth.addEventListener('voiceschanged', () => {
      console.log('🔊 Voces actualizadas');
      this.loadVoices();
    });

    // Chrome fix: force load voices asynchronously
    setTimeout(() => {
      this.loadVoices();
    }, 100);
  }

  disableButton() {
    const ttsButton = document.getElementById('toggle-text-to-speech-btn');
    if (ttsButton) {
      ttsButton.disabled = true;
      ttsButton.title = 'Tu navegador no soporta lectura de voz';
      ttsButton.textContent = '🔊 No disponible';
    }
  }

  loadVoices() {
    const voices = this.synth.getVoices();
    console.log(`📢 Voces disponibles: ${voices.length}`);
    
    if (voices.length > 0) {
      // Try Spanish voice first, fallback to any voice
      this.selectedVoice = voices.find(v => v.lang.startsWith('es')) || voices[0];
      console.log(`✅ Voz seleccionada: "${this.selectedVoice.name}" (${this.selectedVoice.lang})`);
    } else {
      console.warn('⚠️ No hay voces disponibles aún');
      // Retry after a delay
      setTimeout(() => this.loadVoices(), 500);
    }
  }

  getAllPageText() {
    // Create a clone of the entire body to extract text from
    const bodyClone = document.body.cloneNode(true);
    
    // Remove elements that shouldn't be read
    const elementsToRemove = bodyClone.querySelectorAll(
      'nav, script, style, .floating-accessibility-wrapper, [hidden], .hamburger-btn'
    );
    elementsToRemove.forEach(el => el.remove());
    
    return this.extractTextWithLabels(bodyClone);
  }

  extractTextWithLabels(container) {
    const textParts = [];
    
    const walk = (node) => {
      // Skip certain elements
      if (node.classList && (
        node.classList.contains('floating-accessibility-wrapper') ||
        node.classList.contains('hamburger-btn') ||
        node.hasAttribute('hidden') ||
        node.tagName === 'SCRIPT' ||
        node.tagName === 'STYLE'
      )) {
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          textParts.push(text);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        const ariaLabel = node.getAttribute('aria-label');
        const title = node.getAttribute('title');
        const label = ariaLabel || title;

        // Add semantic labels for interactive elements
        if (tag === 'button') {
          if (label) {
            textParts.push(`Botón: ${label}`);
          } else {
            const text = node.textContent.trim();
            if (text) textParts.push(`Botón: ${text}`);
          }
          return; // Don't process children
        } else if (tag === 'a') {
          const href = node.getAttribute('href');
          if (label) {
            textParts.push(`Enlace: ${label}${href && !href.startsWith('#') ? ` (${href})` : ''}`);
          } else {
            const text = node.textContent.trim();
            if (text) textParts.push(`Enlace: ${text}${href && !href.startsWith('#') ? ` (${href})` : ''}`);
          }
          return; // Don't process children
        } else if (tag === 'input') {
          const type = node.getAttribute('type') || 'texto';
          const placeholder = node.getAttribute('placeholder');
          const name = node.getAttribute('name');
          const value = node.value;
          const required = node.hasAttribute('required') ? ' (requerido)' : '';
          
          if (type === 'checkbox' || type === 'radio') {
            const checked = node.checked ? 'marcado' : 'sin marcar';
            const labelText = name || placeholder || 'opción';
            textParts.push(`${type === 'checkbox' ? 'Casilla' : 'Radio'}: ${labelText}, ${checked}${required}`);
          } else if (type === 'submit' || type === 'button') {
            textParts.push(`Botón: ${value || 'Enviar'}${required}`);
          } else if (type === 'hidden') {
            // Skip hidden inputs
          } else {
            const label = placeholder || name || 'campo';
            textParts.push(`Campo de ${type}: ${label}${required}`);
          }
          return;
        } else if (tag === 'select') {
          const name = node.getAttribute('name');
          const required = node.hasAttribute('required') ? ' (requerido)' : '';
          const selectedOption = node.querySelector('option:checked');
          const selectedText = selectedOption ? selectedOption.textContent : 'sin seleccionar';
          textParts.push(`Menú desplegable: ${name || 'selecciona'}, seleccionado: ${selectedText}${required}`);
          return;
        } else if (tag === 'textarea') {
          const placeholder = node.getAttribute('placeholder');
          const name = node.getAttribute('name');
          const required = node.hasAttribute('required') ? ' (requerido)' : '';
          textParts.push(`Área de texto: ${placeholder || name || 'ingresa tu texto'}${required}`);
          return;
        } else if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
          const level = parseInt(tag.charAt(1));
          const text = node.textContent.trim();
          if (text) textParts.push(`Encabezado nivel ${level}: ${text}`);
          return;
        } else if (tag === 'label') {
          const text = node.textContent.trim();
          if (text) textParts.push(`Etiqueta: ${text}`);
          return;
        } else if (tag === 'form') {
          const name = node.getAttribute('name');
          if (name) {
            textParts.push(`Formulario: ${name}`);
          } else {
            textParts.push('Formulario');
          }
          // Process children
          for (let child of node.childNodes) {
            walk(child);
          }
          return;
        } else if (tag === 'ul' || tag === 'ol') {
          const items = node.querySelectorAll(':scope > li');
          const listType = tag === 'ul' ? 'lista con viñetas' : 'lista numerada';
          textParts.push(`${listType} con ${items.length} elementos`);
          for (let child of node.childNodes) {
            walk(child);
          }
          return;
        } else if (tag === 'li') {
          const text = node.textContent.trim();
          if (text) textParts.push(`elemento: ${text}`);
          return;
        } else {
          // Process children for other elements
          for (let child of node.childNodes) {
            walk(child);
          }
        }
      }
    };

    walk(container);
    return textParts.join('. ').replace(/\s+/g, ' ').trim();
  }

  toggleTextToSpeech() {
    if (!this.isSupported) {
      alert('Tu navegador no soporta lectura de texto en voz alta');
      return;
    }

    // If no voice is selected, try to load voices first
    if (!this.selectedVoice) {
      console.log('⏳ Esperando a que las voces se carguen...');
      this.loadVoices();
      
      if (!this.selectedVoice) {
        alert('Las voces de síntesis aún se están cargando. Intenta de nuevo en un momento.');
        return;
      }
    }

    if (this.isFocusMode) {
      // En modo foco, leer el elemento actualmente enfocado
      const focusedElement = document.activeElement;
      if (focusedElement && focusedElement !== document.body) {
        this.readFocusedElement(focusedElement);
      } else {
        this.speakText('Modo de lectura por foco activado. Navega con Tab para escuchar cada elemento');
      }
    } else {
      // Modo página completa (comportamiento original)
      console.log('🔄 Toggle TTS, isSpeaking:', this.isSpeakingOnPage);

      if (this.isSpeakingOnPage) {
        this.stopSpeaking();
      } else {
        this.startSpeaking();
      }
    }
  }

  startSpeaking() {
    // Cancel any ongoing speech
    this.synth.cancel();

    const textToRead = this.getAllPageText();
    if (!textToRead) {
      console.warn('⚠️ No hay texto para leer');
      alert('No hay contenido para leer');
      return;
    }

    console.log('📖 Iniciando lectura de texto...');
    this.allText = textToRead;
    this.isSpeakingOnPage = true;

    // Update button state
    this.updateButtonState();

    // Split text into chunks for better handling of long texts
    const chunks = this.splitTextIntoChunks(textToRead, 500);
    console.log(`📚 Dividido en ${chunks.length} fragmentos`);
    this.speakChunks(chunks);
  }

  splitTextIntoChunks(text, chunkSize = 500) {
    const chunks = [];
    let currentChunk = '';

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    for (let sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  speakChunks(chunks, index = 0) {
    if (index >= chunks.length || !this.isSpeakingOnPage) {
      this.stopSpeaking();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'es-ES';

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      utterance.onend = () => {
        this.speakChunks(chunks, index + 1);
      };

      utterance.onerror = (event) => {
        console.error('❌ Error en síntesis de voz:', event.error);
        this.stopSpeaking();
      };

      this.currentUtterance = utterance;
      console.log(`🔊 Hablando chunk ${index + 1} de ${chunks.length}`);
      this.synth.speak(utterance);
    } catch (error) {
      console.error('❌ Error al crear utterance:', error);
      this.stopSpeaking();
    }
  }

  stopSpeaking() {
    this.synth.cancel();
    this.isSpeakingOnPage = false;

    // Update button state
    this.updateButtonState();

    console.log('⏸ Lectura pausada');
  }

  updateButtonState() {
    const ttsButton = document.getElementById('toggle-text-to-speech-btn');
    if (ttsButton) {
      if (this.isSpeakingOnPage) {
        ttsButton.classList.add('speaking');
        ttsButton.setAttribute('aria-pressed', 'true');
        ttsButton.textContent = '⏸ Pausar lectura';
      } else {
        ttsButton.classList.remove('speaking');
        ttsButton.setAttribute('aria-pressed', 'false');
        const mode = this.isFocusMode ? 'foco' : 'página';
        ttsButton.textContent = `🔊 Leer ${mode}`;
        ttsButton.title = this.isFocusMode 
          ? 'Modo: Lectura por foco (Tab). Doble-clic para cambiar a página completa'
          : 'Modo: Página completa. Doble-clic para cambiar a lectura por foco';
      }
    }
  }

  // ================================
  // NUEVAS FUNCIONES DE LECTURA POR FOCO
  // ================================

  initFocusReading() {
    // Agregar listeners para detectar cuando el usuario navega con Tab
    document.addEventListener('focusin', (event) => {
      if (this.isFocusMode && !this.isSpeakingOnPage) {
        this.readFocusedElement(event.target);
      }
    });

    // También detectar cuando el usuario hace clic en elementos
    document.addEventListener('click', (event) => {
      if (this.isFocusMode && !this.isSpeakingOnPage) {
        // Pequeño delay para asegurar que el foco se haya establecido
        setTimeout(() => {
          if (document.activeElement) {
            this.readFocusedElement(document.activeElement);
          }
        }, 50);
      }
    });

    console.log('✅ Focus reading listeners agregados');
  }

  toggleReadingMode() {
    this.isFocusMode = !this.isFocusMode;
    this.stopSpeaking(); // Parar cualquier lectura actual
    
    const mode = this.isFocusMode ? 'lectura por foco' : 'página completa';
    console.log(`🔄 Cambiando a modo: ${mode}`);
    
    this.updateButtonState();

    // Anunciar el cambio de modo
    this.speakText(`Modo cambiado a ${mode}`);

    // Mostrar notificación visual
    this.showModeNotification(mode);
  }

  showModeNotification(mode) {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 999999;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    notification.textContent = `Modo: ${mode}`;
    document.body.appendChild(notification);

    // Animar aparición
    setTimeout(() => notification.style.opacity = '1', 10);

    // Remover después de 3 segundos
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  readFocusedElement(element) {
    if (!element || element === this.lastFocusedElement) return;

    this.lastFocusedElement = element;
    const elementText = this.getElementText(element);
    
    if (elementText) {
      console.log(`🔍 Leyendo elemento enfocado: ${elementText.substring(0, 50)}...`);
      this.speakText(elementText);
    }
  }

  getElementText(element) {
    // Obtener texto específico del elemento enfocado
    const tagName = element.tagName.toLowerCase();
    const ariaLabel = element.getAttribute('aria-label');
    const title = element.getAttribute('title');
    const placeholder = element.getAttribute('placeholder');
    const alt = element.getAttribute('alt');

    // Textos prioritarios
    if (ariaLabel) return ariaLabel;
    if (title) return title;

    switch (tagName) {
      case 'button':
        return `Botón: ${element.textContent.trim() || 'sin etiqueta'}`;
      
      case 'a':
        const href = element.getAttribute('href');
        const linkText = element.textContent.trim() || href || 'enlace sin texto';
        return `Enlace: ${linkText}`;
      
      case 'input':
        const type = element.getAttribute('type') || 'texto';
        const name = element.getAttribute('name') || '';
        const value = element.value;
        const required = element.hasAttribute('required') ? ' requerido' : '';
        
        if (type === 'checkbox') {
          const checked = element.checked ? 'marcado' : 'sin marcar';
          return `Casilla de verificación: ${placeholder || name || 'opción'}, ${checked}${required}`;
        } else if (type === 'radio') {
          const checked = element.checked ? 'seleccionado' : 'no seleccionado';
          return `Botón de opción: ${placeholder || name || 'opción'}, ${checked}${required}`;
        } else if (type === 'submit' || type === 'button') {
          return `Botón: ${value || element.textContent.trim() || 'enviar'}`;
        } else {
          return `Campo de ${type}: ${placeholder || name || 'entrada de texto'}${required}`;
        }
      
      case 'select':
        const selectedOption = element.selectedOptions[0];
        const selectedText = selectedOption ? selectedOption.textContent : 'ninguna opción seleccionada';
        const selectName = element.getAttribute('name') || 'menú desplegable';
        return `${selectName}: ${selectedText}`;
      
      case 'textarea':
        const textareaName = placeholder || element.getAttribute('name') || 'área de texto';
        const textareaRequired = element.hasAttribute('required') ? ' requerido' : '';
        return `Área de texto: ${textareaName}${textareaRequired}`;
      
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        const level = parseInt(tagName.charAt(1));
        return `Encabezado nivel ${level}: ${element.textContent.trim()}`;
      
      case 'img':
        return `Imagen: ${alt || element.getAttribute('src') || 'sin descripción'}`;
      
      case 'label':
        return `Etiqueta: ${element.textContent.trim()}`;
      
      case 'p':
        const pText = element.textContent.trim();
        if (pText.length > 150) {
          return `Párrafo: ${pText.substring(0, 147)}...`;
        }
        return `Párrafo: ${pText}`;
      
      case 'li':
        return `Elemento de lista: ${element.textContent.trim()}`;
      
      default:
        const text = element.textContent.trim();
        if (text) {
          if (text.length > 100) {
            return `${text.substring(0, 97)}...`;
          }
          return text;
        }
        return `Elemento ${tagName}`;
    }
  }

  speakText(text) {
    if (!text || !this.selectedVoice) return;

    // Cancelar cualquier lectura anterior
    this.synth.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1; // Ligeramente más rápido para elementos individuales
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'es-ES';
      utterance.voice = this.selectedVoice;

      this.synth.speak(utterance);
    } catch (error) {
      console.error('❌ Error al hablar texto:', error);
    }
  }
}

// Initialize when the class is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM cargado, inicializando Text-to-Speech...');
    window.accessibilityTTS = new AccessibilityTextToSpeech();
    // Inicializar estado del botón
    setTimeout(() => {
      if (window.accessibilityTTS) {
        window.accessibilityTTS.updateButtonState();
      }
    }, 100);
  });
} else {
  console.log('📱 Inicializando Text-to-Speech inmediatamente...');
  window.accessibilityTTS = new AccessibilityTextToSpeech();
  // Inicializar estado del botón
  setTimeout(() => {
    if (window.accessibilityTTS) {
      window.accessibilityTTS.updateButtonState();
    }
  }, 100);
}
