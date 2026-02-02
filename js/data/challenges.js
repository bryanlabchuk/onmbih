// Challenge System - Research and Spirit Challenge Events
// With varied win conditions, tiers, and difficulty progression

import { CHALLENGE_CONDITIONS } from './diceSystem.js';

// ===== PLAYER LEVEL SYSTEM =====
export const PLAYER_LEVELS = {
  1: { name: 'Novice Investigator', researchRequired: 0, maxAllies: 3, maxDice: 5 },
  2: { name: 'Amateur Ghost Hunter', researchRequired: 50, maxAllies: 4, maxDice: 5 },
  3: { name: 'Paranormal Researcher', researchRequired: 150, maxAllies: 4, maxDice: 6 },
  4: { name: 'Spirit Medium', researchRequired: 300, maxAllies: 5, maxDice: 6 },
  5: { name: 'Exorcist Apprentice', researchRequired: 500, maxAllies: 5, maxDice: 7 },
  6: { name: 'Master Exorcist', researchRequired: 750, maxAllies: 6, maxDice: 7 },
  7: { name: 'Blackwood Savior', researchRequired: 1000, maxAllies: 6, maxDice: 8 }
};

export function getPlayerLevel(totalResearchEarned) {
  let level = 1;
  for (const [lvl, data] of Object.entries(PLAYER_LEVELS)) {
    if (totalResearchEarned >= data.researchRequired) {
      level = parseInt(lvl);
    }
  }
  return level;
}

export function getLevelData(level) {
  return PLAYER_LEVELS[level] || PLAYER_LEVELS[1];
}

// ===== CHALLENGE TIERS =====
export const CHALLENGE_TIERS = {
  easy: { 
    name: 'Simple', 
    color: '#4a9b6a', 
    requiredLevel: 1,
    researchReward: { min: 5, max: 15 },
    icon: '⭐'
  },
  medium: { 
    name: 'Moderate', 
    color: '#c9944a', 
    requiredLevel: 2,
    researchReward: { min: 15, max: 30 },
    icon: '⭐⭐'
  },
  hard: { 
    name: 'Difficult', 
    color: '#c94a4a', 
    requiredLevel: 4,
    researchReward: { min: 30, max: 50 },
    icon: '⭐⭐⭐'
  },
  expert: { 
    name: 'Expert', 
    color: '#9b4a9b', 
    requiredLevel: 6,
    researchReward: { min: 50, max: 80 },
    icon: '⭐⭐⭐⭐'
  }
};

