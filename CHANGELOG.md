# Changelog

All notable changes to **IsoBloom: The Flower Garden** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

---

## [1.0.0] — 2026-03-13 · TICKET-017

### Added
- Full `README.md` with gameplay instructions, project structure, env setup, and git workflow docs

---

## [0.9.0] — 2026-03-13 · TICKET-016

### Added
- Playwright E2E test suite (`e2e/game.spec.js`) — 14 tests covering all screens and round flow
- `playwright.config.js` with Chromium target and auto-start dev server
- `data-testid` attributes on `NodeButton`, Submit, Reset, and screen CTAs

---

## [0.8.0] — 2026-03-13 · TICKET-015

### Added
- `ParticleBg.vue` — CSS-only floating particle ambient layer (28 deterministic particles)
- Round-swap enter/leave transition on `TargetPatternCard` (fade + slide)
- `app-shell` given `position: relative; z-index: 1` so `ParticleBg` (fixed) layers correctly

---

## [0.7.0] — 2026-03-13 · TICKET-014

### Added
- Complete global CSS in `src/style.css`:
  - Deep-space radial gradient background
  - Chromium custom scrollbar
  - Accessible focus ring via `:focus-visible`
  - Utility class `.visually-hidden`
  - `strong`/`em` colour overrides
- `public/favicon.svg` — SVG Seed of Life favicon

---

## [0.6.0] — 2026-03-13 · TICKET-013

### Added
- `App.vue` fully wired: start → playing → end phase transitions
- `<Transition name="fade">` page-level screen swaps
- `<Transition name="feedback-slide">` for feedback banner
- Game controls: Submit Pattern + Reset buttons with disabled states
- Selection counter below the board

---

## [0.5.0] — 2026-03-13 · TICKET-012

### Added
- `EndScreen.vue` — final score, efficiency %, star rating, flavor quotes, Play Again CTA

---

## [0.5.0] — 2026-03-13 · TICKET-011

### Added
- `StartScreen.vue` — animated Seed of Life background (SVG, CSS spin), title, blurb, Begin Growing CTA

---

## [0.4.0] — 2026-03-13 · TICKET-010

### Added
- `GameHud.vue` — round indicator, progress dots with done/current states, score with bump animation

---

## [0.4.0] — 2026-03-13 · TICKET-009

### Added
- `TargetPatternCard.vue` — circular mini-SVG preview of the abstract pattern, name, description, hint

---

## [0.3.0] — 2026-03-13 · TICKET-008

### Added
- `GameBoard.vue` — responsive SVG board wrapper with decorative background rings and CSS shake-on-error animation

---

## [0.3.0] — 2026-03-13 · TICKET-007

### Added
- `NodeButton.vue` — SVG `<g>` node with hover / selected / correct bloom animation states

---

## [0.3.0] — 2026-03-13 · TICKET-006

### Added
- `EdgeLayer.vue` — SVG `<g>` rendering all board edges; glow states for partial / selected / correct

---

## [0.2.0] — 2026-03-13 · TICKET-005

### Added
- `usePatternMatcher.js` — pure-function engine:
  - `checkPattern()` — node count, edge count, BFS connectivity, degree-sequence comparison
  - `describeSubgraph()` — debug/test helper

---

## [0.2.0] — 2026-03-13 · TICKET-004

### Added
- `useGameState.js` composable — full game lifecycle, round progression, scoring (+100 base, +50 first-attempt bonus), feedback messages, `resetSelection`, `submitAnswer`, `restartGame`

---

## [0.1.0] — 2026-03-13 · TICKET-003

### Added
- `src/data/patterns.js` — 6 puzzle definitions (line2, line3, triangle, fork, line4, kite) with degree signatures, preview node/edge data, hints, and flavor text

---

## [0.1.0] — 2026-03-13 · TICKET-002

### Added
- `src/data/boardGraph.js` — 19-node hexagonal triangular lattice (Flower of Life inspired), 42 edges, full neighbour lists, `getNode()` and `edgesForNodes()` helpers

---

## [0.1.0] — 2026-03-13 · TICKET-001

### Added
- Repository branch strategy: `main` (production), `staging`, `dev`, per-ticket feature branches
- Vite + Vue 3 project scaffold (`package.json`, `vite.config.js`, `index.html`)
- `.env.example` documenting environment variable conventions — `.env` is gitignored
- `src/main.js` app entry point
- `src/style.css` global CSS design tokens
- Skeleton `src/App.vue`
- `CHANGELOG.md`

