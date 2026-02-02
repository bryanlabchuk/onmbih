// Tube Shop UI
// Handles the dice tube purchase and opening interface

import { TUBE_RARITIES, TUBE_ITEMS, DiceTube, TubeShop, RARITY_COLORS } from '../data/diceTubes.js';

export class TubeShopUI {
  constructor(game) {
    this.game = game;
    this.shop = new TubeShop();
    this.selectedTube = null;
    this.openingAnimation = false;
  }
  
  // Initialize shop with player level
  init(playerLevel = 1) {
    this.shop.restock(playerLevel);
  }
  
  // Render the shop modal
  render(container) {
    if (!container) return;
    
    const playerLevel = this.game.playerLevel || 1;
    this.shop.restock(playerLevel);
    
    container.innerHTML = `
      <div class="tube-shop">
        <div class="shop-header">
          <h3>🧪 Dice Tubes</h3>
          <p class="shop-subtitle">Mysterious tubes containing dice upgrades</p>
          <div class="shop-research">
            <span class="research-icon">📚</span>
            <span class="research-amount">${this.game.research}</span>
            <span class="research-label">Research</span>
          </div>
        </div>
        
        <div class="tubes-grid">
          ${this.shop.inventory.map((tube, index) => this.renderTube(tube, index)).join('')}
        </div>
        
        <div class="tube-preview" id="tube-preview" style="display: none;">
          <!-- Preview content -->
        </div>
        
        <div class="shop-legend">
          <h4>Tube Types</h4>
          <div class="legend-items">
            ${Object.values(TUBE_RARITIES).map(rarity => `
              <div class="legend-item">
                <span class="legend-icon" style="color: ${rarity.color}">${rarity.icon}</span>
                <span class="legend-name">${rarity.name}</span>
                <span class="legend-cost">${rarity.cost} pts</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    this.bindEvents(container);
  }
  
  // Render a single tube
  renderTube(tube, index) {
    const config = tube.config;
    const visibleItems = tube.getVisibleItems();
    const hiddenCount = tube.getHiddenCount();
    const canAfford = this.game.research >= tube.getCost();
    
    return `
      <div class="tube-card ${tube.opened ? 'opened' : ''} ${!canAfford ? 'unaffordable' : ''}"
           data-tube-index="${index}"
           style="--tube-color: ${config.color}">
        
        <div class="tube-header">
          <span class="tube-icon">${config.icon}</span>
          <span class="tube-name">${config.name}</span>
        </div>
        
        <div class="tube-body">
          <div class="tube-visual">
            <div class="tube-glass">
              ${this.renderTubeContents(visibleItems, hiddenCount, tube.opened)}
            </div>
            <div class="tube-cork ${tube.opened ? 'popped' : ''}"></div>
          </div>
          
          <div class="tube-info">
            <div class="tube-slots">
              <span class="slot-label">Peek Slots:</span>
              <span class="slot-count">${tube.visibilitySlots}</span>
            </div>
            <div class="tube-items-count">
              <span class="items-label">Contains:</span>
              <span class="items-count">${tube.contents.length} items</span>
            </div>
          </div>
        </div>
        
        <div class="tube-footer">
          ${tube.opened ? `
            <span class="tube-opened-label">✓ Opened</span>
          ` : `
            <button class="tube-buy-btn ${!canAfford ? 'disabled' : ''}"
                    data-tube-index="${index}"
                    ${!canAfford ? 'disabled' : ''}>
              <span class="buy-icon">📚</span>
              <span class="buy-cost">${tube.getCost()}</span>
            </button>
          `}
        </div>
      </div>
    `;
  }
  
  // Render the tube contents visualization
  renderTubeContents(visibleItems, hiddenCount, isOpened) {
    let html = '<div class="tube-contents">';
    
    // Visible items
    visibleItems.forEach((item, i) => {
      const itemData = TUBE_ITEMS[item.id] || item;
      html += `
        <div class="tube-item visible" style="--item-index: ${i}">
          <span class="item-icon">${itemData.icon}</span>
          <span class="item-rarity" style="color: ${RARITY_COLORS[itemData.rarity]}">${itemData.rarity}</span>
        </div>
      `;
    });
    
    // Hidden items (mystery slots)
    if (!isOpened) {
      for (let i = 0; i < hiddenCount; i++) {
        html += `
          <div class="tube-item hidden" style="--item-index: ${visibleItems.length + i}">
            <span class="item-icon">❓</span>
          </div>
        `;
      }
    }
    
    html += '</div>';
    return html;
  }
  
