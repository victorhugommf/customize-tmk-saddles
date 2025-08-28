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
            '#gulletOtherGroup'
        ];
        sectionsToHide.forEach(sectionId => $(sectionId).addClass('hidden'));


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
        this.hideAllDynamicSections();
        switch (buildType) {
            case 'Full Leather': this.showFullLeatherSections(); break;
            case 'Hybrid': this.showHybridSections(); break;
            case 'Full Neoprene': this.showFullNeopreneSections(); break;
        }
    }

    showFullLeatherSections() {
        const riggingNeoprene = ['#doubleRoundRigging', '#dropDoubleSquare', '#dropDownNeoprene'];
        riggingNeoprene.forEach(id => {
            $(id).css('opacity', '0.5');
            $(id).prop('disabled', true).prop('checked', false);
        });
    }

    showHybridSections() {
        const sections = ['#hybridStyleGroup'];
        sections.forEach(id => $(id).removeClass('hidden'));
    }

    showFullNeopreneSections() {
        const sections = ['#toolingPatternOptions'];
        sections.forEach(id => $(id).hide());
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

        const accessoriesGroup = [];
        $('input[name="accessoriesGroup"]:checked').each(function () {
            accessoriesGroup.push($(this).val());
        });

        return {
            saddleBuild,
            seatStyle,
            accessoriesGroup
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