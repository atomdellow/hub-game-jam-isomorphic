# IsoBloom: The Flower Garden 🌸

> **Pi Day 2026 Game Jam** · Theme: **ISOMORPHISM**
>
> A sacred-geometry pattern puzzle where you find hidden isomorphic structures inside the Flower of Life.

---

## 🎮 How to Play

1. **Start the game** — click *Begin Growing* on the title screen.
2. **Read the target pattern** — the card on the left shows a small abstract diagram of the pattern you need to find (e.g. "Triangle Bloom", "Hydro Fork").
3. **Click nodes on the board** to select them. Selected nodes glow teal.
4. **Hit *Submit Pattern*** — the game checks whether your selected nodes form the same *graph structure* as the target (same number of nodes, edges, and connectivity shape).
   - ✅ Correct → nodes bloom green, score increases, next round loads.
   - ❌ Incorrect → the board shakes, a hint is shown. Try again — no points are deducted.
5. **Use *Reset*** to clear your selection at any time.
6. **Complete all 6 rounds** to see your final score and rating.

### Pattern types (in order)

| Round | Name | Structure |
|-------|------|-----------|
| 1 | Sprout Pair | 2 nodes, 1 edge |
| 2 | Growth Stem | 3 nodes in a line |
| 3 | Seed Triangle | 3 nodes, all connected |
| 4 | Hydro Fork | Y-shape: 1 hub + 3 branches |
| 5 | Long Runner | 4 nodes in a straight line |
| 6 | Bloom Kite | Triangle + 1 pendant node |

### The hidden math

Two structures are **isomorphic** if they have the same connectivity, regardless of position, rotation, or reflection on the board. You don't need to place nodes in the same location — only the *relationship* between them matters.

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+  
- npm 9+

### Setup

```bash
# 1. Clone
git clone https://github.com/your-org/hub-game-jam-isomorphic.git
cd hub-game-jam-isomorphic

# 2. Copy env file (no secrets needed for the MVP)
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview   # optional: preview the built output
```

---

## 🧪 Running E2E Tests

Tests use [Playwright](https://playwright.dev/) and cover the full game flow.

```bash
# Install Playwright browsers (first time only)
npx playwright install chromium

# Run all tests (starts dev server automatically)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

The test suite covers:
- Title screen renders correctly
- Start button transitions to the game
- Node click & selection feedback
- Reset button works
- Incorrect submission shows hint
- All 6 rounds complete correctly
- End screen shows score and rating
- Play Again returns to title

---

## 🗂 Project Structure

```
src/
  assets/
  components/
    GameBoard.vue         ← Sacred geometry SVG board
    NodeButton.vue        ← Clickable plant pod (SVG node)
    EdgeLayer.vue         ← Nutrient lines (SVG edges)
    TargetPatternCard.vue ← Pattern preview + hint
    GameHud.vue           ← Round / score / progress bar
    StartScreen.vue       ← Title screen
    EndScreen.vue         ← Completion screen
    ParticleBg.vue        ← Decorative floating particle layer
  composables/
    useGameState.js       ← Full game lifecycle, scoring, feedback
    usePatternMatcher.js  ← Degree-sequence + BFS isomorphism engine
  data/
    boardGraph.js         ← 19-node hexagonal lattice (Flower of Life)
    patterns.js           ← 6 puzzle definitions
  App.vue                 ← Root — wires screens together
  main.js
  style.css               ← Global CSS design tokens

e2e/
  game.spec.js            ← Playwright E2E tests

public/
  favicon.svg
```

---

## 🌿 Tech Stack

| Tool | Role |
|------|------|
| [Vue 3](https://vuejs.org/) + Composition API | UI framework |
| [Vite 5](https://vitejs.dev/) | Build tool & dev server |
| Plain scoped CSS | Styling (no CSS framework needed) |
| SVG | Board, nodes, edges, pattern previews |
| [Playwright](https://playwright.dev/) | End-to-end testing |

No backend. No API keys. Fully client-side.

---

## 🔒 Environment Variables

Copy `.env.example` to `.env`. For the MVP, no keys are required.

```bash
cp .env.example .env
```

Any future API integrations (e.g. leaderboard) will be documented in `.env.example`. **Never commit `.env` to git** — it is listed in `.gitignore`.

---

## 🌱 Git Workflow

```
main          ← production
staging       ← pre-production integration
dev           ← integration branch
feature/TICKET-XXX-*  ← per-ticket feature branches
```

Every ticket:
1. Branches from `dev`
2. Gets developed
3. Merges back into `dev` via `--no-ff`
4. `dev` → `staging` → `main` promoted after QA

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full history.

---

## 🏆 Credits

- **Game design, code, art**: IsoBloom team  
- **Jam theme**: Isomorphism  
- **Inspired by**: hydroponic growing systems and the geometry of natural growth  
- **Pi Day 2026** 🥧
