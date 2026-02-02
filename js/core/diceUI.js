// Dice UI - Inventory, Selection, and Upgrade Interface
import { Dice3DSystem, DiceInventory, FACE_COLORS, PIP_COLORS } from './dice3d.js';

export class DiceUI {
  constructor(game) {
    this.game = game;
    this.inventory = new DiceInventory();
    this.dice3d = null;
    this.selectedDie = null;
    this.selectedFace = null;
    
    // Initialize with starter dice
    this.initStarterDice();
  }

  initStarterDice() {
    // Add 5 starter dice
    for (let i = 0; i < 5; i++) {
      const die = this.inventory.addDie({
        name: `Standard Die ${i + 1}`,
        faceValues: [1, 2, 3, 4, 5, 6],
        rarity: 'common'
      });
      this.inventory.equipDie(die.id);
    }
  }

  init3DView(container) {
    this.dice3d = new Dice3DSystem(container);
    
    // Sync equipped dice to 3D view
    this.syncDiceTo3D();
    
    // Set up roll complete callback
    this.dice3d.onRollComplete = (results) => {
      this.onRollComplete(results);
    };
  }

  syncDiceTo3D() {
    if (!this.dice3d) return;
    
    this.dice3d.clearDice();
    
    const equipped = this.inventory.getEquippedDice();
    const spacing = 2;
    const startX = -((equipped.length - 1) * spacing) / 2;
    
    equipped.forEach((die, index) => {
      this.dice3d.createDie({
        id: die.id,
        faceValues: die.faceValues,
        faceColors: die.faceColors,
        pipColor: die.pipColor,
        position: { x: startX + index * spacing, y: 1, z: 0 },
        modifiers: die.modifiers
      });
    });
  }

