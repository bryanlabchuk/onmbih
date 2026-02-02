// Main Game State Manager
// Handles game flow, state, and coordination between systems

import { TOWNSFOLK } from '../data/townsfolk.js';
import { SPIRITS, getRandomSpirit } from '../data/spirits.js';
import { Die, DICE_FACES } from '../data/diceFaces.js';

export const GAME_PHASES = {
  TITLE: 'title',
  TOWN: 'town',           // Select townsfolk allies
  RESEARCH: 'research',   // Roll dice to gather research
  SPIRIT_SELECT: 'spiritSelect', // Choose which spirit to challenge
  CHALLENGE: 'challenge', // Roll dice to defeat spirit
  REWARD: 'reward',       // Collect rewards
  SHOP: 'shop',           // Buy dice faces, upgrade
  GAME_OVER: 'gameOver',
  VICTORY: 'victory'
};

export class Game {
  constructor() {
    this.reset();
  }

  reset() {
    // Core stats
    this.sanity = 100;
    this.maxSanity = 100;
    this.research = 0;
    this.spiritsBanished = 0;
    this.totalSpirits = 7; // 7 generations of Blackwood ancestors
    
    // Current phase
    this.phase = GAME_PHASES.TITLE;
    this.turn = 0;
    this.run = 1;
    
    // Dice system - start with 5 standard dice
    this.dice = Array(5).fill(null).map(() => new Die('standard'));
    this.maxDice = 8;
    this.rollsRemaining = 3;
    this.maxRolls = 3;
    
    // Townsfolk allies (like Balatro's jokers)
    this.allies = [];
    this.maxAllies = 5;
    this.availableAllies = [];
    
    // Spirits
    this.discoveredSpirits = [];
    this.currentSpirit = null;
    this.defeatedSpirits = [];
    
    // Unlocked content
    this.unlockedDiceFaces = ['standard', 'magnifyingGlass'];
    this.unlockedTownsfolk = Object.keys(TOWNSFOLK).filter(k => TOWNSFOLK[k].unlocked);
    
    // Run modifiers
    this.modifiers = {
      researchMultiplier: 1,
      damageMultiplier: 1,
      scoreMultiplier: 1
    };

    // Event log
    this.log = [];
  }

  // ===== PHASE MANAGEMENT =====
  
  startGame() {
    this.logEvent('game_start', 'Your boyfriend Derek has been acting strange. Seven generations of Blackwood ancestors haunt him. Time to do something about it.');
    this.phase = GAME_PHASES.TOWN;
    this.generateTownOptions();
  }

  transitionTo(phase) {
    this.phase = phase;
    this.logEvent('phase_change', `Entered ${phase} phase`);
    
    switch(phase) {
      case GAME_PHASES.TOWN:
        this.generateTownOptions();
        break;
      case GAME_PHASES.RESEARCH:
        this.startResearchPhase();
        break;
      case GAME_PHASES.SPIRIT_SELECT:
        this.generateSpiritOptions();
        break;
      case GAME_PHASES.CHALLENGE:
        this.startChallenge();
        break;
      case GAME_PHASES.REWARD:
        this.calculateRewards();
        break;
      case GAME_PHASES.SHOP:
        this.generateShopOptions();
        break;
    }
  }

  // ===== TOWN PHASE =====
  
  generateTownOptions() {
    // Generate 3 random townsfolk to choose from
    const available = Object.values(TOWNSFOLK)
      .filter(t => t.unlocked && !this.allies.find(a => a.id === t.id));
    
    // Shuffle and take 3
    this.availableAllies = this.shuffleArray(available).slice(0, 3);
  }

  recruitAlly(townsfolkId) {
    if (this.allies.length >= this.maxAllies) {
      this.logEvent('recruit_failed', 'Too many allies already!');
      return false;
    }

    const townsfolk = TOWNSFOLK[townsfolkId];
    if (!townsfolk) return false;

    this.allies.push({ ...townsfolk });
    this.logEvent('recruit', `${townsfolk.name} joined your investigation!`);
    return true;
  }

