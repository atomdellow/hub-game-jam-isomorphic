# Changelog

All notable changes to **IsoBloom: The Flower Garden** are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

---
## [1.2.0] — 2026-03-13 · TICKET-020

### Added
- **Persistent board mechanic**: correctly-placed patterns now permanently claim their nodes on the shared 19-node board. All 5 rounds play out on the same board, building a visible record of every solved pattern (coloured badges: purple, blue, teal, amber, pink)
- **Fail state** (`phase = 'failed'`): each round allows `MAX_ATTEMPTS = 3` wrong submissions; exhausting all attempts immediately transitions to the new Fail screen
- **`FailScreen.vue`** — red-themed "Garden Blocked!" screen with wilt (🥀) animation, round stats, strategy tip, and "↺ Try Again" button (`data-testid="btn-try-again"`)
- **`claimedByRound`** reactive map (`nodeId → roundNumber`) exported from `useGameState`; persists across rounds, reset only on full restart
- **`attemptsLeft`** ref and `MAX_ATTEMPTS` constant exported from `useGameState`
- **GameHud heart-pips**: Lives row with `maxAttempts` hearts that fade when lost
- **NodeButton round badge**: claimed nodes display their round number, use round-colour accent, and are keyboard- and pointer-inaccessible
- `TOTAL_ROUNDS` reduced from 12 → **5** (one pattern per ~3–4 board nodes; the 19-node board comfortably holds all 5 claims with 3 spare nodes)

### Changed
- `useGameState.submitAnswer`: on correct solve, stamps `claimedByRound`; on wrong solve, decrements `attemptsLeft` and triggers fail phase when budget reaches zero
- `_advanceRound`: resets `attemptsLeft` to `MAX_ATTEMPTS` but keeps `claimedByRound` intact
- `toggleNode` / `resetSelection`: both no-op while `isLocked`; `toggleNode` additionally blocks claimed nodes
- `GameBoard.vue` receives `claimedByRound` prop and passes `claimedRound` to each `NodeButton`
- E2E test suite completely rewritten for persistent-board mechanics: 15 tests covering start screen, game screen interactions, round progression, end screen, and fail screen; non-overlapping board packing verified (Python, 2026-03-13): R1 `{n0,n1}` · R2 `{n7,n12,n16}` · R3 `{n14,n15,n18}` · R4 `{n5,n2,n4,n10}` · R5 `{n3,n8,n13,n17}`

---
## [1.1.0] — 2026-03-13 · TICKET-019

### Added
- **6 new puzzle rounds** bringing the total from 6 → 12:
  - **Round 7 — Twin Bloom** (`diamond`, K₄-e): two triangles sharing one edge — 4 nodes, 5 edges, degree signature `[2,2,3,3]`
  - **Round 8 — Long Stem** (`line5`, P₅): five-node path — 5 nodes, 4 edges, `[1,1,2,2,2]`
  - **Round 9 — Arching Tendril** (`caterpillar`): Y-fork with one arm extended one step further — 5 nodes, 4 edges, `[1,1,1,2,3]`
  - **Round 10 — Comet Bloom** (`tadpole`): closed triangle with a two-node tail — 5 nodes, 5 edges, `[1,2,2,2,3]`
  - **Round 11 — Horned Bloom** (`bull`): triangle with single pendants at two different corners — 5 nodes, 5 edges, `[1,1,2,3,3]`
  - **Round 12 — Twin Tendril Fork** (`doubleCat`): Y-junction with two of three arms each extended one step — 6 nodes, 5 edges, `[1,1,1,2,2,3]`
- Each new pattern has a unique `(nodeCount, edgeCount, degreeSignature)` triple; the existing degree-sequence isomorphism engine detects all 12 without any code changes to the matcher
- E2E test suite updated: `ALL_ROUNDS` covers all 11 follow-up rounds, test timeouts bumped to 40 s for the multi-round tests
- `EndScreen.vue` automatically shows `Max Possible` as `1800` (12 × 150 pts) — no code change required; it derives from `TOTAL_ROUNDS`

---
## [1.0.1] — 2026-03-14 · TICKET-018

### Fixed
- **Vue 3 Transition rendering bug** (`App.vue`): replaced single `<Transition mode="out-in">` wrapping three `v-if/v-else-if/v-else` children with three independent `<Transition name="fade">` wrappers — Vue 3 only supports a single direct child per `<Transition>`, so `mode="out-in"` with multiple children blocked the entering screen from ever mounting after "Start" was clicked
- **FORK round test nodes** (`e2e/game.spec.js`): swapped `n4` → `n5` as one arm of the Y-fork — `n4–n8` is a board edge, so the original `[n9,n4,n8,n14]` selection produced 4 edges and degree sequence `[1,2,2,3]` (kite), not the required `[1,1,1,3]` (fork)
- **KITE round test nodes** (`e2e/game.spec.js`): swapped `n4` → `n7` as the pendant node — the original `[n8,n9,n13,n4]` selection produced 5 edges and degree sequence `[2,2,3,3]` matching no pattern; `n7` (pendant from `n8`) gives 4 edges and `[1,2,2,3]`
- **Strict-mode assertion** (`e2e/game.spec.js` test-9): replaced `getByText('2')` with `getByTestId('round-value').toContainText('2')` to avoid a Playwright strict-mode violation where two DOM elements (`💡 Select any 2 adjacent nodes.` and `/ 2 needed`) simultaneously matched the broad text selector
- Added `data-testid="round-value"` to the round counter span in `GameHud.vue`
- Added `test.setTimeout(25000)` to three multi-round tests to provide adequate time headroom

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