  onRollComplete(results) {
    // Update game state with roll results
    results.forEach(result => {
      const gameDie = this.game.dice.find((d, i) => i === this.inventory.equippedDice.findIndex(ed => ed.id === result.id));
      if (gameDie) {
        gameDie.currentValue = result.value;
      }
    });
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('diceRollComplete', { detail: results }));
  }

  rollAll() {
    if (this.dice3d) {
      this.dice3d.rollAll();
    }
  }

  rollDie(dieId) {
    if (this.dice3d) {
      this.dice3d.rollDie(dieId);
    }
  }

  toggleLock(dieId) {
    if (this.dice3d) {
      return this.dice3d.toggleLock(dieId);
    }
    return false;
  }

  // ===== INVENTORY UI =====
  
  renderInventoryPanel(container) {
    container.innerHTML = `
      <div class="dice-inventory-panel">
        <h3 class="panel-title">🎲 Dice Collection</h3>
        
        <div class="equipped-section">
          <h4>Equipped (${this.inventory.equippedDice.length}/${this.inventory.maxEquipped})</h4>
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
    return this.inventory.equippedDice.map(die => `
      <div class="dice-slot equipped" data-id="${die.id}">
        <div class="dice-preview ${die.rarity}">
          <div class="dice-face-preview">${die.faceValues.join('-')}</div>
          <div class="dice-name">${die.name}</div>
        </div>
        <button class="unequip-btn" data-id="${die.id}">−</button>
      </div>
    `).join('') + this.renderEmptySlots();
  }

  renderEmptySlots() {
    const empty = this.inventory.maxEquipped - this.inventory.equippedDice.length;
    return Array(empty).fill('<div class="dice-slot empty">Empty Slot</div>').join('');
  }

  renderOwnedDice() {
    const unequipped = this.inventory.ownedDice.filter(d => !d.equipped);
    if (unequipped.length === 0) {
      return '<div class="no-dice">No unequipped dice</div>';
    }
    
    return unequipped.map(die => `
      <div class="dice-slot owned" data-id="${die.id}">
        <div class="dice-preview ${die.rarity}">
          <div class="dice-face-preview">${die.faceValues.join('-')}</div>
          <div class="dice-name">${die.name}</div>
        </div>
        <button class="equip-btn" data-id="${die.id}">+</button>
        <button class="upgrade-btn" data-id="${die.id}">⚙</button>
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
    
    // Click to select for upgrade
    container.querySelectorAll('.dice-slot.equipped, .dice-slot.owned').forEach(slot => {
      slot.addEventListener('click', () => {
        const dieId = slot.dataset.id;
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
    return `
      <div class="modal upgrade-modal">
        <div class="modal-header">
          <h3>Upgrade: ${die.name}</h3>
          <button class="modal-close" id="close-upgrade">&times;</button>
        </div>
        
        <div class="upgrade-content">
          <div class="die-3d-preview" id="die-preview-3d">
            <!-- 3D die preview would go here -->
            <div class="die-preview-placeholder">
              <div class="preview-die ${die.rarity}">${die.faceValues[this.selectedFace]}</div>
            </div>
          </div>
          
          <div class="face-selector">
            <h4>Select Face to Modify</h4>
            <div class="face-grid">
              ${die.faceValues.map((val, i) => `
                <button class="face-btn ${i === this.selectedFace ? 'selected' : ''}" data-face="${i}">
                  <span class="face-value">${val}</span>
                  <span class="face-label">Face ${i + 1}</span>
                </button>
              `).join('')}
            </div>
          </div>
          
          <div class="upgrade-options">
            <div class="upgrade-section">
              <h4>Face Value</h4>
              <div class="value-controls">
                <button class="value-btn" data-change="-1">−</button>
                <span class="current-value" id="current-face-value">${die.faceValues[this.selectedFace]}</span>
                <button class="value-btn" data-change="1">+</button>
              </div>
              <small>Cost: 10 research per +1</small>
            </div>
            
            <div class="upgrade-section">
              <h4>Face Color</h4>
              <div class="color-grid">
                ${Object.entries(FACE_COLORS).map(([name, color]) => `
                  <button class="color-btn" data-color="${color}" style="background: ${color}" title="${name}"></button>
                `).join('')}
              </div>
            </div>
            
            <div class="upgrade-section">
              <h4>Pip Color</h4>
              <div class="color-grid">
                ${Object.entries(PIP_COLORS).map(([name, color]) => `
                  <button class="pip-color-btn" data-color="${color}" style="background: ${color}" title="${name}"></button>
                `).join('')}
              </div>
            </div>
            
            <div class="upgrade-section">
              <h4>Special Modifiers</h4>
              <div class="modifier-grid">
                <button class="modifier-btn" data-modifier="glow" data-glow="#4a9b6a">✨ Glow</button>
                <button class="modifier-btn" data-modifier="symbol" data-symbol="⚡">⚡ Lightning</button>
                <button class="modifier-btn" data-modifier="symbol" data-symbol="🔥">🔥 Fire</button>
                <button class="modifier-btn" data-modifier="symbol" data-symbol="❄">❄ Ice</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn" id="cancel-upgrade">Cancel</button>
          <button class="btn btn-primary" id="apply-upgrade">Apply Changes</button>
        </div>
      </div>
    `;
  }

  bindUpgradeEvents(modal) {
    const die = this.selectedDie;
    if (!die) return;
    
    // Close button
    modal.querySelector('#close-upgrade').addEventListener('click', () => this.closeUpgradeModal());
    modal.querySelector('#cancel-upgrade').addEventListener('click', () => this.closeUpgradeModal());
    
    // Face selection
    modal.querySelectorAll('.face-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedFace = parseInt(btn.dataset.face);
        modal.querySelectorAll('.face-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        modal.querySelector('#current-face-value').textContent = die.faceValues[this.selectedFace];
        this.updatePreview(modal);
      });
    });
    
    // Value controls
    modal.querySelectorAll('.value-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const change = parseInt(btn.dataset.change);
        const newValue = Math.max(0, Math.min(20, die.faceValues[this.selectedFace] + change));
        die.faceValues[this.selectedFace] = newValue;
        modal.querySelector('#current-face-value').textContent = newValue;
        modal.querySelector(`.face-btn[data-face="${this.selectedFace}"] .face-value`).textContent = newValue;
        this.updatePreview(modal);
      });
    });
    
    // Color selection
    modal.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        die.faceColors[this.selectedFace] = btn.dataset.color;
        this.updatePreview(modal);
      });
    });
    
    // Pip color selection
    modal.querySelectorAll('.pip-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        die.pipColor = btn.dataset.color;
        this.updatePreview(modal);
      });
    });
    
    // Modifier selection
    modal.querySelectorAll('.modifier-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!die.modifiers[this.selectedFace]) {
          die.modifiers[this.selectedFace] = {};
        }
        if (btn.dataset.glow) {
          die.modifiers[this.selectedFace].glow = btn.dataset.glow;
        }
        if (btn.dataset.symbol) {
          die.modifiers[this.selectedFace].symbol = btn.dataset.symbol;
        }
        this.updatePreview(modal);
      });
    });
    
    // Apply changes
    modal.querySelector('#apply-upgrade').addEventListener('click', () => {
      this.syncDiceTo3D();
      this.closeUpgradeModal();
    });
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeUpgradeModal();
      }
    });
  }

  updatePreview(modal) {
    const die = this.selectedDie;
    const preview = modal.querySelector('.preview-die');
    if (preview && die) {
      preview.textContent = die.faceValues[this.selectedFace];
      preview.style.background = die.faceColors[this.selectedFace] || FACE_COLORS.default;
      preview.style.color = die.pipColor || PIP_COLORS.default;
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
    
    // Show notification
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
