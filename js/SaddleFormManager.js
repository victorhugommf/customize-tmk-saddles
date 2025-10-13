// Reescrita ES6 (moderno) da inicialização do SaddleFormManager
class SaddleFormManager {
    constructor() {
        this.$form = $('#saddleForm');
        this.currentBuild = null;
        this.autoSaveInterval = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.hideAllDynamicSections();
        this.hideAllRiggings();
    }

    setupEventListeners() {
        $('input[name="saddleBuild"]').on('change', e => this.handleSaddleBuildChange($(e.target).val()));
        $('input[name="style"]').on('change', e => this.handleStyleChange($(e.target).val()));
        $('input[name="seatStyle"]').on('change', e => this.handleSeatStyleChange($(e.target).val()));
        $('input[name="tooledCoverage"]').on('change', e => this.handleToolingChange(e));
        $('#gulletSize').on('change', this.handleGulletChange);
        $('input[name="seatOptions"]').on('change', this.handleAccentLimit);
        $('input[name="accessoriesGroup"]').on('change', e => this.handleAccessoriesChange(e));
        $('input[name="buckstitching"]').on('change', e => this.handleBuckstitchingChange(e));
        $('input[name="studs"]').on('change', e => this.handleStudsChange(e));
        $('input[name="saddleBuild"], input[name="seatStyle"], input[name="accessoriesGroup"]')
            .on('change', () => this.updatePrice());
        // PDF generation buttons
        $('#generatePdfEn').on('click', async () => await this.handlePdfGeneration('en'));
        $('#generatePdfPt').on('click', async () => await this.handlePdfGeneration('pt'));
        this.$form.find('input, select, textarea').on('change', () => {
            this.updateProgress();
        });

    }

    hideAllDynamicSections() {
        const sectionsToHide = [
            '#hybridStyleGroup',
            '#gulletOtherGroup',
            '#toolingPatternOptions',
            '#neopreneTypeGroup',
            '#neopreneColorGroup'
        ];
        sectionsToHide.forEach(sectionId => $(sectionId).addClass('hidden'));

        // Esconder seções de cores inicialmente
        this.hideBuckstitchingColorSection();
        this.hideStudsColorSection();
    }

    hideSaddleBuildDynamicItems() {
        const sectionsToHide = [
            '#toolingPatternOptions',
            '#tooledCoverage',
            '#leatherColor',
            '#hybridStyleGroup',
            '#neopreneTypeGroup',
            '#neopreneColorGroup'
        ];
        sectionsToHide.forEach(sectionId => {
            $(sectionId).hide();
            $(sectionId).find('input[type="radio"]').prop('checked', false);
            $(sectionId).find('select').val('');
        });
    }

    handleSaddleBuildChange(saddleBuild) {
        this.currentBuild = saddleBuild;
        this.showSectionsForBuild(saddleBuild);
        this.handleRiggingOptions(saddleBuild);
    }

    handleStyleChange(style) {
        this.riggingStyleChange(style);
    }


    showSectionsForBuild(buildType) {
        this.hideSaddleBuildDynamicItems();
        switch (buildType) {
            case 'Full Leather': this.showFullLeatherSections(); break;
            case 'Hybrid': this.showHybridSections(); break;
            case 'Full Neoprene': this.showFullNeopreneSections(); break;
        }
    }

    showFullLeatherSections() {
        // Mostrar e reativar a seção de Tooling para Full Leather        
        const sectionsToShow = [
            '#toolingPatternOptions',
            '#tooledCoverage',
            '#leatherColor',
        ];
        sectionsToShow.forEach(sectionId => {
            $(sectionId).show();
        });

        // Desativar riggings de neoprene
        const riggingNeoprene = ['#doubleRoundRigging', '#dropDoubleSquare', '#dropDownNeoprene'];
        riggingNeoprene.forEach(id => {
            $(id).css('opacity', '0.5');
            $(id).prop('disabled', true).prop('checked', false);
        });

        console.log('Seção de Tooling ativada para Full Leather');
    }

    showHybridSections() {
        // Mostrar seções específicas do Hybrid   
        const sectionsToShow = [
            '#hybridStyleGroup',
            '#toolingPatternOptions',
            '#neopreneColorGroup'
        ];
        sectionsToShow.forEach(sectionId => {
            $(sectionId).show();
        });

        console.log('Seção de Tooling ativada para Hybrid');
    }

    showFullNeopreneSections() {
        // Mostrar seções de Neoprene Type e Neoprene Color para Full Neoprene
        const sectionsToShow = [
            '#neopreneTypeGroup',
            '#neopreneColorGroup'
        ];
        sectionsToShow.forEach(sectionId => {
            $(sectionId).show();
        });

        console.log('Seções de Neoprene Type e Neoprene Color ativadas para Full Neoprene');
    }

    handleSeatStyleChange(seatStyle) {
        const $seatOptionsGroup = $('#seatOptionsGroup');

        if (!$seatOptionsGroup.length) return;

        if (seatStyle === 'Hard') {
            $seatOptionsGroup.css('opacity', '0.5');
            $seatOptionsGroup.find('input[name="seatOptions"]').prop('disabled', true).prop('checked', false);
        } else {
            $seatOptionsGroup.css('opacity', '1');
            $seatOptionsGroup.find('input[name="seatOptions"]').prop('disabled', false);
        }
    }

