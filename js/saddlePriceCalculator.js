class SaddlePriceCalculator {
  constructor(basePrice = 0) {
    this.basePrice = basePrice;
    this.modifiers = {
      saddleBuild: {
        'Full Leather': 2399,
        'Hybrid': 1799,
        'Full Neoprene': 1500
      },
      seatStyle: {
        'Inlay': 50
      },
      accessoriesGroup: {
        // nome => valor extra
        'Hoof Pick Holder': 15,
        'Hoof Pick Holder on Skirt': 15,
        'Rig Guard': 25,
        'Full Back Cinch': 35,
        'Saddle String 4 or 6': 20,
        'Back Cinch Hole Only': 10
      },
    };
  }

  calculate(formData) {
    let total = this.basePrice;

    const build = formData.saddleBuild;
    const seat = formData.seatStyle;
    const accessories = formData.accessoriesGroup || [];

    if (this.modifiers.saddleBuild[build]) {
      total += this.modifiers.saddleBuild[build];
    }

    if (this.modifiers.seatStyle[seat]) {
      total += this.modifiers.seatStyle[seat];
    }

    accessories.forEach(acc => {
      if (this.modifiers.accessoriesGroup[acc]) {
        total += this.modifiers.accessoriesGroup[acc];
      }
    });

    return total;
  }
}