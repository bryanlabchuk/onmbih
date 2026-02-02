// Town Locations Data
// Each location has unique characters, activities, and atmosphere

export const LOCATIONS = {
  // ===== HOME & PERSONAL =====
  home: {
    id: 'home',
    name: 'Your House',
    icon: '🏠',
    description: 'A cozy Victorian on Elm Street. Derek\'s been acting weird since moving in.',
    activities: ['rest', 'research', 'customize'],
    atmosphere: 'safe',
    characters: ['derek'], // Your haunted boyfriend
    unlocked: true,
    position: { x: 50, y: 60 }
  },
  
  friendsHouse: {
    id: 'friendsHouse',
    name: 'Friend\'s House',
    icon: '🏡',
    description: 'Your best friend\'s place. They\'ve noticed Derek isn\'t himself lately.',
    activities: ['recruit', 'research'],
    atmosphere: 'safe',
    characters: ['teenGirl01', 'teenBoy01'],
    unlocked: true,
    position: { x: 35, y: 55 }
  },

  // ===== DOWNTOWN =====
  library: {
    id: 'library',
    name: 'Blackwood Library',
    icon: '📚',
    description: 'Dusty tomes and forbidden knowledge. The librarian knows more than she lets on.',
    activities: ['research', 'recruit'],
    atmosphere: 'eerie',
    characters: ['historyTeacher', 'oldWoman'],
    researchBonus: 1.5,
    unlocked: true,
    position: { x: 45, y: 35 }
  },
  
  townHall: {
    id: 'townHall',
    name: 'Town Hall',
    icon: '🏛️',
    description: 'Built in 1692. The records room has birth, death, and... other certificates.',
    activities: ['research', 'recruit'],
    atmosphere: 'formal',
    characters: ['businesswoman', 'oldMan'],
    unlocked: true,
    position: { x: 55, y: 30 }
  },
  
  bank: {
    id: 'bank',
    name: 'First National Bank',
    icon: '🏦',
    description: 'The Blackwood family had a safety deposit box here for 200 years.',
    activities: ['research'],
    atmosphere: 'sterile',
    characters: ['adultMan01'],
    unlocked: false,
    unlockRequirement: { spiritsBanished: 1 },
    position: { x: 65, y: 35 }
  },

  // ===== SHOPPING =====
  mall: {
    id: 'mall',
    name: 'Ravenwood Mall',
    icon: '🏬',
    description: 'Built on the old Blackwood estate grounds. Strange things happen after closing.',
    activities: ['recruit', 'customize'],
    atmosphere: 'busy',
    characters: ['teenGirl02', 'teenBoy02', 'teenGirl03'],
    unlocked: true,
    position: { x: 75, y: 45 }
  },
  
  electronicsStore: {
    id: 'electronicsStore',
    name: 'Circuit Shack',
    icon: '📱',
    description: 'EMF readers, spirit boxes, thermal cameras... they call it "ghost hunting gear."',
    activities: ['customize', 'recruit'],
    atmosphere: 'bright',
    characters: ['stonerTeenBoy', 'scientist'],
    diceUpgradeDiscount: 0.2,
    unlocked: true,
    position: { x: 70, y: 55 }
  },
  
  occultStore: {
    id: 'occultStore',
    name: 'The Third Eye',
    icon: '🔮',
    description: 'Candles, crystals, and things that shouldn\'t exist. The owner has "the sight."',
    activities: ['research', 'customize', 'recruit'],
    atmosphere: 'mystical',
    characters: ['witch'],
    spiritDamageBonus: 1,
    unlocked: true,
    position: { x: 30, y: 40 }
  },
  
  sportsStore: {
    id: 'sportsStore',
    name: 'Big Game Sports',
    icon: '⚽',
    description: 'Athletic gear and team spirit. The coach swears the trophy case is haunted.',
    activities: ['recruit'],
    atmosphere: 'energetic',
    characters: ['teenBoy03', 'adultMan06'],
    unlocked: true,
    position: { x: 80, y: 30 }
  },

  // ===== FOOD & SOCIAL =====
  sodaShoppe: {
    id: 'sodaShoppe',
    name: 'Soda Fountain',
    icon: '🥤',
    description: 'A 1950s-style diner. The jukebox plays songs no one remembers recording.',
    activities: ['recruit', 'rest'],
    atmosphere: 'nostalgic',
    characters: ['waitress', 'cook'],
    sanityRestore: 10,
    unlocked: true,
    position: { x: 40, y: 50 }
  },
  
  restaurant: {
    id: 'restaurant',
    name: 'The Black Cat Bistro',
    icon: '🍽️',
    description: 'Fine dining with a dark past. Table 13 is always reserved... but never occupied.',
    activities: ['recruit', 'rest'],
    atmosphere: 'upscale',
    characters: ['adultWoman01', 'adultMan04'],
    sanityRestore: 15,
    unlocked: false,
    unlockRequirement: { research: 50 },
    position: { x: 60, y: 50 }
  },

  // ===== SERVICES =====
  hairSalon: {
    id: 'hairSalon',
    name: 'Curl Up & Dye',
    icon: '💇',
    description: 'Small town gossip central. If it happened in Blackwood, they know about it.',
    activities: ['recruit', 'research'],
    atmosphere: 'chatty',
    characters: ['adultWoman05', 'adultWoman06'],
    unlocked: true,
    position: { x: 25, y: 50 }
  },

  // ===== EDUCATION =====
  school: {
    id: 'school',
    name: 'Blackwood High',
    icon: '🏫',
    description: 'Go Ravens! The old wing has been closed since the "incident" in \'87.',
    activities: ['recruit', 'research'],
    atmosphere: 'institutional',
    characters: ['emoTeenGirl', 'historyTeacher', 'teenGirl01'],
    unlocked: true,
    position: { x: 20, y: 35 }
  },

  // ===== SPOOKY LOCATIONS =====
  graveyard: {
    id: 'graveyard',
    name: 'Blackwood Cemetery',
    icon: '⚰️',
    description: 'Seven generations of Blackwoods rest here. "Rest" being a strong word.',
    activities: ['research', 'challenge'],
    atmosphere: 'haunted',
    characters: ['oldLady'],
    spiritEncounterChance: 0.5,
    unlocked: true,
    position: { x: 15, y: 65 }
  },
  
  abandonedMansion: {
    id: 'abandonedMansion',
    name: 'Old Blackwood Manor',
    icon: '🏚️',
    description: 'The original Blackwood estate. Condemned, but the lights still turn on at midnight.',
    activities: ['research', 'challenge'],
    atmosphere: 'terrifying',
    characters: [],
    spiritEncounterChance: 0.8,
    researchBonus: 2.0,
    unlocked: false,
    unlockRequirement: { spiritsBanished: 3 },
    position: { x: 85, y: 70 }
  },
  
  church: {
    id: 'church',
    name: 'St. Agnes Church',
    icon: '⛪',
    description: 'Built to protect the town. The basement holds secrets the congregation has forgotten.',
    activities: ['research', 'rest'],
    atmosphere: 'sacred',
    characters: ['pilgrimGhostMan'],
    sanityRestore: 20,
    unlocked: false,
    unlockRequirement: { spiritsBanished: 2 },
    position: { x: 50, y: 20 }
  }
};

