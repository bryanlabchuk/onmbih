// Comprehensive Dice System
// Handles dice properties, upgrades, scoring, and challenge conditions

// ===== DIE SHAPES =====
export const DIE_SHAPES = {
  d4: { sides: 4, name: 'D4', icon: '🔺', baseValues: [1, 2, 3, 4], unlockCost: 0 },
  d6: { sides: 6, name: 'D6', icon: '🎲', baseValues: [1, 2, 3, 4, 5, 6], unlockCost: 0 },
  d8: { sides: 8, name: 'D8', icon: '💎', baseValues: [1, 2, 3, 4, 5, 6, 7, 8], unlockCost: 50 },
  d10: { sides: 10, name: 'D10', icon: '🔷', baseValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], unlockCost: 100 },
  d12: { sides: 12, name: 'D12', icon: '⬡', baseValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], unlockCost: 200 },
  d20: { sides: 20, name: 'D20', icon: '🌟', baseValues: Array.from({length: 20}, (_, i) => i + 1), unlockCost: 500 }
};

// ===== DIE COLORS =====
export const DIE_COLORS = {
  white: { name: 'White', hex: '#e8e4dc', bonus: null, unlockCost: 0 },
  red: { name: 'Red', hex: '#c94a4a', bonus: 'combat', unlockCost: 20 },
  blue: { name: 'Blue', hex: '#4a7cc9', bonus: 'research', unlockCost: 20 },
  green: { name: 'Green', hex: '#4a9b6a', bonus: 'healing', unlockCost: 20 },
  purple: { name: 'Purple', hex: '#9b4a9b', bonus: 'spirit', unlockCost: 30 },
  gold: { name: 'Gold', hex: '#c9944a', bonus: 'multiplier', unlockCost: 50 },
  black: { name: 'Black', hex: '#2a2d38', bonus: 'curse', unlockCost: 40 },
  ghost: { name: 'Ghost', hex: '#6aa3c7', bonus: 'ethereal', unlockCost: 75 }
};

// ===== DIE MODIFIERS =====
export const DIE_MODIFIERS = {
  // Value modifiers
  plusOne: { 
    name: '+1', 
    description: 'Add 1 to all face values',
    effect: (values) => values.map(v => v + 1),
    unlockCost: 25 
  },
  plusTwo: { 
    name: '+2', 
    description: 'Add 2 to all face values',
    effect: (values) => values.map(v => v + 2),
    unlockCost: 50 
  },
  double: { 
    name: 'Double', 
    description: 'Double all face values',
    effect: (values) => values.map(v => v * 2),
    unlockCost: 100 
  },
  
  // Special modifiers
  reroll: { 
    name: 'Reroll', 
    description: 'Can reroll this die once per turn',
    effect: 'reroll',
    unlockCost: 30 
  },
  weighted: { 
    name: 'Weighted', 
    description: 'Higher values roll more often',
    effect: 'weighted_high',
    unlockCost: 40 
  },
  lightWeighted: { 
    name: 'Light', 
    description: 'Lower values roll more often (good for specific challenges)',
    effect: 'weighted_low',
    unlockCost: 40 
  },
  clone: { 
    name: 'Clone', 
    description: 'Copies the value of another die after rolling',
    effect: 'clone',
    unlockCost: 75 
  },
  negative: { 
    name: 'Negative', 
    description: 'Values become negative (useful for specific challenges)',
    effect: (values) => values.map(v => -v),
    unlockCost: 35 
  },
  wild: { 
    name: 'Wild', 
    description: 'Can count as any value for pattern matching',
    effect: 'wild',
    unlockCost: 100 
  },
  
  // Conditional modifiers
  exploding: { 
    name: 'Exploding', 
    description: 'On max value, roll again and add',
    effect: 'exploding',
    unlockCost: 60 
  },
  cursed: { 
    name: 'Cursed', 
    description: '+3 to value but deals 1 sanity damage',
    effect: 'cursed',
    unlockCost: 20 
  },
  blessed: { 
    name: 'Blessed', 
    description: 'Minimum roll is 3',
    effect: 'blessed',
    unlockCost: 45 
  },
  ghostly: { 
    name: 'Ghostly', 
    description: '+2 against spirits, -1 in research',
    effect: 'ghostly',
    unlockCost: 55 
  }
};

