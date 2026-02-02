// Dice Tubes - Gacha-style dice upgrade packs
// Tubes contain dice upgrades with varying visibility (peek slots)

// Tube rarity tiers
export const TUBE_RARITIES = {
  common: {
    id: 'common',
    name: 'Standard Tube',
    color: '#9a9589',
    icon: '🧪',
    cost: 15,
    visibilitySlots: { min: 3, max: 5 }, // Can see most contents
    itemCount: { min: 2, max: 3 },
    dropRates: {
      common: 70,
      uncommon: 25,
      rare: 5,
      epic: 0,
      legendary: 0
    }
  },
  uncommon: {
    id: 'uncommon',
    name: 'Quality Tube',
    color: '#4a9b6a',
    icon: '🔬',
    cost: 30,
    visibilitySlots: { min: 2, max: 4 },
    itemCount: { min: 2, max: 4 },
    dropRates: {
      common: 40,
      uncommon: 40,
      rare: 18,
      epic: 2,
      legendary: 0
    }
  },
  rare: {
    id: 'rare',
    name: 'Research Tube',
    color: '#6aa3c7',
    icon: '⚗️',
    cost: 60,
    visibilitySlots: { min: 1, max: 3 }, // Less visibility
    itemCount: { min: 3, max: 5 },
    dropRates: {
      common: 20,
      uncommon: 40,
      rare: 30,
      epic: 9,
      legendary: 1
    }
  },
  epic: {
    id: 'epic',
    name: 'Arcane Tube',
    color: '#9b4a9b',
    icon: '🧫',
    cost: 100,
    visibilitySlots: { min: 0, max: 2 }, // Mystery contents
    itemCount: { min: 3, max: 5 },
    dropRates: {
      common: 5,
      uncommon: 25,
      rare: 40,
      epic: 25,
      legendary: 5
    }
  },
  legendary: {
    id: 'legendary',
    name: 'Blackwood Vial',
    color: '#c9944a',
    icon: '✨',
    cost: 200,
    visibilitySlots: { min: 0, max: 1 }, // Almost blind
    itemCount: { min: 4, max: 6 },
    dropRates: {
      common: 0,
      uncommon: 10,
      rare: 35,
      epic: 40,
      legendary: 15
    }
  }
};

// Tube item types - what can be inside
export const TUBE_ITEM_TYPES = {
  face_value: {
    id: 'face_value',
    name: 'Face Value',
    icon: '🔢',
    description: 'Upgrade a die face to a higher value',
    applyTo: 'face'
  },
  die_color: {
    id: 'die_color',
    name: 'Dye',
    icon: '🎨',
    description: 'Change the color of a die',
    applyTo: 'die'
  },
  die_shape: {
    id: 'die_shape',
    name: 'Die Mold',
    icon: '🎲',
    description: 'Transform a die into a new shape',
    applyTo: 'die'
  },
  modifier: {
    id: 'modifier',
    name: 'Enchantment',
    icon: '⚡',
    description: 'Add a special modifier to a die',
    applyTo: 'die'
  },
  new_die: {
    id: 'new_die',
    name: 'New Die',
    icon: '✨',
    description: 'A complete new die for your collection',
    applyTo: 'inventory'
  },
  reroll_token: {
    id: 'reroll_token',
    name: 'Reroll Token',
    icon: '🔄',
    description: 'Gain an extra reroll for challenges',
    applyTo: 'player'
  }
};

