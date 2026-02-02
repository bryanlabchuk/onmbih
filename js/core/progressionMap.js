// Progression Map UI
// Slay the Spire-style branching path map

import { MapGenerator, NODE_TYPES, LOCATION_THEMES, getDifficultySettings } from '../data/townMap.js';

export class ProgressionMap {
  constructor(game) {
    this.game = game;
    this.map = null;
    this.generator = null;
    this.container = null;
    this.selectedNode = null;
    this.onNodeSelect = null;
    this.isVisible = false;
  }

  // Initialize and generate a new map
  init(seed = null) {
    this.generator = new MapGenerator(seed);
    this.map = this.generator.generate(7);
    
    // Initialize tier tracking
    this.map.highestCompletedTier = -1; // Nothing completed yet
    
    // Mark start node as available
    const startNode = this.map.nodes[this.map.currentNodeId];
    startNode.available = true;
    this.map.availableNodes.add(startNode.id);
    
    console.log('Map initialized. Start node:', startNode.id);
    console.log('Tier 1 nodes:', this.map.tiers[1]?.map(n => n.id));
    
    return this.map;
  }

  // Force unlock tier 1 after start (call this when game begins)
  unlockTier1() {
    const startNode = this.map.tiers[0]?.[0];
    if (startNode) {
      startNode.completed = true;
      this.map.completedNodes.add(startNode.id);
      this.map.highestCompletedTier = 0;
    }
    this.refreshAvailableNodes();
    console.log('Tier 1 unlocked. Available nodes:', Array.from(this.map.availableNodes));
  }

  // Get the current map state
  getMap() {
    return this.map;
  }

  // Get the current node
  getCurrentNode() {
    return this.map?.nodes[this.map.currentNodeId];
  }

  // Get available nodes to travel to
  getAvailableNodes() {
    if (!this.map) return [];
    return Array.from(this.map.availableNodes)
      .map(id => this.map.nodes[id])
      .filter(node => node && !node.completed);
  }

  // Tier unlock requirements - only moving UP a tier has conditions; all locations within a tier are unlocked together
  getTierRequirements() {
    return {
      0: { name: 'Home', requirement: null },           // Start - no condition
      1: { name: 'Town', requirement: null },         // Tier 2 in user terms - always accessible, starting locations
      2: { 
        name: 'Downtown', 
        requirement: { 
          type: 'level_and_research',
          level: 2,
          research: 25,
          description: 'Reach Level 2 and earn 25 research'
        }
      },
      3: { 
        name: 'Outskirts', 
        requirement: { 
          type: 'level_and_research',
          level: 3,
          research: 50,
          description: 'Reach Level 3 and earn 50 research'
        }
      },
      4: { 
        name: 'Dark Places', 
        requirement: { 
          type: 'level_research_allies',
          level: 3,
          research: 75,
          allies: 2,
          description: 'Level 3, 75 research, and 2 allies'
        }
      },
      5: { 
        name: 'The Edge', 
        requirement: { 
          type: 'level_and_research',
          level: 4,
          research: 100,
          description: 'Reach Level 4 and earn 100 research'
        }
      },
      6: { 
        name: 'Blackwood Manor', 
        requirement: { 
          type: 'level_and_research',
          level: 5,
          research: 150,
          description: 'Reach Level 5 and earn 150 research'
        }
      }
    };
  }

  // Get player level from game (research-based)
  getPlayerLevel() {
    const total = this.game.totalResearchEarned || 0;
    if (total >= 150) return 5;
    if (total >= 100) return 4;
    if (total >= 50) return 3;
    if (total >= 25) return 2;
    return 1;
  }