// Location categories for the sidebar
export const LOCATION_CATEGORIES = {
  personal: {
    name: 'Personal',
    icon: '🏠',
    locations: ['home', 'friendsHouse']
  },
  downtown: {
    name: 'Downtown',
    icon: '🏛️',
    locations: ['library', 'townHall', 'bank']
  },
  shopping: {
    name: 'Shopping',
    icon: '🛍️',
    locations: ['mall', 'electronicsStore', 'occultStore', 'sportsStore']
  },
  food: {
    name: 'Food & Social',
    icon: '🍽️',
    locations: ['sodaShoppe', 'restaurant', 'hairSalon']
  },
  education: {
    name: 'Education',
    icon: '📚',
    locations: ['school']
  },
  supernatural: {
    name: 'Supernatural',
    icon: '👻',
    locations: ['graveyard', 'abandonedMansion', 'church']
  }
};

// Get location by ID
export const getLocation = (id) => LOCATIONS[id];

// Get unlocked locations
export const getUnlockedLocations = (gameState) => {
  return Object.values(LOCATIONS).filter(loc => {
    if (loc.unlocked) return true;
    if (!loc.unlockRequirement) return false;
    
    const req = loc.unlockRequirement;
    if (req.spiritsBanished && gameState.spiritsBanished < req.spiritsBanished) return false;
    if (req.research && gameState.research < req.research) return false;
    
    return true;
  });
};

// Get available characters at a location
export const getLocationCharacters = (locationId, townsfolk) => {
  const location = LOCATIONS[locationId];
  if (!location || !location.characters) return [];
  
  return location.characters
    .map(charId => townsfolk[charId])
    .filter(char => char !== undefined);
};
