// Town Map - Slay the Spire style progression
// Branching paths through the haunted town

// Node types and their properties
export const NODE_TYPES = {
  start: {
    id: 'start',
    name: 'Home',
    icon: '🏠',
    color: '#6aa3c7',
    description: 'Your safe haven. Rest and prepare for the journey ahead.',
    activities: ['rest', 'tutorial'],
    canSkip: false
  },
  research: {
    id: 'research',
    name: 'Research',
    icon: '📚',
    color: '#4a9b6a',
    description: 'Gather knowledge about the spirits haunting Derek.',
    activities: ['research'],
    canSkip: false
  },
  elite: {
    id: 'elite',
    name: 'Elite Challenge',
    icon: '⭐',
    color: '#c9944a',
    description: 'A difficult research challenge with greater rewards.',
    activities: ['elite_research'],
    canSkip: false
  },
  recruit: {
    id: 'recruit',
    name: 'Recruitment',
    icon: '👥',
    color: '#9b4a9b',
    description: 'Meet townsfolk who might join your investigation.',
    activities: ['recruit'],
    canSkip: true
  },
  rest: {
    id: 'rest',
    name: 'Rest',
    icon: '💤',
    color: '#6a8fc7',
    description: 'Take a break and restore your sanity.',
    activities: ['rest', 'heal'],
    canSkip: true
  },
  store: {
    id: 'store',
    name: 'Store',
    icon: '🏪',
    color: '#c9944a',
    description: 'Spend research points on dice upgrades.',
    activities: ['shop', 'upgrade'],
    canSkip: true
  },
  mystery: {
    id: 'mystery',
    name: 'Mystery',
    icon: '❓',
    color: '#7a6a9b',
    description: 'Something strange awaits...',
    activities: ['random_event'],
    canSkip: false
  },
  spirit: {
    id: 'spirit',
    name: 'Spirit',
    icon: '👻',
    color: '#c94a4a',
    description: 'Confront one of Derek\'s ancestral spirits.',
    activities: ['spirit_challenge'],
    canSkip: false
  },
  boss: {
    id: 'boss',
    name: 'Boss Spirit',
    icon: '💀',
    color: '#8a2a2a',
    description: 'A powerful spirit guards this area.',
    activities: ['boss_challenge'],
    canSkip: false
  }
};

// Location themes - visual/narrative flavor for nodes
export const LOCATION_THEMES = {
  home: { name: 'Your House', icon: '🏠', atmosphere: 'safe' },
  school: { name: 'Blackwood High', icon: '🏫', atmosphere: 'eerie' },
  friendsHouse: { name: "Friend's House", icon: '🏡', atmosphere: 'comfortable' },
  library: { name: 'Public Library', icon: '📖', atmosphere: 'quiet' },
  park: { name: 'Foggy Park', icon: '🌳', atmosphere: 'spooky' },
  diner: { name: 'Midnight Diner', icon: '🍽️', atmosphere: 'warm' },
  alley: { name: 'Back Alley', icon: '🌑', atmosphere: 'dangerous' },
  store: { name: 'General Store', icon: '🏪', atmosphere: 'normal' },
  church: { name: 'Old Church', icon: '⛪', atmosphere: 'sacred' },
  cemetery: { name: 'Cemetery', icon: '🪦', atmosphere: 'terrifying' },
  occult: { name: 'Occult Shop', icon: '🔮', atmosphere: 'mystical' },
  mall: { name: 'Abandoned Mall', icon: '🏬', atmosphere: 'eerie' },
  townHall: { name: 'Town Hall', icon: '🏛️', atmosphere: 'imposing' },
  mansion: { name: 'Blackwood Manor', icon: '🏚️', atmosphere: 'haunted' },
  hospital: { name: 'Old Hospital', icon: '🏥', atmosphere: 'creepy' },
  theater: { name: 'Rialto Theater', icon: '🎭', atmosphere: 'dramatic' },
  gasStation: { name: 'Gas Station', icon: '⛽', atmosphere: 'isolated' },
  forest: { name: 'Whispering Woods', icon: '🌲', atmosphere: 'mysterious' }
};