  // Check if player meets tier requirements
  checkTierRequirement(tier) {
    const requirements = this.getTierRequirements();
    const tierReq = requirements[tier];
    
    if (!tierReq || !tierReq.requirement) return { met: true, current: 0, required: 0, description: '', tierName: tierReq?.name };
    
    const req = tierReq.requirement;
    const level = this.getPlayerLevel();
    const research = this.game.totalResearchEarned || 0;
    const allies = this.game.allies?.length || 0;
    
    if (req.type === 'level_and_research') {
      const levelOk = level >= req.level;
      const researchOk = research >= req.research;
      const met = levelOk && researchOk;
      return {
        met,
        current: { level, research },
        required: { level: req.level, research: req.research },
        description: req.description,
        tierName: tierReq.name,
        levelOk,
        researchOk
      };
    }
    
    if (req.type === 'level_research_allies') {
      const levelOk = level >= req.level;
      const researchOk = research >= req.research;
      const alliesOk = allies >= (req.allies || 0);
      const met = levelOk && researchOk && alliesOk;
      return {
        met,
        current: { level, research, allies },
        required: { level: req.level, research: req.research, allies: req.allies },
        description: req.description,
        tierName: tierReq.name,
        levelOk,
        researchOk,
        alliesOk
      };
    }
    
    // Legacy single requirement
    let current = 0;
    switch (req.type) {
      case 'challenges':
        current = this.map.completedNodes.size;
        break;
      case 'research':
        current = research;
        break;
      case 'allies':
        current = allies;
        break;
      default:
        return { met: true, current: 0, required: 0, description: '', tierName: tierReq.name };
    }
    
    return {
      met: current >= (req.count || 0),
      current,
      required: req.count,
      description: req.description,
      tierName: tierReq.name
    };
  }

  // Get highest unlocked tier
  getHighestUnlockedTier() {
    for (let tier = 6; tier >= 0; tier--) {
      if (this.checkTierRequirement(tier).met) {
        return tier;
      }
    }
    return 1; // Always can access tier 1
  }

  // Complete a node and update available nodes
  completeNode(nodeId) {
    console.log('Completing node:', nodeId);
    const node = this.map.nodes[nodeId];
    if (!node) {
      console.error('Node not found for completion:', nodeId);
      return;
    }

    node.completed = true;
    this.map.completedNodes.add(nodeId);
    this.map.availableNodes.delete(nodeId);
    
    // Track highest completed tier
    if (node.tier > (this.map.highestCompletedTier || -1)) {
      this.map.highestCompletedTier = node.tier;
    }

    // Refresh available nodes based on current progress
    this.refreshAvailableNodes();

    // Update current position
    this.map.currentNodeId = null;
    
    console.log('Available nodes after completion:', Array.from(this.map.availableNodes));
    console.log('Highest unlocked tier:', this.getHighestUnlockedTier());
  }

  // Refresh which nodes are available - ALL locations in an unlocked tier are available (no path logic)
  refreshAvailableNodes() {
    this.map.availableNodes.clear();
    
    const highestUnlocked = this.getHighestUnlockedTier();
    console.log('Refreshing available nodes. Highest unlocked tier:', highestUnlocked);
    
    // Add every uncompleted node in every unlocked tier (tiers 0 and 1 always; 2+ if condition met)
    for (let tier = 0; tier <= highestUnlocked; tier++) {
      const tierNodes = this.map.tiers[tier];
      if (!tierNodes) continue;
      
      tierNodes.forEach(node => {
        if (node.completed) return;
        node.available = true;
        this.map.availableNodes.add(node.id);
      });
    }
  }

  // Get the current tier the player should be on
  getCurrentTier() {
    return Math.max(1, (this.map.highestCompletedTier || 0) + 1);
  }

  // Check if a node can be accessed
  canAccessNode(nodeId) {
    const node = this.map.nodes[nodeId];
    if (!node) return false;
    if (node.completed) return false;
    
    // Check if tier is unlocked
    const tierUnlocked = this.checkTierRequirement(node.tier).met;
    if (!tierUnlocked) return false;
    
    // Check if node is in available set
    return this.map.availableNodes.has(nodeId);
  }

