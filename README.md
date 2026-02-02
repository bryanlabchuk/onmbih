# Oh No My Boyfriend Is Haunted 👻

A roguelike card & dice game with dark New England horror humor, inspired by Balatro and Stephen King.

## The Story

Derek Blackwood seemed like the perfect boyfriend. Cute, sweet, and only *slightly* possessed by the vengeful spirits of his ancestors. Seven generations of Blackwoods haunt him. Seven spirits that must be banished.

Armed with nothing but dice, research, and the questionable help of the local townsfolk, you're going to save him. Or die trying. Probably die trying.

## How to Play

### Opening the Game
Simply open `index.html` in a modern web browser. No server required!

### Game Flow

1. **Recruit Allies** - Choose townsfolk to help your investigation. Each provides unique abilities.
2. **Research Phase** - Roll dice to gather research points. Lock dice you want to keep.
3. **Challenge Spirits** - Spend research to discover and challenge Derek's ancestral spirits.
4. **Banish & Repeat** - Meet the spirit's challenge requirement to banish them. Repeat until all 7 are gone!

### Mechanics

- **Dice**: Start with 5 standard dice. Click to lock/unlock. 3 rolls per phase.
- **Research**: Sum of dice + bonuses for pairs and straights. Used to discover spirits.
- **Challenges**: Each spirit has a unique victory condition (score target, specific rolls, etc.)
- **Sanity**: Your health. Take damage from spirits. Hit 0 and it's game over.
- **Allies**: Like Balatro's Jokers - provide passive bonuses and abilities.

## Project Structure

```
onmbih/
├── index.html          # Main game file
├── css/
│   └── style.css       # Dark New England aesthetic
├── js/
│   ├── core/
│   │   ├── game.js     # Main game state manager
│   │   ├── ui.js       # DOM rendering and interactions
│   │   └── audio.js    # Procedural audio effects
│   └── data/
│       ├── townsfolk.js    # Ally definitions
│       ├── spirits.js      # Spirit/boss definitions  
│       └── diceFaces.js    # Customizable dice faces
└── assets/
    ├── townsfolk/      # Ally character images
    ├── spirits/        # Ghost/monster images
    └── misc/           # Pets, costumes, etc.
```

## Characters

### Townsfolk (Allies)
- **Ms. Abigail Crane** - History teacher who knows where ALL the bodies are buried
- **Dr. Eleanor Marsh** - MIT dropout turned paranormal researcher
- **Donna Torrance** - Graveyard shift waitress who hears everything
- **Raven Blackwood** - Derek's emo sister who claims she WANTS to be haunted
- **And many more...**

### Spirits (Bosses)
- **Ezekiel Blackwood** - The Founding Father (Tier 1)
- **Abigail Blackwood** - The Accused Witch (Tier 2)
- **Lord Vladislav Blackwood** - The Vampire Immigrant (Tier 3)
- **Pennywhistle Blackwood** - The Clown (Tier 3) 🎈
- **Mr. Snuffles** - Derek's "Imaginary" Friend (Tier 2)
- **And more ancestral nightmares...**

## Development

This is a vanilla JavaScript game with no build step required. 

### Tech Stack
- Pure HTML5/CSS3/ES6 JavaScript
- CSS Custom Properties for theming
- ES6 Modules for code organization
- Web Audio API for procedural sound effects

### To Extend

- Add new townsfolk in `js/data/townsfolk.js`
- Add new spirits in `js/data/spirits.js`
- Add new dice faces in `js/data/diceFaces.js`
- Adjust styling in `css/style.css`

## Credits

Game concept inspired by:
- **Balatro** - Roguelike deckbuilder mechanics
- **Stephen King** - New England horror atmosphere
- **The title** - "Oh No My Boyfriend Is Haunted" (sarcastic)

---

*"The curse isn't real, they said. It's just superstition, they said."*  
— Professor Thaddeus Blackwood, 1923 (shortly before becoming a mummy)
