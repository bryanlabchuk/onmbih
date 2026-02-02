// Visual Effects Manager
// Balatro-style scoring effects, particles, and animations

export class VisualEffects {
  constructor() {
    this.activePopups = [];
    this.comboCount = 0;
  }

  // Create a floating score popup
  createScorePopup(value, x, y, type = 'normal') {
    const popup = document.createElement('div');
    popup.className = `score-popup ${type}`;
    popup.textContent = `+${value}`;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    
    document.body.appendChild(popup);
    
    // Remove after animation
    setTimeout(() => {
      popup.remove();
    }, type === 'big-bonus' ? 2000 : 1500);
    
    return popup;
  }

  // Show combo text (like "PAIR!" "THREE OF A KIND!")
  showComboText(text, color = null) {
    const combo = document.createElement('div');
    combo.className = 'combo-text';
    combo.textContent = text;
    
    if (color) {
      combo.style.color = color;
      combo.style.textShadow = `0 0 20px ${color}, 0 0 40px ${color}, 3px 3px 0 rgba(0, 0, 0, 0.8)`;
    }
    
    document.body.appendChild(combo);
    
    // Play sound effect here if audio system available
    
    setTimeout(() => {
      combo.remove();
    }, 1500);
  }

  // Animate die value chips when scored
  animateDieChip(chipElement, delay = 0) {
    setTimeout(() => {
      chipElement.classList.add('scored', 'sparkle');
      
      setTimeout(() => {
        chipElement.classList.remove('scored', 'sparkle');
      }, 600);
    }, delay);
  }

  // Animate all bonus tags
  animateBonusTags() {
    const tags = document.querySelectorAll('.bonus-tag');
    tags.forEach((tag, index) => {
      setTimeout(() => {
        tag.classList.add('active');
        setTimeout(() => tag.classList.remove('active'), 500);
      }, index * 150);
    });
  }

  // Cascade effect for total score
  animateTotalScore() {
    const totalEl = document.querySelector('.dice-total');
    if (totalEl) {
      totalEl.classList.add('scoring');
      setTimeout(() => totalEl.classList.remove('scoring'), 800);
    }
  }

  // Screen shake effect
  screenShake(intensity = 'normal') {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      const shakeClass = intensity === 'big' ? 'screen-shake-big' : 'screen-shake';
      gameContainer.classList.add(shakeClass);
      setTimeout(() => gameContainer.classList.remove(shakeClass), intensity === 'big' ? 500 : 300);
    }
  }

  // Flash the challenge display on success
  flashChallengeSuccess() {
    const challengeDisplay = document.getElementById('challenge-display');
    if (challengeDisplay) {
      challengeDisplay.classList.add('success-flash');
      setTimeout(() => challengeDisplay.classList.remove('success-flash'), 1000);
    }
  }

  // Research gain animation flying to the counter
  animateResearchGain(amount, startX, startY) {
    const researchCounter = document.getElementById('research-value');
    if (!researchCounter) return;
    
    const counterRect = researchCounter.getBoundingClientRect();
    const endX = counterRect.left + counterRect.width / 2;
    const endY = counterRect.top + counterRect.height / 2;
    
    // Create multiple flying numbers
    const particles = Math.min(amount, 10);
    for (let i = 0; i < particles; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'research-cascade';
        el.textContent = '+' + Math.ceil(amount / particles);
        el.style.left = `${startX + (Math.random() - 0.5) * 50}px`;
        el.style.top = `${startY + (Math.random() - 0.5) * 30}px`;
        el.style.setProperty('--end-x', `${endX - startX}px`);
        
        document.body.appendChild(el);
        
        setTimeout(() => {
          el.remove();
          // Pulse the counter when particle arrives
          if (i === particles - 1) {
            researchCounter.style.transform = 'scale(1.3)';
            researchCounter.style.color = '#4a9b6a';
            setTimeout(() => {
              researchCounter.style.transform = '';
              researchCounter.style.color = '';
            }, 200);
          }
        }, 1000);
      }, i * 100);
    }
  }

  // Full scoring sequence - called when dice settle
  async playScoreSequence(diceResults, bonuses, totalScore, isSuccess) {
    const diceChips = document.querySelectorAll('.die-value-chip');
    const diceContainer = document.getElementById('dice-3d-container');
    const containerRect = diceContainer?.getBoundingClientRect() || { left: 400, top: 300 };
    
    // 1. Animate each die chip with slight delays
    diceChips.forEach((chip, index) => {
      this.animateDieChip(chip, index * 100);
      
      // Create popup for each die value
      const chipRect = chip.getBoundingClientRect();
      const value = diceResults[index]?.value || 0;
      if (value > 0) {
        setTimeout(() => {
          this.createScorePopup(
            value, 
            chipRect.left + chipRect.width / 2, 
            chipRect.top,
            value >= 6 ? 'bonus' : 'normal'
          );
        }, index * 100 + 200);
      }
    });
    
    // 2. Wait for die animations
    await this.delay(600);
    
    // 3. Show bonus combos one by one
    for (let i = 0; i < bonuses.length; i++) {
      const bonus = bonuses[i];
      
      // Show combo text
      this.showComboText(bonus.name + '!', this.getBonusColor(bonus.points));
      
      // Create bonus popup
      setTimeout(() => {
        this.createScorePopup(
          bonus.points,
          containerRect.left + containerRect.width / 2 + (Math.random() - 0.5) * 100,
          containerRect.top + containerRect.height / 2,
          bonus.points >= 30 ? 'big-bonus' : 'bonus'
        );
      }, 300);
      
      // Screen shake for big bonuses
      if (bonus.points >= 30) {
        this.screenShake('big');
      } else if (bonus.points >= 15) {
        this.screenShake('normal');
      }
      
      await this.delay(800);
    }
    
    // 4. Animate bonus tags
    this.animateBonusTags();
    
    // 5. Animate total score
    await this.delay(300);
    this.animateTotalScore();
    
    // 6. Success/failure effects
    if (isSuccess) {
      this.flashChallengeSuccess();
      this.screenShake('big');
    }
    
    return totalScore;
  }

  getBonusColor(points) {
    if (points >= 50) return '#c9944a'; // Gold for huge bonuses
    if (points >= 30) return '#9b4a9b'; // Purple for big bonuses
    if (points >= 15) return '#6aa3c7'; // Blue for medium
    return '#4a9b6a'; // Green for small
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Dice tray entrance animation
  animateDiceEntrance() {
    const tray = document.getElementById('dice-3d-container');
    if (tray) {
      tray.style.transform = 'translateY(20px)';
      tray.style.opacity = '0';
      
      requestAnimationFrame(() => {
        tray.style.transition = 'all 0.5s ease-out';
        tray.style.transform = 'translateY(0)';
        tray.style.opacity = '1';
      });
    }
  }

  // Condition met animation
  animateConditionMet(conditionElement) {
    if (conditionElement) {
      conditionElement.classList.add('condition-met');
      
      // Add checkmark bounce
      const status = conditionElement.querySelector('.condition-status');
      if (status) {
        status.style.transform = 'scale(0)';
        requestAnimationFrame(() => {
          status.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
          status.style.transform = 'scale(1)';
        });
      }
    }
  }
}

// Singleton instance
export const visualEffects = new VisualEffects();