  // Get tier status for UI
  getTierStatus(tier) {
    const req = this.checkTierRequirement(tier);
    const tierNodes = this.map.tiers[tier] || [];
    const completedInTier = tierNodes.filter(n => n.completed).length;
    
    return {
      tier,
      name: this.getTierRequirements()[tier]?.name || `Floor ${tier}`,
      unlocked: req.met,
      requirement: req,
      totalNodes: tierNodes.length,
      completedNodes: completedInTier
    };
  }

  // Move to a node
  moveToNode(nodeId) {
    const node = this.map.nodes[nodeId];
    if (!node || !this.map.availableNodes.has(nodeId)) return false;

    this.map.currentNodeId = nodeId;
    return true;
  }

  // Render the map overlay
  render() {
    console.log('ProgressionMap.render() called');
    const overlay = document.getElementById('map-overlay');
    if (!overlay) {
      console.error('Map overlay not found in render()');
      return;
    }

    overlay.innerHTML = `
      <div class="progression-map-container">
        <div class="map-header">
          <h2>🗺️ Town of Blackwood</h2>
          <p class="map-subtitle">Choose your path through the haunted town</p>
          <button class="map-close-btn" id="close-progression-map">✕</button>
        </div>
        
        <div class="map-canvas-wrapper">
          <div class="map-canvas" id="map-canvas">
            ${this.renderTiers()}
          </div>
        </div>
        
        <div class="map-legend">
          ${this.renderLegend()}
        </div>
        
        <div class="map-node-preview" id="node-preview" style="display: none;">
          <!-- Node preview will be rendered here -->
        </div>
      </div>
    `;

    this.bindEvents();
  }

  // Render all tiers
  renderTiers() {
    if (!this.map) return '<div class="map-empty">No map generated</div>';

    const tierRequirements = this.getTierRequirements();

    // Render from bottom (start) to top (boss)
    const tiersHTML = this.map.tiers.map((tier, tierIndex) => {
      const tierStatus = this.getTierStatus(tierIndex);
      const tierClass = tierIndex === 0 ? 'tier-start' : 
                        tierIndex === this.map.tiers.length - 1 ? 'tier-boss' : '';
      const lockedClass = !tierStatus.unlocked ? 'tier-locked' : '';
      const tierName = tierRequirements[tierIndex]?.name || `Floor ${tierIndex}`;
      const progressStr = !tierStatus.unlocked ? this.formatTierProgress(tierStatus.requirement) : 
                          (tierStatus.completedNodes > 0 ? `${tierStatus.completedNodes}/${tierStatus.totalNodes} done` : '');
      
      return `
        <div class="map-tier ${tierClass} ${lockedClass}" data-tier="${tierIndex}">
          <div class="tier-label">
            <span class="tier-name">${tierName}</span>
            ${progressStr ? `<span class="tier-requirement">${progressStr}</span>` : ''}
          </div>
          <div class="tier-nodes">
            ${tier.map(node => this.renderNode(node)).join('')}
          </div>
        </div>
      `;
    }).reverse().join(''); // Reverse so boss is at top

    // Render connections as SVG overlay
    const connectionsHTML = `
      <svg class="map-connections" id="map-connections">
        ${this.renderConnections()}
      </svg>
    `;

    return connectionsHTML + tiersHTML;
  }

  // Render a single node
  renderNode(node) {
    const isCurrent = this.map.currentNodeId === node.id;
    const isAvailable = this.map.availableNodes.has(node.id);
    const isCompleted = node.completed;
    const isSelected = this.selectedNode === node.id;

    let stateClass = 'locked';
    if (isCompleted) stateClass = 'completed';
    else if (isCurrent) stateClass = 'current';
    else if (isAvailable) stateClass = 'available';

    const nodeType = NODE_TYPES[node.type];
    
    return `
      <div class="map-node ${stateClass} ${isSelected ? 'selected' : ''} type-${node.type}"
           data-node-id="${node.id}"
           data-tier="${node.tier}"
           style="--node-color: ${nodeType.color};">
        <div class="node-icon">${node.locationIcon}</div>
        <div class="node-type-icon">${nodeType.icon}</div>
        ${isCompleted ? '<div class="node-checkmark">✓</div>' : ''}
        ${isCurrent ? '<div class="node-current-indicator"></div>' : ''}
      </div>
    `;
  }