  // ===== RESEARCH PHASE =====
  
  startResearchPhase() {
    this.rollsRemaining = this.maxRolls;
    
    // Apply ally bonuses
    this.allies.forEach(ally => {
      if (ally.ability.effect.extraStartingRolls) {
        this.rollsRemaining += ally.ability.effect.extraStartingRolls;
      }
    });
    
    // Unlock all dice
    this.dice.forEach(d => d.unlock());
    
    this.logEvent('research_start', 'Time to dig through old records and local legends...');
  }

  rollDice() {
    if (this.rollsRemaining <= 0) {
      this.logEvent('roll_failed', 'No rolls remaining!');
      return null;
    }

    this.rollsRemaining--;
    
    const results = this.dice.map(die => {
      if (die.locked) return die.currentValue;
      return die.roll();
    });

    this.logEvent('roll', `Rolled: [${results.join(', ')}]`);
    return results;
  }

  lockDie(index) {
    if (this.dice[index]) {
      this.dice[index].lock();
      this.logEvent('lock', `Locked die ${index + 1} at ${this.dice[index].currentValue}`);
    }
  }

  unlockDie(index) {
    if (this.dice[index]) {
      this.dice[index].unlock();
      this.logEvent('unlock', `Unlocked die ${index + 1}`);
    }
  }

  calculateResearch() {
    const values = this.dice.map(d => d.currentValue).filter(v => v !== null);
    let research = 0;
    
    // Base research is sum of all dice
    const sum = values.reduce((a, b) => a + b, 0);
    research = sum;
    
    // Bonus for pairs
    const pairs = this.countPairs(values);
    research += pairs * 2;
    
    // Bonus for straights
    const straightLength = this.longestStraight(values);
    if (straightLength >= 3) {
      research += straightLength * 2;
    }
    
    // Apply ally bonuses
    this.allies.forEach(ally => {
      if (ally.ability.effect.researchBonus) {
        research += ally.ability.effect.researchBonus;
      }
      if (ally.ability.effect.pairsDoubleForResearch && pairs > 0) {
        research += pairs * 2;
      }
      if (ally.ability.effect.straightResearchBonus && straightLength >= 4) {
        research += ally.ability.effect.straightResearchBonus;
      }
    });
    
    // Apply multipliers
    research = Math.floor(research * this.modifiers.researchMultiplier);
    
    this.research += research;
    this.logEvent('research_gain', `Gained ${research} research. Total: ${this.research}`);
    
    return research;
  }

  // ===== SPIRIT SELECTION =====
  
  generateSpiritOptions() {
    // Reveal spirits you have enough research to challenge
    const maxTier = Math.min(3, Math.floor(this.spiritsBanished / 2) + 1);
    const available = Object.values(SPIRITS)
      .filter(s => s.tier <= maxTier && !this.defeatedSpirits.includes(s.id));
    
    // Show up to 3 spirits
    this.discoveredSpirits = this.shuffleArray(available).slice(0, 3);
  }

  selectSpirit(spiritId) {
    const spirit = SPIRITS[spiritId];
    if (!spirit) return false;
    
    if (this.research < spirit.researchRequired) {
      this.logEvent('spirit_select_failed', `Not enough research! Need ${spirit.researchRequired}, have ${this.research}`);
      return false;
    }
    
    this.currentSpirit = { ...spirit };
    this.research -= spirit.researchRequired;
    this.logEvent('spirit_select', `Challenging ${spirit.name}! Research spent: ${spirit.researchRequired}`);
    return true;
  }

  // ===== CHALLENGE PHASE =====
  
  startChallenge() {
    if (!this.currentSpirit) {
      this.logEvent('challenge_error', 'No spirit selected!');
      return;
    }
    
    this.rollsRemaining = this.maxRolls;
    this.turn = 0;
    
    // Unlock all dice
    this.dice.forEach(d => {
      d.unlock();
      d.uncurse();
    });
    
    // Apply spirit abilities
    this.applySpiritAbilities('onChallengeStart');
    
    this.logEvent('challenge_start', `The spirit of ${this.currentSpirit.name} manifests! ${this.currentSpirit.flavor}`);
  }