// ===== CHALLENGE CONDITIONS =====
export const CHALLENGE_CONDITIONS = {
  // Total-based
  totalAtLeast: (target) => ({
    type: 'total_min',
    target,
    description: `Roll a total of at least ${target}`,
    check: (dice) => dice.reduce((sum, d) => sum + (d.value || 0), 0) >= target
  }),
  
  totalExact: (target) => ({
    type: 'total_exact',
    target,
    description: `Roll exactly ${target}`,
    check: (dice) => dice.reduce((sum, d) => sum + (d.value || 0), 0) === target
  }),
  
  totalRange: (min, max) => ({
    type: 'total_range',
    min, max,
    description: `Roll between ${min} and ${max}`,
    check: (dice) => {
      const total = dice.reduce((sum, d) => sum + (d.value || 0), 0);
      return total >= min && total <= max;
    }
  }),
  
  // Pattern-based
  pairs: (count) => ({
    type: 'pairs',
    target: count,
    description: `Roll ${count} pair${count > 1 ? 's' : ''}`,
    check: (dice) => countPairs(dice) >= count
  }),
  
  threeOfAKind: () => ({
    type: 'three_of_kind',
    description: 'Roll three of a kind',
    check: (dice) => hasNOfAKind(dice, 3)
  }),
  
  fourOfAKind: () => ({
    type: 'four_of_kind',
    description: 'Roll four of a kind',
    check: (dice) => hasNOfAKind(dice, 4)
  }),
  
  fullHouse: () => ({
    type: 'full_house',
    description: 'Roll a full house (3 of a kind + pair)',
    check: (dice) => isFullHouse(dice)
  }),
  
  straight: (length) => ({
    type: 'straight',
    target: length,
    description: `Roll a straight of ${length}`,
    check: (dice) => longestStraight(dice) >= length
  }),
  
  // Specific value requirements
  containsValue: (value, count = 1) => ({
    type: 'contains',
    value, count,
    description: `Roll at least ${count} ${value}${count > 1 ? 's' : ''}`,
    check: (dice) => dice.filter(d => d.value === value).length >= count
  }),
  
  noValue: (value) => ({
    type: 'no_value',
    value,
    description: `Don't roll any ${value}s`,
    check: (dice) => !dice.some(d => d.value === value)
  }),
  
  allDifferent: () => ({
    type: 'all_different',
    description: 'All dice show different values',
    check: (dice) => new Set(dice.map(d => d.value)).size === dice.length
  }),
  
  allSame: () => ({
    type: 'all_same',
    description: 'All dice show the same value',
    check: (dice) => new Set(dice.map(d => d.value)).size === 1
  }),
  
  // Even/Odd
  allEven: () => ({
    type: 'all_even',
    description: 'All dice show even numbers',
    check: (dice) => dice.every(d => d.value % 2 === 0)
  }),
  
  allOdd: () => ({
    type: 'all_odd',
    description: 'All dice show odd numbers',
    check: (dice) => dice.every(d => d.value % 2 !== 0)
  }),
  
  // Special patterns
  ascending: () => ({
    type: 'ascending',
    description: 'Dice must be in ascending order (left to right)',
    check: (dice) => {
      for (let i = 1; i < dice.length; i++) {
        if (dice[i].value < dice[i-1].value) return false;
      }
      return true;
    }
  }),
  
  descending: () => ({
    type: 'descending', 
    description: 'Dice must be in descending order (left to right)',
    check: (dice) => {
      for (let i = 1; i < dice.length; i++) {
        if (dice[i].value > dice[i-1].value) return false;
      }
      return true;
    }
  }),
  
  palindrome: () => ({
    type: 'palindrome',
    description: 'Dice values read same forward and backward',
    check: (dice) => {
      const values = dice.map(d => d.value);
      const reversed = [...values].reverse();
      return values.every((v, i) => v === reversed[i]);
    }
  }),
  
  // Color-based (if dice have colors)
  colorMatch: (color, count) => ({
    type: 'color_match',
    color, count,
    description: `Roll ${count} ${color} dice`,
    check: (dice) => dice.filter(d => d.color === color).length >= count
  }),
  
  // Shape-based
  shapeBonus: (shape) => ({
    type: 'shape_bonus',
    shape,
    description: `${shape} dice get +2 to their value`,
    modifier: (dice) => dice.map(d => ({
      ...d,
      value: d.shape === shape ? d.value + 2 : d.value
    }))
  })
};

