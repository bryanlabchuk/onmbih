// Dice UI - Inventory, Selection, and Upgrade Interface
import { Dice3DSystem, DiceInventory, FACE_COLORS, PIP_COLORS } from './dice3d.js';
import { 
  DIE_SHAPES, 
  DIE_COLORS, 
  DIE_MODIFIERS, 
  SCORING_BONUSES,
  RESEARCH_MILESTONES,
  AdvancedDie,
  ScoreCalculator,
  DiceUpgradeManager
} from '../data/diceSystem.js';

// Upgrade costs
const UPGRADE_COSTS = {
  faceValue: 15,        // Cost per +1 or -1 to face value
  shape: 'varies',      // Depends on shape
  color: 20,            // Cost to change die color
  modifier: 'varies'    // Depends on modifier
};

export class DiceUI {
  constructor(game) {
    this.game = game;
    this.inventory = new DiceInventory();
    this.upgradeManager = new DiceUpgradeManager();
    this.scoreCalculator = new ScoreCalculator('research');
    this.dice3d = null;
    this.selectedDie = null;
    this.selectedFace = null;
    this.container = null;
    this.initialized = false;
    this.pendingUpgradeCost = 0;
    this.lastScoreResult = null;
    
    // Initialize with starter dice
    this.initStarterDice();
  }

  initStarterDice() {
    // Add 5 starter d6 dice
    const starterConfigs = [
      { name: 'Worn Die', shape: 'd6', color: 'white', rarity: 'common' },
      { name: 'Dusty Die', shape: 'd6', color: 'white', rarity: 'common' },
      { name: 'Chipped Die', shape: 'd6', color: 'white', rarity: 'common' },
      { name: 'Faded Die', shape: 'd6', color: 'white', rarity: 'common' },
      { name: 'Old Die', shape: 'd6', color: 'white', rarity: 'common' }
    ];
    
    starterConfigs.forEach(config => {
      // Create with base d6 values
      const fullConfig = {
        ...config,
        faceValues: [...DIE_SHAPES.d6.baseValues],
        faceColors: Array(6).fill(DIE_COLORS.white.hex),
        pipColor: '#2a2d38',
        modifiers: []
      };
      const die = this.inventory.addDie(fullConfig);
      this.inventory.equipDie(die.id);
    });
  }

  // Check for research milestone unlocks
  checkMilestones() {
    if (!this.game) return [];
    
    const newUnlocks = this.upgradeManager.checkMilestones(this.game.research);
    
    // Show notification for each unlock
    newUnlocks.forEach(unlock => {
      this.showMilestoneNotification(unlock);
    });
    
    return newUnlocks;
  }