    //Rigging Options
    showRiggings(riggingIds) {
        riggingIds.forEach(id => {
            $(id).closest('.checkbox-item').css('opacity', '1');
            $(id).prop('disabled', false);
        });
    }

    hideAllRiggings() {
        const riggingCheckItems = $('#riggingStyleGroup .checkbox-item');
        riggingCheckItems.each(function () {
            $(this).css('opacity', '0.5');
            $(this).find('input').prop('disabled', true).prop('checked', false);
        });
    }

    handleRiggingOptions(saddleBuild) {
        const riggingLeather = ['#riggingDouble', '#InskirtPlate', '#dropDown'];
        const riggingNeoprene = ['#dropDoubleSquare', '#dropDownNeoprene', '#doubleRoundRigging'];
        this.hideAllRiggings();

        if (saddleBuild === 'Full Leather') {
            this.showRiggings(riggingLeather);
        }

        if (saddleBuild === 'Full Neoprene') {
            this.showRiggings(riggingNeoprene);
        }
    }


    riggingStyleChange(style) {
        const riggingLeather = ['#riggingDouble', '#InskirtPlate', '#dropDown'];
        const riggingNeoprene = ['#dropDoubleSquare', '#dropDownNeoprene', '#doubleRoundRigging'];

        this.hideAllRiggings();

        if (['01', '02', '03'].includes(style)) {
            this.showRiggings(riggingLeather);
        } else if (['04', '05', '06'].includes(style)) {
            this.showRiggings(riggingNeoprene);
        } else {
            this.hideAllRiggings();
        }
    }


    handleGulletChange(e) {
        const $gulletOther = $('#gulletOtherGroup');
        if ($(e.target).val() === 'other') {
            $gulletOther.show().prop('required', true);
        } else {
            $gulletOther.hide().prop('required', false).val('');
        }
    }

    handleToolingChange(e) {
        const $tooledPartsGroup = $('#tooledPartsGroup');
        if ($(e.target).val() === 'plain') {
            $tooledPartsGroup.hide().prop('required', false).val('');
        } else {
            $tooledPartsGroup.show().prop('required', true);
        }
    }

    handleAccentLimit() {
        const $accentInputs = $('input[name="seatOptions"]');
        const $checkedInputs = $accentInputs.filter(':checked');

        if ($checkedInputs.length >= 3) {
            $accentInputs.not(':checked').each(function () {
                $(this).prop('disabled', true);
                $(this).closest('.checkbox-item').addClass('disabled').css('opacity', '0.5');
            });
        } else {
            $accentInputs.each(function () {
                if (!$(this).data('originally-disabled')) {
                    $(this).prop('disabled', false);
                    $(this).closest('.checkbox-item').removeClass('disabled');
                }
            });
        }
    }

    handleAccessoriesChange(e) {
        const $saddleStringQuantityGroup = $('#saddleStringQuantityGroup');
        const $saddleStringsCheckbox = $('#saddleStrings');

        if ($saddleStringsCheckbox.is(':checked')) {
            $saddleStringQuantityGroup.show();
            $('#saddleStringQuantity').prop('required', true);
        } else {
            $saddleStringQuantityGroup.hide();
            $('#saddleStringQuantity').prop('required', false).val('');
        }
    }

    handleBuckstitchingChange(e) {
        const $buckstitchingColorSection = this.getBuckstitchingColorSection();
        const isAnyBuckstitchingSelected = $('input[name="buckstitching"]:checked').length > 0;

        if (isAnyBuckstitchingSelected) {
            this.showBuckstitchingColorSection();
        } else {
            this.hideBuckstitchingColorSection();
        }
    }

    handleStudsChange(e) {
        const $studsColorSection = this.getStudsColorSection();
        const isAnyStudsSelected = $('input[name="studs"]:checked').length > 0;

        if (isAnyStudsSelected) {
            this.showStudsColorSection();
        } else {
            this.hideStudsColorSection();
        }
    }

    getBuckstitchingColorSection() {
        // Procurar pela seção que contém o Buck Stitching Color
        return $('.form-group').filter(function () {
            return $(this).find('label[for="buckstitchColoer"], input[name="buckStitchColor"]').length > 0;
        });
    }

    getStudsColorSection() {
        // Procurar pela seção que contém o Studs Colors
        return $('.form-group').filter(function () {
            return $(this).find('input[name="studsColors"]').length > 0;
        });
    }

    showBuckstitchingColorSection() {
        const $section = this.getBuckstitchingColorSection();
        $section.show().removeClass('hidden');
    }

    hideBuckstitchingColorSection() {
        const $section = this.getBuckstitchingColorSection();
        $section.hide().addClass('hidden');
        // Limpar seleções quando esconder
        $section.find('input[name="buckStitchColor"]').val('');
        $section.find('.color-dot').removeClass('selected');
    }

