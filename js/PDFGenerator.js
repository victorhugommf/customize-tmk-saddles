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
    this.imageCache = new Map(); // Cache para imagens convertidas
    this.highQualityMode = true; // Flag para modo de alta qualidade
  }

  setLanguage(language) {
    this.language = language;
    this.translationManager.setLanguage(language);
  }



  // Método para obter a imagem selecionada de um campo radio
  async getSelectedImage(fieldName) {
    const $checkedField = this.$form.find(`[name="${fieldName}"]:checked`);
    if ($checkedField.length) {
      // Procurar a imagem no label associado ao radio button
      const $label = $checkedField.siblings('label').add($checkedField.next('label'));
      let $img = $label.find('img.option-image');

      // Se não encontrou, procurar no elemento pai (para estruturas diferentes)
      if (!$img.length) {
        $img = $checkedField.closest('.checkbox-item').find('img.option-image');
      }

      if ($img.length) {
        const imgSrc = $img.attr('src');

        // Verificar cache primeiro
        if (this.imageCache.has(imgSrc)) {
          return this.imageCache.get(imgSrc);
        }

        // Converter imagem para base64 com fundo branco e obter dimensões
        const imageData = await this.imageToBase64WithDimensions($img[0]);
        if (imageData) {
          this.imageCache.set(imgSrc, imageData);
          return imageData;
        }
      }
    }
  }

  // Método para obter múltiplas imagens selecionadas de campos checkbox
  async getMultipleSelectedImages(fieldName) {
    const $checkedFields = this.$form.find(`[name="${fieldName}"]:checked`);
    if ($checkedFields.length) {
      const images = [];

      for (let i = 0; i < $checkedFields.length; i++) {
        const $checkedField = $($checkedFields[i]);

        // Procurar a imagem no label associado ao checkbox
        const $label = $checkedField.siblings('label').add($checkedField.next('label'));
        let $img = $label.find('img.option-image');

        // Se não encontrou, procurar no elemento pai (para estruturas diferentes)
        if (!$img.length) {
          $img = $checkedField.closest('.checkbox-item').find('img.option-image');
        }

        if ($img.length) {
          const imgSrc = $img.attr('src');

          // Verificar cache primeiro
          let imageData;
          if (this.imageCache.has(imgSrc)) {
            imageData = this.imageCache.get(imgSrc);
          } else {
            // Converter imagem para base64 com fundo branco e obter dimensões
            imageData = await this.imageToBase64WithDimensions($img[0]);
            if (imageData) {
              this.imageCache.set(imgSrc, imageData);
            }
          }

          if (imageData) {
            images.push(imageData);
          }
        }
      }

      return images.length > 0 ? images : null;
    }
    return null;
    return null;
  }

  // Método para converter imagem para base64 com fundo branco e retornar dimensões
  async imageToBase64WithDimensions(imgElement) {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Criar uma nova imagem para garantir que está carregada
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = function () {
          // Usar as dimensões originais da imagem
          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;

          canvas.width = originalWidth;
          canvas.height = originalHeight;

          // Preencher com fundo branco para evitar transparência preta
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Configurar contexto para melhor qualidade
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Desenhar a imagem sobre o fundo branco
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          try {
            // Usar JPEG com alta qualidade para evitar problemas de transparência
            const dataURL = canvas.toDataURL('image/jpeg', 0.92);
            resolve({
              base64: dataURL,
              width: originalWidth,
              height: originalHeight
            });
          } catch (error) {
            console.warn('Erro ao converter imagem para base64:', error);
            resolve(null);
          }
        };

        img.onerror = function () {
          console.warn('Erro ao carregar imagem:', imgElement.src);
          resolve(null);
        };

        img.src = imgElement.src;
      } catch (error) {
        console.warn('Erro no processamento da imagem:', error);
        resolve(null);
      }
    });
  }

  // Método para calcular dimensões mantendo proporção
  calculateImageDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    const aspectRatio = originalWidth / originalHeight;

    let newWidth = maxWidth;
    let newHeight = maxWidth / aspectRatio;

    // Se a altura calculada exceder o máximo, ajustar pela altura
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = maxHeight * aspectRatio;
    }

    return {
      width: newWidth,
      height: newHeight
    };
  }



  getTranslation(key) {
    return this.translationManager.getTranslation(key);
  }

  getOptionTranslation(fieldName, optionValue) {
    return this.translationManager.getOptionTranslation(fieldName, optionValue);
  }

  async generate() {
    this.addHeader();
    this.addCustomerInfo();
    await this.addSaddleSpecs();
    await this.addDesignCustomization();
    await this.addToolingOptions();
    await this.addLiningRigging();
    await this.addAccessories();
    this.addPaymentShipping();
    this.addFooter();

    const pdfBlob = this.doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

    const fileName = this.generateFileName(this.language);
    this.doc.save(fileName);
  }

  async generateSingleLanguage(language) {
    try {
      // Show user feedback
      const message = language === 'en'
        ? 'Generating PDF in English...'
        : 'Gerando PDF em Português...';
      this.showGenerationFeedback(message, 'info');

      // Ensure translations are loaded
      await this.translationManager.loadTranslations();

      // Generate PDF in specified language
      this.setLanguage(language);
      this.resetPosition();
      this.addHeader();
      this.addCustomerInfo();
      await this.addSaddleSpecs();
      await this.addDesignCustomization();
      await this.addToolingOptions();
      await this.addLiningRigging();
      await this.addAccessories();
      this.addPaymentShipping();
      this.addFooter();

      const blob = this.doc.output('blob');
      const url = URL.createObjectURL(blob);
      const fileName = this.generateFileName(language);

      // Open PDF in new tab
      window.open(url, '_blank');

      // Download PDF
      this.doc.save(fileName);

      // Show success message
      const successMessage = language === 'en'
        ? 'PDF generated successfully!'
        : 'PDF gerado com sucesso!';
      this.showGenerationFeedback(successMessage, 'success');

    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = language === 'en'
        ? 'Error generating PDF. Please try again.'
        : 'Erro ao gerar PDF. Tente novamente.';
      this.showGenerationFeedback(errorMessage, 'error');
    }
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
      await this.addSaddleSpecs();
      await this.addDesignCustomization();
      await this.addToolingOptions();
      await this.addLiningRigging();
      await this.addAccessories();
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
          await portuguesePDF.addSaddleSpecs();
          await portuguesePDF.addDesignCustomization();
          await portuguesePDF.addToolingOptions();
          await portuguesePDF.addLiningRigging();
          await portuguesePDF.addAccessories();
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
        this.hideGenerationFeedback();
      }, 5000);
    }
  }

  hideGenerationFeedback() {
    const feedbackElement = document.getElementById('pdf-generation-feedback');
    if (feedbackElement && feedbackElement.parentNode) {
      feedbackElement.parentNode.removeChild(feedbackElement);
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

  async addSaddleSpecs() {
    this.addSectionTitle(this.getTranslation('saddleSpecs'));

    const gulletSize = this.getFieldValue('gulletSize');
    const gulletOther = this.getFieldValue('gulletOther');
    const treeType = this.getCheckedRadioValue('treeType');

    // Obter imagens selecionadas
    const treeTypeImage = await this.getSelectedImage('treeType');
    const saddleBuildImage = await this.getSelectedImage('saddleBuild');

    const specsData = [
      [this.getTranslation('seatSize'), this.getFieldValue('seatSize') + '"'],
      [this.getTranslation('treeType'), this.getOptionTranslation('treeType', treeType), treeTypeImage],
      [this.getTranslation('gulletSize'), gulletSize === 'other' ? `${this.getOptionTranslation('gulletSize', gulletSize)} - ${gulletOther}` : gulletSize],
      [this.getTranslation('saddleBuild'), this.getNumberedRadioValue('saddleBuild'), saddleBuildImage],
    ];

    this.addDataTable(specsData);
    this.addSectionDivider();
  }

  async addDesignCustomization() {
    this.addSectionTitle(this.getTranslation('designCustomization'));

    // Obter imagens selecionadas
    const styleImage = await this.getSelectedImage('style');
    const skirtStyleImage = await this.getSelectedImage('skirtStyle');
    const cantleStyleImage = await this.getSelectedImage('cantleStyle');
    const fenderStyleImage = await this.getSelectedImage('fenderStyle');
    const jockeySeatImage = await this.getSelectedImage('jockeySeat');
    const seatStyleImage = await this.getSelectedImage('seatStyle');
    const seatOptionsImage = await this.getSelectedImage('seatOptions');

    const designData = [
      [this.getTranslation('style'), this.getNumberedRadioValue('style'), styleImage],
      [this.getTranslation('skirtStyle'), this.getNumberedRadioValue('skirtStyle'), skirtStyleImage],
      [this.getTranslation('cantleStyle'), this.getNumberedRadioValue('cantleStyle'), cantleStyleImage],
      [this.getTranslation('fenderStyle'), this.getNumberedRadioValue('fenderStyle'), fenderStyleImage],
      [this.getTranslation('jockeySeat'), this.getNumberedRadioValue('jockeySeat'), jockeySeatImage],
      [this.getTranslation('seatStyle'), this.getNumberedRadioValue('seatStyle'), seatStyleImage],
      [this.getTranslation('seatOptions'), this.getNumberedRadioValue('seatOptions'), seatOptionsImage],
    ];

    this.addDataTable(designData.filter(item => item[1]));
    this.addSectionDivider();
  }

  async addToolingOptions() {
    // Verificar se o Saddle Build selecionado é "Hybrid"
    const saddleBuild = this.getCheckedRadioValue('saddleBuild');
    if (saddleBuild === 'Hybrid') {
      // Se for Hybrid, não mostrar as opções de tooling
      return;
    }

    const toolingOption = this.getCheckedRadioValue('tooledCoverage');
    if (!toolingOption) return;

    this.addSectionTitle(this.getTranslation('toolingOptions'));

    // Grupo 1 – Cobertura
    const tooledCoverageImage = await this.getSelectedImage('tooledCoverage');
    const coverageData = [
      [this.getTranslation('tooledCoverage'), this.getOptionTranslation('tooledCoverage', toolingOption), tooledCoverageImage]
    ];
    this.addDataTable(coverageData);

    // Grupo 2 – Plain Parts
    this.addSectionTitle(this.getTranslation('plainParts'));
    const leatherColorImage = await this.getSelectedImage('leatherColor');
    const plainPartsData = [
      [this.getTranslation('leatherColorLabel'), this.getNumberedRadioValue('leatherColor'), leatherColorImage]
    ];
    this.addDataTable(plainPartsData.filter(item => item[1]));

    // Grupo 3 – Tooled Parts
    this.addSectionTitle(this.getTranslation('tooledParts'));
    const leatherColorTooledImage = await this.getSelectedImage('leatherColorTooled');
    const tooledPartsData = [
      [this.getTranslation('leatherColorTooled'), this.getNumberedRadioValue('leatherColorTooled'), leatherColorTooledImage]
    ];
    this.addDataTable(tooledPartsData.filter(item => item[1]));

    // Grupo 4 – General Tooling
    this.addSectionTitle(this.getTranslation('generalTooling'));
    const toolingPatternImage = await this.getSelectedImage('toolingPattern');
    const generalToolingData = [
      [this.getTranslation('toolingPattern'), this.getNumberedRadioValue('toolingPattern'), toolingPatternImage]
    ];
    this.addDataTable(generalToolingData.filter(item => item[1]));

    // Grupo 5 – Border Tooling
    this.addSectionTitle(this.getTranslation('borderTooling'));
    const toolingPatternBorderImage = await this.getSelectedImage('toolingPatternBorder');
    const borderToolingData = [
      [this.getTranslation('toolingPatternBorder'), this.getNumberedRadioValue('toolingPatternBorder'), toolingPatternBorderImage]
    ];
    this.addDataTable(borderToolingData.filter(item => item[1]));

    this.addSectionDivider();
  }

  async addLiningRigging() {
    this.addSectionTitle(this.getTranslation('liningRigging'));

    // Obter imagens selecionadas
    const liningTypeImage = await this.getSelectedImage('liningType');
    const riggingStyleImage = await this.getSelectedImage('riggingStyle');

    const liningData = [
      [this.getTranslation('liningType'), this.getNumberedRadioValue('liningType'), liningTypeImage],
      [this.getTranslation('riggingStyle'), this.getNumberedRadioValue('riggingStyle'), riggingStyleImage],
    ];

    this.addDataTable(liningData.filter(item => item[1]));
    this.addSectionDivider();
  }

  async addAccessories() {
    this.addSectionTitle(this.getTranslation('accessoriesOptions'));

    // Obter imagens selecionadas
    const accessoriesGroupImage = await this.getMultipleSelectedImages('accessoriesGroup');
    const buckstitchingImage = await this.getSelectedImage('buckstitching');
    const backCinchImage = await this.getSelectedImage('backCinch');
    const stirrupsImage = await this.getSelectedImage('stirrups');
    const backSkirtImage = await this.getSelectedImage('backSkirt');
    const conchosImage = await this.getSelectedImage('conchos');

    const accessoriesData = [
      [this.getTranslation('additionalFeatures'), this.getMultipleCheckedValues('accessoriesGroup'), accessoriesGroupImage],
      [this.getTranslation('buckStitchingStyle'), this.getNumberedRadioValue('buckstitching'), buckstitchingImage],
      [this.getTranslation('buckStitchColor'), this.getFieldValue('buckStitchColor')],
      [this.getTranslation('backCinch'), this.getNumberedRadioValue('backCinch'), backCinchImage],
      [this.getTranslation('stirrups'), this.getNumberedRadioValue('stirrups'), stirrupsImage],
      [this.getTranslation('backOfSkirt'), this.getNumberedRadioValue('backSkirt'), backSkirtImage],
      [this.getTranslation('conchos'), this.getCheckedValue('conchos'), conchosImage],
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
    // Não incluir seção PAYMENT & SHIPPING para PDFs em português
    if (this.language === 'pt') {
      return;
    }

    this.addSectionTitle(this.getTranslation('paymentShipping'));

    const paymentData = [
      [this.getTranslation('calculatedPrice'), '$' + (this.getFieldValue('price') || '0.00')],
      [this.getTranslation('deposit'), '$' + (this.getFieldValue('deposit') || '0.00')],
      [this.getTranslation('balanceDue'), '$' + (this.getFieldValue('balanceDue') || '0.00')],
      [this.getTranslation('shippingMethod'), this.getNumberedRadioValue('shippingMethod')],
      [this.getTranslation('paymentMethod'), this.getNumberedRadioValue('paymentMethod')],
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
    data.forEach(([label, value, imageData]) => {
      if (value) {
        const hasImage = imageData && imageData !== null;
        // Calcular espaço necessário baseado no número de imagens
        let requiredSpace = 7; // Espaço base
        if (hasImage) {
          if (Array.isArray(imageData)) {
            // Múltiplas imagens: 45px por imagem + 5px de espaçamento
            requiredSpace = (imageData.length * 45) + ((imageData.length - 1) * 5) + 8;
          } else {
            // Imagem única
            requiredSpace = 45;
          }
        }

        this.checkPageBreak(requiredSpace);

        this.doc.setFont(undefined, 'bold');
        this.doc.text(label, this.leftMargin, this.yPosition);
        this.doc.setFont(undefined, 'normal');

        const splitValue = this.doc.splitTextToSize(value, this.rightMargin - this.leftMargin - 60);
        this.doc.text(splitValue, this.leftMargin + 60, this.yPosition);

        let textHeight = Math.max(7, splitValue.length * 5);

        // Adicionar imagem(ns) se disponível(is)
        if (hasImage) {
          try {
            const maxWidth = 50;  // 2x o tamanho anterior (25 -> 50)
            const maxHeight = 36; // 2x o tamanho anterior (18 -> 36)

            // Verificar se é um array de imagens (múltiplas seleções)
            if (Array.isArray(imageData)) {
              let currentImageY = this.yPosition - 10;
              let totalImageHeight = 0;

              imageData.forEach((singleImageData, index) => {
                let imageWidth = maxWidth;
                let imageHeight = maxHeight;
                let base64Data = singleImageData;

                // Se singleImageData é um objeto com dimensões, calcular proporções corretas
                if (typeof singleImageData === 'object' && singleImageData.base64) {
                  base64Data = singleImageData.base64;
                  const dimensions = this.calculateImageDimensions(
                    singleImageData.width,
                    singleImageData.height,
                    maxWidth,
                    maxHeight
                  );
                  imageWidth = dimensions.width;
                  imageHeight = dimensions.height;
                }

                const imageX = this.rightMargin - maxWidth - 2;

                // Detectar formato da imagem
                const format = base64Data.startsWith('data:image/png') ? 'PNG' : 'JPEG';

                // Adicionar imagem com proporções corretas
                this.doc.addImage(base64Data, format, imageX, currentImageY, imageWidth, imageHeight);

                currentImageY += imageHeight + 5; // Espaço entre imagens
                totalImageHeight += imageHeight + 5;
              });

              textHeight = Math.max(textHeight, totalImageHeight + 8);
            } else {
              // Imagem única (comportamento original)
              let imageWidth = maxWidth;
              let imageHeight = maxHeight;
              let base64Data = imageData;

              // Se imageData é um objeto com dimensões, calcular proporções corretas
              if (typeof imageData === 'object' && imageData.base64) {
                base64Data = imageData.base64;
                const dimensions = this.calculateImageDimensions(
                  imageData.width,
                  imageData.height,
                  maxWidth,
                  maxHeight
                );
                imageWidth = dimensions.width;
                imageHeight = dimensions.height;
              }

              const imageX = this.rightMargin - maxWidth - 2;
              const imageY = this.yPosition - 10; // Ajustar posição Y para imagem maior

              // Detectar formato da imagem
              const format = base64Data.startsWith('data:image/png') ? 'PNG' : 'JPEG';

              // Adicionar imagem com proporções corretas
              this.doc.addImage(base64Data, format, imageX, imageY, imageWidth, imageHeight);
              textHeight = Math.max(textHeight, maxHeight + 8); // Mais espaço para imagem maior
            }
          } catch (error) {
            console.warn('Erro ao adicionar imagem ao PDF:', error);
          }
        }

        this.yPosition += textHeight;
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

  getCheckedRadioValue(fieldName) {
    const $field = this.$form.find(`[name="${fieldName}"]:checked`);
    return $field.length ? $field.val() : '';
  }

  getTranslatedFieldValue(fieldName) {
    const value = this.getFieldValue(fieldName);
    if (!value) return '';
    return this.getOptionTranslation(fieldName, value);
  }

  getTranslatedRadioValue(fieldName) {
    const value = this.getCheckedRadioValue(fieldName);
    if (!value) return '';
    return this.getOptionTranslation(fieldName, value);
  }

  getNumberedRadioValue(fieldName) {
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

  getMultipleCheckedValues(fieldName) {
    const $checkedFields = this.$form.find(`[name="${fieldName}"]:checked`);
    if ($checkedFields.length) {
      const allFields = this.$form.find(`[name="${fieldName}"]`);
      const values = [];

      $checkedFields.each((index, field) => {
        const $field = $(field);
        const checkedIndex = allFields.index($field) + 1; // Start from 1
        const formattedIndex = checkedIndex.toString().padStart(2, '0'); // Format as 01, 02, etc.
        let originalValue = $field.val();

        // Verificar se é Saddle String e adicionar a quantidade
        if (originalValue === 'Saddle String 4 or 6') {
          const saddleStringQuantity = this.$form.find('#saddleStringQuantity').val();
          if (saddleStringQuantity) {
            originalValue = `Saddle String ${saddleStringQuantity}`;
          }
        }

        const translatedValue = this.getOptionTranslation(fieldName, originalValue);
        values.push(`${formattedIndex} - ${translatedValue}`);
      });

      return values.join(', ');
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