// Test script to verify translations are working
console.log('Testing i18n translations...');

// Load translations and test
fetch('assets/translations.json')
  .then(response => response.json())
  .then(translations => {
    console.log('Translations loaded:', translations);

    // Test specific translations
    console.log('EN gulletSize.other:', translations.en.options.gulletSize.other);
    console.log('PT gulletSize.other:', translations.pt.options.gulletSize.other);

    console.log('EN treeType.SAFE:', translations.en.options.treeType.SAFE);
    console.log('PT treeType.SAFE:', translations.pt.options.treeType.SAFE);

    console.log('EN saddleBuild["Full Leather"]:', translations.en.options.saddleBuild["Full Leather"]);
    console.log('PT saddleBuild["Full Leather"]:', translations.pt.options.saddleBuild["Full Leather"]);

    console.log('EN seatOptions["Suede 01 Turquoise Green"]:', translations.en.options.seatOptions["Suede 01 Turquoise Green"]);
    console.log('PT seatOptions["Suede 01 Turquoise Green"]:', translations.pt.options.seatOptions["Suede 01 Turquoise Green"]);
  })
  .catch(error => {
    console.error('Error loading translations:', error);
  });