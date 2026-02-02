// UI Renderer - Handles all DOM updates and user interactions
import { game, GAME_PHASES } from './game.js';
import { audio } from './audio.js';
import { TOWNSFOLK, RARITY_COLORS } from '../data/townsfolk.js';
import { SPIRITS, SPIRIT_TIERS } from '../data/spirits.js';
import { DICE_FACES } from '../data/diceFaces.js';

class UIRenderer {
  constructor() {
    this.elements = {};
    this.animating = false;
  }

  init() {
    // Cache DOM elements
    this.elements = {
      gameContainer: document.getElementById('game-container'),
      titleScreen: document.getElementById('title-screen'),
      gameScreen: document.getElementById('game-screen'),
      phaseIndicator: document.getElementById('phase-indicator'),
      phaseName: document.getElementById('phase-name'),
      phaseDescription: document.getElementById('phase-description'),
      sanityValue: document.getElementById('sanity-value'),
      sanityFill: document.getElementById('sanity-fill'),
      researchValue: document.getElementById('research-value'),
      spiritsValue: document.getElementById('spirits-value'),
      diceTray: document.getElementById('dice-tray'),
      rollsRemaining: document.getElementById('rolls-remaining'),
      rollBtn: document.getElementById('roll-btn'),
      confirmBtn: document.getElementById('confirm-btn'),
      alliesList: document.getElementById('allies-list'),
      spiritDisplay: document.getElementById('spirit-display'),
      eventLog: document.getElementById('event-log'),
      cardGrid: document.getElementById('card-grid'),
      scoreDisplay: document.getElementById('score-display'),
      modalOverlay: document.getElementById('modal-overlay')
    };

    // Bind events
    this.bindEvents();
    
    // Show title screen
    this.showTitleScreen();
  }

  bindEvents() {
    // Start game button
    document.getElementById('start-btn')?.addEventListener('click', () => {
      audio.init();
      audio.playClick();
      game.startGame();
      this.render();
    });

    // Roll button
    document.getElementById('roll-btn')?.addEventListener('click', () => {
      this.rollDice();
    });

    // Confirm button
    document.getElementById('confirm-btn')?.addEventListener('click', () => {
      this.confirmAction();
    });

    // Audio toggle
    document.getElementById('audio-toggle')?.addEventListener('click', () => {
      audio.toggle();
      this.updateAudioButton();
    });

    // Restart button
    document.getElementById('restart-btn')?.addEventListener('click', () => {
      game.reset();
      this.showTitleScreen();
    });
  }

  // ===== RENDER METHODS =====

  render() {
    this.updateStats();
    
    switch(game.phase) {
      case GAME_PHASES.TITLE:
        this.showTitleScreen();
        break;
      case GAME_PHASES.TOWN:
        this.showTownPhase();
        break;
      case GAME_PHASES.RESEARCH:
        this.showResearchPhase();
        break;
      case GAME_PHASES.SPIRIT_SELECT:
        this.showSpiritSelectPhase();
        break;
      case GAME_PHASES.CHALLENGE:
        this.showChallengePhase();
        break;
      case GAME_PHASES.REWARD:
        this.showRewardPhase();
        break;
      case GAME_PHASES.GAME_OVER:
        this.showGameOver();
        break;
      case GAME_PHASES.VICTORY:
        this.showVictory();
        break;
    }
    
    this.updateEventLog();
    this.updateAlliesPanel();
  }

  showTitleScreen() {
    const titleScreen = this.elements.titleScreen;
    const gameScreen = this.elements.gameScreen;
    
    if (titleScreen) titleScreen.style.display = 'flex';
    if (gameScreen) gameScreen.style.display = 'none';
  }

  hideTitle() {
    const titleScreen = this.elements.titleScreen;
    const gameScreen = this.elements.gameScreen;
    
    if (titleScreen) titleScreen.style.display = 'none';
    if (gameScreen) gameScreen.style.display = 'grid';
  }

