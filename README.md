# 🎮 Ad, Soyad, Şəhər, Ölkə... (Real-Time Multiplayer Web Game)

A production-ready, multiplayer, real-time web game based on the classic word category game (*"Ad, Soyad, Şəhər, Ölkə, Heyvan, Meyvə, Əşya"* / *Scattergories* / *STOP*).

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Socket.io**, **Zustand**, and the **Web Audio API**.

---

## 🌟 Key Features

1. **Room Creation & Lobby System (`Lobby.tsx`)**:
   - 6-character room codes (e.g. `NU4TF6`) with one-click direct invite link sharing.
   - Host & player management with 16 animated emoji avatars and "Hazırdır / Ready" toggles.
   - Configurable host settings: Round duration (30s, 45s, 60s, 90s, 120s, or Unlimited), number of rounds (3, 5, 7, 10), and category customization (enable/disable default categories or add custom ones like "Peşə", "Brend", "Kino").
2. **Synchronized Real-Time Gameplay (`GameArena.tsx`)**:
   - Synchronized 3-2-1 countdown on all client screens with audio effects.
   - Target letter selector supporting full Azerbaijani alphabet (`A, B, C, Ç, D, E, Ə, F, G, H, X, İ, J, K, Q, L, M, N, O, Ö, P, R, S, Ş, T, U, Ü, V, Y, Z`).
   - Live character validation indicator (emerald checkmark if word starts with target letter, warning if incorrect).
   - Dynamic countdown timer bar (green -> amber -> pulsing red).
   - **Tactile STOP / BİTDİ Button**: Unlocks when all categories are filled. Smashes siren buzzer and triggers a 5-second synchronized grace period countdown for remaining players before locking inputs.
3. **Collaborative Review & Peer-Grading (`ReviewTable.tsx`)**:
   - Semi-automated scoring engine with Azerbaijani locale handling (`toLocaleLowerCase('az')`):
     - **0 points**: Empty answer, incorrect starting letter, or disapproved by peer votes.
     - **5 points**: Duplicate answer with another player.
     - **10 points**: Unique valid answer.
     - **15 points**: Solo answer (only 1 player in the room provided a valid answer for that category).
   - Interactive peer voting: 👍 / 👎 buttons with live vote tally.
   - Host manual override and finalization button.
4. **Round Scoreboard & Olympic Victory Podium (`Scoreboard.tsx`)**:
   - Real-time leaderboard updated after every round.
   - 3D Olympic Podium for 1st, 2nd, and 3rd place with gold, silver, and bronze trophies.
   - Real-time celebratory confetti blast (`canvas-confetti`).
   - "Yenidən Oyna / Play Again" host control.
5. **Quality of Life & Edge Cases**:
   - Native **Web Audio API** sound synthesizer (countdown beeps, tick-tocks, STOP siren, vote pops, victory fanfare) with zero external file dependencies and mute toggle.
   - Session recovery: Local storage token preserves player name, avatar, and room session across browser refreshes.
   - Spectator mode: Late-joining players observe seamlessly and join on the next round.
   - Mobile-first responsive layout with dark glassmorphism aesthetic.

---

## 🛠️ Project Structure

```
ad-soyad-game/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.mjs
├── server.ts                       # Custom Node.js HTTP + Socket.io + Next.js server
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with font, navbar, toast notifications
│   │   ├── page.tsx                # Landing page: Create / Join Room
│   │   ├── room/[code]/page.tsx    # Room orchestrator (Lobby, Arena, Review, Scoreboard)
│   │   └── globals.css             # Glassmorphism, tactile button & animation utilities
│   ├── components/
│   │   ├── Navbar.tsx              # Brand logo, room badge, copy button, mute, status
│   │   ├── Lobby.tsx               # Lobby screen with player roster & host settings
│   │   ├── GameArena.tsx           # Countdown, letter card, live inputs, tactile STOP
│   │   ├── ReviewTable.tsx         # Comparative response matrix & peer voting
│   │   ├── Scoreboard.tsx          # Round breakdown & Olympic victory podium
│   │   ├── SpectatorBanner.tsx     # Late-join spectator banner
│   │   └── ClientStoreInitializer.tsx # Zustand store initializer & global alerts
│   ├── lib/
│   │   ├── audio.ts                # Web Audio API sound effects synthesizer
│   │   ├── constants.ts            # Default categories, alphabet, presets, avatars
│   │   ├── gameLogic.ts            # Scoring algorithm, Azerbaijani normalization, codes
│   │   ├── socket.ts               # Client Socket.io singleton connection
│   │   └── store.ts                # Zustand state management
│   ├── server/
│   │   ├── RoomManager.ts          # Server room lifecycle, tickers, grace period, scores
│   │   └── socketHandlers.ts       # Socket event listeners (join, stop, vote, finalize)
│   └── types/
│       └── game.ts                 # Shared TypeScript interfaces
└── README.md
```

---

## 🚀 Quickstart & Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (Optional)
No mandatory external environment variables are required. By default, the server runs on port 3000.
To run on a custom port:
```bash
PORT=3000 npm run dev
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 4. Build for Production
```bash
npm run build
npm start
```