// ===== RESEARCH CHALLENGE CONDITIONS =====
// These are the building blocks for challenge requirements
export const CONDITION_TYPES = {
  // Score-based
  minTotal: (target) => ({
    type: 'minTotal',
    target,
    description: `Roll at least ${target} total`,
    icon: '🎯',
    check: (dice) => dice.reduce((sum, d) => sum + (d.value || 0), 0) >= target
  }),
  
  maxTotal: (target) => ({
    type: 'maxTotal',
    target,
    description: `Roll no more than ${target} total`,
    icon: '⬇️',
    check: (dice) => dice.reduce((sum, d) => sum + (d.value || 0), 0) <= target
  }),
  
  exactTotal: (target) => ({
    type: 'exactTotal',
    target,
    description: `Roll exactly ${target}`,
    icon: '🎯',
    check: (dice) => dice.reduce((sum, d) => sum + (d.value || 0), 0) === target
  }),

  // Pattern-based
  pair: () => ({
    type: 'pair',
    description: 'Roll at least one pair',
    icon: '👯',
    check: (dice) => hasPair(dice)
  }),
  
  twoPair: () => ({
    type: 'twoPair',
    description: 'Roll two pairs',
    icon: '👯👯',
    check: (dice) => countPairs(dice) >= 2
  }),
  
  threeOfKind: () => ({
    type: 'threeOfKind',
    description: 'Roll three of a kind',
    icon: '🎰',
    check: (dice) => hasNOfKind(dice, 3)
  }),
  
  fourOfKind: () => ({
    type: 'fourOfKind',
    description: 'Roll four of a kind',
    icon: '🎰🎰',
    check: (dice) => hasNOfKind(dice, 4)
  }),
  
  fullHouse: () => ({
    type: 'fullHouse',
    description: 'Roll a full house (3 + 2)',
    icon: '🏠',
    check: (dice) => isFullHouse(dice)
  }),
  
  straight: (length) => ({
    type: 'straight',
    target: length,
    description: `Roll a straight of ${length}`,
    icon: '📊',
    check: (dice) => longestStraight(dice) >= length
  }),

  // Specific values
  containsValue: (value, count = 1) => ({
    type: 'containsValue',
    value, count,
    description: `Roll at least ${count} ${value}${count > 1 ? 's' : ''}`,
    icon: `${value}️⃣`,
    check: (dice) => dice.filter(d => d.value === value).length >= count
  }),
  
  noValue: (value) => ({
    type: 'noValue',
    value,
    description: `Roll no ${value}s`,
    icon: `🚫${value}`,
    check: (dice) => !dice.some(d => d.value === value)
  }),
  
  allAbove: (value) => ({
    type: 'allAbove',
    value,
    description: `All dice must be ${value} or higher`,
    icon: '⬆️',
    check: (dice) => dice.every(d => d.value >= value)
  }),
  
  allBelow: (value) => ({
    type: 'allBelow',
    value,
    description: `All dice must be ${value} or lower`,
    icon: '⬇️',
    check: (dice) => dice.every(d => d.value <= value)
  }),

  // Even/Odd
  allEven: () => ({
    type: 'allEven',
    description: 'All dice must be even',
    icon: '2️⃣',
    check: (dice) => dice.every(d => d.value % 2 === 0)
  }),
  
  allOdd: () => ({
    type: 'allOdd',
    description: 'All dice must be odd',
    icon: '1️⃣',
    check: (dice) => dice.every(d => d.value % 2 !== 0)
  }),
  
  noEven: () => ({
    type: 'noEven',
    description: 'No even numbers allowed',
    icon: '🚫2',
    check: (dice) => !dice.some(d => d.value % 2 === 0)
  }),
  
  noOdd: () => ({
    type: 'noOdd',
    description: 'No odd numbers allowed',
    icon: '🚫1',
    check: (dice) => !dice.some(d => d.value % 2 !== 0)
  }),

  // Color-based
  hasColor: (color, count = 1) => ({
    type: 'hasColor',
    color, count,
    description: `Use at least ${count} ${color} di${count > 1 ? 'ce' : 'e'}`,
    icon: '🎨',
    check: (dice) => dice.filter(d => d.color === color).length >= count
  }),
  
  noColor: (color) => ({
    type: 'noColor',
    color,
    description: `No ${color} dice allowed`,
    icon: '🚫🎨',
    check: (dice) => !dice.some(d => d.color === color)
  }),
  
  allSameColor: () => ({
    type: 'allSameColor',
    description: 'All dice must be the same color',
    icon: '🌈',
    check: (dice) => {
      const colors = dice.map(d => d.color);
      return new Set(colors).size === 1;
    }
  }),

  // Shape-based
  maxSides: (sides) => ({
    type: 'maxSides',
    sides,
    description: `Only d${sides} or smaller dice`,
    icon: '📐',
    check: (dice) => dice.every(d => (d.sides || 6) <= sides)
  }),
  
  hasShape: (shape, count = 1) => ({
    type: 'hasShape',
    shape, count,
    description: `Use at least ${count} ${shape.toUpperCase()}`,
    icon: '🎲',
    check: (dice) => dice.filter(d => d.shape === shape).length >= count
  }),

  // Roll restrictions
  maxRolls: (rolls) => ({
    type: 'maxRolls',
    rolls,
    description: `Complete in ${rolls} roll${rolls > 1 ? 's' : ''} or less`,
    icon: '🔄',
    checkRolls: true,
    check: (dice, rollsUsed) => rollsUsed <= rolls
  }),
  
  noRerolls: () => ({
    type: 'noRerolls',
    description: 'No re-rolls allowed (1 roll only)',
    icon: '🚫🔄',
    checkRolls: true,
    check: (dice, rollsUsed) => rollsUsed <= 1
  }),

  // Special patterns
  allDifferent: () => ({
    type: 'allDifferent',
    description: 'All dice show different values',
    icon: '🔢',
    check: (dice) => new Set(dice.map(d => d.value)).size === dice.length
  }),
  
  allSame: () => ({
    type: 'allSame',
    description: 'All dice show the same value',
    icon: '🎯',
    check: (dice) => new Set(dice.map(d => d.value)).size === 1
  }),
  
  ascending: () => ({
    type: 'ascending',
    description: 'Dice in ascending order (lock order matters)',
    icon: '📈',
    check: (dice) => {
      for (let i = 1; i < dice.length; i++) {
        if (dice[i].value < dice[i-1].value) return false;
      }
      return true;
    }
  }),
  
  descending: () => ({
    type: 'descending',
    description: 'Dice in descending order (lock order matters)',
    icon: '📉',
    check: (dice) => {
      for (let i = 1; i < dice.length; i++) {
        if (dice[i].value > dice[i-1].value) return false;
      }
      return true;
    }
  })
};

