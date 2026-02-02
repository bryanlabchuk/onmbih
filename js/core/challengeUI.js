// Challenge UI Manager
// Handles challenge display, condition checking, and environment effects

import { 
  PLAYER_LEVELS, 
  getPlayerLevel, 
  getLevelData,
  CHALLENGE_TIERS,
  RESEARCH_CHALLENGES,
  LOCATION_ENVIRONMENTS,
  generateChallenges,
  checkChallengeConditions,
  applyEnvironmentEffects
} from '../data/challenges.js';
import { LOCATIONS } from '../data/locations.js';

export class ChallengeUI {
  constructor(game) {
    this.game = game;
    this.currentChallenge = null;
    this.availableChallenges = [];
    this.rollsUsed = 0;
  }

  // Update player level display
  updateLevelDisplay() {
    const level = getPlayerLevel(this.game.totalResearchEarned || 0);
    const levelData = getLevelData(level);
    
    this.game.playerLevel = level;
    
    // Update max allies based on level
    this.game.maxAllies = levelData.maxAllies;
    this.game.maxDice = levelData.maxDice;
    
    // Update UI elements
    const levelEl = document.getElementById('player-level');
    const titleEl = document.getElementById('player-title');
    const partyCountEl = document.getElementById('party-count');
    const partyMaxEl = document.getElementById('party-max');
    
    if (levelEl) levelEl.textContent = level;
    if (titleEl) titleEl.textContent = levelData.name;
    if (partyCountEl) partyCountEl.textContent = this.game.allies?.length || 0;
    if (partyMaxEl) partyMaxEl.textContent = levelData.maxAllies;
    
    // Check for level up
    if (level > (this.game._lastLevel || 1)) {
      this.showLevelUpNotification(level, levelData);
      this.game._lastLevel = level;
    }
  }