// Specific items that can appear in tubes
export const TUBE_ITEMS = {
  // Face value upgrades (common)
  face_plus_1: {
    id: 'face_plus_1',
    name: '+1 Face',
    type: 'face_value',
    rarity: 'common',
    icon: '1️⃣',
    value: 1,
    description: 'Increase one face value by 1'
  },
  face_plus_2: {
    id: 'face_plus_2',
    name: '+2 Face',
    type: 'face_value',
    rarity: 'uncommon',
    icon: '2️⃣',
    value: 2,
    description: 'Increase one face value by 2'
  },
  face_plus_3: {
    id: 'face_plus_3',
    name: '+3 Face',
    type: 'face_value',
    rarity: 'rare',
    icon: '3️⃣',
    value: 3,
    description: 'Increase one face value by 3'
  },
  
  // Colors (various rarities)
  dye_red: {
    id: 'dye_red',
    name: 'Crimson Dye',
    type: 'die_color',
    rarity: 'common',
    icon: '🔴',
    color: 'red',
    description: 'Dye a die crimson red'
  },
  dye_blue: {
    id: 'dye_blue',
    name: 'Ocean Dye',
    type: 'die_color',
    rarity: 'common',
    icon: '🔵',
    color: 'blue',
    description: 'Dye a die ocean blue'
  },
  dye_green: {
    id: 'dye_green',
    name: 'Forest Dye',
    type: 'die_color',
    rarity: 'common',
    icon: '🟢',
    color: 'green',
    description: 'Dye a die forest green'
  },
  dye_purple: {
    id: 'dye_purple',
    name: 'Mystic Dye',
    type: 'die_color',
    rarity: 'uncommon',
    icon: '🟣',
    color: 'purple',
    description: 'Dye a die mystic purple'
  },
  dye_gold: {
    id: 'dye_gold',
    name: 'Golden Dye',
    type: 'die_color',
    rarity: 'rare',
    icon: '🟡',
    color: 'gold',
    description: 'Dye a die shimmering gold'
  },
  dye_ghost: {
    id: 'dye_ghost',
    name: 'Spectral Dye',
    type: 'die_color',
    rarity: 'epic',
    icon: '👻',
    color: 'ghost',
    description: 'Dye a die with ghostly essence'
  },
  dye_void: {
    id: 'dye_void',
    name: 'Void Dye',
    type: 'die_color',
    rarity: 'legendary',
    icon: '⚫',
    color: 'black',
    description: 'Dye a die with the void itself'
  },
  
  // Shapes (higher rarities)
  mold_d8: {
    id: 'mold_d8',
    name: 'D8 Mold',
    type: 'die_shape',
    rarity: 'uncommon',
    icon: '💎',
    shape: 'd8',
    description: 'Transform a die into a D8 (1-8)'
  },
  mold_d10: {
    id: 'mold_d10',
    name: 'D10 Mold',
    type: 'die_shape',
    rarity: 'rare',
    icon: '🔷',
    shape: 'd10',
    description: 'Transform a die into a D10 (1-10)'
  },
  mold_d12: {
    id: 'mold_d12',
    name: 'D12 Mold',
    type: 'die_shape',
    rarity: 'epic',
    icon: '⬡',
    shape: 'd12',
    description: 'Transform a die into a D12 (1-12)'
  },
  mold_d20: {
    id: 'mold_d20',
    name: 'D20 Mold',
    type: 'die_shape',
    rarity: 'legendary',
    icon: '🌟',
    shape: 'd20',
    description: 'Transform a die into a legendary D20'
  },
  mold_d4: {
    id: 'mold_d4',
    name: 'D4 Mold',
    type: 'die_shape',
    rarity: 'common',
    icon: '🔺',
    shape: 'd4',
    description: 'Transform a die into a D4 (fewer sides but often higher min)'
  },
  
  // Modifiers (various effects)
  mod_lucky: {
    id: 'mod_lucky',
    name: 'Lucky Charm',
    type: 'modifier',
    rarity: 'uncommon',
    icon: '🍀',
    modifier: 'lucky',
    description: 'Reroll 1s automatically'
  },
  mod_weighted: {
    id: 'mod_weighted',
    name: 'Weighted Core',
    type: 'modifier',
    rarity: 'rare',
    icon: '⚖️',
    modifier: 'weighted',
    description: '+1 to minimum roll'
  },
  mod_explosive: {
    id: 'mod_explosive',
    name: 'Explosive Rune',
    type: 'modifier',
    rarity: 'epic',
    icon: '💥',
    modifier: 'explosive',
    description: 'Max rolls explode (roll again and add)'
  },
  mod_doubled: {
    id: 'mod_doubled',
    name: 'Mirror Shard',
    type: 'modifier',
    rarity: 'legendary',
    icon: '🪞',
    modifier: 'doubled',
    description: 'Roll result is doubled'
  },
  mod_cursed: {
    id: 'mod_cursed',
    name: 'Cursed Mark',
    type: 'modifier',
    rarity: 'rare',
    icon: '☠️',
    modifier: 'cursed',
    description: 'Higher highs, lower lows (+2 to 6s, -1 to 1s)'
  },
  mod_spirit: {
    id: 'mod_spirit',
    name: 'Spirit Bond',
    type: 'modifier',
    rarity: 'epic',
    icon: '👻',
    modifier: 'spirit',
    description: 'Bonus vs spirits based on roll'
  },
  
  // New dice
  new_die_basic: {
    id: 'new_die_basic',
    name: 'Basic D6',
    type: 'new_die',
    rarity: 'uncommon',
    icon: '🎲',
    dieConfig: { shape: 'd6', color: 'white' },
    description: 'A fresh new D6 die'
  },
  new_die_crimson: {
    id: 'new_die_crimson',
    name: 'Crimson D6',
    type: 'new_die',
    rarity: 'rare',
    icon: '🎲',
    dieConfig: { shape: 'd6', color: 'red' },
    description: 'A pre-dyed crimson die'
  },
  new_die_d8: {
    id: 'new_die_d8',
    name: 'Quality D8',
    type: 'new_die',
    rarity: 'rare',
    icon: '💎',
    dieConfig: { shape: 'd8', color: 'blue' },
    description: 'An 8-sided die ready to roll'
  },
  new_die_spectral: {
    id: 'new_die_spectral',
    name: 'Spectral Die',
    type: 'new_die',
    rarity: 'epic',
    icon: '👻',
    dieConfig: { shape: 'd6', color: 'ghost', modifier: 'spirit' },
    description: 'A ghostly die attuned to spirits'
  },
  new_die_legendary: {
    id: 'new_die_legendary',
    name: 'Blackwood Die',
    type: 'new_die',
    rarity: 'legendary',
    icon: '✨',
    dieConfig: { shape: 'd10', color: 'gold', modifier: 'lucky' },
    description: 'A legendary die from the Blackwood estate'
  },
  
  // Reroll tokens
  reroll_token_1: {
    id: 'reroll_token_1',
    name: 'Reroll Token',
    type: 'reroll_token',
    rarity: 'common',
    icon: '🔄',
    count: 1,
    description: '+1 reroll for a single challenge'
  },
  reroll_token_3: {
    id: 'reroll_token_3',
    name: 'Reroll Bundle',
    type: 'reroll_token',
    rarity: 'uncommon',
    icon: '🔄',
    count: 3,
    description: '+3 rerolls for challenges'
  }
};