  updateStats() {
    if (this.elements.sanityValue) {
      this.elements.sanityValue.textContent = game.sanity;
    }
    if (this.elements.sanityFill) {
      this.elements.sanityFill.style.width = `${(game.sanity / game.maxSanity) * 100}%`;
    }
    if (this.elements.researchValue) {
      this.elements.researchValue.textContent = game.research;
    }
    if (this.elements.spiritsValue) {
      this.elements.spiritsValue.textContent = `${game.spiritsBanished}/${game.totalSpirits}`;
    }
  }

  // ===== TOWN PHASE =====

  showTownPhase() {
    this.hideTitle();
    this.updatePhaseIndicator('Gather Allies', 'Choose a townsfolk to help your investigation');
    
    const cardGrid = this.elements.cardGrid;
    if (!cardGrid) return;
    
    cardGrid.innerHTML = '';
    cardGrid.style.display = 'flex';
    
    // Show available allies
    game.availableAllies.forEach(ally => {
      const card = this.createAllyCard(ally);
      card.addEventListener('click', () => {
        audio.playClick();
        if (game.recruitAlly(ally.id)) {
          audio.playSuccess();
          game.transitionTo(GAME_PHASES.RESEARCH);
          this.render();
        }
      });
      cardGrid.appendChild(card);
    });
    
    // Skip button
    const skipBtn = document.createElement('button');
    skipBtn.className = 'btn';
    skipBtn.textContent = 'Skip to Research';
    skipBtn.addEventListener('click', () => {
      audio.playClick();
      game.transitionTo(GAME_PHASES.RESEARCH);
      this.render();
    });
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-group';
    btnContainer.style.marginTop = '20px';
    btnContainer.appendChild(skipBtn);
    cardGrid.parentElement.appendChild(btnContainer);
    
    // Hide dice area
    const diceArea = document.getElementById('dice-area');
    if (diceArea) {
      diceArea.style.display = 'none';
    }
  }

  createAllyCard(ally) {
    const card = document.createElement('div');
    card.className = `card ${ally.isCompanion ? 'companion' : ''} ${ally.isBoyfriend ? 'boyfriend' : ''}`;
    
    // Determine type icon
    let typeIcon = '👤';
    if (ally.isCompanion) typeIcon = '🐾';
    if (ally.isBoyfriend) typeIcon = '💕';
    
    // Highlight dice-modifying abilities
    const hasDiceEffect = ally.ability.description.toLowerCase().includes('dice') || 
                          ally.ability.description.toLowerCase().includes('roll') ||
                          ally.ability.description.toLowerCase().includes('reroll');
    
    card.innerHTML = `
      <span class="card-rarity ${ally.rarity}"></span>
      <span class="card-type" style="position: absolute; top: 8px; left: 8px; font-size: 1rem;">${typeIcon}</span>
      <img class="card-portrait" src="${ally.image}" alt="${ally.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22140%22><rect fill=%22%231a1d26%22 width=%22100%%22 height=%22100%%22/><text x=%2250%%22 y=%2250%%22 fill=%22%239a9589%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2240%22>${typeIcon}</text></svg>'">
      <div class="card-content">
        <div class="card-name">${ally.name}</div>
        <div class="card-title">${ally.title}</div>
        <div class="card-ability ${hasDiceEffect ? 'dice-effect' : ''}">${ally.ability.name}: ${ally.ability.description}</div>
      </div>
    `;
    return card;
  }

  // ===== RECRUITMENT (for Progression Map) =====

