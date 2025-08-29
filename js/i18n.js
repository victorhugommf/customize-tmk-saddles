class I18nManager {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = {};
    this.init();
  }

  async init() {
    await this.loadTranslations();
    this.detectLanguage();
    this.setupLanguageToggle();
    this.translatePage();
  }

  async loadTranslations() {
    try {
      const response = await fetch('assets/translations.json');
      this.translations = await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  }

  detectLanguage() {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
      this.currentLanguage = savedLanguage;
      return;
    }

    // Check browser language
    const browserLanguage = navigator.language || navigator.userLanguage;
    if (browserLanguage.startsWith('pt')) {
      this.currentLanguage = 'pt';
    } else {
      this.currentLanguage = 'en';
    }
  }

  setupLanguageToggle() {
    // Create language toggle button
    const languageToggle = document.createElement('div');
    languageToggle.className = 'language-toggle';
    languageToggle.innerHTML = `
            <button id="langToggle" class="lang-btn">
                <span class="flag-icon">${this.currentLanguage === 'en' ? '🇺🇸' : '🇧🇷'}</span>
                <span class="lang-text">${this.currentLanguage === 'en' ? 'EN' : 'PT'}</span>
            </button>
        `;

    // Insert at the top of the container
    const container = document.querySelector('.container');
    if (container) {
      container.insertBefore(languageToggle, container.firstChild);
    }

    // Add event listener
    document.getElementById('langToggle').addEventListener('click', () => {
      this.toggleLanguage();
    });
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'pt' : 'en';
    localStorage.setItem('preferredLanguage', this.currentLanguage);
    this.translatePage();
    this.updateToggleButton();
  }

  updateToggleButton() {
    const flagIcon = document.querySelector('.flag-icon');
    const langText = document.querySelector('.lang-text');

    if (flagIcon && langText) {
      flagIcon.textContent = this.currentLanguage === 'en' ? '🇺🇸' : '🇧🇷';
      langText.textContent = this.currentLanguage === 'en' ? 'EN' : 'PT';
    }
  }

  translatePage() {
    // Add translating class for smooth transition
    document.body.classList.add('translating');

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getTranslation(key);
      if (translation) {
        if (element.tagName === 'BUTTON') {
          // For buttons, preserve the emoji and update text
          const currentText = element.textContent.trim();
          const emoji = currentText.match(/^[\u{1F000}-\u{1F6FF}]|^[\u{2600}-\u{26FF}]/u);
          if (emoji) {
            element.textContent = `${emoji[0]} ${translation}`;
          } else {
            element.textContent = translation;
          }
        } else if (element.tagName === 'INPUT' && element.type === 'submit') {
          element.value = translation;
        } else if (element.hasAttribute('placeholder')) {
          element.placeholder = translation;
        } else if (element.tagName === 'TITLE') {
          element.textContent = translation;
          document.title = translation;
        } else {
          // For section titles, preserve emojis
          const currentText = element.textContent.trim();
          const emoji = currentText.match(/^[\u{1F000}-\u{1F6FF}]|^[\u{2600}-\u{26FF}]/u);
          if (emoji && element.classList.contains('section-title')) {
            element.textContent = `${emoji[0]} ${translation}`;
          } else {
            element.textContent = translation;
          }
        }
      }
    });

    // Translate select options and radio labels
    this.translateSelectOptions();
    this.translateInputLabels();

    // Update document title
    const titleTranslation = this.getTranslation('pageTitle');
    if (titleTranslation) {
      document.title = titleTranslation;
    }

    // Update HTML lang attribute
    document.documentElement.lang = this.currentLanguage;

    // Remove translating class after a short delay
    setTimeout(() => {
      document.body.classList.remove('translating');
    }, 300);
  }

  translateSelectOptions() {
    const selects = document.querySelectorAll('select[data-i18n-options]');
    selects.forEach(select => {
      const optionsKey = select.getAttribute('data-i18n-options');
      const options = select.querySelectorAll('option[value]:not([value=""])');

      options.forEach(option => {
        const value = option.value;
        const translationPath = `options.${optionsKey}.${value}`;
        const translation = this.getTranslation(translationPath);
        if (translation) {
          option.textContent = translation;
        }
      });
    });
  }

  translateInputLabels() {
    const radioGroups = document.querySelectorAll('[data-i18n-radio]');
    radioGroups.forEach(group => {
      const optionsKey = group.getAttribute('data-i18n-radio');
      const inputs = group.querySelectorAll('input[type="radio"], input[type="checkbox"]');

      inputs.forEach(input => {
        const value = input.value;
        const label = input.nextElementSibling;
        if (label && label.tagName === 'LABEL') {
          const translationPath = `options.${optionsKey}.${value}`;
          const translation = this.getTranslation(translationPath);
          if (translation) {
            // Store original text on first translation if not already stored
            if (!label.dataset.originalText) {
              // Find the text content, excluding images
              const textContent = Array.from(label.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .filter(text => text.length > 0)
                .join(' ');

              if (textContent) {
                label.dataset.originalText = textContent;
              } else {
                // Fallback: use the full text content minus any image alt text
                label.dataset.originalText = label.textContent.trim();
              }
            }

            // Find and update text nodes, preserving images
            const walker = document.createTreeWalker(
              label,
              NodeFilter.SHOW_TEXT,
              null,
              false
            );

            let textNode;
            const textNodes = [];
            while (textNode = walker.nextNode()) {
              if (textNode.textContent.trim()) {
                textNodes.push(textNode);
              }
            }

            // Simple and reliable approach: replace all text nodes with the translation
            // First, remove all existing text nodes
            const nodesToRemove = [];
            for (let node of label.childNodes) {
              if (node.nodeType === Node.TEXT_NODE) {
                nodesToRemove.push(node);
              }
            }
            nodesToRemove.forEach(node => node.remove());

            // Add the translated text at the end
            textNode = document.createTextNode(translation);
            label.appendChild(textNode);
          }
        }
      });
    });
  }

  getTranslation(key) {
    // Special handling: neopreneColor uses the same translations as seatOptions
    if (key.startsWith('options.neopreneColor.')) {
      const seatOptionsKey = key.replace('options.neopreneColor.', 'options.seatOptions.');
      return this.getTranslation(seatOptionsKey);
    }

    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        return null;
      }
    }

    return translation;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.i18nManager = new I18nManager();
});