// Tube class for generating and managing tubes
export class DiceTube {
  constructor(rarity = 'common', seed = null) {
    this.rarity = rarity;
    this.config = TUBE_RARITIES[rarity];
    this.seed = seed || Date.now();
    this.rng = this.createRNG(this.seed);
    
    // Generate tube contents
    this.contents = this.generateContents();
    this.visibilitySlots = this.generateVisibility();
    this.opened = false;
  }
  
  createRNG(seed) {
    let s = seed;
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }
  
  // Generate the items in this tube
  generateContents() {
    const contents = [];
    const itemCount = this.config.itemCount.min + 
      Math.floor(this.rng() * (this.config.itemCount.max - this.config.itemCount.min + 1));
    
    for (let i = 0; i < itemCount; i++) {
      const item = this.generateItem();
      if (item) {
        contents.push({
          ...item,
          visible: false // Will be set by visibility slots
        });
      }
    }
    
    return contents;
  }
  
  // Generate a single item based on rarity weights
  generateItem() {
    // Roll for rarity
    const rarityRoll = this.rng() * 100;
    let selectedRarity = 'common';
    let cumulative = 0;
    
    for (const [rarity, weight] of Object.entries(this.config.dropRates)) {
      cumulative += weight;
      if (rarityRoll <= cumulative) {
        selectedRarity = rarity;
        break;
      }
    }
    
    // Get all items of this rarity
    const possibleItems = Object.values(TUBE_ITEMS).filter(item => item.rarity === selectedRarity);
    
    if (possibleItems.length === 0) {
      // Fallback to common if no items of that rarity
      const commonItems = Object.values(TUBE_ITEMS).filter(item => item.rarity === 'common');
      return commonItems[Math.floor(this.rng() * commonItems.length)];
    }
    
    return possibleItems[Math.floor(this.rng() * possibleItems.length)];
  }
  
