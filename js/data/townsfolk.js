// Townsfolk - Your allies in researching the spirits haunting your boyfriend
// Each townsfolk provides unique abilities that help with dice rolls or research

export const TOWNSFOLK = {
  // ===== LIBRARIANS & RESEARCHERS =====
  historyTeacher: {
    id: 'historyTeacher',
    name: 'Ms. Abigail Crane',
    title: 'History Teacher',
    image: 'assets/townsfolk/HistoryTeacher.png',
    description: 'Been teaching Salem history for 40 years. Knows where ALL the bodies are buried.',
    flavor: '"The Blackwood family? Oh honey, pull up a chair. This is going to take a while."',
    rarity: 'uncommon',
    ability: {
      name: 'Local Lore',
      description: 'Research rolls gain +2. First spirit each run requires 1 less research.',
      type: 'passive',
      effect: { researchBonus: 2, firstSpiritResearchReduction: 1 }
    },
    researchSpecialty: ['colonial', 'witch'],
    unlocked: true
  },

  scientist: {
    id: 'scientist',
    name: 'Dr. Eleanor Marsh',
    title: 'Paranormal Researcher',
    image: 'assets/townsfolk/Scientist.png',
    description: 'MIT dropout. Now measures ectoplasm for a living. No regrets.',
    flavor: '"Ghosts are just energy that forgot how to leave. My equipment? Oh, it\'s all homemade."',
    rarity: 'rare',
    ability: {
      name: 'Scientific Method',
      description: 'Can reroll any die once per challenge. Pairs count double for research.',
      type: 'active',
      effect: { rerollsPerChallenge: 1, pairsDoubleForResearch: true }
    },
    researchSpecialty: ['entity', 'monster'],
    unlocked: false
  },

  // ===== SERVICE WORKERS =====
  waitress: {
    id: 'waitress',
    name: 'Donna Torrance',
    title: 'Diner Waitress',
    image: 'assets/townsfolk/Waitress.png',
    description: 'Works the graveyard shift at the Overlook Diner. Hears everything.',
    flavor: '"Coffee\'s always hot, pie\'s always fresh, and the ghosts tip better than the living."',
    rarity: 'common',
    ability: {
      name: 'Local Gossip',
      description: 'Start each research phase with 1 extra die roll. +1 to all dice showing 1.',
      type: 'passive',
      effect: { extraStartingRolls: 1, onesBonus: 1 }
    },
    researchSpecialty: ['townHistory'],
    unlocked: true
  },

  cook: {
    id: 'cook',
    name: 'Big Mike Garfield',
    title: 'Diner Cook',
    image: 'assets/townsfolk/Cook.png',
    description: 'Served in \'Nam. Now serves eggs. Says the ghosts remind him of something.',
    flavor: '"You want your eggs scrambled or haunted? Both come with toast."',
    rarity: 'common',
    ability: {
      name: 'Comfort Food',
      description: 'Heal 1 sanity at the start of each challenge. Dice showing 6 are "lucky" - keep them.',
      type: 'passive',
      effect: { sanityHealPerChallenge: 1, keepSixes: true }
    },
    researchSpecialty: ['comfort'],
    unlocked: true
  },

  businesswoman: {
    id: 'businesswoman',
    name: 'Victoria Ashford',
    title: 'Real Estate Developer',
    image: 'assets/townsfolk/Businesswoman.png',
    description: 'Trying to gentrify haunted properties. It\'s going about as well as you\'d expect.',
    flavor: '"This house has GREAT bones. Literally. We found bones in the walls."',
    rarity: 'uncommon',
    ability: {
      name: 'Property Records',
      description: 'Gain 2 bonus research when discovering a spirit. +1 die for challenges in buildings.',
      type: 'passive',
      effect: { bonusResearchOnDiscovery: 2, buildingDiceBonus: 1 }
    },
    researchSpecialty: ['property', 'colonial'],
    unlocked: false
  },

  // ===== ELDERLY WISDOM =====
  oldLady: {
    id: 'oldLady',
    name: 'Nana Ruth',
    title: 'Town Elder',
    image: 'assets/townsfolk/Old lady.png',
    description: 'Been seeing ghosts since before it was fashionable. Her cats see them too.',
    flavor: '"The Blackwood boy? His great-great-grandfather owed me five dollars. I remember everything."',
    rarity: 'rare',
    ability: {
      name: 'Old Memories',
      description: 'Start with knowledge of one random spirit weakness. Straights give +3 research.',
      type: 'passive',
      effect: { startWithWeakness: true, straightResearchBonus: 3 }
    },
    researchSpecialty: ['family', 'curse'],
    unlocked: false
  },

  oldMan: {
    id: 'oldMan',
    name: 'Ezra Whateley',
    title: 'Retired Gravedigger',
    image: 'assets/townsfolk/OldMan.png',
    description: 'Dug graves for 50 years. Says most of them stayed dug. Most.',
    flavor: '"I buried your boyfriend\'s great-uncle twice. Second time didn\'t take either."',
    rarity: 'uncommon',
    ability: {
      name: 'Grave Knowledge',
      description: 'Spirit challenges deal 1 less sanity damage. Can see spirit health values.',
      type: 'passive',
      effect: { reduceSpiritDamage: 1, revealSpiritHealth: true }
    },
    researchSpecialty: ['death', 'burial'],
    unlocked: true
  },

  oldWoman02: {
    id: 'oldWoman02',
    name: 'Agnes Willow',
    title: 'Hedge Witch',
    image: 'assets/townsfolk/OldWoman02.png',
    description: 'Not a REAL witch. Just knows a lot about herbs. And curses. And blood magic.',
    flavor: '"This tea will help you see spirits. This OTHER tea will help you unsee them."',
    rarity: 'legendary',
    ability: {
      name: 'Hedge Magic',
      description: 'Once per run, banish a spirit without a challenge. All herb dice faces gain +1.',
      type: 'active',
      effect: { freeBanish: 1, herbDiceBonus: 1 }
    },
    researchSpecialty: ['curse', 'witch'],
    unlocked: false
  },

  // ===== TEENS =====
  emoTeenGirl: {
    id: 'emoTeenGirl',
    name: 'Raven Blackwood',
    title: 'Your Boyfriend\'s Sister',
    image: 'assets/townsfolk/EmoTeenGirl.png',
    description: 'Claims she WANTS to be haunted. Writes poetry about it. Actually terrified.',
    flavor: '"My brother\'s been weird since forever. I thought it was just a phase. It was not a phase."',
    rarity: 'uncommon',
    ability: {
      name: 'Family Secrets',
      description: 'Blackwood spirits require 2 less research. Can communicate with friendly ghosts.',
      type: 'passive',
      effect: { blackwoodResearchReduction: 2, friendlyGhostComm: true }
    },
    researchSpecialty: ['family', 'blackwood'],
    unlocked: true
  },

  stonerTeenBoy: {
    id: 'stonerTeenBoy',
    name: 'Chad Dunwich',
    title: 'Pizza Delivery Guy',
    image: 'assets/townsfolk/StonerTeenBoy.png',
    description: 'Delivers to some VERY weird addresses. Has seen things. Can\'t remember most of them.',
    flavor: '"Dude, I literally delivered a pizza to a house that doesn\'t exist. They tipped well though."',
    rarity: 'common',
    ability: {
      name: 'Mellow Vibes',
      description: 'Spirits deal 1 less sanity damage. Bad rolls can be "forgotten" once per phase.',
      type: 'passive',
      effect: { reduceSanityDamage: 1, forgetBadRoll: 1 }
    },
    researchSpecialty: ['locations'],
    unlocked: true
  },

  teenBoy01: {
    id: 'teenBoy01',
    name: 'Derek Blackwood',
    title: 'Your Boyfriend',
    image: 'assets/townsfolk/TeenBoy01.png',
    description: 'He\'s cute. He\'s sweet. He\'s possessed by 7 generations of angry ancestors.',
    flavor: '"I swear I\'m not ALWAYS like this. Just when the moon is full. And Tuesdays."',
    rarity: 'starter',
    ability: {
      name: 'Ancestral Connection',
      description: 'Can sense when spirits are near. Takes double damage but provides +2 to all challenges.',
      type: 'passive',
      effect: { spiritSense: true, doubleDamage: true, challengeBonus: 2 }
    },
    researchSpecialty: ['blackwood', 'family'],
    unlocked: true,
    isBoyfriend: true
  },

  teenBoy02: {
    id: 'teenBoy02',
    name: 'Marcus Chen',
    title: 'Amateur Filmmaker',
    image: 'assets/townsfolk/TeenBoy02.png',
    description: 'Making a documentary about the hauntings. His footage keeps getting corrupted.',
    flavor: '"I caught something on camera! It\'s... it\'s telling me to delete this."',
    rarity: 'common',
    ability: {
      name: 'Documentary Evidence',
      description: 'Research discoveries give +1 bonus. Can "replay" one die per challenge.',
      type: 'active',
      effect: { discoveryBonus: 1, replayDie: 1 }
    },
    researchSpecialty: ['evidence'],
    unlocked: true
  },

  teenBoy03: {
    id: 'teenBoy03',
    name: 'Trevor Marsh',
    title: 'Computer Nerd',
    image: 'assets/townsfolk/TeenBoy03.png',
    description: 'Runs the town\'s paranormal forum. Has way too many theories.',
    flavor: '"According to my database, the Blackwood family tree has... negative branches?"',
    rarity: 'uncommon',
    ability: {
      name: 'Digital Archives',
      description: 'Start each run with 3 bonus research. Can identify spirit types before challenging.',
      type: 'passive',
      effect: { startingResearch: 3, identifySpirits: true }
    },
    researchSpecialty: ['database', 'records'],
    unlocked: false
  },

  teenGirl01: {
    id: 'teenGirl01',
    name: 'Sarah Palmer',
    title: 'Cheerleader',
    image: 'assets/townsfolk/TeenGirl01.png',
    description: 'Seems normal. Suspiciously normal. In this town, that\'s the weirdest thing.',
    flavor: '"Go team! Beat those spirits! ...Why is everyone looking at me like that?"',
    rarity: 'common',
    ability: {
      name: 'Team Spirit',
      description: 'All townsfolk abilities trigger 20% more often. +1 die when with 2+ allies.',
      type: 'passive',
      effect: { abilityBonus: 0.2, allyDiceBonus: 1 }
    },
    researchSpecialty: ['teamwork'],
    unlocked: true
  },

  teenGirl02: {
    id: 'teenGirl02',
    name: 'Maya Santos',
    title: 'Track Star',
    image: 'assets/townsfolk/TeenGirl02.png',
    description: 'Fastest runner in three counties. Very useful when things go wrong.',
    flavor: '"I can outrun anything. ANYTHING. That\'s not confidence, that\'s survival."',
    rarity: 'common',
    ability: {
      name: 'Quick Escape',
      description: 'Can flee any challenge without sanity loss. Failed challenges only cost half research.',
      type: 'active',
      effect: { freeEscape: true, failedChallengeReduction: 0.5 }
    },
    researchSpecialty: ['escape'],
    unlocked: true
  },

  teenGirl03: {
    id: 'teenGirl03',
    name: 'Luna Whitmore',
    title: 'Occult Enthusiast',
    image: 'assets/townsfolk/TeenGirl03.png',
    description: 'Read every book about ghosts. Currently regretting that decision.',
    flavor: '"I WANTED this to be real. I take it back. I take it ALL back."',
    rarity: 'uncommon',
    ability: {
      name: 'Occult Knowledge',
      description: 'Know all spirit weaknesses from the start. Research phase gives +1 die.',
      type: 'passive',
      effect: { knowAllWeaknesses: true, researchDiceBonus: 1 }
    },
    researchSpecialty: ['occult', 'weakness'],
    unlocked: false
  },

  // ===== ADULTS =====
  adultMan01: {
    id: 'adultMan01',
    name: 'Sheriff Dan Hopper',
    title: 'Town Sheriff',
    image: 'assets/townsfolk/AdultMan01.png',
    description: 'Knows something weird is happening. Writes it all off as "gas leaks."',
    flavor: '"Kids, I\'ve seen some things. Things I can\'t explain. So I don\'t. Case closed."',
    rarity: 'uncommon',
    ability: {
      name: 'Official Authority',
      description: 'Can "close the case" on one spirit per run, gaining half its research value.',
      type: 'active',
      effect: { closeCasePerRun: 1 }
    },
    researchSpecialty: ['investigation'],
    unlocked: false
  },

  adultMan04: {
    id: 'adultMan04',
    name: 'Father Michael O\'Brien',
    title: 'Town Priest',
    image: 'assets/townsfolk/Adultman04.png',
    description: 'His faith is strong. It needs to be.',
    flavor: '"I\'ve performed 47 exorcisms this year. It\'s February."',
    rarity: 'rare',
    ability: {
      name: 'Holy Blessing',
      description: 'Reduce spirit damage by 2. Once per run, automatically win a challenge.',
      type: 'active',
      effect: { reduceDamage: 2, autoWinPerRun: 1 }
    },
    researchSpecialty: ['religious', 'demon'],
    unlocked: false
  },

  adultMan05: {
    id: 'adultMan05',
    name: 'Jack Torrance Jr.',
    title: 'Writer',
    image: 'assets/townsfolk/AdultMan05.png',
    description: 'Writing a book about the town. The town keeps editing it.',
    flavor: '"All work and no play makes Jack... wait, I didn\'t write that."',
    rarity: 'uncommon',
    ability: {
      name: 'Creative License',
      description: 'Can "rewrite" one die result per challenge to any value.',
      type: 'active',
      effect: { rewriteDiePerChallenge: 1 }
    },
    researchSpecialty: ['stories', 'history'],
    unlocked: false
  },

  adultMan06: {
    id: 'adultMan06',
    name: 'Dr. Herbert West',
    title: 'Mortician',
    image: 'assets/townsfolk/AdultMan06.png',
    description: 'Very interested in the line between life and death. Too interested.',
    flavor: '"Death is just a temporary condition. I\'ve been working on that."',
    rarity: 'legendary',
    ability: {
      name: 'Reanimation',
      description: 'When a challenge fails, can retry once with +3 dice. Costs 3 sanity.',
      type: 'active',
      effect: { retryWithBonus: 3, sanityCost: 3 }
    },
    researchSpecialty: ['death', 'undead'],
    unlocked: false
  },

  adultWoman01: {
    id: 'adultWoman01',
    name: 'Margaret Blackwood',
    title: 'Derek\'s Mom',
    image: 'assets/townsfolk/AdultWoman01.png',
    description: 'Knows exactly what\'s happening. Has been dealing with it for 20 years.',
    flavor: '"Oh, ANOTHER girlfriend trying to save him? Take a number, dear."',
    rarity: 'rare',
    ability: {
      name: 'Mother\'s Intuition',
      description: 'Blackwood spirits deal half damage. Start with a family heirloom dice face.',
      type: 'passive',
      effect: { blackwoodHalfDamage: true, startWithHeirloom: true }
    },
    researchSpecialty: ['blackwood', 'family'],
    unlocked: false
  },

  adultWoman05: {
    id: 'adultWoman05',
    name: 'Nurse Rachel Creed',
    title: 'ER Nurse',
    image: 'assets/townsfolk/AdultWoman05.png',
    description: 'Patches up the victims. Asks no questions. Has learned not to.',
    flavor: '"Animal attack? Sure. That\'s what I\'ll write. Third one this week."',
    rarity: 'common',
    ability: {
      name: 'Medical Care',
      description: 'Heal 2 sanity after each successful challenge. Can prevent one sanity loss per run.',
      type: 'passive',
      effect: { healOnSuccess: 2, preventLossPerRun: 1 }
    },
    researchSpecialty: ['medical'],
    unlocked: true
  }
};

export const RARITY_COLORS = {
  starter: '#888888',
  common: '#4a9c5d',
  uncommon: '#4a7cc9',
  rare: '#9c4ac9',
  legendary: '#c9944a'
};

export const getUnlockedTownsfolk = () => {
  return Object.values(TOWNSFOLK).filter(t => t.unlocked);
};

export const getTownsfolkByRarity = (rarity) => {
  return Object.values(TOWNSFOLK).filter(t => t.rarity === rarity);
};

export const getTownsfolkBySpecialty = (specialty) => {
  return Object.values(TOWNSFOLK).filter(t => t.researchSpecialty.includes(specialty));
};