// ===== RESEARCH CHALLENGES =====
// Grouped by tier, each with unique conditions
export const RESEARCH_CHALLENGES = {
  // EASY TIER - Simple conditions, achievable by anyone
  easy: [
    {
      id: 'simple_score',
      name: 'Basic Research',
      description: 'Gather some basic information about the spirits.',
      flavorText: '"Every investigation starts with the fundamentals." - Town Librarian',
      conditions: [CONDITION_TYPES.minTotal(12)],
      reward: { research: 8 }
    },
    {
      id: 'find_pair',
      name: 'Pattern Recognition',
      description: 'Notice recurring patterns in the spirit activity.',
      flavorText: '"Two of the same... that can\'t be coincidence."',
      conditions: [CONDITION_TYPES.pair()],
      reward: { research: 10 }
    },
    {
      id: 'lucky_sixes',
      name: 'Lucky Break',
      description: 'Sometimes the spirits reveal themselves.',
      flavorText: '"A 6! That\'s considered lucky in ghost hunting."',
      conditions: [CONDITION_TYPES.containsValue(6, 1)],
      reward: { research: 8 }
    },
    {
      id: 'no_ones',
      name: 'Avoid Bad Omens',
      description: 'Ones are bad luck in paranormal research.',
      flavorText: '"Whatever you do, don\'t roll a one!"',
      conditions: [CONDITION_TYPES.noValue(1), CONDITION_TYPES.minTotal(10)],
      reward: { research: 12 }
    },
    {
      id: 'steady_hand',
      name: 'Steady Readings',
      description: 'Get consistent EMF readings.',
      flavorText: '"Keep the meter steady... steady..."',
      conditions: [CONDITION_TYPES.allAbove(2)],
      reward: { research: 10 }
    }
  ],

  // MEDIUM TIER - Multiple conditions or harder patterns
  medium: [
    {
      id: 'double_pattern',
      name: 'Twin Manifestations',
      description: 'Two pairs indicate a strong presence.',
      flavorText: '"Double manifestation! This is significant!"',
      conditions: [CONDITION_TYPES.twoPair()],
      reward: { research: 20 }
    },
    {
      id: 'color_focus_blue',
      name: 'Cold Spot Analysis',
      description: 'Blue dice resonate with spectral cold.',
      flavorText: '"The temperature dropped 20 degrees..."',
      conditions: [CONDITION_TYPES.hasColor('blue', 2), CONDITION_TYPES.minTotal(15)],
      reward: { research: 22 }
    },
    {
      id: 'quick_study',
      name: 'Instinctive Reading',
      description: 'Trust your first impression.',
      flavorText: '"First roll, final answer. Trust your gut."',
      conditions: [CONDITION_TYPES.noRerolls(), CONDITION_TYPES.minTotal(15)],
      reward: { research: 25 }
    },
    {
      id: 'old_ways',
      name: 'Traditional Methods',
      description: 'Sometimes the old ways work best.',
      flavorText: '"My grandmother only ever used standard dice."',
      conditions: [CONDITION_TYPES.maxSides(6), CONDITION_TYPES.minTotal(18)],
      reward: { research: 22 }
    },
    {
      id: 'spirit_sequence',
      name: 'Spirit Sequence',
      description: 'Detect the pattern in the haunting.',
      flavorText: '"1, 2, 3, 4... it\'s a message!"',
      conditions: [CONDITION_TYPES.straight(4)],
      reward: { research: 25 }
    },
    {
      id: 'even_energy',
      name: 'Balanced Energy',
      description: 'Even numbers stabilize the connection.',
      flavorText: '"Balance in all things, especially the supernatural."',
      conditions: [CONDITION_TYPES.allEven(), CONDITION_TYPES.minTotal(12)],
      reward: { research: 20 }
    }
  ],

  // HARD TIER - Complex combinations
  hard: [
    {
      id: 'triple_threat',
      name: 'Triple Manifestation',
      description: 'Three matching readings confirm a major presence.',
      flavorText: '"Three of a kind... this spirit is STRONG."',
      conditions: [CONDITION_TYPES.threeOfKind(), CONDITION_TYPES.minTotal(18)],
      reward: { research: 40 }
    },
    {
      id: 'full_house_haunting',
      name: 'Full House Haunting',
      description: 'A full house pattern reveals family connections.',
      flavorText: '"A full house! The Blackwood family tree is showing itself."',
      conditions: [CONDITION_TYPES.fullHouse()],
      reward: { research: 45 }
    },
    {
      id: 'chromatic_research',
      name: 'Chromatic Resonance',
      description: 'Matching colors amplify spiritual readings.',
      flavorText: '"When the dice align in color, the spirits speak clearly."',
      conditions: [CONDITION_TYPES.allSameColor(), CONDITION_TYPES.minTotal(20)],
      reward: { research: 40 }
    },
    {
      id: 'perfect_sequence',
      name: 'Perfect Sequence',
      description: 'A long sequence reveals the spirit\'s history.',
      flavorText: '"1692, 1693, 1694, 1695, 1696... the founding years!"',
      conditions: [CONDITION_TYPES.straight(5)],
      reward: { research: 50 }
    },
    {
      id: 'no_room_for_error',
      name: 'Critical Reading',
      description: 'One chance to get it right.',
      flavorText: '"The spirit only shows itself once. Don\'t blink."',
      conditions: [CONDITION_TYPES.noRerolls(), CONDITION_TYPES.pair(), CONDITION_TYPES.minTotal(18)],
      reward: { research: 45 }
    },
    {
      id: 'high_stakes',
      name: 'High Stakes Research',
      description: 'Go big or go home.',
      flavorText: '"We need numbers. BIG numbers."',
      conditions: [CONDITION_TYPES.allAbove(4), CONDITION_TYPES.minTotal(25)],
      reward: { research: 42 }
    }
  ],

  // EXPERT TIER - Near-impossible challenges
  expert: [
    {
      id: 'quad_manifestation',
      name: 'Quad Manifestation',
      description: 'Four matching readings - the spirit reveals its true form.',
      flavorText: '"FOUR of a kind?! I\'ve never seen readings like this!"',
      conditions: [CONDITION_TYPES.fourOfKind()],
      reward: { research: 70 }
    },
    {
      id: 'perfect_alignment',
      name: 'Perfect Alignment',
      description: 'Every die must be unique and high.',
      flavorText: '"Total alignment of the spiritual plane..."',
      conditions: [CONDITION_TYPES.allDifferent(), CONDITION_TYPES.allAbove(3), CONDITION_TYPES.minTotal(25)],
      reward: { research: 65 }
    },
    {
      id: 'ascension_pattern',
      name: 'Ascension Pattern',
      description: 'The spirit rises through the numbers.',
      flavorText: '"Each number higher than the last... it\'s ascending!"',
      conditions: [CONDITION_TYPES.ascending(), CONDITION_TYPES.allDifferent()],
      reward: { research: 60 }
    },
    {
      id: 'purist_challenge',
      name: 'Purist Method',
      description: 'Old dice, no rerolls, high score.',
      flavorText: '"The ancient way. Only true skill will succeed."',
      conditions: [
        CONDITION_TYPES.maxSides(6), 
        CONDITION_TYPES.noRerolls(), 
        CONDITION_TYPES.minTotal(22)
      ],
      reward: { research: 75 }
    },
    {
      id: 'chromatic_master',
      name: 'Chromatic Mastery',
      description: 'Perfect color coordination with high rolls.',
      flavorText: '"Color, pattern, and power - all aligned perfectly."',
      conditions: [
        CONDITION_TYPES.allSameColor(),
        CONDITION_TYPES.threeOfKind(),
        CONDITION_TYPES.minTotal(20)
      ],
      reward: { research: 80 }
    }
  ]
};