    showStudsColorSection() {
        const $section = this.getStudsColorSection();
        $section.show().removeClass('hidden');
    }

    hideStudsColorSection() {
        const $section = this.getStudsColorSection();
        $section.hide().addClass('hidden');
        // Limpar seleções quando esconder
        $section.find('input[name="studsColors"]').prop('checked', false);
    }

    // Continúa com os demais métodos no mesmo estilo...
    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveFormData();
        }, 30000); // Auto-save every 30 seconds
    }

    saveFormData() {
        const formData = this.$form.serializeArray();
        const data = {};

        formData.forEach(({ name, value }) => {
            if (data[name]) {
                if (Array.isArray(data[name])) {
                    data[name].push(value);
                } else {
                    data[name] = [data[name], value];
                }
            } else {
                data[name] = value;
            }
        });

        $('input[type="checkbox"]:checked, input[type="radio"]:checked').each(function () {
            const name = $(this).attr('name');
            const value = $(this).val();
            if (data[name]) {
                if (Array.isArray(data[name])) {
                    data[name].push(value);
                } else {
                    data[name] = [data[name], value];
                }
            } else {
                data[name] = value;
            }
        });

        localStorage.setItem('saddleFormData', JSON.stringify(data));
        this.showNotification('Form data saved automatically', 'success');
    }

    loadSavedData() {
        const savedData = localStorage.getItem('saddleFormData');
        if (savedData) {
            const data = JSON.parse(savedData);

            Object.entries(data).forEach(([key, value]) => {
                const $elements = $(`[name="${key}"]`);
                $elements.each(function () {
                    const $el = $(this);
                    if ($el.is(':checkbox') || $el.is(':radio')) {
                        if (Array.isArray(value)) {
                            $el.prop('checked', value.includes($el.val()));
                        } else {
                            $el.prop('checked', $el.val() === value);
                        }
                    } else {
                        $el.val(value);
                    }
                });
            });

            if (data.saddleBuild) {
                this.handleSaddleBuildChange(data.saddleBuild);
            }
        }
    }

    updateProgress() {
        const $requiredFields = this.$form.find('[required]');
        const filledFields = $requiredFields.filter((_, el) => {
            const $field = $(el);
            if ($field.is(':radio')) {
                return $(`[name="${$field.attr('name')}"]:checked`).length > 0;
            }
            return $field.val().trim() !== '';
        });

        const progress = ($requiredFields.length > 0)
            ? (filledFields.length / $requiredFields.length) * 100
            : 0;

        $('#progressFill').css('width', `${progress}%`);
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };

        const $notification = $('<div>')
            .addClass('notification')
            .text(message)
            .css({
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '15px 20px',
                background: colors[type],
                color: 'white',
                'border-radius': '10px',
                'box-shadow': '0 5px 15px rgba(0,0,0,0.2)',
                'z-index': '1000',
                animation: 'slideIn 0.3s ease'
            });

        $('body').append($notification);

        setTimeout(() => {
            $notification.remove();
        }, 3000);
    }

    validateForm() {
        const $requiredFields = this.$form.find('[required]');
        let isValid = true;

        $requiredFields.each(function () {
            const $field = $(this);
            if ($field.is(':radio')) {
                const groupChecked = $(`[name="${$field.attr('name')}"]:checked`).length > 0;
                if (!groupChecked) {
                    isValid = false;
                    $field.closest('.section')[0].scrollIntoView({ behavior: 'smooth' });
                    return false;
                }
            } else if (!$field.val().trim()) {
                isValid = false;
                $field.focus();
                $field[0].scrollIntoView({ behavior: 'smooth' });
                return false;
            }
        });

        return isValid;
    }

    getFormData() {
        const saddleBuild = $('input[name="saddleBuild"]:checked').val();
        const seatStyle = $('input[name="seatStyle"]:checked').val();
        const saddleStringQuantity = $('#saddleStringQuantity').val();

        const accessoriesGroup = [];
        $('input[name="accessoriesGroup"]:checked').each(function () {
            accessoriesGroup.push($(this).val());
        });

        return {
            saddleBuild,
            seatStyle,
            accessoriesGroup,
            saddleStringQuantity
        };
    }

    updatePrice() {
        const formData = this.getFormData();
        const calculator = new SaddlePriceCalculator();
        const finalPrice = calculator.calculate(formData);

        $('#price').val(finalPrice.toFixed(2));
    }



    async handlePdfGeneration(language) {
        if (!this.validateForm()) {
            const message = language === 'en'
                ? 'Please fill in all required fields'
                : 'Por favor, preencha todos os campos obrigatórios';
            this.showNotification(message, 'error');
            return;
        }

        await this.generatePDF(language);
        localStorage.removeItem('saddleFormData');

        const message = language === 'en'
            ? 'PDF in English is being generated...'
            : 'PDF em Português está sendo gerado...';
        this.showNotification(message, 'success');
    }

    async generatePDF(language) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pdfGenerator = new PDFGenerator(doc, this.$form);
        await pdfGenerator.generateSingleLanguage(language);
    }
}