  // Determine which slots are visible (peek windows)
  generateVisibility() {
    const slotCount = this.config.visibilitySlots.min + 
      Math.floor(this.rng() * (this.config.visibilitySlots.max - this.config.visibilitySlots.min + 1));
    
    // Randomly select which items are visible
    const indices = this.contents.map((_, i) => i);
    const visibleIndices = [];
    
    for (let i = 0; i < Math.min(slotCount, this.contents.length); i++) {
      const randomIndex = Math.floor(this.rng() * indices.length);
      visibleIndices.push(indices.splice(randomIndex, 1)[0]);
    }
    
    // Mark visible items
    visibleIndices.forEach(idx => {
      if (this.contents[idx]) {
        this.contents[idx].visible = true;
      }
    });
    
    return slotCount;
  }
  
  // Get visible items (what player can see before opening)
  getVisibleItems() {
    return this.contents.filter(item => item.visible);
  }
  
  // Get hidden items count
  getHiddenCount() {
    return this.contents.filter(item => !item.visible).length;
  }
  
  // Open the tube and reveal all contents
  open() {
    this.opened = true;
    this.contents.forEach(item => item.visible = true);
    return this.contents;
  }
  
  // Get the cost of this tube
  getCost() {
    return this.config.cost;
  }
}

// Shop inventory - generates available tubes
export class TubeShop {
  constructor() {
    this.inventory = [];
    this.restockCooldown = 0;
  }
  
  // Generate shop inventory
  restock(playerLevel = 1) {
    this.inventory = [];
    
    // Always have common tubes
    this.inventory.push(new DiceTube('common'));
    this.inventory.push(new DiceTube('common'));
    
    // Uncommon available after level 1
    if (playerLevel >= 1) {
      this.inventory.push(new DiceTube('uncommon'));
    }
    
    // Rare available after level 3
    if (playerLevel >= 3) {
      this.inventory.push(new DiceTube('rare'));
    }
    
    // Epic available after level 5
    if (playerLevel >= 5) {
      this.inventory.push(new DiceTube('epic'));
    }
    
    // Legendary occasionally available at high levels
    if (playerLevel >= 7 && Math.random() > 0.7) {
      this.inventory.push(new DiceTube('legendary'));
    }
    
    return this.inventory;
  }
  
  // Get available tubes
  getAvailable() {
    return this.inventory.filter(tube => !tube.opened);
  }
  
  // Purchase a tube
  purchase(index, playerResearch) {
    const tube = this.inventory[index];
    if (!tube || tube.opened) return null;
    
    if (playerResearch < tube.getCost()) {
      return { error: 'Not enough research points' };
    }
    
    return {
      tube: tube,
      cost: tube.getCost()
    };
  }
}

// Rarity colors for UI
export const RARITY_COLORS = {
  common: '#9a9589',
  uncommon: '#4a9b6a',
  rare: '#6aa3c7',
  epic: '#9b4a9b',
  legendary: '#c9944a'
};
