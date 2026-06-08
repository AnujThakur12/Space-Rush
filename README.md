# SkyStrike: Air Supremacy

A modern arcade-style 2D plane shooting game built with pure HTML5 Canvas and vanilla JavaScript.

## Features

- **5 Enemy Types** - Drone, Fighter, Bomber, Stealth Jet, Elite Enemy
- **4 Epic Boss Battles** - Missile Commander, Fortress Bomber, Stealth Titan, Air Carrier
- **5 Weapon Systems** - Machine Gun, Laser Cannon, Rockets, Plasma Cannon, Triple Shot
- **6 Power-ups** - Health, Shield, Double Damage, Rapid Fire, Coin Magnet, Extra Life
- **5 Unlockable Planes** - Falcon, Eagle, Raptor, Phantom, Stealth-X
- **Upgrade System** - Health, Damage, Speed, Fire Rate, Armor
- **5 Dynamic Levels** - Desert, Ocean, City, Snow, Space
- **Local Leaderboard** - Top 10 scores with persistence
- **Save System** - Progress, settings, and unlocks via localStorage
- **Mobile Support** - Touch joystick, fire button, multi-touch
- **Responsive Design** - Works on all screen sizes and orientations
- **Delta-Time Game Loop** - Smooth 60+ FPS on all refresh rates

## Quick Start

Open `index.html` in any modern browser. No build tools or servers required.

```bash
# Clone the repository
git clone <repo-url>

# Open the game
open index.html
# or serve locally:
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Controls

### Desktop
| Key | Action |
|-----|--------|
| W / Arrow Up | Move Up |
| S / Arrow Down | Move Down |
| A / Arrow Left | Move Left |
| D / Arrow Right | Move Right |
| Space | Shoot |
| P | Pause |

### Mobile
- **Left side** - Virtual joystick for movement
- **Right side** - Fire button
- **Top right** - Pause button

## Deployment

Works out of the box on:
- **GitHub Pages** - Push and enable Pages
- **Netlify** - Drag-and-drop the folder
- **Vercel** - Deploy with zero configuration

No backend, build steps, or dependencies required.

## Architecture

```
skystrike/
  index.html          - Entry point
  css/
    style.css         - All styles, responsive layout
  js/
    storage.js        - localStorage save/load system
    audio.js          - Web Audio API sound synthesis
    controls.js       - Keyboard + touch input handling
    collision.js      - Collision detection utilities
    effects.js        - Particle system & visual effects
    bullet.js         - Projectile system & weapon types
    player.js         - Player entity & stats
    enemy.js          - 5 enemy types with unique AI
    boss.js           - 4 boss types with attack patterns
    powerups.js       - Power-up drops & effects
    ui.js             - Menus, HUD, all rendering
    game.js           - Game loop, state, orchestrator
```

All graphics are procedurally drawn via Canvas API. All sounds are synthesized with Web Audio API. Zero external assets required.

## Technical Highlights

- **Delta Time (dt)** - Frame-rate independent movement
- **requestAnimationFrame** - Smooth vsync-aligned rendering
- **Canvas 2D** - No WebGL, pure 2D rendering
- **Object-Oriented** - Clean class-based architecture
- **Modular Design** - Each system is independently maintainable
- **Memory Safe** - Object pooling and cleanup to prevent leaks

## Browser Support

- Chrome/Edge (desktop & mobile)
- Firefox
- Safari (desktop & mobile)
- Samsung Internet
- Opera

## License

MIT