  showMilestoneNotification(unlock) {
    const notification = document.createElement('div');
    notification.className = 'milestone-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">🎉</span>
        <div class="notification-text">
          <div class="notification-title">Research Milestone!</div>
          <div class="notification-desc">${unlock.description}</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 4000);
  }

  // Calculate score for current dice
  calculateScore(context = 'research') {
    this.scoreCalculator.context = context;
    
    const diceForScoring = this.getDiceValues().map((d, i) => ({
      value: d.value,
      currentValue: d.value,
      color: this.inventory.equippedDice[i]?.color || 'white',
      shape: this.inventory.equippedDice[i]?.shape || 'd6',
      modifiers: this.inventory.equippedDice[i]?.modifiers || []
    }));
    
    const result = this.scoreCalculator.calculate(diceForScoring, [], {
      multiplier: this.game?.modifiers?.scoreMultiplier || 1
    });
    
    this.lastScoreResult = result;
    return result;
  }

  init3DView(container) {
    if (this.initialized && this.dice3d) {
      console.log('3D view already initialized');
      return;
    }
    
    this.container = container;
    console.log('Initializing 3D dice view in container:', container);
    
    // Create the 3D system
    this.dice3d = new Dice3DSystem(container);
    this.dice3d.init();
    
    // Sync equipped dice to 3D view
    this.syncDiceTo3D();
    
    // Set up roll complete callback
    this.dice3d.onRollComplete = (results) => {
      this.onRollComplete(results);
    };
    
    // Set up lock callback
    this.dice3d.onDieLocked = (dieId, locked, value) => {
      this.syncLockToGame(dieId, locked);
      
      // Update mini inventory
      const miniInv = document.getElementById('dice-inventory-mini');
      if (miniInv) {
        this.renderMiniInventory(miniInv);
      }
    };
    
    this.initialized = true;
    console.log('3D dice view initialized with', this.inventory.equippedDice.length, 'dice');
  }

  syncDiceTo3D() {
    if (!this.dice3d || !this.dice3d.initialized) {
      console.warn('Cannot sync dice - 3D system not initialized');
      return;
    }
    
    console.log('Syncing dice to 3D view');
    this.dice3d.clearDice();
    
    // Use game dice if available, otherwise use inventory
    const numDice = this.game && this.game.dice ? this.game.dice.length : this.inventory.equippedDice.length;
    const spacing = 2.5;
    const startX = -((numDice - 1) * spacing) / 2;
    
    for (let i = 0; i < numDice; i++) {
      const gameDie = this.game?.dice?.[i];
      const invDie = this.inventory.equippedDice[i];
      
      const position = {
        x: startX + i * spacing,
        y: 1.5,
        z: 0
      };
      
      // Get face values from game die or inventory
      const faceValues = gameDie?.face?.values || invDie?.faceValues || [1, 2, 3, 4, 5, 6];
      const faceColors = invDie?.faceColors || Array(6).fill('#2a2d38');
      const pipColor = invDie?.pipColor || '#e8e4dc';
      const locked = gameDie?.locked || false;
      
      this.dice3d.createDie({
        id: invDie?.id || `die_${i}`,
        faceValues: [...faceValues],
        faceColors: [...faceColors],
        pipColor: pipColor,
        position: position,
        locked: locked,
        modifiers: invDie?.modifiers || {}
      });
    }
    
    console.log('Synced', numDice, 'dice to 3D view');
  }

  onRollComplete(results) {
    console.log('Roll complete, results:', results);
    
    // Update game state with roll results
    if (this.game && this.game.dice) {
      results.forEach((result, index) => {
        if (this.game.dice[index]) {
          this.game.dice[index].currentValue = result.value;
          this.game.dice[index].locked = result.locked;
        }
      });
      
      // Also calculate the score for display
      const total = results.reduce((sum, r) => sum + (r.value || 0), 0);
      console.log('Total roll value:', total);
    }
    
    // Dispatch custom event for the game to handle
    window.dispatchEvent(new CustomEvent('diceRollComplete', { 
      detail: results 
    }));
  }

  // Sync lock state from 3D to game
  syncLockToGame(dieId, locked) {
    if (!this.game || !this.game.dice) return;
    
    const index = this.dice3d.dice.findIndex(d => d.id === dieId);
    if (index >= 0 && this.game.dice[index]) {
      if (locked) {
        this.game.dice[index].lock();
      } else {
        this.game.dice[index].unlock();
      }
    }
  }

  rollAll() {
    if (this.dice3d && this.dice3d.initialized) {
      this.dice3d.rollAll();
      return true;
    }
    console.warn('Cannot roll - 3D system not ready');
    return false;
  }

  rollDie(dieId) {
    if (this.dice3d && this.dice3d.initialized) {
      this.dice3d.rollDie(dieId);
      return true;
    }
    return false;
  }

  toggleLock(dieId) {
    if (this.dice3d && this.dice3d.initialized) {
      return this.dice3d.toggleLock(dieId);
    }
    return false;
  }

  getDiceValues() {
    if (!this.dice3d) return [];
    return this.dice3d.dice.map(d => ({
      id: d.id,
      value: d.mesh.userData.currentValue,
      locked: d.locked
    }));
  }

  isRolling() {
    return this.dice3d ? this.dice3d.isRolling : false;
  }

  // Update the dice values display bar
  updateDiceValuesDisplay() {
    const container = document.getElementById('dice-values-display');
    const totalEl = document.getElementById('dice-total');
    const researchEl = document.getElementById('research-display');
    const bonusesEl = document.getElementById('score-bonuses');
    
    if (!container) return;
    
    // Get values from 3D dice if available, otherwise from game dice
    let values = [];
    if (this.dice3d && this.dice3d.dice.length > 0) {
      values = this.dice3d.dice.map((d, i) => ({
        value: d.mesh.userData.currentValue,
        locked: d.locked,
        shape: this.inventory.equippedDice[i]?.shape || 'd6',
        color: this.inventory.equippedDice[i]?.color || 'white'
      }));
    } else if (this.game && this.game.dice) {
      values = this.game.dice.map((d, i) => ({
        value: d.currentValue,
        locked: d.locked,
        shape: this.inventory.equippedDice[i]?.shape || 'd6',
        color: this.inventory.equippedDice[i]?.color || 'white'
      }));
    } else {
      values = this.inventory.equippedDice.map(die => ({ 
        value: null, 
        locked: false,
        shape: die?.shape || 'd6',
        color: die?.color || 'white'
      }));
    }
    
    // Render dice chips with shape and color info
    container.innerHTML = values.map((d, i) => {
      const value = d.value !== null && d.value !== undefined ? d.value : '?';
      const shapeIcon = DIE_SHAPES[d.shape]?.icon || '🎲';
      const colorHex = DIE_COLORS[d.color]?.hex || '#e8e4dc';
      const invDie = this.inventory.equippedDice[i];
      
      return `
        <div class="die-value-chip ${d.locked ? 'locked' : ''}" 
             data-index="${i}"
             style="border-color: ${colorHex};"
             title="${invDie?.name || 'Die'} (${DIE_SHAPES[d.shape]?.name || 'D6'})${d.locked ? ' [Locked]' : ''}">
          <span class="die-shape-icon">${shapeIcon}</span>
          <span class="die-value">${value}</span>
        </div>
      `;
    }).join('');
    
    // Calculate score with bonuses
    const hasValues = values.some(v => v.value !== null && v.value !== undefined);
    
    if (hasValues) {
      const scoreResult = this.calculateScore(this.game?.phase === 'challenge' ? 'challenge' : 'research');
      
      if (totalEl) {
        totalEl.innerHTML = `
          <span class="base-total">${scoreResult.baseTotal}</span>
          ${scoreResult.bonuses.length > 0 ? `<span class="bonus-total">+${scoreResult.bonuses.reduce((s, b) => s + b.points, 0)}</span>` : ''}
          <span class="final-total">= ${scoreResult.finalScore}</span>
        `;
      }
      
      // Show bonuses
      if (bonusesEl && scoreResult.bonuses.length > 0) {
        bonusesEl.innerHTML = scoreResult.bonuses.map(b => 
          `<span class="bonus-tag">${b.name} +${b.points}</span>`
        ).join('');
        bonusesEl.style.display = 'flex';
      } else if (bonusesEl) {
        bonusesEl.style.display = 'none';
      }
    } else if (totalEl) {
      totalEl.textContent = '0';
    }
    
    if (researchEl && this.game) {
      researchEl.textContent = this.game.research || 0;
    }
    
    // Check for milestone unlocks
    this.checkMilestones();
  }

  // Show the dice area
  showDiceArea() {
    const diceArea = document.getElementById('dice-area');
    if (diceArea) {
      diceArea.style.display = 'flex';
    }
  }

  // Hide the dice area
  hideDiceArea() {
    const diceArea = document.getElementById('dice-area');
    if (diceArea) {
      diceArea.style.display = 'none';
    }
  }

  // ===== MINI INVENTORY DISPLAY =====
  
  renderMiniInventory(container) {
    const equipped = this.inventory.getEquippedDice();
    
    container.innerHTML = equipped.map((die, i) => {
      const is3d = this.dice3d && this.dice3d.dice[i];
      const value = is3d ? this.dice3d.dice[i].mesh.userData.currentValue : '?';
      const locked = is3d ? this.dice3d.dice[i].locked : false;
      
      return `
        <div class="dice-mini-slot filled ${locked ? 'locked' : ''}" 
             data-id="${die.id}" 
             title="${die.name}${locked ? ' (Locked)' : ''}">
          ${value || '?'}
        </div>
      `;
    }).join('');
    
    // Add empty slots
    const emptySlots = this.inventory.maxEquipped - equipped.length;
    for (let i = 0; i < emptySlots; i++) {
      container.innerHTML += '<div class="dice-mini-slot">-</div>';
    }
  }

  // ===== INVENTORY UI =====
  
  renderInventoryPanel(container) {
    container.innerHTML = `
      <div class="dice-inventory-panel">
        <div class="equipped-section">
          <h4>Equipped Dice (${this.inventory.equippedDice.length}/${this.inventory.maxEquipped})</h4>
          <div class="equipped-dice-grid" id="equipped-dice">
            ${this.renderEquippedDice()}
          </div>
        </div>
        
        <div class="owned-section">
          <h4>Collection</h4>
          <div class="owned-dice-grid" id="owned-dice">
            ${this.renderOwnedDice()}
          </div>
        </div>
      </div>
    `;
    
    this.bindInventoryEvents(container);
  }

  renderEquippedDice() {
    const html = this.inventory.equippedDice.map(die => `
      <div class="dice-slot equipped" data-id="${die.id}">
        <div class="dice-preview ${die.rarity}">
          <div class="dice-visual">
            ${this.renderDieVisual(die)}
          </div>
          <div class="dice-name">${die.name}</div>
          <div class="dice-face-preview">[${die.faceValues.join(', ')}]</div>
        </div>
        <button class="unequip-btn" data-id="${die.id}" title="Unequip">−</button>
        <button class="upgrade-btn" data-id="${die.id}" title="Upgrade">⚙</button>
      </div>
    `).join('');
    
    return html + this.renderEmptySlots();
  }

  renderDieVisual(die) {
    // Simple 2D representation of a die
    const topValue = die.faceValues[0];
    const bgColor = die.faceColors[0] || FACE_COLORS.default;
    const pipColor = die.pipColor || PIP_COLORS.default;
    
    return `
      <div class="die-visual-2d" style="background: ${bgColor}; color: ${pipColor};">
        <span>${topValue}</span>
      </div>
    `;
  }

  renderEmptySlots() {
    const empty = this.inventory.maxEquipped - this.inventory.equippedDice.length;
    return Array(empty).fill(`
      <div class="dice-slot empty">
        <span>Empty Slot</span>
      </div>
    `).join('');
  }

  renderOwnedDice() {
    const unequipped = this.inventory.ownedDice.filter(d => !d.equipped);
    if (unequipped.length === 0) {
      return '<div class="no-dice">All dice equipped!</div>';
    }
    
    return unequipped.map(die => `
      <div class="dice-slot owned" data-id="${die.id}">
        <div class="dice-preview ${die.rarity}">
          <div class="dice-visual">
            ${this.renderDieVisual(die)}
          </div>
          <div class="dice-name">${die.name}</div>
          <div class="dice-face-preview">[${die.faceValues.join(', ')}]</div>
        </div>
        <button class="equip-btn" data-id="${die.id}" title="Equip">+</button>
        <button class="upgrade-btn" data-id="${die.id}" title="Upgrade">⚙</button>
      </div>
    `).join('');
  }

  bindInventoryEvents(container) {
    // Equip buttons
    container.querySelectorAll('.equip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dieId = btn.dataset.id;
        if (this.inventory.equipDie(dieId)) {
          this.renderInventoryPanel(container);
          this.syncDiceTo3D();
        }
      });
    });
    
    // Unequip buttons
    container.querySelectorAll('.unequip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dieId = btn.dataset.id;
        if (this.inventory.unequipDie(dieId)) {
          this.renderInventoryPanel(container);
          this.syncDiceTo3D();
        }
      });
    });
    
    // Upgrade buttons
    container.querySelectorAll('.upgrade-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dieId = btn.dataset.id;
        this.openUpgradeModal(dieId);
      });
    });
  }

  // ===== UPGRADE MODAL =====
  
  openUpgradeModal(dieId) {
    const die = this.inventory.ownedDice.find(d => d.id === dieId);
    if (!die) return;
    
    this.selectedDie = die;
    this.selectedFace = 0;
    
    const modal = document.getElementById('modal-overlay');
    modal.style.display = 'flex';
    modal.innerHTML = this.renderUpgradeModal(die);
    
    this.bindUpgradeEvents(modal);
  }

  renderUpgradeModal(die) {
    const currentResearch = this.game ? this.game.research : 0;
    const availableUpgrades = this.upgradeManager.getAvailableUpgrades(die);
    const shapeInfo = DIE_SHAPES[die.shape] || DIE_SHAPES.d6;
    const colorInfo = DIE_COLORS[die.color] || DIE_COLORS.white;
    
    return `
      <div class="modal upgrade-modal">
        <div class="modal-header">
          <h3>⚙️ Upgrade: ${die.name}</h3>
          <button class="modal-close" id="close-upgrade">&times;</button>
        </div>
        
        <div class="upgrade-research-bar">
          <div class="research-available">
            <span class="research-icon">📚</span>
            <span>Available Research:</span>
            <span id="upgrade-research-available" class="research-amount">${currentResearch}</span>
          </div>
          <div class="upgrade-cost">
            <span>Upgrade Cost:</span>
            <span id="upgrade-cost-display" class="cost-amount">0</span>
          </div>
        </div>
        
        <div class="upgrade-content">
          <div class="die-preview-section">
            <div class="die-preview-placeholder">
              <div class="preview-die-large" 
                   style="background: ${colorInfo.hex}; border-color: ${colorInfo.hex};">
                <span class="shape-icon">${shapeInfo.icon}</span>
                <span class="die-name-small">${shapeInfo.name}</span>
              </div>
              <div class="die-stats">
                <div class="stat-row"><span>Shape:</span> <strong>${shapeInfo.name}</strong></div>
                <div class="stat-row"><span>Sides:</span> <strong>${shapeInfo.sides}</strong></div>
                <div class="stat-row"><span>Color:</span> <strong>${colorInfo.name}</strong></div>
                <div class="stat-row"><span>Values:</span> <strong>${die.faceValues.join(', ')}</strong></div>
                ${die.modifiers?.length > 0 ? `<div class="stat-row"><span>Mods:</span> <strong>${die.modifiers.map(m => DIE_MODIFIERS[m]?.name || m).join(', ')}</strong></div>` : ''}
              </div>
            </div>
            
            <div class="upgrade-tip">
              <p>💡 Earn more research to unlock new shapes, colors, and modifiers!</p>
              <p class="next-unlock">${this.getNextMilestoneText()}</p>
            </div>
          </div>
          
          <div class="upgrade-options">
            <!-- Die Shape -->
            <div class="upgrade-section">
              <h4>Die Shape ${availableUpgrades.shapes.length === 0 ? '<span class="locked-tag">🔒 Locked</span>' : ''}</h4>
              ${availableUpgrades.shapes.length > 0 ? `
                <div class="shape-grid">
                  ${availableUpgrades.shapes.map(shapeId => {
                    const shape = DIE_SHAPES[shapeId];
                    return `
                      <button class="shape-btn" data-shape="${shapeId}" title="${shape.name} - ${shape.sides} sides (${shape.unlockCost} research)">
                        <span class="shape-icon">${shape.icon}</span>
                        <span class="shape-name">${shape.name}</span>
                        <span class="shape-cost">${shape.unlockCost}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              ` : '<p class="locked-text">Reach research milestones to unlock more shapes!</p>'}
            </div>
            
            <!-- Die Color -->
            <div class="upgrade-section">
              <h4>Die Color ${availableUpgrades.colors.length === 0 ? '<span class="locked-tag">🔒 Locked</span>' : ''}</h4>
              ${availableUpgrades.colors.length > 0 || this.upgradeManager.unlockedColors.length > 1 ? `
                <div class="color-grid-large">
                  ${this.upgradeManager.unlockedColors.map(colorId => {
                    const color = DIE_COLORS[colorId];
                    const isSelected = die.color === colorId;
                    return `
                      <button class="color-btn-large ${isSelected ? 'selected' : ''}" 
                              data-color="${colorId}" 
                              style="background: ${color.hex};"
                              title="${color.name}${color.bonus ? ` (+${color.bonus} bonus)` : ''} (${UPGRADE_COSTS.color} research)">
                        <span class="color-name">${color.name}</span>
                        ${color.bonus ? `<span class="color-bonus">+${color.bonus}</span>` : ''}
                      </button>
                    `;
                  }).join('')}
                </div>
              ` : '<p class="locked-text">Reach 25 research to unlock colors!</p>'}
            </div>
            
            <!-- Face Values -->
            <div class="upgrade-section">
              <h4>Face Values <span class="cost-tag">${UPGRADE_COSTS.faceValue} research each</span></h4>
              <div class="face-grid">
                ${die.faceValues.map((val, i) => `
                  <div class="face-edit-group">
                    <button class="face-dec" data-face="${i}">−</button>
                    <span class="face-val" data-face="${i}">${val}</span>
                    <button class="face-inc" data-face="${i}">+</button>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- Modifiers -->
            <div class="upgrade-section">
              <h4>Modifiers ${availableUpgrades.modifiers.length === 0 && this.upgradeManager.unlockedModifiers.length === 0 ? '<span class="locked-tag">🔒 Locked</span>' : ''}</h4>
              ${this.upgradeManager.unlockedModifiers.length > 0 ? `
                <div class="modifier-grid">
                  ${this.upgradeManager.unlockedModifiers.map(modId => {
                    const mod = DIE_MODIFIERS[modId];
                    const isApplied = die.modifiers?.includes(modId);
                    return `
                      <button class="modifier-btn ${isApplied ? 'applied' : ''}" 
                              data-modifier="${modId}"
                              ${isApplied ? 'disabled' : ''}
                              title="${mod.description} (${mod.unlockCost} research)">
                        <span class="mod-name">${mod.name}</span>
                        <span class="mod-cost">${isApplied ? '✓' : mod.unlockCost}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              ` : '<p class="locked-text">Reach 75 research to unlock modifiers!</p>'}
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn" id="cancel-upgrade">Cancel</button>
          <button class="btn btn-primary" id="apply-upgrade" disabled>
            <span id="apply-btn-text">No Changes</span>
          </button>
        </div>
      </div>
    `;
  }

  getNextMilestoneText() {
    const currentResearch = this.game ? this.game.research : 0;
    const milestones = Object.entries(RESEARCH_MILESTONES)
      .map(([threshold, data]) => ({ threshold: parseInt(threshold), ...data }))
      .filter(m => m.threshold > currentResearch)
      .sort((a, b) => a.threshold - b.threshold);
    
    if (milestones.length === 0) {
      return '🎉 All milestones reached!';
    }
    
    const next = milestones[0];
    return `Next unlock at ${next.threshold} research: ${next.description}`;
  }

  bindUpgradeEvents(modal) {
    const die = this.selectedDie;
    if (!die) return;
    
    // Store original values to calculate cost
    const originalValues = [...die.faceValues];
    const originalShape = die.shape;
    const originalColor = die.color;
    const originalModifiers = [...(die.modifiers || [])];
    this.pendingUpgradeCost = 0;
    
    const pendingChanges = {
      faceChanges: 0,
      shapeChange: null,
      colorChange: null,
      newModifiers: []
    };
    
    const updateCostDisplay = () => {
      let cost = 0;
      
      // Calculate face value change cost
      for (let i = 0; i < die.faceValues.length; i++) {
        if (i < originalValues.length) {
          const diff = Math.abs(die.faceValues[i] - originalValues[i]);
          cost += diff * UPGRADE_COSTS.faceValue;
        }
      }
      pendingChanges.faceChanges = cost;
      
      // Shape change cost
      if (pendingChanges.shapeChange && pendingChanges.shapeChange !== originalShape) {
        cost += DIE_SHAPES[pendingChanges.shapeChange]?.unlockCost || 0;
      }
      
      // Color change cost
      if (pendingChanges.colorChange && pendingChanges.colorChange !== originalColor) {
        cost += UPGRADE_COSTS.color;
      }
      
      // Modifier costs
      pendingChanges.newModifiers.forEach(modId => {
        if (!originalModifiers.includes(modId)) {
          cost += DIE_MODIFIERS[modId]?.unlockCost || 0;
        }
      });
      
      this.pendingUpgradeCost = cost;
      
      const costDisplay = modal.querySelector('#upgrade-cost-display');
      const applyBtn = modal.querySelector('#apply-upgrade');
      const applyBtnText = modal.querySelector('#apply-btn-text');
      const currentResearch = this.game ? this.game.research : 0;
      
      if (costDisplay) {
        costDisplay.textContent = cost;
        costDisplay.classList.toggle('insufficient', cost > currentResearch);
      }
      
      if (applyBtn && applyBtnText) {
        if (cost === 0) {
          applyBtn.disabled = true;
          applyBtnText.textContent = 'No Changes';
        } else if (cost > currentResearch) {
          applyBtn.disabled = true;
          applyBtnText.textContent = `Need ${cost - currentResearch} more research`;
        } else {
          applyBtn.disabled = false;
          applyBtnText.textContent = `Apply (${cost} research)`;
        }
      }
    };
    
    const restoreOriginal = () => {
      die.faceValues = [...originalValues];
      die.shape = originalShape;
      die.color = originalColor;
      die.modifiers = [...originalModifiers];
    };
    
    // Close buttons
    modal.querySelector('#close-upgrade')?.addEventListener('click', () => {
      restoreOriginal();
      this.closeUpgradeModal();
    });
    modal.querySelector('#cancel-upgrade')?.addEventListener('click', () => {
      restoreOriginal();
      this.closeUpgradeModal();
    });
    
    // Face value increment/decrement
    modal.querySelectorAll('.face-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const faceIndex = parseInt(btn.dataset.face);
        const maxValue = DIE_SHAPES[die.shape]?.sides || 6;
        const newValue = Math.min(maxValue + 3, die.faceValues[faceIndex] + 1);
        die.faceValues[faceIndex] = newValue;
        modal.querySelector(`.face-val[data-face="${faceIndex}"]`).textContent = newValue;
        updateCostDisplay();
      });
    });
    
    modal.querySelectorAll('.face-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const faceIndex = parseInt(btn.dataset.face);
        const newValue = Math.max(0, die.faceValues[faceIndex] - 1);
        die.faceValues[faceIndex] = newValue;
        modal.querySelector(`.face-val[data-face="${faceIndex}"]`).textContent = newValue;
        updateCostDisplay();
      });
    });
    
    // Shape selection
    modal.querySelectorAll('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const shapeId = btn.dataset.shape;
        modal.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        pendingChanges.shapeChange = shapeId;
        
        // Update face values to new shape's base values
        die.shape = shapeId;
        die.faceValues = [...DIE_SHAPES[shapeId].baseValues];
        
        // Re-render face value controls
        const faceGrid = modal.querySelector('.face-grid');
        if (faceGrid) {
          faceGrid.innerHTML = die.faceValues.map((val, i) => `
            <div class="face-edit-group">
              <button class="face-dec" data-face="${i}">−</button>
              <span class="face-val" data-face="${i}">${val}</span>
              <button class="face-inc" data-face="${i}">+</button>
            </div>
          `).join('');
          
          // Rebind face events
          this.bindFaceEvents(modal, die, updateCostDisplay);
        }
        
        updateCostDisplay();
      });
    });
    
    // Color selection
    modal.querySelectorAll('.color-btn-large').forEach(btn => {
      btn.addEventListener('click', () => {
        const colorId = btn.dataset.color;
        modal.querySelectorAll('.color-btn-large').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        pendingChanges.colorChange = colorId;
        die.color = colorId;
        
        // Update preview
        const previewDie = modal.querySelector('.preview-die-large');
        if (previewDie) {
          const colorHex = DIE_COLORS[colorId]?.hex || '#e8e4dc';
          previewDie.style.background = colorHex;
          previewDie.style.borderColor = colorHex;
        }
        
        updateCostDisplay();
      });
    });
    
    // Modifier selection
    modal.querySelectorAll('.modifier-btn:not(.applied)').forEach(btn => {
      btn.addEventListener('click', () => {
        const modId = btn.dataset.modifier;
        if (!pendingChanges.newModifiers.includes(modId)) {
          pendingChanges.newModifiers.push(modId);
          btn.classList.add('pending');
          btn.querySelector('.mod-cost').textContent = '✓';
        } else {
          pendingChanges.newModifiers = pendingChanges.newModifiers.filter(m => m !== modId);
          btn.classList.remove('pending');
          btn.querySelector('.mod-cost').textContent = DIE_MODIFIERS[modId]?.unlockCost || 0;
        }
        updateCostDisplay();
      });
    });
    
    // Apply changes
    modal.querySelector('#apply-upgrade')?.addEventListener('click', () => {
      if (this.pendingUpgradeCost > 0 && this.game) {
        // Deduct research
        this.game.research -= this.pendingUpgradeCost;
        
        // Apply modifiers
        pendingChanges.newModifiers.forEach(modId => {
          if (!die.modifiers) die.modifiers = [];
          if (!die.modifiers.includes(modId)) {
            die.modifiers.push(modId);
          }
        });
        
        // Update face colors based on die color
        const colorHex = DIE_COLORS[die.color]?.hex || '#e8e4dc';
        die.faceColors = Array(die.faceValues.length).fill(colorHex);
        
        // Log the upgrade
        if (this.game.logEvent) {
          this.game.logEvent('upgrade', `Upgraded ${die.name} for ${this.pendingUpgradeCost} research`);
        }
        
        // Show notification
        this.showUpgradeNotification(die, this.pendingUpgradeCost);
        
        // Check for new milestone unlocks
        this.checkMilestones();
      }
      
      this.syncDiceTo3D();
      this.updateDiceValuesDisplay();
      this.closeUpgradeModal();
    });
    
    // Click outside to close (restore values)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        restoreOriginal();
        this.closeUpgradeModal();
      }
    });
    
    // Initial cost display
    updateCostDisplay();
  }

  bindFaceEvents(modal, die, updateCostDisplay) {
    modal.querySelectorAll('.face-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const faceIndex = parseInt(btn.dataset.face);
        const maxValue = DIE_SHAPES[die.shape]?.sides || 6;
        const newValue = Math.min(maxValue + 3, die.faceValues[faceIndex] + 1);
        die.faceValues[faceIndex] = newValue;
        modal.querySelector(`.face-val[data-face="${faceIndex}"]`).textContent = newValue;
        updateCostDisplay();
      });
    });
    
    modal.querySelectorAll('.face-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const faceIndex = parseInt(btn.dataset.face);
        const newValue = Math.max(0, die.faceValues[faceIndex] - 1);
        die.faceValues[faceIndex] = newValue;
        modal.querySelector(`.face-val[data-face="${faceIndex}"]`).textContent = newValue;
        updateCostDisplay();
      });
    });
  }

  showUpgradeNotification(die, cost) {
    const notification = document.createElement('div');
    notification.className = 'upgrade-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">⚙️</span>
        <span class="notification-text">${die.name} upgraded! (-${cost} research)</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 2000);
  }

  updateUpgradePreview(modal, die) {
    const preview = modal.querySelector('.preview-die');
    const label = modal.querySelector('.preview-label');
    if (preview && die) {
      preview.textContent = die.faceValues[this.selectedFace];
      preview.style.background = die.faceColors[this.selectedFace] || FACE_COLORS.default;
      preview.style.color = die.pipColor || PIP_COLORS.default;
    }
    if (label) {
      label.textContent = `Face ${this.selectedFace + 1}`;
    }
  }

  closeUpgradeModal() {
    const modal = document.getElementById('modal-overlay');
    modal.style.display = 'none';
    this.selectedDie = null;
    this.selectedFace = null;
  }

  // ===== REWARD DICE =====
  
  awardDie(config) {
    const die = this.inventory.addDie(config);
    this.showDieAwardNotification(die);
    return die;
  }

  showDieAwardNotification(die) {
    const notification = document.createElement('div');
    notification.className = 'die-award-notification';
    notification.innerHTML = `
      <div class="award-content">
        <div class="award-icon">🎲</div>
        <div class="award-text">
          <div class="award-title">New Die Acquired!</div>
          <div class="award-name ${die.rarity}">${die.name}</div>
          <div class="award-values">[${die.faceValues.join(', ')}]</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  // ===== SAVE/LOAD =====
  
  save() {
    return this.inventory.toJSON();
  }

  load(data) {
    this.inventory.fromJSON(data);
    this.syncDiceTo3D();
  }
}
