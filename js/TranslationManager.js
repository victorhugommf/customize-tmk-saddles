class TranslationManager {
  constructor() {
    this.translations = null;
    this.currentLanguage = 'en';
    this.loadTranslations();
  }

  async loadTranslations() {
    try {
      const response = await fetch('./assets/translations.json');
      this.translations = await response.json();
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to empty translations if file can't be loaded
      this.translations = { en: {}, pt: {} };
    }
  }

  setLanguage(language) {
    if (this.translations && this.translations[language]) {
      this.currentLanguage = language;
    } else {
      console.warn(`Language '${language}' not found, using default 'en'`);
      this.currentLanguage = 'en';
    }
  }

  getTranslation(key) {
    if (!this.translations) {
      console.warn('Translations not loaded yet');
      return key;
    }

    const translation = this.translations[this.currentLanguage]?.[key];
    if (translation) {
      return translation;
    }

    // Fallback to English if translation not found in current language
    const fallback = this.translations['en']?.[key];
    if (fallback) {
      console.warn(`Translation for '${key}' not found in '${this.currentLanguage}', using English fallback`);
      return fallback;
    }

    // Return the key itself if no translation found
    console.warn(`Translation for '${key}' not found in any language`);
    return key;
  }

  getOptionTranslation(fieldName, optionValue) {
    if (!this.translations) {
      console.warn('Translations not loaded yet');
      return optionValue;
    }

    const options = this.translations[this.currentLanguage]?.options?.[fieldName];
    if (options && options[optionValue]) {
      return options[optionValue];
    }

    // Fallback to English if translation not found in current language
    const fallbackOptions = this.translations['en']?.options?.[fieldName];
    if (fallbackOptions && fallbackOptions[optionValue]) {
      console.warn(`Option translation for '${fieldName}.${optionValue}' not found in '${this.currentLanguage}', using English fallback`);
      return fallbackOptions[optionValue];
    }

    // Return the original value if no translation found
    console.warn(`Option translation for '${fieldName}.${optionValue}' not found in any language`);
    return optionValue;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return this.translations ? Object.keys(this.translations) : [];
  }

  // Static method to create a singleton instance
  static getInstance() {
    if (!TranslationManager.instance) {
      TranslationManager.instance = new TranslationManager();
    }
    return TranslationManager.instance;
  }
}

// Export for use in other files
window.TranslationManager = TranslationManager;