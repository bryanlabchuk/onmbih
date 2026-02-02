// Dice UI - Inventory, Selection, and Upgrade Interface
import { Dice3DSystem, DiceInventory, FACE_COLORS, PIP_COLORS } from './dice3d.js';

// Upgrade costs
const UPGRADE_COSTS = {
  valueChange: 15,      // Cost per +1 or -1 to face value
  colorChange: 5,       // Cost to change face color
  pipColorChange: 10,   // Cost to change pip color
  specialModifier: 25   // Cost for special effects
};

export class DiceUI {
  constructor(game) {
    this.game = game;
    this.inventory = new DiceInventory();
    this.dice3d = null;
    this.selectedDie = null;
    this.selectedFace = null;
    this.container = null;
    this.initialized = false;
    this.pendingUpgradeCost = 0;
    
    // Initialize with starter dice
    this.initStarterDice();
  }

  initStarterDice() {
    // Add 5 starter dice with slight variations
    const starterConfigs = [
      { name: 'Worn Die', faceValues: [1, 2, 3, 4, 5, 6], rarity: 'common' },
      { name: 'Dusty Die', faceValues: [1, 2, 3, 4, 5, 6], rarity: 'common' },
      { name: 'Chipped Die', faceValues: [1, 2, 3, 4, 5, 6], rarity: 'common' },
      { name: 'Faded Die', faceValues: [1, 2, 3, 4, 5, 6], rarity: 'common' },
      { name: 'Old Die', faceValues: [1, 2, 3, 4, 5, 6], rarity: 'common' }
    ];
    
    starterConfigs.forEach(config => {
      const die = this.inventory.addDie(config);
      this.inventory.equipDie(die.id);
    });
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
    
    if (!container) return;
    
    // Get values from 3D dice if available, otherwise from game dice
    let values = [];
    if (this.dice3d && this.dice3d.dice.length > 0) {
      values = this.dice3d.dice.map(d => ({
        value: d.mesh.userData.currentValue,
        locked: d.locked
      }));
    } else if (this.game && this.game.dice) {
      values = this.game.dice.map(d => ({
        value: d.currentValue,
        locked: d.locked
      }));
    } else {
      // Fallback for display
      values = this.inventory.equippedDice.map(() => ({ value: null, locked: false }));
    }
    
    let total = 0;
    
    container.innerHTML = values.map((d, i) => {
      const value = d.value !== null && d.value !== undefined ? d.value : '?';
      if (typeof d.value === 'number') total += d.value;
      
      return `
        <div class="die-value-chip ${d.locked ? 'locked' : ''}" 
             data-index="${i}"
             title="Die ${i + 1}${d.locked ? ' (Locked)' : ' - Click Roll to see value'}">
          ${value}
        </div>
      `;
    }).join('');
    
    if (totalEl) {
      totalEl.textContent = total;
    }
    
    if (researchEl && this.game) {
      researchEl.textContent = this.game.research || 0;
    }
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
          <div class="die-3d-preview" id="die-preview-3d">
            <div class="die-preview-placeholder">
              <div class="preview-die ${die.rarity}" 
                   style="background: ${die.faceColors[this.selectedFace] || FACE_COLORS.default}; color: ${die.pipColor || PIP_COLORS.default};">
                ${die.faceValues[this.selectedFace]}
              </div>
              <div class="preview-label">Face ${this.selectedFace + 1}</div>
            </div>
            
            <div class="upgrade-tip">
              <p>💡 <strong>Tip:</strong> Higher face values help you meet spirit challenge requirements!</p>
            </div>
          </div>
          
          <div class="upgrade-options">
            <div class="face-selector">
              <h4>Select Face to Modify</h4>
              <div class="face-grid">
                ${die.faceValues.map((val, i) => `
                  <button class="face-btn ${i === this.selectedFace ? 'selected' : ''}" data-face="${i}"
                          style="background: ${die.faceColors[i] || FACE_COLORS.default}; color: ${die.pipColor || PIP_COLORS.default};">
                    <span class="face-value">${val}</span>
                  </button>
                `).join('')}
              </div>
            </div>
            
            <div class="upgrade-section">
              <h4>Increase Face Value <span class="cost-tag">${UPGRADE_COSTS.valueChange} research each</span></h4>
              <div class="value-controls">
                <button class="value-btn" data-change="-1" title="Decrease (-${UPGRADE_COSTS.valueChange} research)">−</button>
                <span class="current-value" id="current-face-value">${die.faceValues[this.selectedFace]}</span>
                <button class="value-btn" data-change="1" title="Increase (+${UPGRADE_COSTS.valueChange} research)">+</button>
              </div>
              <div class="value-range">Range: 0 - 9</div>
            </div>
            
            <div class="upgrade-section">
              <h4>Face Color <span class="cost-tag">${UPGRADE_COSTS.colorChange} research</span></h4>
              <div class="color-grid">
                ${Object.entries(FACE_COLORS).map(([name, color]) => `
                  <button class="color-btn ${die.faceColors[this.selectedFace] === color ? 'selected' : ''}" 
                          data-color="${color}" 
                          data-name="${name}"
                          style="background: ${color}" 
                          title="${name} (${UPGRADE_COSTS.colorChange} research)"></button>
                `).join('')}
              </div>
            </div>
            
            <div class="upgrade-section">
              <h4>Pip Color <span class="cost-tag">${UPGRADE_COSTS.pipColorChange} research</span></h4>
              <div class="color-grid">
                ${Object.entries(PIP_COLORS).map(([name, color]) => `
                  <button class="pip-color-btn ${die.pipColor === color ? 'selected' : ''}" 
                          data-color="${color}" 
                          data-name="${name}"
                          style="background: ${color}" 
                          title="${name} (${UPGRADE_COSTS.pipColorChange} research)"></button>
                `).join('')}
              </div>
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

  bindUpgradeEvents(modal) {
    const die = this.selectedDie;
    if (!die) return;
    
    // Store original values to calculate cost
    const originalValues = [...die.faceValues];
    const originalColors = [...die.faceColors];
    const originalPipColor = die.pipColor;
    this.pendingUpgradeCost = 0;
    
    const updateCostDisplay = () => {
      let cost = 0;
      
      // Calculate value change cost
      for (let i = 0; i < 6; i++) {
        const diff = Math.abs(die.faceValues[i] - originalValues[i]);
        cost += diff * UPGRADE_COSTS.valueChange;
      }
      
      // Calculate color change cost
      for (let i = 0; i < 6; i++) {
        if (die.faceColors[i] !== originalColors[i]) {
          cost += UPGRADE_COSTS.colorChange;
        }
      }
      
      // Calculate pip color cost
      if (die.pipColor !== originalPipColor) {
        cost += UPGRADE_COSTS.pipColorChange;
      }
      
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
    
    // Close buttons
    modal.querySelector('#close-upgrade').addEventListener('click', () => {
      // Restore original values on cancel
      die.faceValues = [...originalValues];
      die.faceColors = [...originalColors];
      die.pipColor = originalPipColor;
      this.closeUpgradeModal();
    });
    modal.querySelector('#cancel-upgrade').addEventListener('click', () => {
      die.faceValues = [...originalValues];
      die.faceColors = [...originalColors];
      die.pipColor = originalPipColor;
      this.closeUpgradeModal();
    });
    
    // Face selection
    modal.querySelectorAll('.face-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedFace = parseInt(btn.dataset.face);
        modal.querySelectorAll('.face-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        modal.querySelector('#current-face-value').textContent = die.faceValues[this.selectedFace];
        this.updateUpgradePreview(modal, die);
      });
    });
    
    // Value controls
    modal.querySelectorAll('.value-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const change = parseInt(btn.dataset.change);
        const newValue = Math.max(0, Math.min(9, die.faceValues[this.selectedFace] + change));
        die.faceValues[this.selectedFace] = newValue;
        modal.querySelector('#current-face-value').textContent = newValue;
        modal.querySelector(`.face-btn[data-face="${this.selectedFace}"] .face-value`).textContent = newValue;
        this.updateUpgradePreview(modal, die);
        updateCostDisplay();
      });
    });
    
    // Color selection
    modal.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        die.faceColors[this.selectedFace] = btn.dataset.color;
        modal.querySelector(`.face-btn[data-face="${this.selectedFace}"]`).style.background = btn.dataset.color;
        this.updateUpgradePreview(modal, die);
        updateCostDisplay();
      });
    });
    
    // Pip color selection
    modal.querySelectorAll('.pip-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.pip-color-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        die.pipColor = btn.dataset.color;
        modal.querySelectorAll('.face-btn').forEach(fb => fb.style.color = btn.dataset.color);
        this.updateUpgradePreview(modal, die);
        updateCostDisplay();
      });
    });
    
    // Apply changes
    modal.querySelector('#apply-upgrade').addEventListener('click', () => {
      if (this.pendingUpgradeCost > 0 && this.game) {
        // Deduct research
        this.game.research -= this.pendingUpgradeCost;
        
        // Log the upgrade
        if (this.game.logEvent) {
          this.game.logEvent('upgrade', `Upgraded ${die.name} for ${this.pendingUpgradeCost} research`);
        }
        
        // Show notification
        this.showUpgradeNotification(die, this.pendingUpgradeCost);
      }
      
      this.syncDiceTo3D();
      this.updateDiceValuesDisplay();
      this.closeUpgradeModal();
    });
    
    // Click outside to close (restore values)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        die.faceValues = [...originalValues];
        die.faceColors = [...originalColors];
        die.pipColor = originalPipColor;
        this.closeUpgradeModal();
      }
    });
    
    // Initial cost display
    updateCostDisplay();
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
