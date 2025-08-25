class PDFGenerator {
  constructor(doc, $form, language = 'en') {
    this.doc = doc;
    this.$form = $form;
    this.language = language;
    this.yPosition = 20;
    this.pageHeight = 280;
    this.leftMargin = 20;
    this.rightMargin = 190;
    this.translationManager = TranslationManager.getInstance();
  }

  setLanguage(language) {
    this.language = language;
    this.translationManager.setLanguage(language);
  }

  getTranslation(key) {
    return this.translationManager.getTranslation(key);
  }

  getOptionTranslation(fieldName, optionValue) {
    return this.translationManager.getOptionTranslation(fieldName, optionValue);
  }

  generate() {
    this.addHeader();
    this.addCustomerInfo();
    this.addSaddleSpecs();
    this.addDesignCustomization();
    this.addToolingOptions();
    this.addLiningRigging();
    this.addAccessories();
    this.addPaymentShipping();
    this.addFooter();

    const pdfBlob = this.doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

    const fileName = this.generateFileName(this.language);
    this.doc.save(fileName);
  }

  async generateDualLanguage() {
    try {
      // Show user feedback
      this.showGenerationFeedback('Generating PDFs in both languages...');

      // Ensure translations are loaded
      await this.translationManager.loadTranslations();

      // Generate English PDF
      this.setLanguage('en');
      this.resetPosition();
      this.addHeader();
      this.addCustomerInfo();
      this.addSaddleSpecs();
      this.addDesignCustomization();
      this.addToolingOptions();
      this.addLiningRigging();
      this.addAccessories();
      this.addPaymentShipping();
      this.addFooter();

      const englishBlob = this.doc.output('blob');
      const englishUrl = URL.createObjectURL(englishBlob);
      const englishFileName = this.generateFileName('en');

      // Open English PDF in new tab
      window.open(englishUrl, '_blank');

      // Download English PDF
      this.doc.save(englishFileName);

      // Create new document for Portuguese PDF with delay
      setTimeout(async () => {
        try {
          const { jsPDF } = window.jspdf;
          const portugueseDoc = new jsPDF();
          const portuguesePDF = new PDFGenerator(portugueseDoc, this.$form, 'pt');

          // Ensure translations are loaded for Portuguese PDF
          await portuguesePDF.translationManager.loadTranslations();

          // Generate Portuguese PDF
          portuguesePDF.setLanguage('pt');
          portuguesePDF.resetPosition();
          portuguesePDF.addHeader();
          portuguesePDF.addCustomerInfo();
          portuguesePDF.addSaddleSpecs();
          portuguesePDF.addDesignCustomization();
          portuguesePDF.addToolingOptions();
          portuguesePDF.addLiningRigging();
          portuguesePDF.addAccessories();
          portuguesePDF.addPaymentShipping();
          portuguesePDF.addFooter();

          const portugueseBlob = portuguesePDF.doc.output('blob');
          const portugueseUrl = URL.createObjectURL(portugueseBlob);
          const portugueseFileName = portuguesePDF.generateFileName('pt');

          // Open Portuguese PDF in new tab
          window.open(portugueseUrl, '_blank');

          // Download Portuguese PDF
          portuguesePDF.doc.save(portugueseFileName);

          // Show success feedback
          this.showGenerationFeedback('Both PDFs generated successfully!', 'success');

        } catch (error) {
          console.error('Error generating Portuguese PDF:', error);
          this.showGenerationFeedback('Error generating Portuguese PDF. Please try again.', 'error');
        }
      }, 1000); // 1 second delay between downloads

    } catch (error) {
      console.error('Error generating English PDF:', error);
      this.showGenerationFeedback('Error generating PDFs. Please try again.', 'error');
    }
  }

  generateFileName(language) {
    const customerName = this.getFieldValue('customerName') || 'Customer';
    const timestamp = new Date().toISOString().slice(0, 10);
    const languageCode = language.toUpperCase();
    return `Tomahawk_Saddle_Order_${customerName.replace(/\s+/g, '_')}_${timestamp}_${languageCode}.pdf`;
  }

  showGenerationFeedback(message, type = 'info') {
    // Create or update feedback element
    let feedbackElement = document.getElementById('pdf-generation-feedback');
    if (!feedbackElement) {
      feedbackElement = document.createElement('div');
      feedbackElement.id = 'pdf-generation-feedback';
      feedbackElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;
      document.body.appendChild(feedbackElement);
    }

    // Set background color based on type
    const colors = {
      info: '#3498db',
      success: '#27ae60',
      error: '#e74c3c'
    };
    feedbackElement.style.backgroundColor = colors[type] || colors.info;
    feedbackElement.textContent = message;

    // Auto-hide after delay (except for info messages during generation)
    if (type !== 'info') {
      setTimeout(() => {
        if (feedbackElement && feedbackElement.parentNode) {
          feedbackElement.parentNode.removeChild(feedbackElement);
        }
      }, 5000);
    }
  }

  resetPosition() {
    this.yPosition = 20;
  }

  addHeader() {
    this.doc.setFontSize(20);
    this.doc.setFont(undefined, 'bold');
    this.doc.text(this.getTranslation('title'), 105, this.yPosition, { align: 'center' });

    this.yPosition += 10;
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'normal');
    this.doc.text(this.getTranslation('subtitle'), 105, this.yPosition, { align: 'center' });

    this.yPosition += 10;
    this.doc.setFontSize(10);
    const now = new Date();
    const locale = this.language === 'pt' ? 'pt-BR' : 'en-US';
    this.doc.text(`${this.getTranslation('generated')} ${now.toLocaleDateString(locale)} ${now.toLocaleTimeString(locale)}`, 105, this.yPosition, { align: 'center' });

    this.yPosition += 20;
    this.addSectionDivider();
  }

  addCustomerInfo() {
    this.addSectionTitle(this.getTranslation('customerInfo'));

    const customerData = [
      [this.getTranslation('customerName'), this.getFieldValue('customerName')],
      [this.getTranslation('phoneNumber'), this.getFieldValue('phone')],
      [this.getTranslation('email'), this.getFieldValue('email')],
      [this.getTranslation('shippingAddress'), this.getFieldValue('address')],
    ];

    this.addDataTable(customerData);
    this.addSectionDivider();
  }

  addSaddleSpecs() {
    this.addSectionTitle(this.getTranslation('saddleSpecs'));

    const gulletSize = this.getFieldValue('gulletSize');
    const gulletOther = this.getFieldValue('gulletOther');
    const treeType = this.getFieldValue('treeType');

    const specsData = [
      [this.getTranslation('seatSize'), this.getFieldValue('seatSize') + '"'],
      [this.getTranslation('treeType'), this.getOptionTranslation('treeType', treeType)],
      [this.getTranslation('gulletSize'), gulletSize === 'other' ? `${this.getOptionTranslation('gulletSize', gulletSize)} - ${gulletOther}` : gulletSize],
      [this.getTranslation('saddleBuild'), this.getCheckedValue('saddleBuild')],
    ];

    this.addDataTable(specsData);
    this.addSectionDivider();
  }

  addDesignCustomization() {
    this.addSectionTitle(this.getTranslation('designCustomization'));

    const designData = [
      [this.getTranslation('style'), this.getCheckedValue('style')],
      [this.getTranslation('skirtStyle'), this.getCheckedValue('skirtStyle')],
      [this.getTranslation('cantleStyle'), this.getCheckedValue('cantleStyle')],
      [this.getTranslation('fenderStyle'), this.getCheckedValue('fenderStyle')],
      [this.getTranslation('jockeySeat'), this.getCheckedValue('jockeySeat')],
      [this.getTranslation('seatStyle'), this.getCheckedValue('seatStyle')],
      [this.getTranslation('seatOptions'), this.getCheckedValues('seatOptions').join(', ')],
    ];

    this.addDataTable(designData.filter(item => item[1]));
    this.addSectionDivider();
  }

  addToolingOptions() {
    const toolingOption = this.getFieldValue('tooledCoverage');
    if (!toolingOption) return;

    this.addSectionTitle(this.getTranslation('toolingOptions'));

    // Grupo 1 – Cobertura
    const coverageData = [
      [this.getTranslation('tooledCoverage'), this.getOptionTranslation('tooledCoverage', toolingOption)]
    ];
    this.addDataTable(coverageData);

    // Grupo 2 – Plain Parts
    this.addSectionTitle(this.getTranslation('plainParts'));
    const plainPartsData = [
      [this.getTranslation('leatherColorRoughout'), this.getFieldValue('leatherColorRoughout')],
      [this.getTranslation('leatherColorSmooth'), this.getFieldValue('leatherColorSmooth')]
    ];
    this.addDataTable(plainPartsData.filter(item => item[1]));

    // Grupo 3 – Tooled Parts
    this.addSectionTitle(this.getTranslation('tooledParts'));
    const tooledPartsData = [
      [this.getTranslation('leatherColorTooled'), this.getFieldValue('leatherColorTooled')]
    ];
    this.addDataTable(tooledPartsData.filter(item => item[1]));

    // Grupo 4 – General Tooling
    this.addSectionTitle(this.getTranslation('generalTooling'));
    const generalToolingData = [
      [this.getTranslation('toolingPatternFloral'), this.getFieldValue('toolingPatternFloral')],
      [this.getTranslation('toolingPatternGeometric'), this.getFieldValue('toolingPatternGeometric')]
    ];
    this.addDataTable(generalToolingData.filter(item => item[1]));

    // Grupo 5 – Border Tooling
    this.addSectionTitle(this.getTranslation('borderTooling'));
    const borderToolingData = [
      [this.getTranslation('toolingPatternBorder'), this.getFieldValue('toolingPatternBorder')]
    ];
    this.addDataTable(borderToolingData.filter(item => item[1]));

    this.addSectionDivider();
  }

  addLiningRigging() {
    this.addSectionTitle(this.getTranslation('liningRigging'));

    const liningData = [
      [this.getTranslation('liningType'), this.getCheckedValue('liningType')],
      [this.getTranslation('riggingStyle'), this.getCheckedValue('riggingStyle')],
    ];

    this.addDataTable(liningData.filter(item => item[1]));
    this.addSectionDivider();
  }

  addAccessories() {
    this.addSectionTitle(this.getTranslation('accessoriesOptions'));

    const accessoriesData = [
      [this.getTranslation('additionalFeatures'), this.getCheckedValues('accessoriesGroup').join(', ')],
      [this.getTranslation('buckStitchingStyle'), this.getTranslatedFieldValue('buckstitching')],
      [this.getTranslation('buckStitchColor'), this.getFieldValue('buckStitchColor')],
      [this.getTranslation('backCinch'), this.getTranslatedFieldValue('backCinch')],
      [this.getTranslation('stirrups'), this.getFieldValue('stirrups')],
      [this.getTranslation('backOfSkirt'), this.getCheckedValue('backSkirt')],
      [this.getTranslation('conchos'), this.getFieldValue('conchos')],
    ];

    this.addDataTable(accessoriesData.filter(item => item[1]));

    const specialNotes = this.getFieldValue('specialNotes');
    if (specialNotes) {
      this.checkPageBreak(20);
      this.doc.setFont(undefined, 'bold');
      this.doc.text(this.getTranslation('specialNotes'), this.leftMargin, this.yPosition);
      this.yPosition += 7;
      this.doc.setFont(undefined, 'normal');
      const splitNotes = this.doc.splitTextToSize(specialNotes, this.rightMargin - this.leftMargin);
      this.doc.text(splitNotes, this.leftMargin, this.yPosition);
      this.yPosition += splitNotes.length * 5;
    }

    this.addSectionDivider();
  }

  addPaymentShipping() {
    this.addSectionTitle(this.getTranslation('paymentShipping'));

    const paymentData = [
      [this.getTranslation('calculatedPrice'), '$' + (this.getFieldValue('price') || '0.00')],
      [this.getTranslation('deposit'), '$' + (this.getFieldValue('deposit') || '0.00')],
      [this.getTranslation('balanceDue'), '$' + (this.getFieldValue('balanceDue') || '0.00')],
      [this.getTranslation('shippingMethod'), this.getCheckedValue('shippingMethod')],
      [this.getTranslation('paymentMethod'), this.getCheckedValue('paymentMethod')],
      [this.getTranslation('otherPayment'), this.getFieldValue('otherPaymentMethod')],
    ];

    this.addDataTable(paymentData.filter(item => item[1] && item[1] !== '$'));

    this.checkPageBreak(10);
    this.doc.setFont(undefined, 'bold');
    this.doc.setFontSize(12);
    this.yPosition += 10;
    this.doc.setFontSize(10);

    this.addSectionDivider();
  }

  addFooter() {
    this.doc.setFontSize(8);
    this.doc.setFont(undefined, 'italic');
    this.doc.text(this.getTranslation('footerText'), 105, 285, { align: 'center' });
  }

  addSectionTitle(title) {
    this.checkPageBreak(15);
    this.doc.setFont(undefined, 'bold');
    this.doc.setFontSize(12);
    this.doc.text(title, this.leftMargin, this.yPosition);
    this.yPosition += 10;
    this.doc.setFont(undefined, 'normal');
    this.doc.setFontSize(10);
  }

  addDataTable(data) {
    data.forEach(([label, value]) => {
      if (value) {
        this.checkPageBreak(7);
        this.doc.setFont(undefined, 'bold');
        this.doc.text(label, this.leftMargin, this.yPosition);
        this.doc.setFont(undefined, 'normal');
        const splitValue = this.doc.splitTextToSize(value, this.rightMargin - this.leftMargin - 60);
        this.doc.text(splitValue, this.leftMargin + 60, this.yPosition);
        this.yPosition += Math.max(7, splitValue.length * 5);
      }
    });
  }

  addSectionDivider() {
    this.checkPageBreak(10);
    this.doc.line(this.leftMargin, this.yPosition, this.rightMargin, this.yPosition);
    this.yPosition += 10;
  }

  checkPageBreak(requiredSpace) {
    if (this.yPosition + requiredSpace > this.pageHeight) {
      this.doc.addPage();
      this.yPosition = 20;
    }
  }

  getFieldValue(fieldName) {
    const $field = this.$form.find(`[name="${fieldName}"]`);
    return $field.length ? $field.val() : '';
  }

  getTranslatedFieldValue(fieldName) {
    const value = this.getFieldValue(fieldName);
    if (!value) return '';
    return this.getOptionTranslation(fieldName, value);
  }

  getCheckedValue(fieldName) {
    const $field = this.$form.find(`[name="${fieldName}"]:checked`);
    if ($field.length) {
      const allFields = this.$form.find(`[name="${fieldName}"]`);
      const checkedIndex = allFields.index($field) + 1; // Start from 1
      const formattedIndex = checkedIndex.toString().padStart(2, '0'); // Format as 01, 02, etc.
      const originalValue = $field.val();
      const translatedValue = this.getOptionTranslation(fieldName, originalValue);
      return `${formattedIndex} - ${translatedValue}`;
    }
    return '';
  }

  getCheckedValues(fieldName) {
    const values = [];
    const self = this;
    this.$form.find(`[name="${fieldName}"]:checked`).each(function () {
      const originalValue = $(this).val();
      const translatedValue = self.getOptionTranslation(fieldName, originalValue);
      values.push(translatedValue);
    });
    return values;
  }
}