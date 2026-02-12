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

    // Utility functions for consistent field disabling/enabling
    disableField(selector, options = {}) {
        const {
            opacity = '0.5',
            clearSelection = true,
            addDisabledClass = true
        } = options;

        const $elements = $(selector);

        $elements.each(function () {
            const $element = $(this);

            // Handle different element types
            if ($element.is('input, select, textarea')) {
                // Direct form element
                $element.prop('disabled', true);
                if (clearSelection) {
                    if ($element.is('input[type="radio"], input[type="checkbox"]')) {
                        $element.prop('checked', false);
                    } else {
                        $element.val('');
                    }
                }

                // Apply styling to parent container
                const $container = $element.closest('.checkbox-item, .form-group');
                if ($container.length) {
                    $container.css('opacity', opacity);
                    if (addDisabledClass) {
                        $container.addClass('disabled');
                    }
                }
            } else {
                // Container element (checkbox-item, form-group, etc.)
                $element.css('opacity', opacity);
                if (addDisabledClass) {
                    $element.addClass('disabled');
                }

                // Disable all inputs within the container
                $element.find('input, select, textarea').prop('disabled', true);
                if (clearSelection) {
                    $element.find('input[type="radio"], input[type="checkbox"]').prop('checked', false);
                    $element.find('input:not([type="radio"]):not([type="checkbox"]), select, textarea').val('');
                }
            }
        });

        return $elements; // Allow chaining
    }

    enableField(selector, options = {}) {
        const {
            opacity = '1',
            removeDisabledClass = true
        } = options;

        const $elements = $(selector);

        $elements.each(function () {
            const $element = $(this);

            // Handle different element types
            if ($element.is('input, select, textarea')) {
                // Direct form element
                $element.prop('disabled', false);

                // Apply styling to parent container
                const $container = $element.closest('.checkbox-item, .form-group');
                if ($container.length) {
                    $container.css('opacity', opacity);
                    if (removeDisabledClass) {
                        $container.removeClass('disabled');
                    }
                }
            } else {
                // Container element (checkbox-item, form-group, etc.)
                $element.css('opacity', opacity);
                if (removeDisabledClass) {
                    $element.removeClass('disabled');
                }

                // Enable all inputs within the container
                $element.find('input, select, textarea').prop('disabled', false);
            }
        });

        return $elements; // Allow chaining
    }

    setupEventListeners() {
        $('input[name="saddleBuild"]').on('change', e => this.handleSaddleBuildChange($(e.target).val()));
        $('input[name="style"]').on('change', e => this.handleStyleChange($(e.target).val()));
        $('input[name="seatStyle"]').on('change', e => this.handleSeatStyleChange($(e.target).val()));
        $('input[name="tooledCoverage"]').on('change', e => this.handleToolingChange(e));
        $('input[name="toolingPattern"]').on('change', e => this.handleToolingPatternChange(e));
        $('#gulletSize').on('change', e => this.handleGulletChange(e));
        $('input[name="seatOptions"]').on('change', () => this.handleAccentLimit());
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

        // Lining type change handler for InskirtPlate validation
        $('input[name="liningType"]').on('change', e => this.handleLiningTypeChange(e));
        // PDF generation buttons
        $('#generatePdfEn').on('click', async () => await this.handlePdfGeneration('en'));
        $('#generatePdfPt').on('click', async () => await this.handlePdfGeneration('pt'));

        // Initialize stirrup rules
        this.initializeStirrupRules();

        // Add event listeners for dynamic required field management
        $('input[name="saddleBuild"], input[name="seatStyle"], input[name="tooledCoverage"]')
            .on('change', () => this.updateRequiredFields());

        // Initial required fields update
        this.updateRequiredFields();
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

        // Enable tooling pattern options for Full Leather
        const $toolingPatternInputs = $('input[name="toolingPattern"]');
        const $toolingPatternItems = $toolingPatternInputs.closest('.checkbox-item');
        this.enableField($toolingPatternItems);

        // Atualizar estado da opção "None" baseado no Tooled Coverage atual
        this.updateToolingPatternNoneOption();

        // Desativar riggings de neoprene
        const riggingNeoprene = ['#doubleRoundRigging', '#dropDoubleSquare', '#dropDownNeoprene'];
        riggingNeoprene.forEach(id => {
            this.disableField(id);
        });

        console.log('Seção de Tooling ativada para Full Leather');
    }

    showHybridSections() {
        // Mostrar seções específicas do Hybrid   
        const sectionsToShow = [
            '#hybridStyleGroup',
            '#toolingPatternOptions',
            '#leatherColor',
            '#neopreneColorGroup'
        ];
        sectionsToShow.forEach(sectionId => {
            $(sectionId).show();
        });

        // Enable tooling pattern options for Hybrid
        const $toolingPatternInputs = $('input[name="toolingPattern"]');
        const $toolingPatternItems = $toolingPatternInputs.closest('.checkbox-item');
        this.enableField($toolingPatternItems);

        // Atualizar estado da opção "None" baseado no Tooled Coverage atual
        this.updateToolingPatternNoneOption();

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
            this.disableField($seatOptionsGroup);
        } else {
            this.enableField($seatOptionsGroup);
        }
    }

    //Rigging Options
    showRiggings(riggingIds) {
        riggingIds.forEach(id => {
            this.enableField($(id).closest('.checkbox-item'));
        });
    }

    hideAllRiggings() {
        const riggingCheckItems = $('#riggingStyleGroup .checkbox-item');
        this.disableField(riggingCheckItems);
    }

    handleRiggingOptions(saddleBuild) {
        const riggingLeather = ['#riggingDouble', '#InskirtPlate', '#dropDown'];
        const riggingNeoprene = ['#dropDoubleSquare', '#dropDownNeoprene', '#doubleRoundRigging'];
        this.hideAllRiggings();

        if (saddleBuild === 'Full Leather') {
            this.showRiggings(riggingLeather);
            // Apply InskirtPlate validation based on current lining type
            const selectedLining = $('input[name="liningType"]:checked').val();
            if (selectedLining) {
                this.updateInskirtPlateAvailability(selectedLining);
            }
        }

        if (saddleBuild === 'Full Neoprene') {
            this.showRiggings(riggingNeoprene);
        }
    }
    handleLiningTypeChange(e) {
        const selectedLining = $(e.target).val();
        this.updateInskirtPlateAvailability(selectedLining);
    }

    updateInskirtPlateAvailability(liningType) {
        const $inskirtPlate = $('#InskirtPlate');
        const $inskirtPlateItem = $inskirtPlate.closest('.checkbox-item');

        if (liningType === 'Fleece') {
            // Enable InskirtPlate when Fleece is selected
            this.enableField($inskirtPlateItem);
        } else {
            // Disable InskirtPlate when Fleece is not selected
            this.disableField($inskirtPlateItem);

            // If InskirtPlate was selected, clear the selection
            if ($inskirtPlate.is(':checked')) {
                $inskirtPlate.prop('checked', false);
            }
        }
    }



    riggingStyleChange(style) {
        const riggingLeather = ['#riggingDouble', '#InskirtPlate', '#dropDown'];
        const riggingNeoprene = ['#dropDoubleSquare', '#dropDownNeoprene', '#doubleRoundRigging'];

        this.hideAllRiggings();

        if (['01', '02', '03'].includes(style)) {
            this.showRiggings(riggingLeather);
            // Apply InskirtPlate validation based on current lining type
            const selectedLining = $('input[name="liningType"]:checked').val();
            if (selectedLining) {
                this.updateInskirtPlateAvailability(selectedLining);
            }
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
        this.updateRequiredFields();
    }

    handleToolingChange(e) {
        const $tooledPartsGroup = $('#tooledPartsGroup');
        const $toolingPatternInputs = $('input[name="toolingPattern"]');
        const $toolingPatternItems = $toolingPatternInputs.closest('.checkbox-item');
        const $toolingPatternBorderInputs = $('input[name="toolingPatternBorder"]');
        const $toolingPatternBorderItems = $toolingPatternBorderInputs.closest('.checkbox-item');
        const $noneOption = $('#toolingNone');

        if ($(e.target).val() === 'plain') {
            // Hide tooled parts group
            $tooledPartsGroup.hide().prop('required', false).val('');

            // Disable tooling pattern options
            this.disableField($toolingPatternItems, { opacity: '0.4' });

            // Disable tooling pattern border options
            this.disableField($toolingPatternBorderItems, { opacity: '0.4' });

            console.log('Tooling Pattern and Border disabled - Plain selected');
        } else {
            // Show tooled parts group
            $tooledPartsGroup.show().prop('required', true);

            // Enable tooling pattern options
            this.enableField($toolingPatternItems);

            // Enable tooling pattern border options
            this.enableField($toolingPatternBorderItems);

            console.log('Tooling Pattern and Border enabled - Non-plain selected');
        }

        // Atualizar estado da opção "None" baseado na seleção atual
        this.updateToolingPatternNoneOption();
        this.updateRequiredFields();
    }

    updateToolingPatternNoneOption() {
        const $noneOption = $('#toolingNone');
        const $noneOptionItem = $noneOption.closest('.checkbox-item');
        const selectedTooledCoverage = $('input[name="tooledCoverage"]:checked').val();

        if (selectedTooledCoverage && selectedTooledCoverage !== 'plain') {
            // Disable "None" when any option other than "plain" is selected
            this.disableField($noneOptionItem, { opacity: '0.4' });

            // If "None" was selected, clear the selection
            if ($noneOption.is(':checked')) {
                $noneOption.prop('checked', false);
            }
        } else {
            // Enable "None" when "plain" is selected or nothing is selected
            this.enableField($noneOptionItem);
        }
    }

    handleToolingPatternChange(e) {
        const $tooledPartsGroup = $('#tooledPartsGroup');
        const $tooledPartsInputs = $('input[name="leatherColorTooled"]');
        const $tooledPartsItems = $tooledPartsInputs.closest('.checkbox-item');

        if ($(e.target).val() === 'None') {
            // Disable tooled parts options when None is selected
            this.disableField($tooledPartsItems, { opacity: '0.4' });

            console.log('Leather Color - Tooled disabled - None selected in Tooling Pattern');
        } else {
            // Enable tooled parts options when any pattern is selected
            this.enableField($tooledPartsItems);

            console.log('Leather Color - Tooled enabled - Pattern selected in Tooling Pattern');
        }
        this.updateRequiredFields();
    }

    handleAccentLimit() {
        const $accentInputs = $('input[name="seatOptions"]');
        const $checkedInputs = $accentInputs.filter(':checked');

        if ($checkedInputs.length >= 3) {
            $accentInputs.not(':checked').each((index, element) => {
                this.disableField($(element).closest('.checkbox-item'), { clearSelection: false });
            });
        } else {
            $accentInputs.each((index, element) => {
                if (!$(element).data('originally-disabled')) {
                    this.enableField($(element).closest('.checkbox-item'));
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
        this.updateRequiredFields();
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
        const selectedStuds = $('input[name="studs"]:checked').val();

        if (selectedStuds && selectedStuds !== 'None') {
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

        // Reset all studs to enabled
        const $allStudsOptions = $('input[name="studs"]').closest('.checkbox-item');
        this.enableField($allStudsOptions);

        // Apply rules based on buckstitching selection
        if (!buckstitchingSelection || buckstitchingSelection === 'None') {
            // No buckstitching selected: disable buckstitching studs options
            this.disableField('#studs3, #studs4');
        } else if (buckstitchingSelection === 'Single Buckstitch') {
            // Single buckstitch: disable non-single buckstitch options
            this.disableField('#studs1, #studs2, #studs4');
        } else if (buckstitchingSelection === 'Double Buckstitch') {
            // Double buckstitch: disable non-double buckstitch options
            this.disableField('#studs1, #studs2, #studs3');
        } else {
            // X Buckstitch or others: allow all options
            // Already reset above, so nothing to do
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
        this.updateRequiredFields();
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
        this.updateRequiredFields();
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

    // Função para gerenciar campos required dinamicamente
    updateRequiredFields() {
        // Campos que devem ser required apenas quando visíveis/habilitados
        const conditionalRequiredFields = [
            // Gullet Other - apenas quando "other" está selecionado
            {
                field: '#gulletOther',
                condition: () => $('#gulletSize').val() === 'other'
            },
            // Tooled Parts - apenas quando não é "Full Neoprene" E não é "plain" E quando tooling pattern não é "None"
            {
                field: 'input[name="leatherColorTooled"]',
                condition: () => {
                    const build = $('input[name="saddleBuild"]:checked').val();
                    const tooledCoverage = $('input[name="tooledCoverage"]:checked').val();
                    const toolingPattern = $('input[name="toolingPattern"]:checked').val();
                    return build !== 'Full Neoprene' && tooledCoverage !== 'plain' && toolingPattern !== 'None';
                }
            },
            // Tooling Pattern - quando não é "plain" OU quando é Hybrid
            {
                field: 'input[name="toolingPattern"]',
                condition: () => {
                    const build = $('input[name="saddleBuild"]:checked').val();
                    const tooledCoverage = $('input[name="tooledCoverage"]:checked').val();
                    return (tooledCoverage && tooledCoverage !== 'plain') || build === 'Hybrid';
                }
            },
            // Neoprene Type - apenas quando Full Neoprene está selecionado
            {
                field: 'input[name="neopreneType"]',
                condition: () => $('input[name="saddleBuild"]:checked').val() === 'Full Neoprene'
            },
            // Neoprene Color - apenas quando Hybrid ou Full Neoprene está selecionado
            {
                field: 'input[name="neopreneColor"]',
                condition: () => {
                    const build = $('input[name="saddleBuild"]:checked').val();
                    return build === 'Hybrid' || build === 'Full Neoprene';
                }
            },
            // Style - apenas quando Hybrid está selecionado
            {
                field: 'input[name="style"]',
                condition: () => $('input[name="saddleBuild"]:checked').val() === 'Hybrid'
            },
            // Leather Color (Plain Parts) - quando Full Leather ou Hybrid está selecionado
            {
                field: 'input[name="leatherColor"]',
                condition: () => {
                    const build = $('input[name="saddleBuild"]:checked').val();
                    return build === 'Full Leather' || build === 'Hybrid';
                }
            },
            // Seat Options - apenas quando não é "Hard"
            {
                field: 'input[name="seatOptions"]',
                condition: () => $('input[name="seatStyle"]:checked').val() !== 'Hard'
            },
            // Stirrup Size - apenas quando measurements section está habilitada e há linhas ativas
            {
                field: '#selectedStirrupSize',
                condition: () => {
                    const $section = $('.stirrup-measurements-section');
                    const hasActiveRows = $('.size-row:not(.disabled)').length > 0;
                    return !$section.hasClass('disabled') && hasActiveRows;
                }
            },
            // Saddle String Quantity - apenas quando Saddle Strings está selecionado
            {
                field: '#saddleStringQuantity',
                condition: () => $('#saddleStrings').is(':checked')
            },
            // Buck Stitch Color - apenas quando buckstitching está selecionado
            {
                field: 'input[name="buckStitchColor"]',
                condition: () => {
                    const buckstitching = $('input[name="buckstitching"]:checked').val();
                    return buckstitching && buckstitching !== 'None';
                }
            },
            // Studs Colors - apenas quando studs está selecionado
            {
                field: 'input[name="studsColors"]',
                condition: () => {
                    const studs = $('input[name="studs"]:checked').val();
                    return studs && studs !== 'None';
                }
            },
            // Tooled Coverage - apenas quando Full Leather está selecionado
            {
                field: 'input[name="tooledCoverage"]',
                condition: () => {
                    const build = $('input[name="saddleBuild"]:checked').val();
                    return build === 'Full Leather';
                }
            },
            // Tooling Pattern Border - apenas quando não é "plain"
            {
                field: 'input[name="toolingPatternBorder"]',
                condition: () => {
                    const tooledCoverage = $('input[name="tooledCoverage"]:checked').val();
                    return tooledCoverage && tooledCoverage !== 'plain';
                }
            }
        ];

        // Aplicar regras condicionais
        conditionalRequiredFields.forEach(({ field, condition }) => {
            const $field = $(field);
            const shouldBeRequired = condition();

            if (shouldBeRequired) {
                $field.prop('required', true);
            } else {
                $field.prop('required', false);
                // Limpar valor se não é mais obrigatório
                if ($field.is('input[type="radio"], input[type="checkbox"]')) {
                    $field.prop('checked', false);
                } else {
                    $field.val('');
                }
            }
        });

        console.log('Updated required fields based on current form state');
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
        const missingFields = [];
        let isValid = true;
        const self = this; // Salvar referência para usar dentro do each

        $requiredFields.each(function () {
            const $field = $(this);
            let fieldName = '';
            let isEmpty = false;

            if ($field.is(':radio')) {
                const groupChecked = $(`[name="${$field.attr('name')}"]:checked`).length > 0;
                if (!groupChecked) {
                    isEmpty = true;
                    fieldName = $field.attr('name');
                }
            } else if (!$field.val().trim()) {
                isEmpty = true;
                fieldName = $field.attr('name') || $field.attr('id');
            }

            if (isEmpty) {
                isValid = false;
                // Obter o label do campo para mostrar um nome mais amigável
                const friendlyName = self.getFieldFriendlyName($field);
                const sectionName = self.getFieldSectionName($field);

                missingFields.push({
                    name: fieldName,
                    friendlyName: friendlyName,
                    sectionName: sectionName,
                    element: $field
                });
            }
        });

        if (!isValid) {
            this.showMissingFieldsModal(missingFields);
        }

        return isValid;
    }

    getFieldFriendlyName($field) {
        // Tentar encontrar o label associado ao campo
        let label = '';

        if ($field.is(':radio')) {
            // Para radio buttons, pegar o label do grupo
            const $groupLabel = $field.closest('.form-group').find('label').first();
            label = $groupLabel.find('span').first().text() || $groupLabel.text();
        } else {
            // Para outros campos, pegar o label associado
            const fieldId = $field.attr('id');
            if (fieldId) {
                const $label = $(`label[for="${fieldId}"]`);
                if ($label.length) {
                    label = $label.find('span').first().text() || $label.text();
                } else {
                    // Se não encontrar label específico, pegar o label do form-group
                    const $groupLabel = $field.closest('.form-group').find('label').first();
                    label = $groupLabel.find('span').first().text() || $groupLabel.text();
                }
            }
        }

        // Limpar o texto do label (remover asteriscos e espaços extras)
        return label.replace(/\*/g, '').trim() || $field.attr('name') || 'Campo não identificado';
    }

    getFieldSectionName($field) {
        // Encontrar a seção pai do campo
        const $section = $field.closest('.section');
        if ($section.length) {
            const $sectionTitle = $section.find('.section-title').first();
            return $sectionTitle.text().replace(/[🎨🏇👤🔗⚙️🔨]/g, '').trim() || 'Seção não identificada';
        }
        return 'Seção não identificada';
    }

    showMissingFieldsModal(missingFields) {
        // Detectar idioma atual
        const currentLang = $('html').attr('lang') || 'en';
        const isPortuguese = currentLang === 'pt';

        // Textos do modal baseados no idioma
        const texts = {
            title: isPortuguese ? '⚠️ Campos Obrigatórios Não Preenchidos' : '⚠️ Required Fields Not Filled',
            description: isPortuguese ? 'Por favor, preencha os seguintes campos para continuar:' : 'Please fill in the following fields to continue:',
            closeButton: isPortuguese ? 'Fechar' : 'Close'
        };

        // Agrupar campos por seção
        const fieldsBySection = {};
        missingFields.forEach(field => {
            if (!fieldsBySection[field.sectionName]) {
                fieldsBySection[field.sectionName] = [];
            }
            fieldsBySection[field.sectionName].push(field);
        });

        // Criar o conteúdo do modal
        let modalContent = '<div class="missing-fields-modal">';
        modalContent += `<h3>${texts.title}</h3>`;
        modalContent += `<p>${texts.description}</p>`;

        Object.keys(fieldsBySection).forEach(sectionName => {
            modalContent += `<div class="missing-section">`;
            modalContent += `<h4>${sectionName}</h4>`;
            modalContent += '<ul>';
            fieldsBySection[sectionName].forEach(field => {
                modalContent += `<li class="missing-field-item" data-field="${field.name}">${field.friendlyName}</li>`;
            });
            modalContent += '</ul>';
            modalContent += '</div>';
        });

        modalContent += '<div class="modal-buttons">';
        modalContent += `<button class="btn-close-modal">${texts.closeButton}</button>`;
        modalContent += '</div>';
        modalContent += '</div>';

        // Criar e mostrar o modal
        const $modal = $('<div class="modal-overlay">').html(modalContent);
        $('body').append($modal);

        // Event listeners para o modal
        $modal.find('.btn-close-modal').on('click', () => {
            $modal.remove();
        });

        $modal.find('.missing-field-item').on('click', function () {
            const fieldName = $(this).data('field');
            const field = missingFields.find(f => f.name === fieldName);
            if (field && field.element) {
                $modal.remove();
                // Scroll para o campo e dar foco
                field.element[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    if (field.element.is(':radio')) {
                        // Para radio buttons, destacar o grupo
                        field.element.closest('.form-group').addClass('highlight-field');
                        setTimeout(() => {
                            field.element.closest('.form-group').removeClass('highlight-field');
                        }, 3000);
                    } else {
                        field.element.focus().addClass('highlight-field');
                        setTimeout(() => {
                            field.element.removeClass('highlight-field');
                        }, 3000);
                    }
                }, 500);
            }
        });

        // Fechar modal clicando fora
        $modal.on('click', function (e) {
            if (e.target === this) {
                $modal.remove();
            }
        });
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
            // O modal detalhado já será mostrado pelo validateForm()
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