  // Render tube preview when selected
  renderTubePreview(tube, index) {
    const preview = document.getElementById('tube-preview');
    if (!preview) return;
    
    const config = tube.config;
    const visibleItems = tube.getVisibleItems();
    const hiddenCount = tube.getHiddenCount();
    const canAfford = this.game.research >= tube.getCost();
    
    preview.innerHTML = `
      <div class="preview-header" style="border-color: ${config.color}">
        <span class="preview-icon">${config.icon}</span>
        <h4>${config.name}</h4>
      </div>
      
      <div class="preview-body">
        <p class="preview-description">
          A ${config.name.toLowerCase()} with ${tube.visibilitySlots} peek slot${tube.visibilitySlots !== 1 ? 's' : ''}.
          Contains ${tube.contents.length} item${tube.contents.length !== 1 ? 's' : ''}.
        </p>
        
        <div class="preview-visible">
          <h5>Visible Contents (${visibleItems.length})</h5>
          <div class="visible-items">
            ${visibleItems.map(item => {
              const itemData = TUBE_ITEMS[item.id] || item;
              return `
                <div class="preview-item" style="border-color: ${RARITY_COLORS[itemData.rarity]}">
                  <span class="item-icon">${itemData.icon}</span>
                  <div class="item-details">
                    <span class="item-name">${itemData.name}</span>
                    <span class="item-desc">${itemData.description}</span>
                  </div>
                </div>
              `;
            }).join('') || '<p class="no-visible">No items visible</p>'}
          </div>
        </div>
        
        ${hiddenCount > 0 ? `
          <div class="preview-hidden">
            <span class="hidden-label">+ ${hiddenCount} mystery item${hiddenCount !== 1 ? 's' : ''}</span>
          </div>
        ` : ''}
        
        <div class="preview-rates">
          <h5>Drop Rates</h5>
          <div class="rate-bars">
            ${Object.entries(config.dropRates).filter(([_, rate]) => rate > 0).map(([rarity, rate]) => `
              <div class="rate-bar">
                <span class="rate-label" style="color: ${RARITY_COLORS[rarity]}">${rarity}</span>
                <div class="rate-fill" style="width: ${rate}%; background: ${RARITY_COLORS[rarity]}"></div>
                <span class="rate-value">${rate}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <div class="preview-footer">
        ${tube.opened ? `
          <span class="preview-opened">Already Opened</span>
        ` : `
          <button class="preview-buy-btn ${!canAfford ? 'disabled' : ''}"
                  data-tube-index="${index}"
                  ${!canAfford ? 'disabled' : ''}>
            ${canAfford ? `Buy & Open for ${tube.getCost()} Research` : `Need ${tube.getCost() - this.game.research} more Research`}
          </button>
        `}
      </div>
    `;
    
    preview.style.display = 'block';
    
    // Bind preview buy button
    const buyBtn = preview.querySelector('.preview-buy-btn');
    if (buyBtn && !tube.opened) {
      buyBtn.onclick = () => this.purchaseTube(index);
    }
  }
  
  // Bind event handlers
  bindEvents(container) {
    // Tube card clicks
    container.querySelectorAll('.tube-card').forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest('.tube-buy-btn')) return;
        
        const index = parseInt(card.dataset.tubeIndex);
        const tube = this.shop.inventory[index];
        
        // Deselect others
        container.querySelectorAll('.tube-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        this.selectedTube = index;
        this.renderTubePreview(tube, index);
      };
    });
    
    // Buy buttons
    container.querySelectorAll('.tube-buy-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.tubeIndex);
        this.purchaseTube(index);
      };
    });
  }
  
  // Purchase and open a tube
  purchaseTube(index) {
    const tube = this.shop.inventory[index];
    if (!tube || tube.opened) return;
    
    const cost = tube.getCost();
    if (this.game.research < cost) {
      window.uiBar?.logEvent('Not enough research points!', 'danger');
      return;
    }
    
    // Deduct cost
    this.game.research -= cost;
    document.getElementById('research-value').textContent = this.game.research;
    
    // Open the tube with animation
    this.openTubeWithAnimation(tube, index);
  }
  
  // Animated tube opening
  openTubeWithAnimation(tube, index) {
    if (this.openingAnimation) return;
    this.openingAnimation = true;
    
    const modal = document.getElementById('modal-overlay');
    
    // Create opening animation overlay
    modal.innerHTML = `
      <div class="tube-opening-screen">
        <div class="tube-opening-visual">
          <div class="opening-tube" style="--tube-color: ${tube.config.color}">
            <div class="tube-glass opening">
              <div class="tube-contents-reveal">
                ${tube.contents.map((item, i) => {
                  const itemData = TUBE_ITEMS[item.id] || item;
                  return `
                    <div class="reveal-item" style="--reveal-delay: ${i * 400 + 500}ms; --item-color: ${RARITY_COLORS[itemData.rarity]}">
                      <span class="reveal-icon">${itemData.icon}</span>
                      <div class="reveal-info">
                        <span class="reveal-name">${itemData.name}</span>
                        <span class="reveal-rarity">${itemData.rarity}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            <div class="tube-cork popping"></div>
          </div>
        </div>
        
        <div class="tube-results" style="opacity: 0">
          <h3>🎉 Tube Opened!</h3>
          <div class="results-items">
            ${tube.contents.map(item => {
              const itemData = TUBE_ITEMS[item.id] || item;
              return `
                <div class="result-item" style="border-color: ${RARITY_COLORS[itemData.rarity]}">
                  <span class="result-icon">${itemData.icon}</span>
                  <div class="result-details">
                    <span class="result-name">${itemData.name}</span>
                    <span class="result-desc">${itemData.description}</span>
                    <span class="result-rarity" style="color: ${RARITY_COLORS[itemData.rarity]}">${itemData.rarity}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <button class="btn btn-primary" id="close-tube-results">Collect Items</button>
        </div>
      </div>
    `;
    
    // Mark tube as opened
    tube.open();
    
    // Show results after animation
    setTimeout(() => {
      const results = modal.querySelector('.tube-results');
      if (results) results.style.opacity = '1';
    }, 500 + tube.contents.length * 400);
    
    // Close button
    document.getElementById('close-tube-results')?.addEventListener('click', () => {
      this.collectItems(tube);
      modal.style.display = 'none';
      this.openingAnimation = false;
      
      // Log the items received
      tube.contents.forEach(item => {
        const itemData = TUBE_ITEMS[item.id] || item;
        window.uiBar?.logEvent(`Received: ${itemData.name}`, 'success');
      });
      
      // Update research display
      document.querySelector('.shop-research .research-amount').textContent = this.game.research;
    });
  }
  
  // Apply collected items to game
  collectItems(tube) {
    tube.contents.forEach(item => {
      const itemData = TUBE_ITEMS[item.id] || item;
      this.applyItem(itemData);
    });
  }
  
  // Apply a single item to the game
  applyItem(item) {
    switch (item.type) {
      case 'face_value':
        // Store for later use on dice
        if (!this.game.tubeInventory) this.game.tubeInventory = {};
        if (!this.game.tubeInventory.faceUpgrades) this.game.tubeInventory.faceUpgrades = [];
        this.game.tubeInventory.faceUpgrades.push(item);
        break;
        
      case 'die_color':
        if (!this.game.tubeInventory) this.game.tubeInventory = {};
        if (!this.game.tubeInventory.dyes) this.game.tubeInventory.dyes = [];
        this.game.tubeInventory.dyes.push(item);
        break;
        
      case 'die_shape':
        if (!this.game.tubeInventory) this.game.tubeInventory = {};
        if (!this.game.tubeInventory.molds) this.game.tubeInventory.molds = [];
        this.game.tubeInventory.molds.push(item);
        break;
        
      case 'modifier':
        if (!this.game.tubeInventory) this.game.tubeInventory = {};
        if (!this.game.tubeInventory.modifiers) this.game.tubeInventory.modifiers = [];
        this.game.tubeInventory.modifiers.push(item);
        break;
        
      case 'new_die':
        // Add directly to dice inventory
        if (!this.game.tubeInventory) this.game.tubeInventory = {};
        if (!this.game.tubeInventory.newDice) this.game.tubeInventory.newDice = [];
        this.game.tubeInventory.newDice.push(item);
        break;
        
      case 'reroll_token':
        // Add rerolls directly
        this.game.bonusRerolls = (this.game.bonusRerolls || 0) + (item.count || 1);
        break;
    }
  }
  
  // Get count of unused items by type
  getItemCount(type) {
    if (!this.game.tubeInventory) return 0;
    
    switch (type) {
      case 'face_value':
        return this.game.tubeInventory.faceUpgrades?.length || 0;
      case 'die_color':
        return this.game.tubeInventory.dyes?.length || 0;
      case 'die_shape':
        return this.game.tubeInventory.molds?.length || 0;
      case 'modifier':
        return this.game.tubeInventory.modifiers?.length || 0;
      case 'new_die':
        return this.game.tubeInventory.newDice?.length || 0;
      default:
        return 0;
    }
  }
}