  // Render SVG connections between nodes
  renderConnections() {
    if (!this.map) return '';

    // We'll calculate positions after the DOM is rendered
    return `<g class="connections-group" id="connections-group"></g>`;
  }

  // Draw connections after DOM is ready
  drawConnections() {
    const group = document.getElementById('connections-group');
    const canvas = document.getElementById('map-canvas');
    if (!group || !canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    let paths = '';

    this.map.connections.forEach(conn => {
      const fromEl = document.querySelector(`[data-node-id="${conn.from}"]`);
      const toEl = document.querySelector(`[data-node-id="${conn.to}"]`);
      
      if (!fromEl || !toEl) return;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // Calculate center points relative to canvas
      const fromX = fromRect.left + fromRect.width / 2 - canvasRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - canvasRect.top;
      const toX = toRect.left + toRect.width / 2 - canvasRect.left;
      const toY = toRect.top + toRect.height / 2 - canvasRect.top;

      // Determine if path is available
      const fromNode = this.map.nodes[conn.from];
      const toNode = this.map.nodes[conn.to];
      const isActive = fromNode.completed && toNode.available;
      const isCompleted = fromNode.completed && toNode.completed;

      // Create curved path
      const midY = (fromY + toY) / 2;
      const pathClass = isCompleted ? 'completed' : isActive ? 'active' : 'locked';

      paths += `
        <path class="connection-path ${pathClass}"
              d="M ${fromX} ${fromY} Q ${fromX} ${midY} ${(fromX + toX) / 2} ${midY} T ${toX} ${toY}"
              fill="none"/>
      `;
    });

    group.innerHTML = paths;

    // Update SVG viewBox
    const svg = document.getElementById('map-connections');
    if (svg) {
      svg.setAttribute('width', canvasRect.width);
      svg.setAttribute('height', canvasRect.height);
    }
  }

  // Render the legend
  renderLegend() {
    const types = ['research', 'elite', 'recruit', 'rest', 'store', 'mystery', 'spirit', 'boss'];
    
    return `
      <div class="legend-items">
        ${types.map(type => {
          const nodeType = NODE_TYPES[type];
          return `
            <div class="legend-item">
              <span class="legend-icon" style="background: ${nodeType.color}">${nodeType.icon}</span>
              <span class="legend-name">${nodeType.name}</span>
            </div>
          `;
        }).join('')}
      </div>
      <div class="legend-states">
        <div class="legend-state"><span class="state-dot available"></span> Available</div>
        <div class="legend-state"><span class="state-dot completed"></span> Completed</div>
        <div class="legend-state"><span class="state-dot locked"></span> Locked</div>
      </div>
    `;
  }

  // Format tier progress for display
  formatTierProgress(tierReq) {
    if (!tierReq.required) return '';
    const r = tierReq.required;
    const c = tierReq.current;
    if (typeof r === 'number' && typeof c === 'number') return `${c}/${r}`;
    if (r.level != null && r.research != null) {
      const lvl = (c && c.level != null) ? c.level : this.getPlayerLevel();
      const res = (c && c.research != null) ? c.research : (this.game.totalResearchEarned || 0);
      const parts = [];
      if (tierReq.levelOk) parts.push(`Level ${lvl} ✓`); else parts.push(`Level ${lvl}/${r.level}`);
      if (tierReq.researchOk) parts.push(`Research ${res} ✓`); else parts.push(`Research ${res}/${r.research}`);
      if (r.allies != null) {
        const a = (c && c.allies != null) ? c.allies : (this.game.allies?.length || 0);
        if (tierReq.alliesOk) parts.push(`Allies ${a} ✓`); else parts.push(`Allies ${a}/${r.allies}`);
      }
      return parts.join(' · ');
    }
    return tierReq.description || '';
  }

  // Render node preview
  renderNodePreview(node) {
    const preview = document.getElementById('node-preview');
    if (!preview || !node) {
      if (preview) preview.style.display = 'none';
      return;
    }

    const nodeType = NODE_TYPES[node.type];
    const difficulty = getDifficultySettings(node.difficulty);
    const isAvailable = this.canAccessNode(node.id);
    const isCompleted = node.completed;
    
    const tierReq = this.checkTierRequirement(node.tier);
    const tierName = this.getTierRequirements()[node.tier]?.name || `Floor ${node.tier}`;
    const progressText = this.formatTierProgress(tierReq);

    preview.innerHTML = `
      <div class="preview-header" style="border-color: ${nodeType.color}">
        <span class="preview-icon">${node.locationIcon}</span>
        <div class="preview-titles">
          <h3>${node.locationName}</h3>
          <span class="preview-type">${nodeType.icon} ${nodeType.name}</span>
        </div>
      </div>
      
      <div class="preview-tier-badge ${tierReq.met ? 'unlocked' : 'locked'}">
        ${tierReq.met ? '🔓' : '🔒'} ${tierName}
      </div>
      
      <p class="preview-description">${nodeType.description}</p>
      
      <div class="preview-details">
        <div class="preview-detail">
          <span class="detail-label">Difficulty</span>
          <span class="detail-value">${'⭐'.repeat(node.difficulty + 1)}</span>
        </div>
        <div class="preview-detail">
          <span class="detail-label">Atmosphere</span>
          <span class="detail-value atmosphere-${node.atmosphere}">${node.atmosphere}</span>
        </div>
        ${node.rewards.research ? `
          <div class="preview-detail">
            <span class="detail-label">Research</span>
            <span class="detail-value reward">+${node.rewards.research}</span>
          </div>
        ` : ''}
        ${node.rewards.sanity ? `
          <div class="preview-detail">
            <span class="detail-label">Sanity</span>
            <span class="detail-value reward">+${node.rewards.sanity}</span>
          </div>
        ` : ''}
        ${node.rewards.ally ? `
          <div class="preview-detail">
            <span class="detail-label">Reward</span>
            <span class="detail-value reward">New Ally</span>
          </div>
        ` : ''}
      </div>
      
      ${isAvailable && !isCompleted ? `
        <button class="preview-travel-btn" data-node-id="${node.id}">
          Enter ${node.locationName}
        </button>
      ` : isCompleted ? `
        <div class="preview-completed">✓ Completed</div>
      ` : !tierReq.met ? `
        <div class="preview-locked">
          <div class="lock-icon">🔒</div>
          <div class="lock-text">${tierName} Locked</div>
          <div class="lock-requirement">${tierReq.description}</div>
          <div class="lock-progress">${progressText}</div>
        </div>
      ` : `
        <div class="preview-locked">🔒 Complete a nearby location first</div>
      `}
    `;

    preview.style.display = 'block';
  }

  // Bind event handlers
  bindEvents() {
    console.log('Binding progression map events...');
    
    const container = document.querySelector('.progression-map-container');
    if (!container) {
      console.error('Progression map container not found');
      return;
    }
    
    console.log('Container found, binding click events');

    // Close button - direct binding
    const closeBtn = document.getElementById('close-progression-map');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button clicked');
        this.hide();
      };
    }

