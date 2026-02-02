// UI Bar Manager
// Handles the CRPG-style bottom bar interface

export class UIBar {
  constructor(game) {
    this.game = game;
    this.expandedPanel = null;
    this.diceUI = null;
    this.challengeUI = null;
  }

  init(diceUI, challengeUI) {
    this.diceUI = diceUI;
    this.challengeUI = challengeUI;
    
    this.bindPanelEvents();
    this.bindActionEvents();
    this.syncEventLog();
    
    // Initial update
    this.updateDicePreview();
    this.updateQuestPreview();
  }

  // ===== PANEL EXPAND/COLLAPSE =====
  bindPanelEvents() {
    // Panel headers toggle expansion
    document.querySelectorAll('.ui-panel-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const panel = header.closest('.ui-panel');
        const panelId = panel.id;
        
        if (panel.classList.contains('expanded')) {
          this.collapsePanel(panel);
        } else {
          // Collapse any other expanded panel first
          if (this.expandedPanel && this.expandedPanel !== panel) {
            this.collapsePanel(this.expandedPanel);
          }
          this.expandPanel(panel);
        }
      });
    });

    // Close panels when clicking outside
    document.addEventListener('click', (e) => {
      if (this.expandedPanel && 
          !e.target.closest('.ui-panel') &&
          !e.target.closest('.modal')) {
        this.collapsePanel(this.expandedPanel);
      }
    });

    // Escape key closes panels
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.expandedPanel) {
        this.collapsePanel(this.expandedPanel);
      }
    });
  }

  expandPanel(panel) {
    panel.classList.add('expanded');
    this.expandedPanel = panel;
    
    // Update content when expanded
    if (panel.id === 'dice-panel') {
      this.updateDiceExpanded();
    } else if (panel.id === 'quest-panel') {
      this.updateQuestExpanded();
    }
  }

  collapsePanel(panel) {
    panel.classList.remove('expanded');
    if (this.expandedPanel === panel) {
      this.expandedPanel = null;
    }
  }

  // ===== ACTION BUTTON EVENTS =====
  bindActionEvents() {
    // Skip challenge button
    document.getElementById('skip-challenge-btn')?.addEventListener('click', () => {
      if (this.challengeUI && this.challengeUI.currentChallenge) {
        // Complete with failure
        this.logEvent('Skipped current challenge', 'warning');
        this.challengeUI.completeChallenge(false);
        
        // Clear quest display
        this.clearQuestDisplay();
        
        // Reset game rolls
        if (this.game) {
          this.game.rollsRemaining = this.game.maxRolls || 3;
          this.game.rollsUsedThisChallenge = 0;
        }
        
        // Update UI
        this.updateRollButton(false, this.game?.rollsRemaining || 3);
        
        // Show continue button to go to map
        setTimeout(() => {
          this.logEvent('Click Continue to choose next destination', 'info');
          this.showContinueButton(() => {
            // Complete the current node and show map
            if (this.game.currentNode && window.progressionMap) {
              window.progressionMap.completeNode(this.game.currentNode.id);
              window.progressionMap.show();
            }
          });
        }, 500);
      } else {
        this.logEvent('No active challenge to skip', 'warning');
      }
    });

    // Listen for challenge clear events
    window.addEventListener('challengeCleared', () => {
      this.clearQuestDisplay();
    });
  }

  // ===== DICE PREVIEW =====
  updateDicePreview() {
    const container = document.getElementById('dice-mini-preview');
    if (!container || !this.diceUI) return;

    const equipped = this.diceUI.inventory?.equippedDice || [];
    const values = this.diceUI.getCurrentValues?.() || [];
    const areDocked = this.diceUI.dice3d?.diceAreDocked;
    
    // Color lookup
    const colorHexMap = {
      white: '#e8e4dc',
      red: '#c94a4a',
      blue: '#6aa3c7',
      green: '#4a9b6a',
      purple: '#9b4a9b',
      gold: '#c9944a',
      black: '#2a2a2a',
      ghost: '#a8c4d4'
    };

    container.innerHTML = equipped.map((die, i) => {
      const value = values[i]?.value;
      const displayValue = value !== null && value !== undefined ? value : (areDocked ? '•' : '?');
      const isDocked = areDocked || value === null || value === undefined;
      const colorHex = die.colorHex || colorHexMap[die.color] || '#e8e4dc';
      
      return `
        <div class="dice-mini ${isDocked ? 'docked' : ''}" 
             style="border-color: ${colorHex};"
             title="${die.name || 'Die'}">
          ${displayValue}
        </div>
      `;
    }).join('');
  }

  updateDiceExpanded() {
    const container = document.getElementById('dice-equipped-list');
    if (!container || !this.diceUI) return;

    const equipped = this.diceUI.inventory?.equippedDice || [];
    
    // Import shape/color data from the diceUI
    let DIE_SHAPES = {};
    let DIE_COLORS = {};
    
    try {
      // These are imported in diceUI
      if (this.diceUI.constructor) {
        // Get from the module if available
        const shapes = { 
          d4: { name: 'D4', icon: '🔺' },
          d6: { name: 'D6', icon: '🎲' },
          d8: { name: 'D8', icon: '💎' },
          d10: { name: 'D10', icon: '🔷' },
          d12: { name: 'D12', icon: '⬡' },
          d20: { name: 'D20', icon: '🌟' }
        };
        const colors = {
          white: { name: 'White', hex: '#e8e4dc' },
          red: { name: 'Red', hex: '#c94a4a' },
          blue: { name: 'Blue', hex: '#6aa3c7' },
          green: { name: 'Green', hex: '#4a9b6a' },
          purple: { name: 'Purple', hex: '#9b4a9b' },
          gold: { name: 'Gold', hex: '#c9944a' },
          black: { name: 'Black', hex: '#2a2a2a' },
          ghost: { name: 'Ghost', hex: '#a8c4d4' }
        };
        DIE_SHAPES = shapes;
        DIE_COLORS = colors;
      }
    } catch (e) {
      console.warn('Could not get dice data', e);
    }

    container.innerHTML = equipped.map((die, i) => {
      const shapeData = DIE_SHAPES[die.shape] || {};
      const colorData = DIE_COLORS[die.color] || {};
      
      return `
        <div class="dice-equipped-item" data-index="${i}">
          <span class="die-icon" style="color: ${colorData.hex || '#e8e4dc'}">
            ${shapeData.icon || '🎲'}
          </span>
          <span>${shapeData.name || 'D6'}</span>
          <span style="font-size: 0.65rem; color: var(--text-muted);">
            ${colorData.name || 'White'}
          </span>
        </div>
      `;
    }).join('');

    // Click to select die for upgrade
    container.querySelectorAll('.dice-equipped-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        if (this.diceUI.showUpgradeModal) {
          this.collapsePanel(document.getElementById('dice-panel'));
          this.diceUI.showUpgradeModal(index);
        }
      });
    });
  }

  // ===== QUEST PREVIEW =====
  updateQuestPreview() {
    const nameEl = document.querySelector('#quest-preview .quest-preview-name');
    const pipsEl = document.getElementById('quest-pips');
    
    if (!this.challengeUI || !this.challengeUI.currentChallenge) {
      if (nameEl) nameEl.textContent = 'Select a destination';
      if (pipsEl) pipsEl.innerHTML = '';
      return;
    }

    const challenge = this.challengeUI.currentChallenge;
    const conditions = challenge.conditions || [];
    const conditionResults = this.challengeUI.lastConditionResults || [];

    if (nameEl) {
      nameEl.textContent = challenge.name || 'Challenge';
    }

    if (pipsEl) {
      pipsEl.innerHTML = conditions.map((cond, i) => {
        const result = conditionResults[i];
        let statusClass = 'pending';
        if (result?.passed) statusClass = 'passed';
        else if (result?.checked && !result?.passed) statusClass = 'failed';
        
        return `<span class="quest-condition-pip ${statusClass}" title="${cond.description || ''}"></span>`;
      }).join('');
    }
  }

  // Clear all challenge/quest display when entering a new location
  clearQuestDisplay() {
    const nameEl = document.querySelector('#quest-preview .quest-preview-name');
    const pipsEl = document.getElementById('quest-pips');
    
    if (nameEl) nameEl.textContent = 'Select a destination';
    if (pipsEl) pipsEl.innerHTML = '';
    
    // Clear expanded view too
    const tierBadge = document.getElementById('quest-tier-badge');
    const detailName = document.getElementById('quest-detail-name');
    const detailType = document.getElementById('quest-detail-type');
    const conditionsList = document.getElementById('quest-conditions-list');
    const rewardSection = document.getElementById('quest-reward-section');
    
    if (tierBadge) tierBadge.textContent = '';
    if (detailName) detailName.textContent = 'No Active Challenge';
    if (detailType) detailType.textContent = 'Choose a destination from the map';
    if (conditionsList) conditionsList.innerHTML = '';
    if (rewardSection) rewardSection.style.display = 'none';
  }

  updateQuestExpanded() {
    if (!this.challengeUI) return;

    const challenge = this.challengeUI.currentChallenge;
    const tierBadge = document.getElementById('quest-tier-badge');
    const nameEl = document.getElementById('quest-detail-name');
    const typeEl = document.getElementById('quest-detail-type');
    const conditionsList = document.getElementById('quest-conditions-list');
    const rewardSection = document.getElementById('quest-reward-section');
    const rewardValue = document.getElementById('quest-reward-value');

    if (!challenge) {
      if (nameEl) nameEl.textContent = 'Select a Challenge';
      if (typeEl) typeEl.textContent = 'Use "New" button to pick one';
      if (conditionsList) conditionsList.innerHTML = '';
      if (rewardSection) rewardSection.style.display = 'none';
      return;
    }

    const tierIcons = { easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐', expert: '💀' };
    
    if (tierBadge) tierBadge.textContent = tierIcons[challenge.tier] || '⭐';
    if (nameEl) nameEl.textContent = challenge.name || 'Challenge';
    if (typeEl) typeEl.textContent = `${challenge.tier?.toUpperCase() || 'EASY'} RESEARCH`;

    // Render conditions
    if (conditionsList) {
      const conditions = challenge.conditions || [];
      const conditionResults = this.challengeUI.lastConditionResults || [];

      conditionsList.innerHTML = conditions.map((cond, i) => {
        const result = conditionResults[i];
        let statusClass = 'pending';
        let statusIcon = '○';
        
        if (result?.passed) {
          statusClass = 'passed';
          statusIcon = '✓';
        } else if (result?.checked && !result?.passed) {
          statusClass = 'failed';
          statusIcon = '✗';
        }

        return `
          <div class="quest-condition">
            <span class="quest-condition-status ${statusClass}">${statusIcon}</span>
            <span class="quest-condition-text">${cond.description || cond.type}</span>
          </div>
        `;
      }).join('');
    }

    // Reward
    if (rewardSection && rewardValue) {
      rewardSection.style.display = 'flex';
      rewardValue.textContent = `+${challenge.reward || 0} Research`;
    }
  }

  // ===== EVENT LOG =====
  syncEventLog() {
    // Watch the legacy event log and sync to UI bar log
    const legacyLog = document.getElementById('event-log');
    const uiLog = document.getElementById('ui-event-log');
    
    if (!legacyLog || !uiLog) return;

    // Create a mutation observer to watch for new log entries
    const observer = new MutationObserver((mutations) => {
      this.updateEventLog();
    });

    observer.observe(legacyLog, { childList: true, subtree: true });
  }

  updateEventLog() {
    const legacyLog = document.getElementById('event-log');
    const uiLog = document.getElementById('ui-event-log');
    
    if (!legacyLog || !uiLog) return;

    // Copy entries from legacy log
    const entries = legacyLog.querySelectorAll('.log-entry');
    const recentEntries = Array.from(entries).slice(-20); // Keep last 20

    uiLog.innerHTML = recentEntries.map(entry => {
      const classes = Array.from(entry.classList).filter(c => c !== 'log-entry').join(' ');
      return `<div class="ui-log-entry ${classes}">${entry.textContent}</div>`;
    }).join('');

    // Scroll to bottom
    uiLog.scrollTop = uiLog.scrollHeight;
  }

  logEvent(message, type = 'info') {
    const uiLog = document.getElementById('ui-event-log');
    if (!uiLog) return;

    const entry = document.createElement('div');
    entry.className = `ui-log-entry ${type}`;
    
    const time = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    
    entry.innerHTML = `<span class="log-time">${time}</span>${message}`;
    uiLog.appendChild(entry);

    // Trim old entries
    while (uiLog.children.length > 50) {
      uiLog.removeChild(uiLog.firstChild);
    }

    // Scroll to bottom
    uiLog.scrollTop = uiLog.scrollHeight;
  }

  // ===== STATUS UPDATES =====
  updateStatus() {
    // Update rolls badge
    const rollsBadge = document.getElementById('rolls-badge');
    if (rollsBadge) {
      rollsBadge.textContent = this.game.rollsRemaining;
    }

    // Update location name
    const locationName = document.getElementById('current-location-name');
    if (locationName && this.game.currentLocation) {
      locationName.textContent = this.game.currentLocation.name || 'Your House';
    }
  }

  // ===== ROLL BUTTON STATE =====
  updateRollButton(isRolling, rollsRemaining) {
    const btn = document.getElementById('roll-all-3d');
    const badge = document.getElementById('rolls-badge');
    
    if (btn) {
      if (isRolling) {
        btn.disabled = true;
        btn.querySelector('span:not(.btn-icon):not(.rolls-badge)').textContent = 'Rolling...';
      } else {
        btn.disabled = rollsRemaining <= 0;
        btn.querySelector('span:not(.btn-icon):not(.rolls-badge)').textContent = rollsRemaining > 0 ? 'Roll' : 'Done';
      }
    }
    
    if (badge) {
      badge.textContent = rollsRemaining;
    }
  }

  // Full refresh of all UI bar elements
  refresh() {
    this.updateDicePreview();
    this.updateQuestPreview();
    this.updateStatus();
    this.updateEventLog();
    
    if (this.expandedPanel?.id === 'dice-panel') {
      this.updateDiceExpanded();
    } else if (this.expandedPanel?.id === 'quest-panel') {
      this.updateQuestExpanded();
    }
  }

  // Reset UI when entering a new location
  resetForNewLocation(locationName) {
    // Clear any expanded panel
    if (this.expandedPanel) {
      this.collapsePanel(this.expandedPanel);
    }
    
    // Clear quest display
    this.clearQuestDisplay();
    
    // Update dice preview to show docked state
    this.updateDicePreview();
    
    // Update location name
    const locationEl = document.getElementById('current-location-name');
    if (locationEl) {
      locationEl.textContent = locationName || 'Unknown';
    }
    
    // Reset roll button
    this.updateRollButton(false, this.game?.rollsRemaining || 3);
    
    // Update status
    this.updateStatus();
  }

  // Show a "Continue" button in the UI bar actions area
  showContinueButton(onContinue) {
    const actionsArea = document.querySelector('.ui-actions');
    if (!actionsArea) return;
    
    // Hide other action buttons temporarily
    const skipBtn = document.getElementById('skip-challenge-btn');
    const rollBtn = document.getElementById('roll-all-3d');
    if (skipBtn) skipBtn.style.display = 'none';
    if (rollBtn) rollBtn.style.display = 'none';
    
    // Create continue button
    let continueBtn = document.getElementById('continue-btn-action');
    if (!continueBtn) {
      continueBtn = document.createElement('button');
      continueBtn.id = 'continue-btn-action';
      continueBtn.className = 'btn btn-primary action-btn';
      continueBtn.innerHTML = '<span class="btn-icon">🗺️</span><span>Continue</span>';
      actionsArea.appendChild(continueBtn);
    }
    
    continueBtn.style.display = 'flex';
    continueBtn.onclick = () => {
      // Hide continue button
      continueBtn.style.display = 'none';
      
      // Show other buttons
      if (skipBtn) skipBtn.style.display = '';
      if (rollBtn) rollBtn.style.display = '';
      
      // Call callback
      if (onContinue) onContinue();
    };
  }

  // Hide the continue button and restore normal buttons
  hideContinueButton() {
    const continueBtn = document.getElementById('continue-btn-action');
    const skipBtn = document.getElementById('skip-challenge-btn');
    const rollBtn = document.getElementById('roll-all-3d');
    
    if (continueBtn) continueBtn.style.display = 'none';
    if (skipBtn) skipBtn.style.display = '';
    if (rollBtn) rollBtn.style.display = '';
  }
}

// Singleton instance
export const uiBar = new UIBar(null);
