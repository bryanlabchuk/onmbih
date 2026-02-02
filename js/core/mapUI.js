// Map UI - Town map overlay with location selection
import { LOCATIONS, LOCATION_CATEGORIES, getUnlockedLocations } from '../data/locations.js';

export class MapUI {
  constructor(game) {
    this.game = game;
    this.currentLocation = null;
    this.selectedLocation = null;
    this.mapContainer = null;
    this.isVisible = false;
    this.onLocationSelect = null; // Callback when location is selected
  }

  init() {
    this.mapContainer = document.getElementById('map-overlay');
    if (!this.mapContainer) {
      console.error('Map container not found');
      return;
    }
    
    this.render();
    this.bindEvents();
  }

  render() {
    if (!this.mapContainer) return;

    const unlockedLocations = getUnlockedLocations(this.game);
    
    this.mapContainer.innerHTML = `
      <div class="map-wrapper">
        <!-- Map Header -->
        <div class="map-header">
          <h2 class="map-title">🗺️ Blackwood, Massachusetts</h2>
          <div class="map-subtitle">Population: 6,660 (and counting...)</div>
          <button class="btn map-close-btn" id="close-map">✕</button>
        </div>

        <!-- Main Content -->
        <div class="map-content">
          <!-- Sidebar with location list -->
          <div class="map-sidebar">
            <div class="sidebar-header">
              <h3>📍 Locations</h3>
              <div class="location-count">${unlockedLocations.length}/${Object.keys(LOCATIONS).length} discovered</div>
            </div>
            
            <div class="location-categories">
              ${this.renderLocationCategories()}
            </div>
          </div>

          <!-- Map Area -->
          <div class="map-area">
            <div class="town-map" id="town-map">
              ${this.renderMapBackground()}
              ${this.renderMapLocations()}
            </div>
            
            <!-- Location Preview -->
            <div class="location-preview" id="location-preview">
              <div class="preview-placeholder">
                <span class="preview-icon">🗺️</span>
                <p>Select a location to see details</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with current status -->
        <div class="map-footer">
          <div class="player-status">
            <span class="status-item">🧠 Sanity: ${this.game.sanity}/${this.game.maxSanity}</span>
            <span class="status-item">📚 Research: ${this.game.research}</span>
            <span class="status-item">👻 Spirits Banished: ${this.game.spiritsBanished}/${this.game.totalSpirits}</span>
          </div>
          <div class="current-time">
            <span class="time-icon">🌙</span>
            <span>Night ${this.game.turn + 1}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderLocationCategories() {
    return Object.entries(LOCATION_CATEGORIES).map(([catId, category]) => {
      const categoryLocations = category.locations.map(locId => LOCATIONS[locId]);
      
      return `
        <div class="location-category">
          <div class="category-header">
            <span class="category-icon">${category.icon}</span>
            <span class="category-name">${category.name}</span>
          </div>
          <div class="category-locations">
            ${categoryLocations.map(loc => this.renderLocationListItem(loc)).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  renderLocationListItem(location) {
    const isUnlocked = this.isLocationUnlocked(location);
    const isSelected = this.selectedLocation?.id === location.id;
    const isCurrent = this.currentLocation?.id === location.id;
    
    return `
      <div class="location-list-item ${isUnlocked ? '' : 'locked'} ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}"
           data-location="${location.id}"
           ${isUnlocked ? '' : 'title="' + this.getUnlockRequirementText(location) + '"'}>
        <span class="location-icon">${isUnlocked ? location.icon : '🔒'}</span>
        <span class="location-name">${isUnlocked ? location.name : '???'}</span>
        ${isCurrent ? '<span class="current-badge">HERE</span>' : ''}
      </div>
    `;
  }

  renderMapBackground() {
    // SVG background with roads and decorative elements
    return `
      <svg class="map-bg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <!-- Background -->
        <rect width="100" height="100" fill="#1a2530"/>
        
        <!-- Roads -->
        <g class="roads" stroke="#3a4550" stroke-width="1.5" fill="none">
          <!-- Main Street (horizontal) -->
          <path d="M 0 50 L 100 50"/>
          <!-- Oak Avenue (vertical) -->
          <path d="M 50 0 L 50 100"/>
          <!-- Elm Street -->
          <path d="M 20 35 L 80 35"/>
          <!-- Cemetery Road -->
          <path d="M 15 65 L 15 35"/>
          <!-- Mall Boulevard -->
          <path d="M 75 30 L 75 70"/>
        </g>
        
        <!-- Decorative trees -->
        <g class="trees" fill="#2a4a3a" opacity="0.5">
          <circle cx="10" cy="10" r="3"/>
          <circle cx="90" cy="10" r="4"/>
          <circle cx="5" cy="45" r="2"/>
          <circle cx="95" cy="85" r="3"/>
          <circle cx="10" cy="80" r="4"/>
          <circle cx="92" cy="25" r="2"/>
        </g>
        
        <!-- Water (river) -->
        <path d="M 0 85 Q 30 80 50 90 Q 70 100 100 95" 
              stroke="#2a4a6a" stroke-width="3" fill="none" opacity="0.5"/>
      </svg>
    `;
  }

  renderMapLocations() {
    return Object.values(LOCATIONS).map(loc => {
      const isUnlocked = this.isLocationUnlocked(loc);
      const isCurrent = this.currentLocation?.id === loc.id;
      
      return `
        <div class="map-location ${isUnlocked ? '' : 'locked'} ${isCurrent ? 'current' : ''} ${loc.atmosphere}"
             data-location="${loc.id}"
             style="left: ${loc.position.x}%; top: ${loc.position.y}%"
             title="${isUnlocked ? loc.name : 'Unknown Location'}">
          <span class="location-marker">${isUnlocked ? loc.icon : '❓'}</span>
          ${isUnlocked ? `<span class="location-label">${loc.name}</span>` : ''}
          ${isCurrent ? '<div class="current-indicator"></div>' : ''}
        </div>
      `;
    }).join('');
  }

  renderLocationPreview(location) {
    if (!location) {
      return `
        <div class="preview-placeholder">
          <span class="preview-icon">🗺️</span>
          <p>Select a location to see details</p>
        </div>
      `;
    }

    const isUnlocked = this.isLocationUnlocked(location);
    
    if (!isUnlocked) {
      return `
        <div class="preview-locked">
          <span class="preview-icon">🔒</span>
          <h3>Unknown Location</h3>
          <p class="unlock-req">${this.getUnlockRequirementText(location)}</p>
        </div>
      `;
    }

    const activities = this.getActivityIcons(location.activities);
    const bonuses = this.getLocationBonuses(location);

    return `
      <div class="preview-content ${location.atmosphere}">
        <div class="preview-header">
          <span class="preview-icon-large">${location.icon}</span>
          <div class="preview-titles">
            <h3>${location.name}</h3>
            <span class="atmosphere-tag">${this.getAtmosphereLabel(location.atmosphere)}</span>
          </div>
        </div>
        
        <p class="preview-description">${location.description}</p>
        
        <div class="preview-activities">
          <h4>Available Activities</h4>
          <div class="activity-list">
            ${activities}
          </div>
        </div>
        
        ${bonuses ? `
          <div class="preview-bonuses">
            <h4>Location Bonuses</h4>
            <div class="bonus-list">${bonuses}</div>
          </div>
        ` : ''}
        
        ${location.characters.length > 0 ? `
          <div class="preview-characters">
            <h4>People Here</h4>
            <div class="character-count">${location.characters.length} character${location.characters.length > 1 ? 's' : ''} available</div>
          </div>
        ` : ''}
        
        <button class="btn btn-primary btn-travel" data-location="${location.id}">
          🚶 Travel Here
        </button>
      </div>
    `;
  }

  getActivityIcons(activities) {
    const activityInfo = {
      rest: { icon: '💤', name: 'Rest', desc: 'Restore sanity' },
      research: { icon: '📖', name: 'Research', desc: 'Gather information' },
      recruit: { icon: '🤝', name: 'Recruit', desc: 'Find allies' },
      customize: { icon: '🎲', name: 'Customize', desc: 'Upgrade dice' },
      challenge: { icon: '⚔️', name: 'Challenge', desc: 'Face spirits' }
    };

    return activities.map(act => {
      const info = activityInfo[act] || { icon: '❓', name: act, desc: '' };
      return `
        <div class="activity-item" title="${info.desc}">
          <span class="activity-icon">${info.icon}</span>
          <span class="activity-name">${info.name}</span>
        </div>
      `;
    }).join('');
  }

  getLocationBonuses(location) {
    const bonuses = [];
    
    if (location.researchBonus) {
      bonuses.push(`<span class="bonus-item">📚 ${Math.round((location.researchBonus - 1) * 100)}% research bonus</span>`);
    }
    if (location.sanityRestore) {
      bonuses.push(`<span class="bonus-item">💚 +${location.sanityRestore} sanity when resting</span>`);
    }
    if (location.spiritDamageBonus) {
      bonuses.push(`<span class="bonus-item">⚔️ +${location.spiritDamageBonus} spirit damage</span>`);
    }
    if (location.diceUpgradeDiscount) {
      bonuses.push(`<span class="bonus-item">🎲 ${Math.round(location.diceUpgradeDiscount * 100)}% dice upgrade discount</span>`);
    }
    if (location.spiritEncounterChance) {
      bonuses.push(`<span class="bonus-item">👻 ${Math.round(location.spiritEncounterChance * 100)}% spirit encounter chance</span>`);
    }
    
    return bonuses.length > 0 ? bonuses.join('') : null;
  }

  getAtmosphereLabel(atmosphere) {
    const labels = {
      safe: '🏠 Safe Haven',
      eerie: '👀 Eerie',
      formal: '👔 Formal',
      sterile: '🧼 Sterile',
      busy: '🏃 Busy',
      bright: '💡 Bright',
      mystical: '✨ Mystical',
      energetic: '⚡ Energetic',
      nostalgic: '📻 Nostalgic',
      upscale: '🥂 Upscale',
      chatty: '💬 Chatty',
      institutional: '📋 Institutional',
      haunted: '👻 Haunted',
      terrifying: '💀 Terrifying',
      sacred: '🕊️ Sacred'
    };
    return labels[atmosphere] || atmosphere;
  }

  getUnlockRequirementText(location) {
    if (!location.unlockRequirement) return 'Explore more to discover this location';
    
    const req = location.unlockRequirement;
    const parts = [];
    
    if (req.spiritsBanished) {
      parts.push(`Banish ${req.spiritsBanished} spirit${req.spiritsBanished > 1 ? 's' : ''}`);
    }
    if (req.research) {
      parts.push(`Gather ${req.research} research`);
    }
    
    return parts.length > 0 ? `Requires: ${parts.join(', ')}` : 'Explore more to discover';
  }

  isLocationUnlocked(location) {
    if (location.unlocked) return true;
    if (!location.unlockRequirement) return false;
    
    const req = location.unlockRequirement;
    if (req.spiritsBanished && this.game.spiritsBanished < req.spiritsBanished) return false;
    if (req.research && this.game.research < req.research) return false;
    
    return true;
  }

  bindEvents() {
    if (!this.mapContainer) return;

    // Close button
    this.mapContainer.querySelector('#close-map')?.addEventListener('click', () => {
      this.hide();
    });

    // Location list items
    this.mapContainer.querySelectorAll('.location-list-item:not(.locked)').forEach(item => {
      item.addEventListener('click', () => {
        const locId = item.dataset.location;
        this.selectLocation(locId);
      });
    });

    // Map location markers
    this.mapContainer.querySelectorAll('.map-location:not(.locked)').forEach(marker => {
      marker.addEventListener('click', () => {
        const locId = marker.dataset.location;
        this.selectLocation(locId);
      });
    });

    // Travel button (delegated)
    this.mapContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-travel') || e.target.closest('.btn-travel')) {
        const btn = e.target.classList.contains('btn-travel') ? e.target : e.target.closest('.btn-travel');
        const locId = btn.dataset.location;
        this.travelTo(locId);
      }
    });

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  selectLocation(locationId) {
    const location = LOCATIONS[locationId];
    if (!location || !this.isLocationUnlocked(location)) return;

    this.selectedLocation = location;

    // Update list selection
    this.mapContainer.querySelectorAll('.location-list-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.location === locationId);
    });

