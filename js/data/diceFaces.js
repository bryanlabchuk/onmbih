// Dice Faces - Customizable faces for your dice
// Players can unlock and equip different faces that modify dice behavior

export const DICE_FACES = {
  // ===== STANDARD FACES =====
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'A regular die face. Nothing special. Reliable.',
    emoji: '⚀',
    rarity: 'starter',
    values: [1, 2, 3, 4, 5, 6],
    effect: null,
    unlocked: true
  },

  // ===== RESEARCH FACES =====
  magnifyingGlass: {
    id: 'magnifyingGlass',
    name: 'Magnifying Glass',
    description: '+1 to research rolls, -1 to challenge rolls',
    emoji: '🔍',
    rarity: 'common',
    values: [1, 2, 3, 4, 5, 6],
    effect: {
      researchBonus: 1,
      challengePenalty: -1
    },
    unlocked: true
  },

  oldBook: {
    id: 'oldBook',
    name: 'Dusty Tome',
    description: 'Doubles count towards research requirements',
    emoji: '📖',
    rarity: 'uncommon',
    values: [2, 2, 4, 4, 6, 6],
    effect: {
      doublesBonus: true
    },
    unlocked: false
  },

  candle: {
    id: 'candle',
    name: 'Seance Candle',
    description: 'Can reveal spirit information when rolling 6',
    emoji: '🕯️',
    rarity: 'uncommon',
    values: [1, 2, 3, 4, 5, 6],
    effect: {
      onSix: 'revealSpiritInfo'
    },
    unlocked: false
  },

  // ===== COMBAT FACES =====
  sword: {
    id: 'sword',
    name: 'Silver Blade',
    description: '+2 to challenge rolls, cannot be used for research',
    emoji: '⚔️',
    rarity: 'uncommon',
    values: [2, 3, 4, 5, 6, 7],
    effect: {
      challengeBonus: 2,
      researchDisabled: true
    },
    unlocked: false
  },

  shield: {
    id: 'shield',
    name: 'Iron Ward',
    description: 'Reduces spirit damage by 1 when equipped',
    emoji: '🛡️',
    rarity: 'uncommon',
    values: [1, 2, 3, 4, 4, 5],
    effect: {
      damageReduction: 1
    },
    unlocked: false
  },

  holyWater: {
    id: 'holyWater',
    name: 'Holy Water',
    description: 'Extra effective against religious-weak spirits (+3)',
    emoji: '💧',
    rarity: 'rare',
    values: [1, 2, 3, 4, 5, 6],
    effect: {
      bonusAgainstWeakness: { type: 'religious', bonus: 3 }
    },
    unlocked: false
  },

  // ===== CURSED FACES =====
  skull: {
    id: 'skull',
    name: 'Death\'s Grin',
    description: 'High risk, high reward. Can roll 0 or 8.',
    emoji: '💀',
    rarity: 'rare',
    values: [0, 2, 4, 6, 8, 8],
    effect: {
      volatile: true
    },
    unlocked: false
  },

  blackCat: {
    id: 'blackCat',
    name: 'Black Cat\'s Eye',
    description: 'Lucky 7s! But 1s become 0s.',
    emoji: '🐱',
    rarity: 'uncommon',
    values: [0, 2, 3, 5, 7, 7],
    effect: {
      lucky: true,
      unlucky: true
    },
    unlocked: false
  },

  cursedMirror: {
    id: 'cursedMirror',
    name: 'Cursed Mirror',
    description: 'Copies the result of another die you rolled',
    emoji: '🪞',
    rarity: 'rare',
    values: [1, 2, 3, 4, 5, 6],
    effect: {
      copyDie: true
    },
    unlocked: false
  },

  // ===== SPIRIT REWARD FACES =====
  pilgrimCross: {
    id: 'pilgrimCross',
    name: 'Pilgrim\'s Cross',
    description: 'Obtained from Ezekiel. +2 against colonial spirits.',
    emoji: '✝️',
    rarity: 'legendary',
    values: [1, 3, 3, 5, 5, 6],
    effect: {
      bonusAgainstEra: { era: 'colonial', bonus: 2 }
    },
    source: 'pilgrimGhost',
    unlocked: false
  },

  hexMark: {
    id: 'hexMark',
    name: 'Hex Mark',
    description: 'Obtained from Abigail. Curses become blessings.',
    emoji: '🔮',
    rarity: 'legendary',
    values: [1, 2, 3, 4, 5, 6],
    effect: {
      curseImmunity: true,
      convertCurses: true
    },
    source: 'witchSpirit',
    unlocked: false
  },

  mourningStar: {
    id: 'mourningStar',
    name: 'Mourning Star',
    description: 'Obtained from Eleanor. Grief becomes strength.',
    emoji: '⭐',
    rarity: 'legendary',
    values: [1, 1, 4, 5, 6, 6],
    effect: {
      lowToHigh: true // 1s can become 6s
    },
    source: 'ghostWoman01',
    unlocked: false
  },

  poisonVial: {
    id: 'poisonVial',
    name: 'Poison Vial',
    description: 'Obtained from Cordelia. Slow but deadly.',
    emoji: '🧪',
    rarity: 'legendary',
    values: [1, 1, 2, 2, 3, 10],
    effect: {
      stackingPoison: true // Gets stronger each roll
    },
    source: 'ghostWoman02',
    unlocked: false
  },

  bloodMoon: {
    id: 'bloodMoon',
    name: 'Blood Moon',
    description: 'Obtained from Vladislav. Drains life to power.',
    emoji: '🌑',
    rarity: 'legendary',
    values: [2, 3, 4, 5, 6, 7],
    effect: {
      lifeSteal: true // Heal when dealing damage
    },
    source: 'vampire',
    unlocked: false
  },

  scarab: {
    id: 'scarab',
    name: 'Golden Scarab',
    description: 'Obtained from Thaddeus. Ancient power lingers.',
    emoji: '🪲',
    rarity: 'legendary',
    values: [3, 3, 3, 5, 5, 5],
    effect: {
      tripleBonus: true // Triples are worth double
    },
    source: 'mummy',
    unlocked: false
  },

  floatingBalloon: {
    id: 'floatingBalloon',
    name: 'Red Balloon',
    description: 'Obtained from Pennywhistle. We all float down here.',
    emoji: '🎈',
    rarity: 'legendary',
    values: [1, 1, 1, 13, 13, 13],
    effect: {
      luckyThirteen: true // 13s are VERY good
    },
    source: 'clown',
    unlocked: false
  },

  spiralEye: {
    id: 'spiralEye',
    name: 'Spiral Eye',
    description: 'Obtained from Mr. Snuffles. Reality bends.',
    emoji: '👁️',
    rarity: 'legendary',
    values: [1, 2, 3, 3, 2, 1],
    effect: {
      palindromeBonus: true // Palindrome rolls get +5
    },
    source: 'hypnoAnteater',
    unlocked: false
  },

  goodBoyBone: {
    id: 'goodBoyBone',
    name: 'Good Boy Bone',
    description: 'Obtained from Old Yeller. Who\'s a good die?',
    emoji: '🦴',
    rarity: 'rare',
    values: [2, 3, 4, 4, 5, 6],
    effect: {
      loyalty: true // Returns to your hand if lost
    },
    source: 'ghostDog',
    unlocked: false
  },

  toxicGlow: {
    id: 'toxicGlow',
    name: 'Toxic Glow',
    description: 'Obtained from the Blackwood Experiment. Radioactive luck.',
    emoji: '☢️',
    rarity: 'rare',
    values: [1, 2, 3, 4, 5, 6],
    effect: {
      corrosive: true, // Slowly damages spirits over time
      glowing: true    // Reveals hidden information
    },
    source: 'greenGooMonster',
    unlocked: false
  },

  sourPower: {
    id: 'sourPower',
    name: 'Sour Power',
    description: 'Obtained from the Citrus Abomination. When life gives you lemons...',
    emoji: '🍋',
    rarity: 'rare',
    values: [1, 2, 2, 4, 5, 6],
    effect: {
      sourSurprise: true, // 2s can become 6s
      zesty: true         // Extra damage to sweet-weak spirits
    },
    source: 'lemonMonster',
    unlocked: false
  },

  // ===== SPECIAL SHAPES =====
  d4: {
    id: 'd4',
    name: 'Tetrahedron',
    description: 'A 4-sided die. Fewer options, but more consistent.',
    emoji: '🔺',
    rarity: 'uncommon',
    values: [1, 2, 3, 4],
    shape: 'd4',
    effect: {
      consistent: true
    },
    unlocked: false
  },

  d8: {
    id: 'd8',
    name: 'Octahedron',
    description: 'An 8-sided die. More range, more chaos.',
    emoji: '💎',
    rarity: 'rare',
    values: [1, 2, 3, 4, 5, 6, 7, 8],
    shape: 'd8',
    effect: {
      expanded: true
    },
    unlocked: false
  },

  d12: {
    id: 'd12',
    name: 'Dodecahedron',
    description: 'A 12-sided die. Go big or go home.',
    emoji: '🔷',
    rarity: 'legendary',
    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    shape: 'd12',
    effect: {
      massive: true
    },
    unlocked: false
  },

  d20: {
    id: 'd20',
    name: 'Icosahedron',
    description: 'THE d20. Critical hits on 20. Critical fails on 1.',
    emoji: '⬡',
    rarity: 'legendary',
    values: Array.from({length: 20}, (_, i) => i + 1),
    shape: 'd20',
    effect: {
      critical: true,
      criticalFail: true
    },
    unlocked: false
  }
};

export const RARITY_ORDER = ['starter', 'common', 'uncommon', 'rare', 'legendary'];

export const getUnlockedFaces = () => {
  return Object.values(DICE_FACES).filter(f => f.unlocked);
};

export const getFacesByRarity = (rarity) => {
  return Object.values(DICE_FACES).filter(f => f.rarity === rarity);
};

export const getSpiritRewardFaces = () => {
  return Object.values(DICE_FACES).filter(f => f.source);
};

// Dice class for game use
export class Die {
  constructor(faceId = 'standard') {
    this.face = DICE_FACES[faceId] || DICE_FACES.standard;
    this.currentValue = null;
    this.locked = false;
    this.cursed = false;
  }

  roll() {
    if (this.locked) return this.currentValue;
    const values = this.face.values;
    this.currentValue = values[Math.floor(Math.random() * values.length)];
    return this.currentValue;
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  curse() {
    this.cursed = true;
  }

  uncurse() {
    this.cursed = false;
  }

  setFace(faceId) {
    if (DICE_FACES[faceId]) {
      this.face = DICE_FACES[faceId];
    }
  }
}