// ===== SCORING BONUSES =====
export const SCORING_BONUSES = {
  // Pattern bonuses
  pair: { name: 'Pair', points: 5, check: (dice) => countPairs(dice) >= 1 },
  twoPair: { name: 'Two Pair', points: 15, check: (dice) => countPairs(dice) >= 2 },
  threeOfKind: { name: 'Three of a Kind', points: 25, check: (dice) => hasNOfAKind(dice, 3) },
  fourOfKind: { name: 'Four of a Kind', points: 50, check: (dice) => hasNOfAKind(dice, 4) },
  fiveOfKind: { name: 'Five of a Kind!', points: 100, check: (dice) => hasNOfAKind(dice, 5) },
  fullHouse: { name: 'Full House', points: 35, check: (dice) => isFullHouse(dice) },
  smallStraight: { name: 'Small Straight', points: 30, check: (dice) => longestStraight(dice) >= 4 },
  largeStraight: { name: 'Large Straight', points: 45, check: (dice) => longestStraight(dice) >= 5 },
  
  // Special bonuses
  allEvens: { name: 'All Evens', points: 20, check: (dice) => dice.every(d => d.value % 2 === 0) },
  allOdds: { name: 'All Odds', points: 20, check: (dice) => dice.every(d => d.value % 2 !== 0) },
  lowBall: { name: 'Low Ball (all ≤3)', points: 15, check: (dice) => dice.every(d => d.value <= 3) },
  highRoller: { name: 'High Roller (all ≥4)', points: 15, check: (dice) => dice.every(d => d.value >= 4) },
  lucky7: { name: 'Lucky 7s', points: 7, check: (dice) => dice.some(d => d.value === 7), per: true },
  snake: { name: 'Snake Eyes', points: 10, check: (dice) => dice.filter(d => d.value === 1).length >= 2 },
  boxcars: { name: 'Boxcars', points: 10, check: (dice) => dice.filter(d => d.value === 6).length >= 2 }
};

// ===== RESEARCH MILESTONES =====
export const RESEARCH_MILESTONES = {
  25: { unlock: 'colors', items: ['red', 'blue', 'green'], description: 'Unlock colored dice!' },
  50: { unlock: 'shape', items: ['d8'], description: 'Unlock D8 dice!' },
  75: { unlock: 'modifier', items: ['reroll', 'plusOne'], description: 'Unlock die modifiers!' },
  100: { unlock: 'shape', items: ['d10'], description: 'Unlock D10 dice!' },
  150: { unlock: 'colors', items: ['purple', 'gold'], description: 'Unlock rare colors!' },
  200: { unlock: 'modifier', items: ['weighted', 'clone'], description: 'Unlock advanced modifiers!' },
  250: { unlock: 'shape', items: ['d12'], description: 'Unlock D12 dice!' },
  300: { unlock: 'modifier', items: ['exploding', 'wild'], description: 'Unlock powerful modifiers!' },
  400: { unlock: 'colors', items: ['black', 'ghost'], description: 'Unlock spectral colors!' },
  500: { unlock: 'shape', items: ['d20'], description: 'Unlock the legendary D20!' },
  750: { unlock: 'modifier', items: ['double'], description: 'Unlock the Double modifier!' }
};

// ===== HELPER FUNCTIONS =====

function countPairs(dice) {
  const counts = {};
  dice.forEach(d => {
    counts[d.value] = (counts[d.value] || 0) + 1;
  });
  return Object.values(counts).filter(c => c >= 2).length;
}

function hasNOfAKind(dice, n) {
  const counts = {};
  dice.forEach(d => {
    counts[d.value] = (counts[d.value] || 0) + 1;
  });
  return Object.values(counts).some(c => c >= n);
}

function isFullHouse(dice) {
  const counts = {};
  dice.forEach(d => {
    counts[d.value] = (counts[d.value] || 0) + 1;
  });
  const values = Object.values(counts);
  return values.includes(3) && values.includes(2);
}