    // Node click/hover - use event delegation for better reliability
    container.onclick = (e) => {
      console.log('Container clicked, target:', e.target.className);
      
      // Check for travel button
      const travelBtn = e.target.closest('.preview-travel-btn');
      if (travelBtn) {
        e.preventDefault();
        e.stopPropagation();
        const nodeId = travelBtn.dataset.nodeId;
        console.log('Travel button clicked for node:', nodeId);
        this.travelToNode(nodeId);
        return;
      }

      // Check for node click
      const nodeEl = e.target.closest('.map-node');
      if (nodeEl) {
        e.stopPropagation();
        const nodeId = nodeEl.dataset.nodeId;
        console.log('Node clicked:', nodeId);
        this.selectNode(nodeId);
        return;
      }

      // Check for close button
      if (e.target.id === 'close-progression-map' || e.target.closest('.map-close-btn')) {
        e.stopPropagation();
        this.hide();
        return;
      }
    };

    // Node hover for preview
    container.onmouseover = (e) => {
      const nodeEl = e.target.closest('.map-node');
      if (nodeEl) {
        const nodeId = nodeEl.dataset.nodeId;
        const node = this.map.nodes[nodeId];
        this.renderNodePreview(node);
      }
    };

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });

    // Draw connections after layout settles
    setTimeout(() => this.drawConnections(), 100);
    window.addEventListener('resize', () => {
      if (this.isVisible) {
        this.drawConnections();
      }
    });
    
    console.log('Event binding complete');
  }

  // Select a node
  selectNode(nodeId) {
    this.selectedNode = nodeId;
    
    // Update visual selection
    document.querySelectorAll('.map-node').forEach(n => {
      n.classList.toggle('selected', n.dataset.nodeId === nodeId);
    });

    // Show preview
    const node = this.map.nodes[nodeId];
    this.renderNodePreview(node);
  }

  // Travel to a node
  travelToNode(nodeId) {
    console.log('travelToNode called with:', nodeId);
    const node = this.map.nodes[nodeId];
    
    if (!node) {
      console.error('Node not found:', nodeId);
      return;
    }
    
    // Strict tier check - can only access nodes in the allowed tier
    if (!this.canAccessNode(nodeId)) {
      console.error('Node not accessible:', nodeId, 'Current tier allowed:', this.getCurrentTier(), 'Node tier:', node.tier);
      return;
    }

    console.log('Moving to node:', node.locationName, 'Tier:', node.tier);
    this.moveToNode(nodeId);
    this.hide();

    // Trigger callback
    if (this.onNodeSelect) {
      console.log('Calling onNodeSelect callback');
      this.onNodeSelect(node);
    } else {
      console.error('No onNodeSelect callback defined!');
    }
  }

  // Show the map
  show() {
    console.log('ProgressionMap.show() called');
    const overlay = document.getElementById('map-overlay');
    if (!overlay) {
      console.error('Map overlay element not found!');
      return;
    }
    
    // Refresh available nodes so newly met tier conditions show new locations
    if (this.map) {
      this.refreshAvailableNodes();
      console.log('Available nodes:', Array.from(this.map.availableNodes));
    }
    
    this.render();
    
    // Force display with inline style to override any CSS
    overlay.style.cssText = 'display: flex !important; opacity: 1; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; background: rgba(10, 12, 18, 0.98);';
    overlay.classList.add('visible');
    this.isVisible = true;

    // Redraw connections after display
    setTimeout(() => this.drawConnections(), 50);
    
    console.log('Map overlay displayed');
  }

  // Hide the map
  hide() {
    const overlay = document.getElementById('map-overlay');
    if (overlay) {
      overlay.style.cssText = '';
      overlay.style.display = 'none';
      overlay.classList.remove('visible');
      this.isVisible = false;
    }
  }

  // Toggle visibility
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  // Save map state (for persistence)
  saveState() {
    return {
      seed: this.map.seed,
      currentNodeId: this.map.currentNodeId,
      completedNodes: Array.from(this.map.completedNodes),
      availableNodes: Array.from(this.map.availableNodes),
      highestCompletedTier: this.map.highestCompletedTier
    };
  }

  // Load map state
  loadState(state) {
    if (!state) return;

    // Regenerate map with same seed
    this.generator = new MapGenerator(state.seed);
    this.map = this.generator.generate(7);

    // Restore state
    this.map.currentNodeId = state.currentNodeId;
    this.map.completedNodes = new Set(state.completedNodes || []);
    this.map.availableNodes = new Set(state.availableNodes || []);
    this.map.highestCompletedTier = state.highestCompletedTier ?? -1;

    // Update node states
    Object.values(this.map.nodes).forEach(node => {
      node.completed = this.map.completedNodes.has(node.id);
      node.available = this.map.availableNodes.has(node.id);
    });
  }
}
