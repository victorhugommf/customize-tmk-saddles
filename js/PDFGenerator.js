class PDFGenerator {
  constructor(doc, $form) {
    this.doc = doc;
    this.$form = $form;
    this.yPosition = 20;
    this.pageHeight = 280;
    this.leftMargin = 20;
    this.rightMargin = 190;
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

    const customerName = this.getFieldValue('customerName') || 'Customer';
    const timestamp = new Date().toISOString().slice(0, 10);
    this.doc.save(`Tomahawk_Saddle_Order_${customerName.replace(/\s+/g, '_')}_${timestamp}.pdf`);
  }

  addHeader() {
    this.doc.setFontSize(20);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('TOMAHAWK BARREL SADDLE', 105, this.yPosition, { align: 'center' });

    this.yPosition += 10;
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'normal');
    this.doc.text('Custom Saddle Order Form', 105, this.yPosition, { align: 'center' });

    this.yPosition += 10;
    this.doc.setFontSize(10);
    const now = new Date();
    this.doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 105, this.yPosition, { align: 'center' });

    this.yPosition += 20;
    this.addSectionDivider();
  }

  addCustomerInfo() {
    this.addSectionTitle('CUSTOMER INFORMATION');

    const customerData = [
      ['Customer Name:', this.getFieldValue('customerName')],
      ['Phone Number:', this.getFieldValue('phone')],
      ['Email:', this.getFieldValue('email')],
      ['Shipping Address:', this.getFieldValue('address')],
    ];

    this.addDataTable(customerData);
    this.addSectionDivider();
  }

  addSaddleSpecs() {
    this.addSectionTitle('SADDLE SPECIFICATIONS');

    const gulletSize = this.getFieldValue('gulletSize');
    const gulletOther = this.getFieldValue('gulletOther');

    const specsData = [
      ['Seat Size:', this.getFieldValue('seatSize') + '"'],
      ['Tree Type:', this.getFieldValue('treeType')],
      ['Gullet Size:', gulletSize === 'other' ? `${gulletSize} - ${gulletOther}` : gulletSize],
      ['Saddle Build:', this.getCheckedValue('saddleBuild')],
    ];

    this.addDataTable(specsData);
    this.addSectionDivider();
  }

  addDesignCustomization() {
    this.addSectionTitle('DESIGN & CUSTOMIZATION');

    const designData = [
      ['Style:', this.getCheckedValue('style')],
      ['Skirt Style:', this.getCheckedValue('skirtStyle')],
      ['Cantle Style:', this.getCheckedValue('cantleStyle')],
      ['Fender Style:', this.getCheckedValue('fenderStyle')],
      ['Jockey Seat:', this.getCheckedValue('jockeySeat')],
      ['Seat Style:', this.getCheckedValue('seatStyle')],
      ['Seat Options:', this.getCheckedValues('accentOptions').join(', ')],
    ];

    this.addDataTable(designData.filter(item => item[1]));
    this.addSectionDivider();
  }

  addToolingOptions() {
    const toolingOption = this.getFieldValue('tooledCoverage');
    if (!toolingOption) return;

    this.addSectionTitle('TOOLING & PATTERN OPTIONS');

    // Grupo 1 – Cobertura
    const coverageData = [
      ['Tooled Coverage:', toolingOption]
    ];
    this.addDataTable(coverageData);

    // Grupo 2 – Plain Parts
    this.addSectionTitle('Plain Parts');
    const plainPartsData = [
      ['Leather Color - Roughout:', this.getFieldValue('leatherColorRoughout')],
      ['Leather Color - Smooth:', this.getFieldValue('leatherColorSmooth')]
    ];
    this.addDataTable(plainPartsData.filter(item => item[1]));

    // Grupo 3 – Tooled Parts
    this.addSectionTitle('Tooled Parts');
    const tooledPartsData = [
      ['Leather Color - Tooled:', this.getFieldValue('leatherColorTooled')]
    ];
    this.addDataTable(tooledPartsData.filter(item => item[1]));

    // Grupo 4 – General Tooling
    this.addSectionTitle('General Tooling');
    const generalToolingData = [
      ['Tooling Pattern Floral:', this.getFieldValue('toolingPatternFloral')],
      ['Tooling Pattern Geometric:', this.getFieldValue('toolingPatternGeometric')]
    ];
    this.addDataTable(generalToolingData.filter(item => item[1]));

    // Grupo 5 – Border Tooling
    this.addSectionTitle('Border Tooling');
    const borderToolingData = [
      ['Tooling Pattern Border:', this.getFieldValue('toolingPatternBorder')]
    ];
    this.addDataTable(borderToolingData.filter(item => item[1]));

    this.addSectionDivider();
  }

  addLiningRigging() {
    this.addSectionTitle('LINING & RIGGING');

    const liningData = [
      ['Lining Type:', this.getCheckedValue('liningType')],
      ['Rigging Style:', this.getCheckedValue('riggingStyle')],
    ];

    this.addDataTable(liningData.filter(item => item[1]));
    this.addSectionDivider();
  }

  addAccessories() {
    this.addSectionTitle('ACCESSORIES & OPTIONS');

    const accessoriesData = [
      ['Additional Saddle Features:', this.getCheckedValues('accessoriesGroup').join(', ')],
      ['Buck Stitching Style:', this.getFieldValue('buckstitching')],
      ['Buck Stitch Color:', this.getFieldValue('buckStitchColor')],
      ['Back Cinch:', this.getFieldValue('backCinch')],
      ['Stirrups:', this.getFieldValue('stirrups')],
      ['Back of Skirt:', this.getCheckedValue('backSkirt')],
      ['Conchos:', this.getFieldValue('conchos')],
    ];

    this.addDataTable(accessoriesData.filter(item => item[1]));

    const specialNotes = this.getFieldValue('specialNotes');
    if (specialNotes) {
      this.checkPageBreak(20);
      this.doc.setFont(undefined, 'bold');
      this.doc.text('Special Notes:', this.leftMargin, this.yPosition);
      this.yPosition += 7;
      this.doc.setFont(undefined, 'normal');
      const splitNotes = this.doc.splitTextToSize(specialNotes, this.rightMargin - this.leftMargin);
      this.doc.text(splitNotes, this.leftMargin, this.yPosition);
      this.yPosition += splitNotes.length * 5;
    }

    this.addSectionDivider();
  }

  addPaymentShipping() {
    this.addSectionTitle('PAYMENT & SHIPPING');

    const paymentData = [
      ['Calculated Price:', '$' + (this.getFieldValue('price') || '0.00')],
      ['Deposit:', '$' + (this.getFieldValue('deposit') || '0.00')],
      ['Balance Due:', '$' + (this.getFieldValue('balanceDue') || '0.00')],
      ['Shipping Method:', this.getCheckedValue('shippingMethod')],
      ['Payment Method:', this.getCheckedValue('paymentMethod')],
      ['Other Payment:', this.getFieldValue('otherPaymentMethod')],
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
    this.doc.text('This document was generated automatically from the Tomahawk Barrel Saddle order form.', 105, 285, { align: 'center' });
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

  getCheckedValue(fieldName) {
    const $field = this.$form.find(`[name="${fieldName}"]:checked`);
    if ($field.length) {
      const allFields = this.$form.find(`[name="${fieldName}"]`);
      const checkedIndex = allFields.index($field) + 1; // Start from 1
      const formattedIndex = checkedIndex.toString().padStart(2, '0'); // Format as 01, 02, etc.
      return `${formattedIndex} - ${$field.val()}`;
    }
    return '';
  }

  getCheckedValues(fieldName) {
    const values = [];
    this.$form.find(`[name="${fieldName}"]:checked`).each(function () {
      values.push($(this).val());
    });
    return values;
  }
}