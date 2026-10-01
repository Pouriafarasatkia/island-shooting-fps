# Island Shooting — P2P FPS

Real-time **browser-based multiplayer First-Person Shooter** built for serverless/static deployment (Vercel, Netlify, GitHub Pages).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite (ES modules) |
| Rendering | Three.js (WebGL, shadows, ACES tone mapping) |
| Physics | Rapier3D WASM |
| Networking | PeerJS (WebRTC DataChannels) |
| Architecture | Event-bus + fixed-timestep |

## Features

- **Fixed-timestep engine** — 60 Hz physics/logic
- **Real ballistics** — RK4 integration, G1/G7 drag, projectile drop, wind (no hitscan)
- **Authoritative Host P2P** — one peer simulates; clients send inputs
- **Client-side prediction + reconciliation**
- **Procedural weapon recoil**
- **Data-driven weapons & physics**
- **Kinematic character controller** — slopes, autostep, snap-to-ground
- **Stylized island map** — trees, rocks, crates, water
- **Lobby + HUD** — host/join room codes, health, ammo, kill feed, scoreboard

## Quick Start

```bash
npm install
npm run dev
```

1. Click **Host Game** → copy the room code  
2. Open another tab/browser → **Join** with the code  
3. Click the canvas to lock pointer → WASD + mouse + LMB

### Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Mouse | Look |
| LMB | Fire |
| Shift | Sprint |
| Space | Jump |
| R | Reload |
| 1 / 2 | Switch weapons |

## Deploy

```bash
npm run build
# Deploy the `dist/` folder — pure static SPA
```

PeerJS uses public STUN servers. For strict NATs add a TURN server.

## License

MIT
