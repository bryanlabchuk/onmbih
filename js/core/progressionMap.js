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
    
    // Mark start node as available
    const startNode = this.map.nodes[this.map.currentNodeId];
    startNode.available = true;
    this.map.availableNodes.add(startNode.id);
    
    return this.map;
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

  // Complete a node and unlock connections
  completeNode(nodeId) {
    const node = this.map.nodes[nodeId];
    if (!node) return;

    node.completed = true;
    this.map.completedNodes.add(nodeId);
    this.map.availableNodes.delete(nodeId);

    // Unlock connected nodes
    node.connections.out.forEach(outId => {
      const outNode = this.map.nodes[outId];
      if (outNode && !outNode.completed) {
        outNode.available = true;
        this.map.availableNodes.add(outId);
      }
    });

    // Update current position
    this.map.currentNodeId = null; // Will be set when player selects next node
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
    const overlay = document.getElementById('map-overlay');
    if (!overlay) return;

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

    // Render from bottom (start) to top (boss)
    const tiersHTML = this.map.tiers.map((tier, tierIndex) => {
      const tierClass = tierIndex === 0 ? 'tier-start' : 
                        tierIndex === this.map.tiers.length - 1 ? 'tier-boss' : '';
      
      return `
        <div class="map-tier ${tierClass}" data-tier="${tierIndex}">
          <div class="tier-label">
            ${tierIndex === 0 ? 'START' : 
              tierIndex === this.map.tiers.length - 1 ? 'BOSS' : 
              `Floor ${tierIndex}`}
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

  // Render node preview
  renderNodePreview(node) {
    const preview = document.getElementById('node-preview');
    if (!preview || !node) {
      if (preview) preview.style.display = 'none';
      return;
    }

    const nodeType = NODE_TYPES[node.type];
    const difficulty = getDifficultySettings(node.difficulty);
    const isAvailable = this.map.availableNodes.has(node.id);
    const isCompleted = node.completed;

    preview.innerHTML = `
      <div class="preview-header" style="border-color: ${nodeType.color}">
        <span class="preview-icon">${node.locationIcon}</span>
        <div class="preview-titles">
          <h3>${node.locationName}</h3>
          <span class="preview-type">${nodeType.icon} ${nodeType.name}</span>
        </div>
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
      ` : `
        <div class="preview-locked">🔒 Locked - Complete previous nodes first</div>
      `}
    `;

    preview.style.display = 'block';
  }

  // Bind event handlers
  bindEvents() {
    // Close button
    document.getElementById('close-progression-map')?.addEventListener('click', () => {
      this.hide();
    });

    // Node click/hover
    document.querySelectorAll('.map-node').forEach(nodeEl => {
      nodeEl.addEventListener('click', (e) => {
        const nodeId = nodeEl.dataset.nodeId;
        this.selectNode(nodeId);
      });

      nodeEl.addEventListener('mouseenter', (e) => {
        const nodeId = nodeEl.dataset.nodeId;
        const node = this.map.nodes[nodeId];
        this.renderNodePreview(node);
      });
    });

    // Travel button in preview
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('preview-travel-btn')) {
        const nodeId = e.target.dataset.nodeId;
        this.travelToNode(nodeId);
      }
    });

    // Click outside to deselect
    document.querySelector('.map-canvas')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('map-canvas')) {
        this.selectedNode = null;
        document.querySelectorAll('.map-node').forEach(n => n.classList.remove('selected'));
        document.getElementById('node-preview').style.display = 'none';
      }
    });

    // Escape to close
    const escHandler = (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    };
    document.addEventListener('keydown', escHandler);

    // Draw connections after layout settles
    setTimeout(() => this.drawConnections(), 100);
    window.addEventListener('resize', () => this.drawConnections());
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
    const node = this.map.nodes[nodeId];
    if (!node || !this.map.availableNodes.has(nodeId)) return;

    this.moveToNode(nodeId);
    this.hide();

    // Trigger callback
    if (this.onNodeSelect) {
      this.onNodeSelect(node);
    }
  }

  // Show the map
  show() {
    const overlay = document.getElementById('map-overlay');
    if (overlay) {
      this.render();
      overlay.style.display = 'flex';
      this.isVisible = true;

      // Redraw connections after display
      setTimeout(() => this.drawConnections(), 50);
    }
  }

  // Hide the map
  hide() {
    const overlay = document.getElementById('map-overlay');
    if (overlay) {
      overlay.style.display = 'none';
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
      availableNodes: Array.from(this.map.availableNodes)
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

    // Update node states
    Object.values(this.map.nodes).forEach(node => {
      node.completed = this.map.completedNodes.has(node.id);
      node.available = this.map.availableNodes.has(node.id);
    });
  }
}