function longestStraight(dice) {
  const uniqueValues = [...new Set(dice.map(d => d.value))].sort((a, b) => a - b);
  let longest = 1;
  let current = 1;
  
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

// ===== ADVANCED DIE CLASS =====
export class AdvancedDie {
  constructor(config = {}) {
    this.id = config.id || `die_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.name = config.name || 'Standard Die';
    this.shape = config.shape || 'd6';
    this.color = config.color || 'white';
    this.modifiers = config.modifiers || [];
    this.faceValues = config.faceValues || [...DIE_SHAPES[this.shape].baseValues];
    this.customFaces = config.customFaces || null; // For individual face customization
    this.weights = config.weights || null; // For weighted rolls
    
    this.currentValue = null;
    this.locked = false;
    this.rerollsUsed = 0;
    this.maxRerolls = this.modifiers.includes('reroll') ? 1 : 0;
  }
  
  // Get effective face values after modifiers
  getEffectiveValues() {
    let values = this.customFaces ? [...this.customFaces] : [...this.faceValues];
    
    // Apply modifiers
    this.modifiers.forEach(modId => {
      const mod = DIE_MODIFIERS[modId];
      if (mod && typeof mod.effect === 'function') {
        values = mod.effect(values);
      }
    });
    
    return values;
  }
  
  // Roll the die
  roll() {
    if (this.locked) return this.currentValue;
    
    const values = this.getEffectiveValues();
    
    // Handle weighted rolls
    if (this.modifiers.includes('weighted') || this.weights) {
      this.currentValue = this.weightedRoll(values, 'high');
    } else if (this.modifiers.includes('lightWeighted')) {
      this.currentValue = this.weightedRoll(values, 'low');
    } else {
      this.currentValue = values[Math.floor(Math.random() * values.length)];
    }
    
    // Handle exploding dice
    if (this.modifiers.includes('exploding') && this.currentValue === Math.max(...values)) {
      const bonus = values[Math.floor(Math.random() * values.length)];
      this.currentValue += bonus;
    }
    
    // Handle blessed (minimum 3)
    if (this.modifiers.includes('blessed') && this.currentValue < 3) {
      this.currentValue = 3;
    }
    
    return this.currentValue;
  }
  
  weightedRoll(values, direction) {
    // Create weighted distribution
    const weights = values.map((v, i) => {
      if (direction === 'high') {
        return i + 1; // Higher indices (higher values) have more weight
      } else {
        return values.length - i; // Lower indices (lower values) have more weight
      }
    });
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < values.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return values[i];
      }
    }
    
    return values[values.length - 1];
  }
  
  // Check if can reroll
  canReroll() {
    return !this.locked && this.rerollsUsed < this.maxRerolls;
  }
  
  // Use reroll
  reroll() {
    if (this.canReroll()) {
      this.rerollsUsed++;
      return this.roll();
    }
    return this.currentValue;
  }
  
  // Lock/unlock
  lock() { this.locked = true; }
  unlock() { this.locked = false; }
  
  // Reset for new round
  resetForRound() {
    this.locked = false;
    this.rerollsUsed = 0;
    this.currentValue = null;
  }
  
  // Get color bonus
  getColorBonus() {
    return DIE_COLORS[this.color]?.bonus || null;
  }
  
  // Clone another die's value
  cloneValue(otherDie) {
    if (this.modifiers.includes('clone') && otherDie) {
      this.currentValue = otherDie.currentValue;
    }
  }
  
  // Serialize for saving
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      shape: this.shape,
      color: this.color,
      modifiers: this.modifiers,
      faceValues: this.faceValues,
      customFaces: this.customFaces,
      weights: this.weights
    };
  }
  
  // Deserialize
  static fromJSON(data) {
    return new AdvancedDie(data);
  }
}

// ===== SCORE CALCULATOR =====
export class ScoreCalculator {
  constructor(context = 'research') {
    this.context = context; // 'research' or 'challenge'
  }
  
  // Calculate total score with all bonuses
  calculate(dice, conditions = [], modifiers = {}) {
    const result = {
      baseTotal: 0,
      bonuses: [],
      penalties: [],
      finalScore: 0,
      conditionsMet: [],
      conditionsFailed: []
    };
    
    // Calculate base total
    result.baseTotal = dice.reduce((sum, d) => sum + (d.currentValue || d.value || 0), 0);
    
    // Check for pattern bonuses
    const diceForCheck = dice.map(d => ({ value: d.currentValue || d.value || 0, ...d }));
    
    Object.entries(SCORING_BONUSES).forEach(([key, bonus]) => {
      if (bonus.check(diceForCheck)) {
        if (bonus.per) {
          // Count how many times the condition is met
          const count = diceForCheck.filter(d => bonus.check([d])).length;
          result.bonuses.push({ name: bonus.name, points: bonus.points * count });
        } else {
          result.bonuses.push({ name: bonus.name, points: bonus.points });
        }
      }
    });
    
    // Check color bonuses
    dice.forEach(d => {
      const colorBonus = DIE_COLORS[d.color]?.bonus;
      if (colorBonus) {
        if (this.context === 'research' && colorBonus === 'research') {
          result.bonuses.push({ name: 'Blue Die (Research)', points: 3 });
        } else if (this.context === 'challenge' && colorBonus === 'combat') {
          result.bonuses.push({ name: 'Red Die (Combat)', points: 3 });
        } else if (colorBonus === 'multiplier') {
          result.bonuses.push({ name: 'Gold Die (×1.1)', points: Math.floor(result.baseTotal * 0.1) });
        }
      }
    });
    
    // Check conditions
    conditions.forEach(condition => {
      if (condition.check(diceForCheck)) {
        result.conditionsMet.push(condition.description);
      } else {
        result.conditionsFailed.push(condition.description);
      }
    });
    
    // Apply modifiers
    if (modifiers.multiplier) {
      result.baseTotal = Math.floor(result.baseTotal * modifiers.multiplier);
    }
    
    // Calculate final score
    const bonusTotal = result.bonuses.reduce((sum, b) => sum + b.points, 0);
    const penaltyTotal = result.penalties.reduce((sum, p) => sum + p.points, 0);
    result.finalScore = result.baseTotal + bonusTotal - penaltyTotal;
    
    return result;
  }
}

// ===== UPGRADE MANAGER =====
export class DiceUpgradeManager {
  constructor() {
    this.unlockedShapes = ['d6'];
    this.unlockedColors = ['white'];
    this.unlockedModifiers = [];
    this.totalResearchSpent = 0;
    this.milestonesReached = [];
  }
  
  // Check and unlock milestones
  checkMilestones(totalResearch) {
    const newUnlocks = [];
    
    Object.entries(RESEARCH_MILESTONES).forEach(([threshold, milestone]) => {
      if (totalResearch >= parseInt(threshold) && !this.milestonesReached.includes(threshold)) {
        this.milestonesReached.push(threshold);
        
        switch (milestone.unlock) {
          case 'shape':
            milestone.items.forEach(item => {
              if (!this.unlockedShapes.includes(item)) {
                this.unlockedShapes.push(item);
                newUnlocks.push({ type: 'shape', item, description: milestone.description });
              }
            });
            break;
          case 'colors':
            milestone.items.forEach(item => {
              if (!this.unlockedColors.includes(item)) {
                this.unlockedColors.push(item);
                newUnlocks.push({ type: 'color', item, description: milestone.description });
              }
            });
            break;
          case 'modifier':
            milestone.items.forEach(item => {
              if (!this.unlockedModifiers.includes(item)) {
                this.unlockedModifiers.push(item);
                newUnlocks.push({ type: 'modifier', item, description: milestone.description });
              }
            });
            break;
        }
      }
    });
    
    return newUnlocks;
  }
  
  // Get available upgrades for a die
  getAvailableUpgrades(die) {
    const upgrades = {
      shapes: this.unlockedShapes.filter(s => s !== die.shape),
      colors: this.unlockedColors.filter(c => c !== die.color),
      modifiers: this.unlockedModifiers.filter(m => !die.modifiers.includes(m))
    };
    
    return upgrades;
  }
  
  // Apply upgrade to die
  upgradeDie(die, upgradeType, upgradeValue, researchCost) {
    switch (upgradeType) {
      case 'shape':
        if (this.unlockedShapes.includes(upgradeValue)) {
          die.shape = upgradeValue;
          die.faceValues = [...DIE_SHAPES[upgradeValue].baseValues];
        }
        break;
      case 'color':
        if (this.unlockedColors.includes(upgradeValue)) {
          die.color = upgradeValue;
        }
        break;
      case 'modifier':
        if (this.unlockedModifiers.includes(upgradeValue) && !die.modifiers.includes(upgradeValue)) {
          die.modifiers.push(upgradeValue);
        }
        break;
      case 'face':
        // upgradeValue should be { faceIndex, newValue }
        if (die.customFaces === null) {
          die.customFaces = [...die.faceValues];
        }
        die.customFaces[upgradeValue.faceIndex] = upgradeValue.newValue;
        break;
    }
    
    this.totalResearchSpent += researchCost;
    return die;
  }
  
  // Serialize
  toJSON() {
    return {
      unlockedShapes: this.unlockedShapes,
      unlockedColors: this.unlockedColors,
      unlockedModifiers: this.unlockedModifiers,
      totalResearchSpent: this.totalResearchSpent,
      milestonesReached: this.milestonesReached
    };
  }
  
  // Deserialize
  static fromJSON(data) {
    const manager = new DiceUpgradeManager();
    Object.assign(manager, data);
    return manager;
  }
}

// Export helper functions
export { countPairs, hasNOfAKind, isFullHouse, longestStraight };