// Tier definitions - what can appear at each depth
export const TIER_CONFIG = {
  0: { // Start
    nodeCount: 1,
    types: ['start'],
    themes: ['home'],
    difficulty: 0
  },
  1: { // Starting locations (adjacent to Home) - always at least 2
    nodeCount: { min: 2, max: 4 },
    types: ['research', 'recruit', 'mystery', 'rest'],
    weights: { research: 35, recruit: 30, mystery: 20, rest: 15 },
    themes: ['school', 'friendsHouse', 'park', 'diner', 'store'],
    difficulty: 1
  },
  2: { // Building up - 3-4 nodes
    nodeCount: { min: 3, max: 4 },
    types: ['research', 'store', 'recruit', 'rest', 'mystery'],
    weights: { research: 30, store: 20, recruit: 20, rest: 15, mystery: 15 },
    themes: ['library', 'diner', 'alley', 'store'],
    difficulty: 2
  },
  3: { // Mid game - 3-4 nodes
    nodeCount: { min: 3, max: 4 },
    types: ['research', 'elite', 'store', 'recruit', 'rest'],
    weights: { research: 25, elite: 20, store: 20, recruit: 20, rest: 15 },
    themes: ['church', 'mall', 'occult', 'theater'],
    difficulty: 3
  },
  4: { // Late game - 2-3 nodes
    nodeCount: { min: 2, max: 3 },
    types: ['elite', 'research', 'rest', 'spirit'],
    weights: { elite: 30, research: 25, rest: 25, spirit: 20 },
    themes: ['townHall', 'cemetery', 'hospital', 'gasStation'],
    difficulty: 4
  },
  5: { // Pre-boss - 1-2 nodes
    nodeCount: { min: 1, max: 2 },
    types: ['rest', 'store', 'spirit'],
    weights: { rest: 40, store: 30, spirit: 30 },
    themes: ['forest', 'mansion'],
    difficulty: 5
  },
  6: { // Boss
    nodeCount: 1,
    types: ['boss'],
    themes: ['mansion'],
    difficulty: 6
  }
};

// Map generation class
export class MapGenerator {
  constructor(seed = null) {
    this.seed = seed || Date.now();
    this.rng = this.createRNG(this.seed);
  }