  showLevelUpNotification(level, levelData) {
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
      <div class="level-up-content">
        <span class="level-up-icon">🎉</span>
        <div class="level-up-text">
          <div class="level-up-title">LEVEL UP!</div>
          <div class="level-up-level">Level ${level}</div>
          <div class="level-up-name">${levelData.name}</div>
          <div class="level-up-rewards">
            <span>👥 Max Allies: ${levelData.maxAllies}</span>
            <span>🎲 Max Dice: ${levelData.maxDice}</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 4000);
  }

  // Update location environment display
  updateEnvironmentDisplay(locationId) {
    const location = LOCATIONS[locationId];
    const environment = LOCATION_ENVIRONMENTS[locationId];
    
    if (!location || !environment) return;
    
    const envContainer = document.getElementById('location-environment');
    const iconEl = document.getElementById('env-icon');
    const nameEl = document.getElementById('env-name');
    const typeEl = document.getElementById('env-type');
    const effectsEl = document.getElementById('env-effects');
    
    if (!envContainer) return;
    
    // Update header
    if (iconEl) iconEl.textContent = location.icon;
    if (nameEl) nameEl.textContent = location.name;
    if (typeEl) typeEl.textContent = environment.name;
    
    // Update ambiance class
    envContainer.className = `location-environment ambiance-${environment.ambiance}`;
    
    // Render effects
    if (effectsEl) {
      effectsEl.innerHTML = environment.effects.map(effect => {
        const isPositive = this.isPositiveEffect(effect);
        const isNegative = this.isNegativeEffect(effect);
        const typeClass = isPositive ? 'positive' : (isNegative ? 'negative' : 'neutral');
        
        return `
          <div class="env-effect ${typeClass}">
            <span class="effect-icon">${this.getEffectIcon(effect)}</span>
            <span class="effect-text">${effect.description}</span>
          </div>
        `;
      }).join('');
    }
  }

  isPositiveEffect(effect) {
    const positiveTypes = [
      'research_multiplier', 'spirit_damage', 'sanity_heal', 'bonus_rolls',
      'reroll_ones', 'bonus_pairs', 'gold_bonus', 'sixes_explode', 'modifier_discount',
      'purple_power', 'high_roller', 'full_house_bonus', 'straight_bonus',
      'spirit_connection', 'ghost_dice', 'lock_protection', 'curse_immunity', 'info_reveal'
    ];
    return positiveTypes.includes(effect.type);
  }

  isNegativeEffect(effect) {
    const negativeTypes = [
      'sanity_drain', 'curse_risk', 'penalty_low', 'distracted',
      'max_sides', 'no_black_dice', 'min_total', 'all_or_nothing'
    ];
    return negativeTypes.includes(effect.type);
  }

  getEffectIcon(effect) {
    const icons = {
      research_multiplier: '📚',
      spirit_damage: '⚔️',
      sanity_heal: '💚',
      sanity_drain: '💔',
      bonus_rolls: '🔄',
      reroll_ones: '🎯',
      curse_risk: '☠️',
      curse_immunity: '🛡️',
      max_sides: '📐',
      bonus_pairs: '👯',
      gold_bonus: '💰',
      sixes_explode: '💥',
      modifier_discount: '💲',
      purple_power: '💜',
      high_roller: '🏆',
      full_house_bonus: '🏠',
      straight_bonus: '📊',
      spirit_connection: '👻',
      ghost_dice: '👻',
      penalty_low: '⬇️',
      lock_protection: '🔒',
      distracted: '😵',
      info_reveal: '💡',
      random_reroll: '🎰',
      bonus_variety: '🌈',
      no_black_dice: '🚫',
      min_total: '🎯',
      all_or_nothing: '⚡'
    };
    return icons[effect.type] || '✨';
  }

  // Generate and display available challenges
  showAvailableChallenges() {
    const level = this.game.playerLevel || 1;
    this.availableChallenges = generateChallenges(level, 3);
    
    // Create challenge selection modal
    const modal = document.getElementById('modal-overlay');
    if (!modal) return;
    
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal challenge-select-modal">
        <div class="modal-header">
          <h3>📖 Choose a Research Challenge</h3>
          <button class="modal-close" onclick="document.getElementById('modal-overlay').style.display='none'">&times;</button>
        </div>
        <div class="challenge-select-grid">
          ${this.availableChallenges.map((challenge, index) => this.renderChallengeCard(challenge, index)).join('')}
        </div>
        <div class="modal-footer">
          <button class="btn" onclick="document.getElementById('modal-overlay').style.display='none'">Cancel</button>
        </div>
      </div>
    `;
    
    // Bind selection events
    modal.querySelectorAll('.challenge-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        this.selectChallenge(this.availableChallenges[index]);
        modal.style.display = 'none';
      });
    });
  }

  renderChallengeCard(challenge, index) {
    const tier = CHALLENGE_TIERS[challenge.tier];
    
    return `
      <div class="challenge-card tier-${challenge.tier}" data-index="${index}">
        <div class="card-tier" style="color: ${tier.color}">
          ${tier.icon} ${tier.name}
        </div>
        <h4 class="card-name">${challenge.name}</h4>
        <p class="card-desc">${challenge.description}</p>
        <div class="card-conditions">
          ${challenge.conditions.map(c => `
            <div class="card-condition">
              <span>${c.icon}</span>
              <span>${c.description}</span>
            </div>
          `).join('')}
        </div>
        <div class="card-reward">
          <span>Reward:</span>
          <span class="reward">+${challenge.reward.research} Research</span>
        </div>
        ${challenge.flavorText ? `<p class="card-flavor">${challenge.flavorText}</p>` : ''}
      </div>
    `;
  }

  // Select and start a challenge
  selectChallenge(challenge) {
    this.currentChallenge = challenge;
    this.game.currentChallenge = challenge;
    this.rollsUsed = 0;
    this.game.rollsUsedThisChallenge = 0;
    
    this.updateChallengeDisplay();
    
    // Log the event
    if (this.game.logEvent) {
      this.game.logEvent('challenge_start', `Started challenge: ${challenge.name}`);
    }
  }

  // Update the active challenge display
  updateChallengeDisplay() {
    const challenge = this.currentChallenge;
    const container = document.getElementById('challenge-display');
    
    if (!container) return;
    
    if (!challenge) {
      container.style.display = 'none';
      return;
    }
    
    container.style.display = 'block';
    container.className = `challenge-display tier-${challenge.tier}`;
    
    const tier = CHALLENGE_TIERS[challenge.tier];
    
    document.getElementById('challenge-tier').textContent = tier.icon;
    document.getElementById('challenge-name').textContent = challenge.name;
    document.getElementById('challenge-description').textContent = challenge.description;
    document.getElementById('challenge-reward').textContent = `+${challenge.reward.research} Research`;
    
    // Render conditions
    const conditionsEl = document.getElementById('challenge-conditions');
    if (conditionsEl) {
      conditionsEl.innerHTML = challenge.conditions.map(condition => `
        <div class="condition-item">
          <span class="condition-icon">${condition.icon}</span>
          <span class="condition-text">${condition.description}</span>
          <span class="condition-status pending" data-type="${condition.type}">?</span>
        </div>
      `).join('');
    }
  }

  // Check challenge conditions against current dice
  checkConditions(dice) {
    if (!this.currentChallenge) return null;
    
    const result = checkChallengeConditions(
      this.currentChallenge,
      dice,
      this.game.rollsUsedThisChallenge || 1
    );
    
    // Update condition display
    const conditionsEl = document.getElementById('challenge-conditions');
    if (conditionsEl) {
      const statusEls = conditionsEl.querySelectorAll('.condition-status');
      statusEls.forEach((el, index) => {
        const condResult = result.conditions[index];
        if (condResult) {
          el.className = `condition-status ${condResult.passed ? 'passed' : 'failed'}`;
          el.textContent = condResult.passed ? '✓' : '✗';
        }
      });
    }
    
    return result;
  }

  // Complete the current challenge
  completeChallenge(success) {
    if (!this.currentChallenge) return;
    
    const locationId = this.game.currentLocation?.id || 'home';
    let reward = { research: 0, sanityChange: 0 };
    
    if (success) {
      reward.research = this.currentChallenge.reward.research;
      
      // Apply environment effects
      reward = applyEnvironmentEffects(locationId, reward, this.game);
      
      // Add to game state
      this.game.research += reward.research;
      this.game.totalResearchEarned = (this.game.totalResearchEarned || 0) + reward.research;
      
      if (reward.sanityChange) {
        this.game.sanity = Math.min(this.game.maxSanity, Math.max(0, this.game.sanity + reward.sanityChange));
      }
      
      this.showChallengeCompleteNotification(true, reward);
      
      if (this.game.logEvent) {
        this.game.logEvent('challenge_complete', `Completed ${this.currentChallenge.name}! +${reward.research} research`);
      }
    } else {
      // Check for sanity drain from environment
      const environment = LOCATION_ENVIRONMENTS[locationId];
      if (environment) {
        const drainEffect = environment.effects.find(e => e.type === 'sanity_drain');
        if (drainEffect) {
          reward.sanityChange = -drainEffect.value;
          this.game.sanity = Math.max(0, this.game.sanity + reward.sanityChange);
        }
      }
      
      this.showChallengeCompleteNotification(false, reward);
      
      if (this.game.logEvent) {
        this.game.logEvent('challenge_failed', `Failed ${this.currentChallenge.name}`);
      }
    }
    
    // Update displays
    this.updateLevelDisplay();
    
    // Clear current challenge
    this.currentChallenge = null;
    this.game.currentChallenge = null;
    
    // Hide challenge display after delay
    setTimeout(() => {
      const container = document.getElementById('challenge-display');
      if (container) container.style.display = 'none';
    }, 2000);
    
    return reward;
  }

  showChallengeCompleteNotification(success, reward) {
    const notification = document.createElement('div');
    notification.className = `challenge-complete-notification ${success ? 'success' : 'failure'}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${success ? '🎉' : '💔'}</span>
        <div class="notification-text">
          <div class="notification-title">${success ? 'Challenge Complete!' : 'Challenge Failed'}</div>
          ${success ? `<div class="notification-reward">+${reward.research} Research</div>` : ''}
          ${reward.sanityChange ? `<div class="notification-sanity">${reward.sanityChange > 0 ? '+' : ''}${reward.sanityChange} Sanity</div>` : ''}
          ${reward.appliedEffects?.length ? `<div class="notification-effects">${reward.appliedEffects.join(', ')}</div>` : ''}
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  // Track rolls used
  incrementRollCount() {
    this.rollsUsed++;
    this.game.rollsUsedThisChallenge = this.rollsUsed;
  }

  // Get environment bonuses for current location
  getEnvironmentBonuses(locationId) {
    const environment = LOCATION_ENVIRONMENTS[locationId];
    if (!environment) return {};
    
    const bonuses = {};
    
    environment.effects.forEach(effect => {
      switch (effect.type) {
        case 'bonus_rolls':
          bonuses.extraRolls = effect.value;
          break;
        case 'research_multiplier':
          bonuses.researchMultiplier = effect.value;
          break;
        case 'spirit_damage':
          bonuses.spiritDamage = effect.value;
          break;
        // Add more as needed
      }
    });
    
    return bonuses;
  }
}
