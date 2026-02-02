// Spirits - The ancestors haunting your boyfriend
// Each spirit requires research to discover, then a dice challenge to banish

export const SPIRITS = {
  // ===== COLONIAL ERA =====
  pilgrimGhost: {
    id: 'pilgrimGhost',
    name: 'Ezekiel Blackwood',
    title: 'The Founding Father',
    era: 'colonial',
    image: 'assets/spirits/PilgrimGhostMan.png',
    description: 'The first Blackwood to settle in New England. Made some... questionable deals.',
    flavor: '"This land was promised to me. BY WHAT LIVES BENEATH."',
    tier: 1,
    researchRequired: 8,
    challengeRequirement: {
      type: 'score',
      target: 25,
      description: 'Score 25 or more'
    },
    health: 3,
    damage: 2,
    weakness: 'religious',
    resistance: 'family',
    abilities: [
      {
        name: 'Puritan Judgment',
        description: 'Dice showing 6 are reduced to 1',
        trigger: 'onRoll'
      }
    ],
    reward: {
      research: 5,
      diceFace: 'pilgrimCross'
    },
    lore: 'Arrived in 1692. The same year as the trials. Coincidence? No.'
  },

  witchSpirit: {
    id: 'witchSpirit',
    name: 'Abigail Blackwood',
    title: 'The Accused',
    era: 'colonial',
    image: 'assets/spirits/Witch.png',
    description: 'Accused of witchcraft. She wasn\'t a witch then. She is now.',
    flavor: '"They burned me for nothing. Now I burn for EVERYTHING."',
    tier: 2,
    researchRequired: 12,
    challengeRequirement: {
      type: 'pairs',
      count: 3,
      description: 'Roll 3 pairs'
    },
    health: 4,
    damage: 3,
    weakness: 'water',
    resistance: 'fire',
    abilities: [
      {
        name: 'Hex',
        description: 'One random die is cursed - always rolls 1',
        trigger: 'onChallengeStart'
      },
      {
        name: 'Coven\'s Revenge',
        description: 'If you roll three 1s, take 2 extra damage',
        trigger: 'onRoll'
      }
    ],
    reward: {
      research: 8,
      diceFace: 'hexMark'
    },
    lore: 'Her journal was found in the Blackwood basement. The last entry just says "THEY\'LL PAY" 400 times.'
  },

  // ===== VICTORIAN ERA =====
  ghostWoman01: {
    id: 'ghostWoman01',
    name: 'Eleanor Blackwood',
    title: 'The Mourning Widow',
    era: 'victorian',
    image: 'assets/spirits/GhostWomen01.png',
    description: 'Mourned her husband for 40 years. He wasn\'t dead. She knew.',
    flavor: '"I wore black for him every day. Every. Single. Day."',
    tier: 1,
    researchRequired: 10,
    challengeRequirement: {
      type: 'score',
      target: 30,
      description: 'Score 30 or more'
    },
    health: 3,
    damage: 2,
    weakness: 'love',
    resistance: 'death',
    abilities: [
      {
        name: 'Endless Grief',
        description: 'Your highest die is halved (rounded down)',
        trigger: 'onScore'
      }
    ],
    reward: {
      research: 6,
      diceFace: 'mourningStar'
    },
    lore: 'She knew he was in the walls. She could hear him scratching.'
  },

  ghostWoman02: {
    id: 'ghostWoman02',
    name: 'Cordelia Blackwood',
    title: 'The Poisoner',
    era: 'victorian',
    image: 'assets/spirits/GhostWomen02.png',
    description: 'Outlived three husbands. All died of "natural causes." All very wealthy.',
    flavor: '"Arsenic in the tea, dear? Don\'t mind if I do."',
    tier: 2,
    researchRequired: 14,
    challengeRequirement: {
      type: 'straight',
      length: 4,
      description: 'Roll a straight of 4'
    },
    health: 5,
    damage: 2,
    weakness: 'truth',
    resistance: 'poison',
    abilities: [
      {
        name: 'Poisoned Dice',
        description: 'Each reroll costs 1 sanity',
        trigger: 'onReroll'
      },
      {
        name: 'Sweet Smile',
        description: 'First roll always looks better than it is (-3 to actual score)',
        trigger: 'onFirstRoll'
      }
    ],
    reward: {
      research: 10,
      diceFace: 'poisonVial'
    },
    lore: 'Her cookbook was found. The recipes were... not for food.'
  },

  vampire: {
    id: 'vampire',
    name: 'Lord Vladislav Blackwood',
    title: 'The Immigrant',
    era: 'victorian',
    image: 'assets/spirits/Vampire.png',
    description: 'Came from the old country. Brought old country problems.',
    flavor: '"The Blackwood blood called to me across the ocean. So rich. So... delicious."',
    tier: 3,
    researchRequired: 18,
    challengeRequirement: {
      type: 'specific',
      values: [1, 3, 5],
      description: 'Roll at least one 1, one 3, and one 5'
    },
    health: 6,
    damage: 4,
    weakness: 'sunlight',
    resistance: 'night',
    abilities: [
      {
        name: 'Blood Drain',
        description: 'Heals 1 health for every 1 you roll',
        trigger: 'onRoll'
      },
      {
        name: 'Hypnotic Gaze',
        description: 'You must reroll your highest die',
        trigger: 'onRoll'
      }
    ],
    reward: {
      research: 12,
      diceFace: 'bloodMoon'
    },
    lore: 'Immigration records show he arrived in 1887. Cemetery records show he was buried in 1886.'
  },

  // ===== EARLY 20TH CENTURY =====
  mummy: {
    id: 'mummy',
    name: 'Professor Thaddeus Blackwood',
    title: 'The Archaeologist',
    era: 'early20th',
    image: 'assets/spirits/Mummy .png',
    description: 'Brought back more than artifacts from Egypt. Much more.',
    flavor: '"The curse isn\'t real, they said. It\'s just superstition, they said."',
    tier: 2,
    researchRequired: 15,
    challengeRequirement: {
      type: 'score',
      target: 35,
      description: 'Score 35 or more'
    },
    health: 5,
    damage: 3,
    weakness: 'fire',
    resistance: 'time',
    abilities: [
      {
        name: 'Ancient Curse',
        description: 'Bandages wrap one die - it cannot be rerolled',
        trigger: 'onChallengeStart'
      },
      {
        name: 'Sands of Time',
        description: 'Each turn the challenge continues, requirements increase by 2',
        trigger: 'onTurnEnd'
      }
    ],
    reward: {
      research: 10,
      diceFace: 'scarab'
    },
    lore: 'His expedition notes mention "the deal." The next 50 pages are just hieroglyphics.'
  },

  clown: {
    id: 'clown',
    name: 'Pennywhistle Blackwood',
    title: 'The Entertainer',
    era: 'early20th',
    image: 'assets/spirits/Clown.png',
    description: 'Ran away to join the circus. The circus ran away from him.',
    flavor: '"Everyone laughs at the clown. EVERYONE. WHETHER THEY WANT TO OR NOT."',
    tier: 3,
    researchRequired: 20,
    challengeRequirement: {
      type: 'allSame',
      description: 'Roll all dice showing the same number'
    },
    health: 7,
    damage: 5,
    weakness: 'courage',
    resistance: 'fear',
    abilities: [
      {
        name: 'Balloon Animals',
        description: 'Summons balloon dice that pop on 1s (lose that die for the challenge)',
        trigger: 'onChallengeStart'
      },
      {
        name: 'Madness Honk',
        description: 'Random dice swap values with each other',
        trigger: 'onRoll'
      },
      {
        name: 'We All Float',
        description: 'If your score is exactly 13, you win. Otherwise, take 3 damage.',
        trigger: 'onScore'
      }
    ],
    reward: {
      research: 15,
      diceFace: 'floatingBalloon'
    },
    lore: 'The circus burned down in 1923. All the other performers were found. He was not.'
  },

  // ===== MODERN ERA =====
  greenGooMonster: {
    id: 'greenGooMonster',
    name: 'The Blackwood Experiment',
    title: 'Failed Chemistry Project',
    era: 'modern',
    image: 'assets/spirits/GreenGooMonster.png',
    description: 'Derek\'s uncle tried to cure the family curse with science. This happened instead.',
    flavor: '"BLLUURRRRGGHH" (Translation: "The formula was almost right.")',
    tier: 1,
    researchRequired: 8,
    challengeRequirement: {
      type: 'evens',
      count: 4,
      description: 'Roll 4 even numbers'
    },
    health: 4,
    damage: 2,
    weakness: 'cold',
    resistance: 'acid',
    abilities: [
      {
        name: 'Corrosive',
        description: 'Dissolves your lowest die each turn',
        trigger: 'onTurnEnd'
      }
    ],
    reward: {
      research: 5,
      diceFace: 'toxicGlow'
    },
    lore: 'The basement is still off-limits. The goo is still spreading. Slowly.'
  },

  lemonMonster: {
    id: 'lemonMonster',
    name: 'The Citrus Abomination',
    title: 'Cursed Lemonade Stand',
    era: 'modern',
    image: 'assets/spirits/LemonMonster.png',
    description: 'Young Derek\'s lemonade stand gained sentience. It was not happy about it.',
    flavor: '"WHEN LIFE GIVES YOU LEMONS, LIFE GETS SQUEEZED."',
    tier: 1,
    researchRequired: 6,
    challengeRequirement: {
      type: 'score',
      target: 20,
      description: 'Score 20 or more'
    },
    health: 3,
    damage: 1,
    weakness: 'sweet',
    resistance: 'sour',
    abilities: [
      {
        name: 'Sour Taste',
        description: 'All rolls taste like disappointment (no mechanical effect, just sad)',
        trigger: 'flavor'
      },
      {
        name: 'Citric Acid',
        description: '5s and 6s are reduced by 1',
        trigger: 'onRoll'
      }
    ],
    reward: {
      research: 4,
      diceFace: 'sourPower'
    },
    lore: 'The health department has visited 47 times. They keep forgetting why.'
  },

  hypnoAnteater: {
    id: 'hypnoAnteater',
    name: 'Mr. Snuffles',
    title: 'Derek\'s "Imaginary" Friend',
    era: 'modern',
    image: 'assets/spirits/HypnoAnteater.png',
    description: 'Not imaginary. Never was. Has been watching. Waiting. Snuffling.',
    flavor: '"We\'ve been friends since Derek was three. He\'s MINE."',
    tier: 2,
    researchRequired: 16,
    challengeRequirement: {
      type: 'hypnotic',
      pattern: [1, 2, 3, 2, 1],
      description: 'Roll a hypnotic pattern: 1-2-3-2-1'
    },
    health: 5,
    damage: 3,
    weakness: 'reality',
    resistance: 'dreams',
    abilities: [
      {
        name: 'Hypnotic Spiral',
        description: 'You must roll dice in a specific pattern or take 2 damage',
        trigger: 'onRoll'
      },
      {
        name: 'Ant Farm',
        description: 'Summons ant dice - they\'re weak (max 2) but there are MANY',
        trigger: 'onChallengeStart'
      }
    ],
    reward: {
      research: 12,
      diceFace: 'spiralEye'
    },
    lore: 'Derek\'s childhood drawings all feature Mr. Snuffles. In every single one, he\'s getting closer.'
  },

  ghostDog: {
    id: 'ghostDog',
    name: 'Old Yeller Blackwood',
    title: 'The Family Pet',
    era: 'modern',
    image: 'assets/spirits/GhostDog.png',
    description: 'The Blackwood family dog. Died in 1987. Still a good boy. Mostly.',
    flavor: '"*ghostly bark* *ghostly tail wag* *ghostly existential dread*"',
    tier: 1,
    researchRequired: 5,
    challengeRequirement: {
      type: 'score',
      target: 15,
      description: 'Score 15 or more'
    },
    health: 2,
    damage: 1,
    weakness: 'treats',
    resistance: 'affection',
    abilities: [
      {
        name: 'Loyal to a Fault',
        description: 'Doesn\'t want to hurt you, but will if Derek is threatened',
        trigger: 'passive'
      },
      {
        name: 'Fetch',
        description: 'Steals your highest die and brings it back as a 4',
        trigger: 'onRoll'
      }
    ],
    reward: {
      research: 3,
      diceFace: 'goodBoyBone'
    },
    lore: 'He was buried in the pet cemetery. Yes, THAT pet cemetery. Mistakes were made.'
  }
};

export const SPIRIT_TIERS = {
  1: { name: 'Restless', color: '#6a9955' },
  2: { name: 'Vengeful', color: '#c9944a' },
  3: { name: 'Malevolent', color: '#c94a4a' }
};

export const getSpiritsbyEra = (era) => {
  return Object.values(SPIRITS).filter(s => s.era === era);
};

export const getSpiritsByTier = (tier) => {
  return Object.values(SPIRITS).filter(s => s.tier === tier);
};

export const getRandomSpirit = (maxTier = 3) => {
  const available = Object.values(SPIRITS).filter(s => s.tier <= maxTier);
  return available[Math.floor(Math.random() * available.length)];
};