  // Simple seeded random number generator
  createRNG(seed) {
    let s = seed;
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  // Generate a complete map
  generate(totalTiers = 7) {
    const map = {
      seed: this.seed,
      tiers: [],
      nodes: {},
      connections: [],
      currentNodeId: null,
      completedNodes: new Set(),
      availableNodes: new Set()
    };

    // Generate each tier
    for (let tier = 0; tier < totalTiers; tier++) {
      const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG[6];
      const tierNodes = this.generateTier(tier, tierConfig, map);
      map.tiers.push(tierNodes);
      
      // Add nodes to lookup
      tierNodes.forEach(node => {
        map.nodes[node.id] = node;
      });
    }

    // Generate connections between tiers
    this.generateConnections(map);

    // Set starting state
    const startNode = map.tiers[0][0];
    map.currentNodeId = startNode.id;
    map.availableNodes.add(startNode.id);

    return map;
  }

  // Generate nodes for a single tier
  generateTier(tierIndex, config, map) {
    const nodes = [];
    
    // Determine node count
    let nodeCount = config.nodeCount;
    if (typeof nodeCount === 'object') {
      nodeCount = config.nodeCount.min + 
        Math.floor(this.rng() * (config.nodeCount.max - config.nodeCount.min + 1));
    }

    // Generate each node
    for (let i = 0; i < nodeCount; i++) {
      const nodeType = this.selectNodeType(config);
      const theme = this.selectTheme(config, i);
      
      const node = {
        id: `node_${tierIndex}_${i}`,
        tier: tierIndex,
        index: i,
        type: nodeType,
        theme: theme,
        ...NODE_TYPES[nodeType],
        locationName: LOCATION_THEMES[theme]?.name || theme,
        locationIcon: LOCATION_THEMES[theme]?.icon || '📍',
        atmosphere: LOCATION_THEMES[theme]?.atmosphere || 'normal',
        difficulty: config.difficulty,
        connections: { in: [], out: [] },
        completed: false,
        available: false,
        rewards: this.generateRewards(nodeType, config.difficulty)
      };

      nodes.push(node);
    }

    return nodes;
  }

  // Select a node type based on weights
  selectNodeType(config) {
    if (config.types.length === 1) return config.types[0];
    
    const weights = config.weights || {};
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let roll = this.rng() * totalWeight;
    
    for (const type of config.types) {
      roll -= weights[type] || 0;
      if (roll <= 0) return type;
    }
    
    return config.types[0];
  }

  // Select a location theme
  selectTheme(config, index) {
    if (!config.themes || config.themes.length === 0) return 'unknown';
    const themeIndex = Math.floor(this.rng() * config.themes.length);
    return config.themes[themeIndex];
  }

  // Generate rewards for a node
  generateRewards(nodeType, difficulty) {
    const baseReward = 10 + (difficulty * 5);
    
    switch (nodeType) {
      case 'research':
        return { research: baseReward + Math.floor(this.rng() * 10) };
      case 'elite':
        return { research: baseReward * 2 + Math.floor(this.rng() * 15) };
      case 'spirit':
        return { research: baseReward * 1.5, spiritProgress: 1 };
      case 'boss':
        return { research: baseReward * 3, spiritProgress: 1, unlock: true };
      case 'recruit':
        return { ally: true };
      case 'rest':
        return { sanity: 20 + difficulty * 5 };
      case 'store':
        return { discount: 10 + difficulty * 5 };
      case 'mystery':
        return { random: true };
      default:
        return {};
    }
  }

  // Generate connections between tiers
  generateConnections(map) {
    for (let tier = 0; tier < map.tiers.length - 1; tier++) {
      const currentTier = map.tiers[tier];
      const nextTier = map.tiers[tier + 1];
      
      // Ensure every node has at least one outgoing connection
      currentTier.forEach((node, nodeIndex) => {
        // Connect to 1-2 nodes in next tier
        const connectionCount = 1 + (this.rng() > 0.5 ? 1 : 0);
        const possibleTargets = [...nextTier];
        
        for (let c = 0; c < connectionCount && possibleTargets.length > 0; c++) {
          // Prefer nodes that are somewhat aligned horizontally
          const targetIndex = this.selectAlignedTarget(nodeIndex, currentTier.length, possibleTargets, nextTier.length);
          const target = possibleTargets[targetIndex];
          
          // Create connection
          const connection = {
            from: node.id,
            to: target.id,
            fromTier: tier,
            toTier: tier + 1
          };
          
          map.connections.push(connection);
          node.connections.out.push(target.id);
          target.connections.in.push(node.id);
          
          // Remove from possible targets to avoid duplicates
          possibleTargets.splice(targetIndex, 1);
        }
      });
      
      // Ensure every node in next tier has at least one incoming connection
      nextTier.forEach(node => {
        if (node.connections.in.length === 0) {
          // Connect from a random node in current tier
          const sourceIndex = Math.floor(this.rng() * currentTier.length);
          const source = currentTier[sourceIndex];
          
          const connection = {
            from: source.id,
            to: node.id,
            fromTier: tier,
            toTier: tier + 1
          };
          
          map.connections.push(connection);
          source.connections.out.push(node.id);
          node.connections.in.push(source.id);
        }
      });
    }
  }

  // Select a target that's somewhat aligned with the source
  selectAlignedTarget(sourceIndex, sourceCount, targets, targetCount) {
    // Calculate ideal position ratio
    const sourceRatio = sourceIndex / Math.max(sourceCount - 1, 1);
    
    // Find target closest to this ratio
    let bestIndex = 0;
    let bestDiff = Infinity;
    
    targets.forEach((target, i) => {
      const targetRatio = target.index / Math.max(targetCount - 1, 1);
      const diff = Math.abs(sourceRatio - targetRatio) + this.rng() * 0.3; // Add some randomness
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIndex = i;
      }
    });
    
    return bestIndex;
  }
}

// Challenge scaling based on difficulty
export const DIFFICULTY_SCALING = {
  0: { // Tutorial
    researchMultiplier: 0.5,
    conditionCount: 1,
    rollCount: 4,
    challengeTier: 'easy'
  },
  1: { // Early
    researchMultiplier: 0.75,
    conditionCount: 2,
    rollCount: 4,
    challengeTier: 'easy'
  },
  2: { // Building
    researchMultiplier: 1.0,
    conditionCount: 2,
    rollCount: 3,
    challengeTier: 'easy'
  },
  3: { // Mid
    researchMultiplier: 1.25,
    conditionCount: 3,
    rollCount: 3,
    challengeTier: 'medium'
  },
  4: { // Late
    researchMultiplier: 1.5,
    conditionCount: 3,
    rollCount: 3,
    challengeTier: 'hard'
  },
  5: { // Pre-boss
    researchMultiplier: 1.75,
    conditionCount: 4,
    rollCount: 3,
    challengeTier: 'hard'
  },
  6: { // Boss
    researchMultiplier: 2.0,
    conditionCount: 4,
    rollCount: 2,
    challengeTier: 'expert'
  }
};

// Export a helper to get difficulty settings
export function getDifficultySettings(difficulty) {
  return DIFFICULTY_SCALING[difficulty] || DIFFICULTY_SCALING[3];
}
