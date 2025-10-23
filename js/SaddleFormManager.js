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

        // Interactive table for stirrup measurements
        $('.size-row').on('click', e => this.handleSizeRowClick(e));

        // Interactive table for fender height
        $('.fender-size-row').on('click', e => this.handleFenderHeightRowClick(e));

        // Stirrup type change handler
        $('input[name="stirrups"]').on('change', e => this.handleStirrupTypeChange(e));
        // PDF generation buttons
        $('#generatePdfEn').on('click', async () => await this.handlePdfGeneration('en'));
        $('#generatePdfPt').on('click', async () => await this.handlePdfGeneration('pt'));

        // Initialize stirrup rules
        this.initializeStirrupRules();
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

        // Aplicar regras iniciais dos studs (nenhum buckstitching selecionado)
        this.updateStudsOptions(null);
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
        const selectedBuckstitching = $('input[name="buckstitching"]:checked').val();
        const isValidBuckstitchingSelected = selectedBuckstitching && selectedBuckstitching !== 'None';

        if (isValidBuckstitchingSelected) {
            this.showBuckstitchingColorSection();
        } else {
            this.hideBuckstitchingColorSection();
        }

        // Atualizar opções de studs baseado na seleção de buckstitching
        this.updateStudsOptions(selectedBuckstitching);
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

    updateStudsOptions(buckstitchingSelection) {
        // Limpar seleção atual de studs
        $('input[name="studs"]').prop('checked', false);

        // Esconder seção de cores de studs
        this.hideStudsColorSection();

        // Resetar todos os studs para visível e habilitado
        const $allStudsOptions = $('input[name="studs"]').closest('.checkbox-item');
        $allStudsOptions.css('opacity', '1').find('input').prop('disabled', false);

        // Aplicar regras baseadas na seleção de buckstitching
        if (!buckstitchingSelection || buckstitchingSelection === 'None') {
            // Nenhum buckstitching selecionado: mostrar apenas single studs / double studs
            $('#studs3, #studs4').closest('.checkbox-item').css('opacity', '0.5').find('input').prop('disabled', true);
        } else if (buckstitchingSelection === 'Single Buckstitch') {
            // Single buckstitch: mostrar apenas single buckstitch studs
            $('#studs1, #studs2, #studs4').closest('.checkbox-item').css('opacity', '0.5').find('input').prop('disabled', true);
        } else if (buckstitchingSelection === 'Double Buckstitch') {
            // Double buckstitch: mostrar apenas double buckstitch studs
            $('#studs1, #studs2, #studs3').closest('.checkbox-item').css('opacity', '0.5').find('input').prop('disabled', true);
        } else {
            // X Buckstitch ou outros: permitir todas as opções
            // Já resetamos acima, então não precisa fazer nada
        }
    }

    handleSizeRowClick(e) {
        const $row = $(e.currentTarget);
        const size = $row.data('size');

        // Don't allow selection of disabled rows
        if ($row.hasClass('disabled')) {
            console.log('Cannot select disabled row:', size);
            return;
        }

        // Remove seleção anterior
        $('.size-row').removeClass('selected');

        // Adiciona seleção à linha clicada
        $row.addClass('selected');

        // Atualiza o campo hidden
        $('#selectedStirrupSize').val(size);

        console.log('Selected stirrup size:', size);

        // Atualizar progresso
        this.updateProgress();
    }

    handleFenderHeightRowClick(e) {
        const $row = $(e.currentTarget);
        const fenderHeight = $row.data('fender-height');

        // Remove seleção anterior
        $('.fender-size-row').removeClass('selected');

        // Adiciona seleção à linha clicada
        $row.addClass('selected');

        // Atualiza o campo hidden
        $('#selectedFenderHeight').val(fenderHeight);

        console.log('Selected fender height:', fenderHeight);

        // Aplicar regras condicionais para stirrups
        this.applyStirrupRules(fenderHeight);

        // Atualizar progresso
        this.updateProgress();
    }

    applyStirrupRules(fenderHeight) {
        const $stirrupOptions = $('.checkbox-item[data-stirrup-type]');

        // Reset all stirrup options
        $stirrupOptions.removeClass('disabled');

        // Enable measurements section
        this.enableMeasurementsSection();

        // Clear any previous stirrup selection
        $('input[name="stirrups"]').prop('checked', false);

        // Clear stirrup size selection
        $('#selectedStirrupSize').val('');
        $('.size-row').removeClass('selected');

        switch (fenderHeight) {
            case '45cm': // Adult
                // Show all stirrup types
                // Always show measurements with only Adult row
                this.filterMeasurementRows(['adult']);
                break;

            case '39cm': // Juvenile  
                // Show all stirrup types
                // Show measurements based on stirrup type selection
                this.updateMeasurementsForJuvenile();
                break;

            case '33.5cm': // Child
                // Only show Aluminium options
                $stirrupOptions.filter('[data-stirrup-type="wood"]').addClass('disabled');
                // Always show measurements with only Child row
                this.filterMeasurementRows(['child', 'juvenile']);
                break;
        }

        console.log('Applied stirrup rules for fender height:', fenderHeight);
    }

    handleStirrupTypeChange(e) {
        const selectedStirrup = $(e.target).val();
        const fenderHeight = $('#selectedFenderHeight').val();

        // Clear stirrup size selection when changing stirrup type
        $('#selectedStirrupSize').val('');
        $('.size-row').removeClass('selected');

        // Apply measurement rules based on fender height and stirrup type
        if (fenderHeight === '39cm') { // Juvenile
            this.updateMeasurementsForJuvenile();
        }

        console.log('Stirrup type changed:', selectedStirrup, 'for fender height:', fenderHeight);
    }

    initializeStirrupRules() {
        // Show stirrup measurements section by default
        $('.stirrup-measurements-section').show();

        // Show all measurement rows initially but disable them
        $('.size-row').show().addClass('disabled');

        // If there's already a fender height selected, apply rules
        const selectedFenderHeight = $('#selectedFenderHeight').val();
        if (selectedFenderHeight) {
            this.applyStirrupRules(selectedFenderHeight);
        } else {
            // No fender height selected, disable measurements until selection is made
            this.disableMeasurementsSection();
        }
    }

    updateMeasurementsForJuvenile() {
        const selectedStirrup = $('input[name="stirrups"]:checked').val();

        if (!selectedStirrup) {
            // No stirrup selected yet, disable measurements
            this.disableMeasurementsSection();
            return;
        }

        // Enable measurements section
        this.enableMeasurementsSection();

        if (selectedStirrup.includes('Wood')) {
            // Wood stirrups: show only Adult row
            this.filterMeasurementRows(['adult']);
        } else if (selectedStirrup.includes('Aluminium')) {
            // Aluminium stirrups: show Adult and Juvenile rows
            this.filterMeasurementRows(['adult', 'juvenile']);
        }
    }

    filterMeasurementRows(allowedSizes) {
        const $allRows = $('.size-row');

        // First, disable all rows (greyed out)
        $allRows.addClass('disabled').removeClass('selected');

        // Clear previous selection
        $('#selectedStirrupSize').val('');

        // Then enable only allowed rows
        allowedSizes.forEach(size => {
            $(`.size-row[data-size="${size}"]`).removeClass('disabled');
        });

        // If only one option is available, select it automatically
        if (allowedSizes.length === 1) {
            const singleSize = allowedSizes[0];
            const $singleRow = $(`.size-row[data-size="${singleSize}"]`);

            $singleRow.addClass('selected');
            $('#selectedStirrupSize').val(singleSize);

            console.log('Auto-selected single available size:', singleSize);

            // Update progress since we made an automatic selection
            this.updateProgress();
        }

        console.log('Filtered measurement rows - active:', allowedSizes);
    }

    disableMeasurementsSection() {
        const $measurementsSection = $('.stirrup-measurements-section');
        $measurementsSection.addClass('disabled');

        // Disable all rows
        $('.size-row').addClass('disabled');

        // Clear any selection
        $('.size-row').removeClass('selected');
        $('#selectedStirrupSize').val('');

        console.log('Measurements section disabled');
    }

    enableMeasurementsSection() {
        const $measurementsSection = $('.stirrup-measurements-section');
        $measurementsSection.removeClass('disabled');

        console.log('Measurements section enabled');
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