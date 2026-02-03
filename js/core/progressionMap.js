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

  // Whether the player has "left home" (start node completed) — tier 1 is then always available
  hasLeftHome() {
    const startNode = this.map?.tiers[0]?.[0];
    return !!startNode?.completed;
  }

  // Force unlock starting locations (call when game begins) — at least 2 locations adjacent to Home
  unlockTier1() {
    if (!this.map) return;
    const startNode = this.map.tiers[0]?.[0];
    if (startNode) {
      startNode.completed = true;
      this.map.completedNodes.add(startNode.id);
      this.map.highestCompletedTier = 0;
    }
    // Explicitly add all tier 1 nodes so they are always available when leaving home
    const tier1Nodes = this.map.tiers[1] || [];
    tier1Nodes.forEach(node => {
      if (!node.completed) {
        node.available = true;
        this.map.availableNodes.add(node.id);
      }
    });
    // Also run full refresh so logic stays consistent
    this.refreshAvailableNodes();
    console.log('Starting locations unlocked. Available:', Array.from(this.map.availableNodes));
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

  // Tier names only — linear branching: no locked locations; all nodes in a tier are available once previous tier has at least one completed node
  getTierRequirements() {
    return {
      0: { name: 'Home' },
      1: { name: "School & Best Friend's House" },
      2: { name: 'Downtown' },
      3: { name: 'Outskirts' },
      4: { name: 'Dark Places' },
      5: { name: 'The Edge' },
      6: { name: 'Blackwood Manor' }
    };
  }

  // Tier is reachable if tier 0, or at least one node in the previous tier is completed
  checkTierRequirement(tier) {
    const requirements = this.getTierRequirements();
    const tierReq = requirements[tier];
    const tierName = tierReq?.name || `Floor ${tier}`;
    if (tier === 0) return { met: true, tierName };
    const prevTier = this.map?.tiers[tier - 1] || [];
    const met = prevTier.some(n => n.completed);
    const completedInPrev = prevTier.filter(n => n.completed).length;
    const totalInPrev = prevTier.length;
    return { met, tierName, completedInPrev, totalInPrev };
  }

  // Highest tier that is unlocked: tier N is unlocked when at least one node in tier N-1 is completed
  getHighestUnlockedTier() {
    let highest = 0;
    for (let t = 1; t <= 6; t++) {
      const prevTier = this.map?.tiers[t - 1] || [];
      if (prevTier.some(n => n.completed)) highest = t;
    }
    return highest;
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

  // Refresh which nodes are available — linear branching: all nodes in a tier are available once previous tier has at least one completed node
  refreshAvailableNodes() {
    if (!this.map) return;
    this.map.availableNodes.clear();

    // Tier 0 (Home): available if not yet completed
    const tier0Nodes = this.map.tiers[0] || [];
    tier0Nodes.forEach(node => {
      if (!node.completed) {
        node.available = true;
        this.map.availableNodes.add(node.id);
      }
    });

    // Tiers 1+ unlocked when at least one node in previous tier is completed; add all uncompleted nodes in that tier
    const highestUnlocked = this.getHighestUnlockedTier();
    for (let tier = 1; tier <= highestUnlocked; tier++) {
      const tierNodes = this.map.tiers[tier] || [];
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

  // Check if a node can be accessed (in available set and not completed)
  canAccessNode(nodeId) {
    const node = this.map.nodes[nodeId];
    if (!node) return false;
    if (node.completed) return false;
    return this.map.availableNodes.has(nodeId);
  }

  // Get tier status for UI (linear branching: unlocked when previous tier has at least one completed node)
  getTierStatus(tier) {
    const req = this.checkTierRequirement(tier);
    const tierNodes = this.map.tiers[tier] || [];
    const completedInTier = tierNodes.filter(n => n.completed).length;
    return {
      tier,
      name: this.getTierRequirements()[tier]?.name || `Floor ${tier}`,
      unlocked: req.met,
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

    // Render from bottom (start) to top (boss) — linear branching, no locked concept
    const tiersHTML = this.map.tiers.map((tier, tierIndex) => {
      const tierStatus = this.getTierStatus(tierIndex);
      const tierClass = tierIndex === 0 ? 'tier-start' : 
                        tierIndex === this.map.tiers.length - 1 ? 'tier-boss' : '';
      const tierName = tierRequirements[tierIndex]?.name || `Floor ${tierIndex}`;
      const progressStr = tierStatus.totalNodes > 0 ? `${tierStatus.completedNodes}/${tierStatus.totalNodes} visited` : '';
      return `
        <div class="map-tier ${tierClass}" data-tier="${tierIndex}">
          <div class="tier-label">
            <span class="tier-name">${tierName}</span>
            ${progressStr ? `<span class="tier-progress">${progressStr}</span>` : ''}
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

  // Render a single node (available = can travel, completed, current, or upcoming = not yet reachable)
  renderNode(node) {
    const isCurrent = this.map.currentNodeId === node.id;
    const isAvailable = this.map.availableNodes.has(node.id);
    const isCompleted = node.completed;
    const isSelected = this.selectedNode === node.id;

    let stateClass = 'upcoming';
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

      const fromNode = this.map.nodes[conn.from];
      const toNode = this.map.nodes[conn.to];
      const isActive = fromNode.completed && toNode.available;
      const isCompleted = fromNode.completed && toNode.completed;
      const midY = (fromY + toY) / 2;
      const pathClass = isCompleted ? 'completed' : isActive ? 'active' : 'upcoming';

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
        <div class="legend-state"><span class="state-dot upcoming"></span> Upcoming</div>
      </div>
    `;
  }

  // Format tier progress for display
  formatTierProgress(tierReq) {
    if (!tierReq || !tierReq.required) return '';
    const r = tierReq.required;
    const c = tierReq.current;
    if (typeof r === 'number' && typeof c === 'number') return `${c}/${r}`;
    if (r && r.completed != null && c && c.completed != null) return `${c.completed}/${r.completed} visited`;
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

  // Render node preview (no locked concept — available, completed, or upcoming)
  renderNodePreview(node) {
    const preview = document.getElementById('node-preview');
    if (!preview || !node) {
      if (preview) preview.style.display = 'none';
      return;
    }

    const nodeType = NODE_TYPES[node.type];
    const isAvailable = this.canAccessNode(node.id);
    const isCompleted = node.completed;
    const tierName = this.getTierRequirements()[node.tier]?.name || `Floor ${node.tier}`;
    const prevTierName = node.tier > 0 ? (this.getTierRequirements()[node.tier - 1]?.name || 'the previous area') : '';

    preview.innerHTML = `
      <div class="preview-header" style="border-color: ${nodeType.color}">
        <span class="preview-icon">${node.locationIcon}</span>
        <div class="preview-titles">
          <h3>${node.locationName}</h3>
          <span class="preview-type">${nodeType.icon} ${nodeType.name}</span>
        </div>
      </div>
      
      <div class="preview-tier-badge">${tierName}</div>
      
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
      ` : `
        <div class="preview-upcoming">Visit ${prevTierName} first</div>
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
    
    if (this.map) {
      this.refreshAvailableNodes();
      // Safety: if player has left home but no nodes are available, force-add tier 1 (starting locations)
      if (this.hasLeftHome() && this.map.availableNodes.size === 0) {
        const tier1 = this.map.tiers[1] || [];
        tier1.forEach(node => {
          if (!node.completed) {
            node.available = true;
            this.map.availableNodes.add(node.id);
          }
        });
        console.log('Safety: re-added starting locations. Available:', Array.from(this.map.availableNodes));
      }
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