  renderRecruitmentOptions(container, onComplete) {
    if (!container) {
      console.error('No container provided for recruitment options');
      if (onComplete) onComplete();
      return;
    }
    
    // Generate available allies
    const available = Object.values(TOWNSFOLK)
      .filter(t => t.unlocked && !game.allies?.find(a => a.id === t.id));
    
    // Shuffle and take 3
    const shuffled = available.sort(() => Math.random() - 0.5);
    game.availableAllies = shuffled.slice(0, 3);
    
    container.innerHTML = '';
    container.style.display = 'grid';
    
    // Check if player can recruit more
    const canRecruit = (game.allies?.length || 0) < (game.maxAllies || 3);
    
    if (!canRecruit) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <h3 style="color: var(--candle-orange);">Party Full!</h3>
          <p style="color: var(--text-secondary);">You cannot recruit more allies at your current level.</p>
          <button class="btn btn-primary" id="recruitment-continue">Continue</button>
        </div>
      `;
      document.getElementById('recruitment-continue')?.addEventListener('click', () => {
        if (onComplete) onComplete();
      });
      return;
    }
    
    // Show available allies
    game.availableAllies.slice(0, 3).forEach(ally => {
      const card = this.createAllyCard(ally);
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        audio.playClick();
        if (game.recruitAlly(ally.id)) {
          audio.playSuccess();
          // Log the recruitment
          window.uiBar?.logEvent(`Recruited ${ally.name}!`, 'success');
          if (onComplete) onComplete();
        }
      });
      container.appendChild(card);
    });
    
    // Skip button
    const skipContainer = document.createElement('div');
    skipContainer.style.cssText = 'grid-column: 1 / -1; text-align: center; margin-top: 20px;';
    skipContainer.innerHTML = `
      <button class="btn" id="recruitment-skip">Skip Recruitment</button>
    `;
    container.appendChild(skipContainer);
    
    document.getElementById('recruitment-skip')?.addEventListener('click', () => {
      audio.playClick();
      if (onComplete) onComplete();
    });
  }

  // ===== RESEARCH PHASE =====

  showResearchPhase() {
    this.hideTitle();
    this.updatePhaseIndicator('Research Phase', 'Roll dice to gather research on the spirits haunting Derek');
    
    // Hide card grid
    if (this.elements.cardGrid) {
      this.elements.cardGrid.style.display = 'none';
    }
    
    // Show dice area
    const diceArea = document.getElementById('dice-area');
    if (diceArea) {
      diceArea.style.display = 'flex';
    }
    
    // Update dice values display
    if (window.diceUI) {
      window.diceUI.updateDiceValuesDisplay();
    }
    
    // Update rolls display
    this.updateRollsDisplay();
    
    // Update research display in dice area
    const researchDisplay = document.getElementById('research-display');
    if (researchDisplay) {
      researchDisplay.textContent = game.research;
    }
    
    // Update roll button state
    const rollBtn = document.getElementById('roll-all-3d');
    if (rollBtn) {
      rollBtn.disabled = game.rollsRemaining <= 0;
      rollBtn.textContent = game.rollsRemaining > 0 ? '🎲 Roll All' : 'No Rolls Left';
    }
    
    // Update buttons
    if (this.elements.rollBtn) {
      this.elements.rollBtn.style.display = 'none';
    }
    if (this.elements.confirmBtn) {
      this.elements.confirmBtn.style.display = 'inline-block';
      this.elements.confirmBtn.textContent = 'Finish Research';
    }
    
    // Hide score display in research (we show total in dice area)
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
      scoreDisplay.style.display = 'none';
    }
  }

  // ===== SPIRIT SELECT PHASE =====

  showSpiritSelectPhase() {
    this.hideTitle();
    this.updatePhaseIndicator('Choose Your Target', 'Select a spirit to challenge');
    
    const cardGrid = this.elements.cardGrid;
    if (!cardGrid) return;
    
    cardGrid.innerHTML = '';
    cardGrid.style.display = 'flex';
    
    // Show available spirits
    game.discoveredSpirits.forEach(spirit => {
      const card = this.createSpiritCard(spirit);
      const canChallenge = game.research >= spirit.researchRequired;
      
      if (!canChallenge) {
        card.style.opacity = '0.5';
        card.style.cursor = 'not-allowed';
      }
      
      card.addEventListener('click', () => {
        if (canChallenge) {
          audio.playSpiritAppear();
          game.selectSpirit(spirit.id);
          game.transitionTo(GAME_PHASES.CHALLENGE);
          this.render();
        }
      });
      cardGrid.appendChild(card);
    });
    
    // Hide dice area
    const diceArea = document.getElementById('dice-area');
    if (diceArea) {
      diceArea.style.display = 'none';
    }
    
    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'btn';
    backBtn.textContent = 'Continue Research';
    backBtn.addEventListener('click', () => {
      audio.playClick();
      game.transitionTo(GAME_PHASES.RESEARCH);
      this.render();
    });
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-group';
    btnContainer.style.marginTop = '20px';
    btnContainer.appendChild(backBtn);
    cardGrid.parentElement.appendChild(btnContainer);
  }

  createSpiritCard(spirit) {
    const tierInfo = SPIRIT_TIERS[spirit.tier];
    const card = document.createElement('div');
    card.className = 'card spirit';
    card.innerHTML = `
      <img class="card-portrait" src="${spirit.image}" alt="${spirit.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22140%22><rect fill=%22%231a1d26%22 width=%22100%%22 height=%22100%%22/><text x=%2250%%22 y=%2250%%22 fill=%22%239b4a4a%22 text-anchor=%22middle%22 dy=%22.3em%22>👻</text></svg>'">
      <div class="card-content">
        <div class="card-name" style="color: ${tierInfo.color}">${spirit.name}</div>
        <div class="card-title">${spirit.title}</div>
        <div class="card-ability" style="color: var(--candle-orange)">
          Research Required: ${spirit.researchRequired}<br>
          ${spirit.challengeRequirement.description}
        </div>
      </div>
    `;
    return card;
  }

  // ===== CHALLENGE PHASE =====

  showChallengePhase() {
    this.hideTitle();
    
    if (!game.currentSpirit) {
      game.transitionTo(GAME_PHASES.SPIRIT_SELECT);
      return;
    }
    
    this.updatePhaseIndicator(
      `⚔️ Challenging: ${game.currentSpirit.name}`,
      game.currentSpirit.challengeRequirement.description
    );
    
    // Show dice area
    const diceArea = document.getElementById('dice-area');
    if (diceArea) {
      diceArea.style.display = 'flex';
    }
    
    // Update dice values display
    if (window.diceUI) {
      window.diceUI.updateDiceValuesDisplay();
    }
    
    // Hide card grid
    if (this.elements.cardGrid) {
      this.elements.cardGrid.style.display = 'none';
    }
    
    this.updateRollsDisplay();
    this.updateSpiritDisplay();
    
    // Update research display
    const researchDisplay = document.getElementById('research-display');
    if (researchDisplay) {
      researchDisplay.textContent = game.research;
    }
    
    // Update roll button state
    const rollBtn = document.getElementById('roll-all-3d');
    if (rollBtn) {
      rollBtn.disabled = game.rollsRemaining <= 0;
      rollBtn.textContent = game.rollsRemaining > 0 ? '🎲 Roll All' : 'No Rolls Left';
    }
    
    // Update buttons
    if (this.elements.rollBtn) {
      this.elements.rollBtn.style.display = 'none';
    }
    if (this.elements.confirmBtn) {
      this.elements.confirmBtn.style.display = 'inline-block';
      this.elements.confirmBtn.textContent = 'End Turn';
    }
    
    // Show score display
    this.updateScoreDisplay('challenge');
  }

  updateSpiritDisplay() {
    const display = this.elements.spiritDisplay;
    if (!display || !game.currentSpirit) return;
    
    const spirit = game.currentSpirit;
    const tierInfo = SPIRIT_TIERS[spirit.tier];
    
    display.innerHTML = `
      <img class="spirit-portrait ghost-float" src="${spirit.image}" alt="${spirit.name}">
      <div class="spirit-name">${spirit.name}</div>
      <div class="spirit-title">${spirit.title}</div>
      <div class="spirit-stats">
        <div class="spirit-stat">
          <div class="spirit-stat-label">Health</div>
          <div class="spirit-stat-value" style="color: var(--blood-red)">${spirit.health}</div>
        </div>
        <div class="spirit-stat">
          <div class="spirit-stat-label">Damage</div>
          <div class="spirit-stat-value" style="color: var(--candle-orange)">${spirit.damage}</div>
        </div>
      </div>
      <div class="requirement-box">
        <div class="requirement-label">Victory Condition</div>
        <div class="requirement-text">${spirit.challengeRequirement.description}</div>
      </div>
      <div class="flavor-text" style="margin-top: 15px; font-size: 0.8rem;">
        ${spirit.flavor}
      </div>
    `;
    display.style.display = 'block';
  }

  // ===== DICE RENDERING =====

  renderDice() {
    const tray = this.elements.diceTray;
    if (!tray) return;
    
    tray.innerHTML = '';
    
    game.dice.forEach((die, index) => {
      const dieEl = document.createElement('div');
      dieEl.className = 'die';
      dieEl.dataset.index = index;
      dieEl.dataset.value = die.currentValue || '?';
      
      if (die.locked) dieEl.classList.add('locked');
      if (die.cursed) dieEl.classList.add('cursed');
      
      dieEl.textContent = die.currentValue !== null ? die.currentValue : '?';
      
      // Click to lock/unlock
      dieEl.addEventListener('click', () => {
        if (this.animating) return;
        
        audio.playClick();
        if (die.locked) {
          game.unlockDie(index);
        } else {
          game.lockDie(index);
        }
        this.renderDice();
      });
      
      tray.appendChild(dieEl);
    });
  }

  async rollDice() {
    if (game.rollsRemaining <= 0 || this.animating) return;
    
    this.animating = true;
    audio.playDiceRoll();
    
    // Add rolling animation to unlocked dice
    const dieElements = this.elements.diceTray.querySelectorAll('.die:not(.locked)');
    dieElements.forEach(el => el.classList.add('rolling'));
    
    // Wait for animation
    await this.sleep(500);
    
    // Actually roll
    const results = game.rollDice();
    
    // Remove animation and update values
    dieElements.forEach((el, i) => {
      el.classList.remove('rolling');
      const dieIndex = parseInt(el.dataset.index);
      const die = game.dice[dieIndex];
      if (!die.locked && die.currentValue !== null) {
        audio.playDiceLand(die.currentValue);
      }
    });
    
    this.renderDice();
    this.updateRollsDisplay();
    this.updateScoreDisplay(game.phase === GAME_PHASES.RESEARCH ? 'research' : 'challenge');
    
    this.animating = false;
  }

  updateRollsDisplay() {
    if (this.elements.rollsRemaining) {
      this.elements.rollsRemaining.textContent = game.rollsRemaining;
    }
    if (this.elements.rollBtn) {
      this.elements.rollBtn.disabled = game.rollsRemaining <= 0;
    }
  }

  updateScoreDisplay(type) {
    const display = this.elements.scoreDisplay;
    if (!display) return;
    
    display.style.display = 'block';
    
    if (type === 'research') {
      const values = game.dice.map(d => d.currentValue).filter(v => v !== null);
      const sum = values.reduce((a, b) => a + b, 0);
      const pairs = game.countPairs(values);
      const triples = game.countTriples(values);
      const straight = game.longestStraight(values);
      
      // Calculate ally bonuses
      let allyBonus = 0;
      game.allies.forEach(ally => {
        if (ally.ability.effect.researchBonus) allyBonus += ally.ability.effect.researchBonus;
        if (ally.ability.effect.triplesBreakthrough && triples > 0) allyBonus += triples * ally.ability.effect.triplesBreakthrough;
      });
      
      const bonuses = [];
      if (pairs > 0) bonuses.push(`+${pairs * 2} pairs`);
      if (triples > 0) bonuses.push(`+${triples * 3} triples`);
      if (straight >= 3) bonuses.push(`+${straight * 2} straight`);
      if (allyBonus > 0) bonuses.push(`+${allyBonus} allies`);
      
      display.innerHTML = `
        <div class="score-label">Current Research Value</div>
        <div class="score-value">${sum}</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 10px;">
          ${bonuses.length > 0 ? bonuses.join(' • ') : 'Roll for bonuses!'}
        </div>
      `;
    } else if (type === 'challenge') {
      const score = game.calculateChallengeScore();
      const meetsReq = game.checkChallengeRequirement();
      
      display.innerHTML = `
        <div class="score-label">Challenge Score</div>
        <div class="score-value ${meetsReq ? 'success' : ''}">${score}</div>
        <div style="font-size: 0.9rem; color: ${meetsReq ? 'var(--spirit-green)' : 'var(--blood-red)'}; margin-top: 10px;">
          ${meetsReq ? '✓ Requirement Met!' : '✗ Keep rolling...'}
        </div>
      `;
    }
  }

  confirmAction() {
    audio.playClick();
    
    if (game.phase === GAME_PHASES.RESEARCH) {
      game.calculateResearch();
      game.transitionTo(GAME_PHASES.SPIRIT_SELECT);
      this.render();
    } else if (game.phase === GAME_PHASES.CHALLENGE) {
      const result = game.resolveChallengeRound();
      
      if (result === 'victory') {
        audio.playSpiritDefeat();
        setTimeout(() => this.render(), 1000);
      } else if (result === 'defeat') {
        audio.playFailure();
        setTimeout(() => this.render(), 1000);
      } else {
        audio.playDamage();
        game.rollsRemaining = game.maxRolls;
        game.dice.forEach(d => d.unlock());
        this.render();
      }
    }
  }

  // ===== REWARD PHASE =====

  showRewardPhase() {
    this.hideTitle();
    this.updatePhaseIndicator('Spirit Banished!', 'Collect your rewards');
    
    const cardGrid = this.elements.cardGrid;
    if (!cardGrid) return;
    
    cardGrid.style.display = 'flex';
    cardGrid.innerHTML = `
      <div style="text-align: center; width: 100%;">
        <h2 style="color: var(--spirit-green); margin-bottom: 20px;">Spirit Defeated!</h2>
        <p style="color: var(--text-secondary); margin-bottom: 30px;">
          You have banished ${game.spiritsBanished} of ${game.totalSpirits} spirits.
        </p>
        <button class="btn btn-primary" id="continue-btn">Continue</button>
      </div>
    `;
    
    document.getElementById('continue-btn')?.addEventListener('click', () => {
      audio.playClick();
      game.transitionTo(GAME_PHASES.TOWN);
      this.render();
    });
    
    // Hide dice
    if (this.elements.diceTray) {
      this.elements.diceTray.style.display = 'none';
    }
    if (this.elements.spiritDisplay) {
      this.elements.spiritDisplay.style.display = 'none';
    }
  }

  // ===== END SCREENS =====

  showGameOver() {
    const gameScreen = this.elements.gameScreen;
    if (!gameScreen) return;
    
    gameScreen.innerHTML = `
      <div class="end-screen">
        <h1 class="end-title defeat">Your Mind Shattered</h1>
        <p class="flavor-text" style="max-width: 500px; margin-bottom: 30px;">
          The spirits were too much. Your sanity crumbled like autumn leaves.
          Derek watched helplessly as another would-be savior fell to the family curse...
        </p>
        <div class="end-stats">
          <div class="end-stat">
            <div class="end-stat-value">${game.spiritsBanished}</div>
            <div class="end-stat-label">Spirits Banished</div>
          </div>
          <div class="end-stat">
            <div class="end-stat-value">${game.research}</div>
            <div class="end-stat-label">Research Gathered</div>
          </div>
        </div>
        <button class="btn btn-danger" id="restart-btn">Try Again</button>
      </div>
    `;
    
    document.getElementById('restart-btn')?.addEventListener('click', () => {
      game.reset();
      this.init();
    });
  }

  showVictory() {
    const gameScreen = this.elements.gameScreen;
    if (!gameScreen) return;
    
    gameScreen.innerHTML = `
      <div class="end-screen">
        <h1 class="end-title victory">Derek Is Free!</h1>
        <p class="flavor-text" style="max-width: 500px; margin-bottom: 30px;">
          Seven generations of Blackwood spirits have been banished.
          Derek looks at you with tears in his eyes - for the first time in his life,
          he is truly alone in his own body. "Thank you," he whispers. "Thank you."
        </p>
        <div class="end-stats">
          <div class="end-stat">
            <div class="end-stat-value">${game.sanity}</div>
            <div class="end-stat-label">Sanity Remaining</div>
          </div>
          <div class="end-stat">
            <div class="end-stat-value">${game.totalSpirits}</div>
            <div class="end-stat-label">Spirits Banished</div>
          </div>
        </div>
        <button class="btn btn-success" id="restart-btn">Play Again</button>
      </div>
    `;
    
    document.getElementById('restart-btn')?.addEventListener('click', () => {
      game.reset();
      this.init();
    });
  }

  // ===== HELPER METHODS =====

  updatePhaseIndicator(name, description) {
    if (this.elements.phaseName) {
      this.elements.phaseName.textContent = name;
    }
    if (this.elements.phaseDescription) {
      this.elements.phaseDescription.textContent = description;
    }
  }

  updateEventLog() {
    const log = this.elements.eventLog;
    if (!log) return;
    
    // Get last 10 events
    const events = game.log.slice(-10).reverse();
    
    log.innerHTML = events.map(e => {
      let className = 'log-entry';
      if (e.type === 'damage') className += ' damage';
      if (e.type === 'spirit_defeated' || e.type === 'victory') className += ' success';
      if (e.type === 'info' || e.type === 'phase_change') className += ' info';
      return `<div class="${className}">${e.message}</div>`;
    }).join('');
  }

  updateAlliesPanel() {
    const list = this.elements.alliesList;
    if (!list) return;
    
    if (game.allies.length === 0) {
      list.innerHTML = '<div class="flavor-text">No allies recruited yet</div>';
      return;
    }
    
    list.innerHTML = game.allies.map(ally => {
      let typeIcon = '👤';
      let typeClass = '';
      if (ally.isCompanion) { typeIcon = '🐾'; typeClass = 'companion'; }
      if (ally.isBoyfriend) { typeIcon = '💕'; typeClass = 'boyfriend'; }
      
      const hasDiceEffect = ally.ability.description.toLowerCase().includes('dice') || 
                            ally.ability.description.toLowerCase().includes('roll');
      
      return `
        <div class="ally-card-mini ${typeClass}" data-id="${ally.id}" title="${ally.ability.name}: ${ally.ability.description}">
          <span style="font-size: 0.8rem; margin-right: 5px;">${typeIcon}</span>
          <img class="ally-portrait-mini" src="${ally.image}" alt="${ally.name}" onerror="this.style.display='none'">
          <div class="ally-info-mini">
            <div class="ally-name-mini">${ally.name}</div>
            <div class="ally-title-mini">${ally.title}</div>
            ${hasDiceEffect ? '<div style="font-size: 0.6rem; color: var(--candle-orange);">🎲 Dice Effect</div>' : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  updateAudioButton() {
    const btn = document.getElementById('audio-toggle');
    if (btn) {
      btn.textContent = audio.enabled ? '🔊' : '🔇';
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const ui = new UIRenderer();