  applySpiritAbilities(trigger) {
    if (!this.currentSpirit) return;
    
    this.currentSpirit.abilities.forEach(ability => {
      if (ability.trigger === trigger) {
        this.logEvent('spirit_ability', `${this.currentSpirit.name} uses ${ability.name}: ${ability.description}`);
        // Apply ability effects (simplified for now)
        switch(ability.name) {
          case 'Hex':
            // Curse a random die
            const randomIndex = Math.floor(Math.random() * this.dice.length);
            this.dice[randomIndex].curse();
            break;
          case 'Bandages':
            // Lock a random die
            const bandageIndex = Math.floor(Math.random() * this.dice.length);
            this.dice[bandageIndex].lock();
            break;
          // Add more ability implementations
        }
      }
    });
  }

  calculateChallengeScore() {
    const values = this.dice.map(d => d.currentValue).filter(v => v !== null);
    let score = values.reduce((a, b) => a + b, 0);
    
    // Apply ally bonuses
    this.allies.forEach(ally => {
      if (ally.ability.effect.challengeBonus) {
        score += ally.ability.effect.challengeBonus;
      }
    });
    
    // Apply die face effects
    this.dice.forEach(die => {
      if (die.face.effect) {
        if (die.face.effect.challengeBonus) {
          score += die.face.effect.challengeBonus;
        }
        if (die.face.effect.bonusAgainstWeakness) {
          const bonus = die.face.effect.bonusAgainstWeakness;
          if (this.currentSpirit && this.currentSpirit.weakness === bonus.type) {
            score += bonus.bonus;
          }
        }
      }
    });
    
    // Apply multipliers
    score = Math.floor(score * this.modifiers.scoreMultiplier);
    
    return score;
  }

  checkChallengeRequirement() {
    if (!this.currentSpirit) return false;
    
    const values = this.dice.map(d => d.currentValue).filter(v => v !== null);
    const req = this.currentSpirit.challengeRequirement;
    
    switch(req.type) {
      case 'score':
        return this.calculateChallengeScore() >= req.target;
      
      case 'pairs':
        return this.countPairs(values) >= req.count;
      
      case 'straight':
        return this.longestStraight(values) >= req.length;
      
      case 'specific':
        return req.values.every(v => values.includes(v));
      
      case 'evens':
        return values.filter(v => v % 2 === 0).length >= req.count;
      
      case 'allSame':
        return values.every(v => v === values[0]);
      
      case 'hypnotic':
        // Check if dice values match the hypnotic pattern
        if (!req.pattern || values.length < req.pattern.length) return false;
        // Check if the pattern exists as a subsequence in the rolled values
        const sortedValues = [...values].sort((a, b) => a - b);
        const sortedPattern = [...req.pattern].sort((a, b) => a - b);
        // Count occurrences needed for pattern
        const patternCounts = {};
        sortedPattern.forEach(v => patternCounts[v] = (patternCounts[v] || 0) + 1);
        const valueCounts = {};
        sortedValues.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
        return Object.entries(patternCounts).every(([val, count]) => 
          (valueCounts[val] || 0) >= count
        );
      
      default:
        return false;
    }
  }

  resolveChallengeRound() {
    // Apply spirit abilities
    this.applySpiritAbilities('onRoll');
    this.applySpiritAbilities('onScore');
    
    // Check if requirement is met
    if (this.checkChallengeRequirement()) {
      this.defeatSpirit();
      return 'victory';
    }
    
    // Take damage
    let damage = this.currentSpirit.damage;
    
    // Apply damage reduction from allies
    this.allies.forEach(ally => {
      if (ally.ability.effect.reduceSpiritDamage) {
        damage -= ally.ability.effect.reduceSpiritDamage;
      }
      if (ally.ability.effect.reduceDamage) {
        damage -= ally.ability.effect.reduceDamage;
      }
    });
    
    damage = Math.max(0, damage);
    this.takeDamage(damage);
    
    if (this.sanity <= 0) {
      return 'defeat';
    }
    
    this.turn++;
    return 'continue';
  }