    // Update map selection
    this.mapContainer.querySelectorAll('.map-location').forEach(marker => {
      marker.classList.toggle('selected', marker.dataset.location === locationId);
    });

    // Update preview
    const previewEl = this.mapContainer.querySelector('#location-preview');
    if (previewEl) {
      previewEl.innerHTML = this.renderLocationPreview(location);
    }
  }

  travelTo(locationId) {
    const location = LOCATIONS[locationId];
    if (!location || !this.isLocationUnlocked(location)) return;

    this.currentLocation = location;
    
    // Trigger callback
    if (this.onLocationSelect) {
      this.onLocationSelect(location);
    }

    // Hide the map
    this.hide();
  }

  show() {
    if (!this.mapContainer) this.init();
    
    this.render();
    this.bindEvents();
    this.mapContainer.classList.add('visible');
    this.isVisible = true;
    document.body.style.overflow = 'hidden';
  }

  hide() {
    if (!this.mapContainer) return;
    
    this.mapContainer.classList.remove('visible');
    this.isVisible = false;
    document.body.style.overflow = '';
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  // Update the map when game state changes
  update() {
    if (this.isVisible) {
      this.render();
      this.bindEvents();
      
      // Re-select current location if any
      if (this.selectedLocation) {
        this.selectLocation(this.selectedLocation.id);
      }
    }
  }

  // Set current location without traveling (for initialization)
  setCurrentLocation(locationId) {
    const location = LOCATIONS[locationId];
    if (location) {
      this.currentLocation = location;
    }
  }
}
