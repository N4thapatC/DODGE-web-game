# 🎮 DODGE.exe

A minimalist retro-style dodge game with escalating difficulty across 4 intense phases. Test your reflexes and see how long you can survive!

![Game Status](https://img.shields.io/badge/status-playable-brightgreen)
![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

## 🕹️ Game Features

- **4 Unique Phases** - Each with increasing difficulty and unique enemy patterns
- **Dynamic Difficulty** - Enemy speed and spawn rate increase over time
- **Retro Aesthetics** - Pixel-perfect design with Press Start 2P font
- **Custom Music System** - Support for phase-specific background music
- **Sound Effects** - 8-bit style audio feedback
- **Score Tracking** - Local high score and latest score display
- **God Mode** - Secret debug mode for testing (Press G)

## 🎯 How to Play

### Controls
- **Arrow Keys** or **WASD** - Move your character
- **Space** - Start game (from menu)
- **M** - Toggle background music
- **G** - Toggle God Mode (secret)

### Objective
Survive as long as possible by dodging red enemy squares. The game gets progressively harder through 4 phases:

1. **Phase 1: BASIC** (Green) - Enemies move in straight lines
2. **Phase 2: AIM** (Yellow) - Enemies aim directly at you
3. **Phase 3: MIXED** (Orange) - Combination of both enemy types
4. **Phase 4: ENDLESS PHASE** (Red) - Maximum intensity, no end!

Each phase lasts 30 seconds before transitioning to the next level of difficulty.

## 🚀 Quick Start

### Option 1: Play Locally (No Setup Required)

1. Download all files
2. Open `index.html` in your web browser
3. Press Space to start playing!

### Option 2: Add Custom Music

1. Create a `music` folder in the game directory
2. Add your MP3 files with these names:
   ```
   music/
   ├── phase1.mp3
   ├── phase2.mp3
   ├── phase3.mp3
   └── phase4.mp3
   ```
3. Launch the game - it will automatically use your music!

**Note:** If music files are not found, the game will run silently (sound effects still work).

## 📁 Project Structure

```
DODGE.exe/
├── index.html          # Main HTML file
├── game.js             # Game logic and mechanics
├── style.css           # Styling
├── README.md           # This file
└── music/              # (Optional) Background music folder
    ├── phase1.mp3
    ├── phase2.mp3
    ├── phase3.mp3
    └── phase4.mp3
```

## 🎵 Music Recommendations

For the best experience, use music that matches each phase's intensity:

- **Phase 1**: Calm, chill music (100-110 BPM)
- **Phase 2**: Tense, focused music (110-130 BPM)
- **Phase 3**: Intense, fast music (130-150 BPM)
- **Phase 4**: Aggressive, extreme music (150+ BPM)

## 🎨 Technical Details

### Built With
- **Vanilla JavaScript** - No frameworks required
- **HTML5 Canvas** - For rendering
- **Web Audio API** - For sound effects
- **HTML5 Audio** - For background music

### Browser Compatibility
- Chrome/Edge (Recommended)
- Firefox
- Safari
- Opera

### Performance
- 60 FPS gameplay
- Lightweight (~50KB total)
- No external dependencies

## 🔧 Customization

### Adjust Music Volume
Edit `game.js` line ~80:
```javascript
bgMusicAudio.volume = 0.3; // 0.0 to 1.0 (default: 0.3 = 30%)
```

### Change Phase Duration
Edit `game.js` line ~121:
```javascript
const PHASE_DURATION = 30; // seconds (default: 30)
```

### Modify Difficulty Curve
Look for phase-specific settings in `game.js` starting around line ~439.

## 🐛 Known Issues

- Music files must be in MP3 format
- Browser must support Web Audio API
- Some browsers may require user interaction before playing audio

## 📝 Development Notes

### God Mode
Press **G** during gameplay to toggle invincibility. Useful for:
- Testing higher phases
- Learning enemy patterns
- Debugging

A gold "GOD MODE" indicator appears when active.

## 🤝 Contributing

Feel free to fork this project and submit pull requests! Some ideas for contributions:

- Particle effects
- Power-ups system
- Enemy variety
- Achievement system
- Online leaderboard
- Mobile controls

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created as a minimalist arcade-style game experiment.

## 🎯 Future Ideas

- [ ] Particle effects on death
- [ ] Power-up system
- [ ] More enemy types
- [ ] Achievement badges
- [ ] Mobile touch controls
- [ ] Online leaderboard
- [ ] Customizable color schemes

---

**Enjoy the game! How long can you survive?** 🎮👾

*Star ⭐ this repo if you enjoyed playing!*