  defeatSpirit() {
    const spirit = this.currentSpirit;
    this.defeatedSpirits.push(spirit.id);
    this.spiritsBanished++;
    
    this.logEvent('spirit_defeated', `${spirit.name} has been banished! "${spirit.flavor}"`);
    
    // Unlock reward
    if (spirit.reward.diceFace) {
      this.unlockDiceFace(spirit.reward.diceFace);
    }
    
    // Check victory
    if (this.spiritsBanished >= this.totalSpirits) {
      this.phase = GAME_PHASES.VICTORY;
      this.logEvent('victory', 'All spirits have been banished! Derek is free!');
    } else {
      this.transitionTo(GAME_PHASES.REWARD);
    }
  }

  // ===== DAMAGE & SANITY =====
  
  takeDamage(amount) {
    this.sanity -= amount;
    this.logEvent('damage', `Lost ${amount} sanity. Remaining: ${this.sanity}`);
    
    if (this.sanity <= 0) {
      this.gameOver();
    }
  }

  healSanity(amount) {
    this.sanity = Math.min(this.maxSanity, this.sanity + amount);
    this.logEvent('heal', `Restored ${amount} sanity. Current: ${this.sanity}`);
  }

  gameOver() {
    this.phase = GAME_PHASES.GAME_OVER;
    this.logEvent('game_over', 'Your sanity shattered. The spirits claimed another victim...');
  }

  // ===== REWARDS & SHOP =====
  
  calculateRewards() {
    if (!this.currentSpirit) return;
    
    // Grant bonus research
    this.research += this.currentSpirit.reward.research;
    this.logEvent('reward', `Gained ${this.currentSpirit.reward.research} bonus research`);
    
    this.currentSpirit = null;
  }

  unlockDiceFace(faceId) {
    if (!this.unlockedDiceFaces.includes(faceId)) {
      this.unlockedDiceFaces.push(faceId);
      this.logEvent('unlock', `Unlocked new dice face: ${DICE_FACES[faceId]?.name || faceId}`);
    }
  }

  generateShopOptions() {
    // Generate shop items (dice faces, ally upgrades, etc.)
    // This would be expanded in a full implementation
  }

  // ===== UTILITY FUNCTIONS =====
  
  countPairs(values) {
    const counts = {};
    values.forEach(v => counts[v] = (counts[v] || 0) + 1);
    return Object.values(counts).filter(c => c >= 2).length;
  }

  longestStraight(values) {
    const sorted = [...new Set(values)].sort((a, b) => a - b);
    let longest = 1;
    let current = 1;
    
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i-1] + 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }
    
    return longest;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  logEvent(type, message) {
    this.log.push({
      type,
      message,
      timestamp: Date.now(),
      turn: this.turn,
      phase: this.phase
    });
    console.log(`[${type}] ${message}`);
  }

  // ===== SAVE/LOAD =====
  
  getState() {
    return {
      sanity: this.sanity,
      maxSanity: this.maxSanity,
      research: this.research,
      spiritsBanished: this.spiritsBanished,
      phase: this.phase,
      turn: this.turn,
      run: this.run,
      dice: this.dice.map(d => ({ face: d.face.id, value: d.currentValue, locked: d.locked })),
      allies: this.allies.map(a => a.id),
      defeatedSpirits: this.defeatedSpirits,
      unlockedDiceFaces: this.unlockedDiceFaces,
      unlockedTownsfolk: this.unlockedTownsfolk
    };
  }

  loadState(state) {
    Object.assign(this, state);
    this.dice = state.dice.map(d => {
      const die = new Die(d.face);
      die.currentValue = d.value;
      die.locked = d.locked;
      return die;
    });
    this.allies = state.allies.map(id => ({ ...TOWNSFOLK[id] }));
  }
}

// Export singleton instance
export const game = new Game();