// ===== LOCATION ENVIRONMENTAL EFFECTS =====
export const LOCATION_ENVIRONMENTS = {
  home: {
    name: 'Comfortable',
    description: 'The familiar surroundings help you focus.',
    effects: [
      { type: 'bonus_rolls', value: 1, description: '+1 roll per round' }
    ],
    ambiance: 'warm'
  },
  
  friendsHouse: {
    name: 'Supportive',
    description: 'Friends cheer you on.',
    effects: [
      { type: 'reroll_ones', value: true, description: 'May reroll 1s once' }
    ],
    ambiance: 'friendly'
  },
  
  library: {
    name: 'Scholarly',
    description: 'Ancient knowledge enhances research.',
    effects: [
      { type: 'research_multiplier', value: 1.5, description: '+50% research gained' },
      { type: 'max_sides', value: 8, description: 'Only d8 or smaller allowed' }
    ],
    ambiance: 'studious'
  },
  
  townHall: {
    name: 'Official',
    description: 'Bureaucracy demands precision.',
    effects: [
      { type: 'bonus_pairs', value: 5, description: '+5 bonus for pairs' },
      { type: 'penalty_low', value: -2, description: '-2 penalty for rolls under 3' }
    ],
    ambiance: 'formal'
  },
  
  bank: {
    name: 'Secure',
    description: 'The vault protects against interference.',
    effects: [
      { type: 'lock_protection', value: true, description: 'Locked dice cannot be cursed' },
      { type: 'gold_bonus', value: 3, description: '+3 for each gold die' }
    ],
    ambiance: 'cold'
  },
  
  mall: {
    name: 'Chaotic',
    description: 'Crowds create unpredictable energy.',
    effects: [
      { type: 'random_reroll', value: 1, description: 'One random die rerolls each turn' },
      { type: 'bonus_variety', value: 3, description: '+3 if all dice are different' }
    ],
    ambiance: 'noisy'
  },
  
  electronicsStore: {
    name: 'Amplified',
    description: 'EMF equipment boosts readings.',
    effects: [
      { type: 'sixes_explode', value: true, description: '6s add a bonus d6 roll' },
      { type: 'modifier_discount', value: 0.2, description: '20% off die modifications' }
    ],
    ambiance: 'electric'
  },
  
  occultStore: {
    name: 'Mystical',
    description: 'Ancient artifacts resonate with spirits.',
    effects: [
      { type: 'spirit_damage', value: 1, description: '+1 damage to spirits' },
      { type: 'purple_power', value: 2, description: '+2 for each purple die' },
      { type: 'curse_risk', value: 0.1, description: '10% chance of curse per roll' }
    ],
    ambiance: 'ethereal'
  },
  
  sportsStore: {
    name: 'Competitive',
    description: 'Channel that winning energy.',
    effects: [
      { type: 'high_roller', value: 5, description: '+5 if highest die is 6+' },
      { type: 'all_or_nothing', value: true, description: 'Must use all rolls or forfeit' }
    ],
    ambiance: 'energetic'
  },
  
  sodaShoppe: {
    name: 'Nostalgic',
    description: 'Simpler times, simpler rules.',
    effects: [
      { type: 'sanity_heal', value: 5, description: '+5 sanity after each challenge' },
      { type: 'max_sides', value: 6, description: 'Only d6 allowed' }
    ],
    ambiance: 'retro'
  },
  
  restaurant: {
    name: 'Refined',
    description: 'Elegance demands excellence.',
    effects: [
      { type: 'full_house_bonus', value: 20, description: '+20 for full house' },
      { type: 'min_total', value: 15, description: 'Must roll at least 15 to succeed' }
    ],
    ambiance: 'elegant'
  },
  
  hairSalon: {
    name: 'Gossipy',
    description: 'Rumors fly, information flows.',
    effects: [
      { type: 'info_reveal', value: true, description: 'Reveals one spirit weakness' },
      { type: 'distracted', value: -1, description: '-1 to focus (max rolls)' }
    ],
    ambiance: 'chatty'
  },
  
  school: {
    name: 'Educational',
    description: 'Learning environment boosts research.',
    effects: [
      { type: 'research_multiplier', value: 1.25, description: '+25% research gained' },
      { type: 'straight_bonus', value: 10, description: '+10 for straights' }
    ],
    ambiance: 'academic'
  },
  
  graveyard: {
    name: 'Haunted',
    description: 'The veil between worlds is thin here.',
    effects: [
      { type: 'spirit_connection', value: 2, description: '+2 to all spirit challenges' },
      { type: 'sanity_drain', value: 3, description: '-3 sanity per challenge' },
      { type: 'ghost_dice', value: true, description: 'Ghost-colored dice roll twice' }
    ],
    ambiance: 'spooky'
  },
  
  abandonedMansion: {
    name: 'Terrifying',
    description: 'Maximum risk, maximum reward.',
    effects: [
      { type: 'research_multiplier', value: 2.0, description: 'Double research gained' },
      { type: 'spirit_damage', value: 2, description: '+2 damage to spirits' },
      { type: 'sanity_drain', value: 5, description: '-5 sanity per challenge' },
      { type: 'curse_risk', value: 0.25, description: '25% chance of curse per roll' }
    ],
    ambiance: 'terrifying'
  },
  
  church: {
    name: 'Sacred',
    description: 'Holy ground protects the faithful.',
    effects: [
      { type: 'curse_immunity', value: true, description: 'Immune to curses' },
      { type: 'sanity_heal', value: 10, description: '+10 sanity after each challenge' },
      { type: 'no_black_dice', value: true, description: 'Black dice are forbidden' }
    ],
    ambiance: 'peaceful'
  }
};

// ===== HELPER FUNCTIONS =====
function hasPair(dice) {
  const counts = {};
  dice.forEach(d => { counts[d.value] = (counts[d.value] || 0) + 1; });
  return Object.values(counts).some(c => c >= 2);
}

function countPairs(dice) {
  const counts = {};
  dice.forEach(d => { counts[d.value] = (counts[d.value] || 0) + 1; });
  return Object.values(counts).filter(c => c >= 2).length;
}

function hasNOfKind(dice, n) {
  const counts = {};
  dice.forEach(d => { counts[d.value] = (counts[d.value] || 0) + 1; });
  return Object.values(counts).some(c => c >= n);
}

function isFullHouse(dice) {
  const counts = {};
  dice.forEach(d => { counts[d.value] = (counts[d.value] || 0) + 1; });
  const values = Object.values(counts);
  return values.includes(3) && values.includes(2);
}

function longestStraight(dice) {
  const uniqueValues = [...new Set(dice.map(d => d.value))].sort((a, b) => a - b);
  let longest = 1, current = 1;
  for (let i = 1; i < uniqueValues.length; i++) {
    if (uniqueValues[i] === uniqueValues[i-1] + 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

// ===== CHALLENGE GENERATOR =====
export function generateChallenges(playerLevel, count = 3, forceTier = null) {
  const availableTiers = Object.entries(CHALLENGE_TIERS)
    .filter(([_, tier]) => playerLevel >= tier.requiredLevel)
    .map(([id, _]) => id);
  
  const challenges = [];
  
  for (let i = 0; i < count; i++) {
    let tier;
    
    // Use forced tier if specified and available
    if (forceTier && RESEARCH_CHALLENGES[forceTier]) {
      tier = forceTier;
    } else {
      // Weight towards appropriate difficulty
      const tierWeights = {
        easy: playerLevel <= 2 ? 3 : 1,
        medium: playerLevel >= 2 && playerLevel <= 4 ? 3 : 1,
        hard: playerLevel >= 4 ? 2 : 0,
        expert: playerLevel >= 6 ? 2 : 0
      };
      
      tier = weightedRandomTier(availableTiers, tierWeights);
    }
    
    const tierChallenges = RESEARCH_CHALLENGES[tier];
    
    if (tierChallenges && tierChallenges.length > 0) {
      const challenge = tierChallenges[Math.floor(Math.random() * tierChallenges.length)];
      challenges.push({
        ...challenge,
        tier,
        tierData: CHALLENGE_TIERS[tier]
      });
    }
  }
  
  return challenges;
}

function weightedRandomTier(tiers, weights) {
  const filteredTiers = tiers.filter(t => weights[t] > 0);
  const totalWeight = filteredTiers.reduce((sum, t) => sum + weights[t], 0);
  let random = Math.random() * totalWeight;
  
  for (const tier of filteredTiers) {
    random -= weights[tier];
    if (random <= 0) return tier;
  }
  
  return filteredTiers[0];
}

// ===== CHALLENGE CHECKER =====
export function checkChallengeConditions(challenge, dice, rollsUsed = 1) {
  const results = {
    success: true,
    conditions: []
  };
  
  // Prepare dice data for checking
  const diceData = dice.map(d => ({
    value: d.currentValue || d.value || 0,
    color: d.color || 'white',
    shape: d.shape || 'd6',
    sides: parseInt((d.shape || 'd6').replace('d', '')) || 6
  }));
  
  for (const condition of challenge.conditions) {
    let passed;
    
    if (condition.checkRolls) {
      passed = condition.check(diceData, rollsUsed);
    } else {
      passed = condition.check(diceData);
    }
    
    results.conditions.push({
      description: condition.description,
      icon: condition.icon,
      passed
    });
    
    if (!passed) {
      results.success = false;
    }
  }
  
  return results;
}

// ===== ENVIRONMENT EFFECT APPLIER =====
export function applyEnvironmentEffects(locationId, rollResult, gameState) {
  const environment = LOCATION_ENVIRONMENTS[locationId];
  if (!environment) return rollResult;
  
  let modified = { ...rollResult };
  const appliedEffects = [];
  
  for (const effect of environment.effects) {
    switch (effect.type) {
      case 'research_multiplier':
        if (modified.research) {
          modified.research = Math.floor(modified.research * effect.value);
          appliedEffects.push(effect.description);
        }
        break;
        
      case 'spirit_damage':
        modified.spiritDamageBonus = (modified.spiritDamageBonus || 0) + effect.value;
        appliedEffects.push(effect.description);
        break;
        
      case 'sanity_drain':
        modified.sanityChange = (modified.sanityChange || 0) - effect.value;
        appliedEffects.push(effect.description);
        break;
        
      case 'sanity_heal':
        modified.sanityChange = (modified.sanityChange || 0) + effect.value;
        appliedEffects.push(effect.description);
        break;
        
      // Add more effect handlers as needed
    }
  }
  
  modified.appliedEffects = appliedEffects;
  return modified;
}

export { hasPair, countPairs, hasNOfKind, isFullHouse, longestStraight };
