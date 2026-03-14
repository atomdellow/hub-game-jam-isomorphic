# IsoBloom: The Flower Garden — Agent Context File
**Date:** 2026-03-14 · **Current version:** v1.4.0 · **Tag:** `v1.4.0` on `main`

---

## 1. Project Summary

**IsoBloom** is a browser puzzle game for the Pi Day 2026 game jam.
Built with **Vue 3 + Vite 5**. The player is shown a target graph shape
(e.g. a triangle, a Y-fork) and must find a matching subgraph on a
hexagonal node board by clicking nodes and submitting.

Pattern matching is graph-isomorphism via: nodeCount + edgeCount +
sorted degree-sequence + BFS connectivity. No position or rotation matters —
only the connection topology.

---

## 2. Tech Stack

| Tool | Version | Notes |
|------|---------|-------|
| Vue 3 | ^3.4 | Composition API, `<script setup>` |
| Vite | ^5.4 | Dev server port 5173 |
| Playwright | ^1.43 | E2E tests in `e2e/game.spec.js` |
| Node | 20+ | |

**Key scripts:**
```
npm run dev          # dev server
npm run build        # production build to dist/
npm run test:e2e     # Playwright tests (need dev server running or use preview)
python verify_patterns.py  # verify pattern packings (see §7)
```

---

## 3. File Structure

```
hub-game-jam-isomorphic/
├── src/
│   ├── App.vue                          # root — screen routing
│   ├── main.js                          # Vue mount
│   ├── style.css                        # global dark theme
│   ├── data/
│   │   ├── boardGraph.js                # 19-node hex graph (nodes, edges, ZONES)
│   │   └── patterns.js                  # 5-round pattern sequence
│   ├── composables/
│   │   ├── useGameState.js              # central state machine
│   │   └── usePatternMatcher.js         # graph isomorphism checker
│   └── components/
│       ├── StartScreen.vue
│       ├── EndScreen.vue
│       ├── FailScreen.vue
│       ├── GameHud.vue                  # top bar: round, hearts, score
│       ├── GameBoard.vue                # SVG board wrapper
│       ├── EdgeLayer.vue                # SVG edges
│       ├── NodeButton.vue               # single SVG node
│       ├── TargetPatternCard.vue        # shows target shape in sidebar
│       └── ParticleBg.vue              # decorative background
├── e2e/
│   └── game.spec.js                     # 15 Playwright tests (all passing)
├── verify_patterns.py                   # Python geometry verifier
├── CHANGELOG.md
└── AGENT_CONTEXT.md                     # this file
```

---

## 4. Game Flow (v1.4.0)

```
StartScreen  →  [startGame()]
  phase = 'start'

Playing      →  [5 rounds on 19-node board]
  phase = 'playing'
  roundIndex: 0–4
  Each round:
    - Player clicks nodes to select them
    - Submit → checkPattern() → correct/incorrect feedback
    - 3 wrong attempts → phase = 'failed'  → FailScreen
    - Correct → nodes claimed (claimedByRound map), advance round
    - After round 5 correct → phase = 'end'  → EndScreen

EndScreen / FailScreen  →  [restartGame()]  →  StartScreen
```

**Scoring:**
- 100 pts per correct round
- +50 bonus if solved on first attempt
- Max score: 750 (5 × 150)

---

## 5. boardGraph.js — The 19-Node Board

SVG viewport: 500×500. Constants: `CX=250, CY=250, H=60, V=52`

```
Row +2 (3 nodes):   n0   n1   n2          y = CY - 2V = 146
Row +1 (4 nodes):  n3   n4   n5   n6      y = CY - V  = 198
Row  0 (5 nodes): n7   n8   n9  n10  n11  y = CY      = 250
Row -1 (4 nodes):  n12  n13  n14  n15     y = CY + V  = 302
Row -2 (3 nodes):   n16  n17  n18         y = CY + 2V = 354
```

Node x-coordinates (left to right per row):
- Row+2: 190, 250, 310
- Row+1: 160, 220, 280, 340
- Row 0:  130, 190, 250, 310, 370
- Row-1: 160, 220, 280, 340
- Row-2: 190, 250, 310

**42 edges total.** Every node connects horizontally to same-row neighbours
and diagonally to the two nearest nodes in each adjacent row (x offset ±H/2=30).

Exports: `nodes`, `edges`, `ZONES`, `getZoneForNode()`, `getNode()`, `edgesForNodes()`

> Note: `ZONES` is defined in boardGraph.js (leftover from a rejected design)
> but is NOT used anywhere in the current game logic. It can be safely ignored
> or repurposed later.

---

## 6. patterns.js — Round Definitions

Each pattern object:
```js
{
  id:              string,         // 'line2' | 'triangle' | 'line3' | 'fork' | 'line4'
  name:            string,         // display name
  round:           number,         // 1-based
  nodeCount:       number,
  edgeCount:       number,
  degreeSignature: number[],       // sorted ascending, e.g. [1,1,2,2]
  description:     string,
  hint:            string,
  flavor:          string,
  previewNodes:    {x,y}[],        // 100×100 canvas coords for TargetPatternCard SVG
  previewEdges:    [number,number][], // index pairs into previewNodes
}
```

**Current 5-round sequence (Python-verified, non-overlapping canonical packing):**

| Round | ID | Name | Nodes | Degrees | Canonical nodes |
|---|---|---|---|---|---|
| 1 | line2 | Sprout Pair | 2 | [1,1] | n0,n1 |
| 2 | triangle | Sacred Triangle | 3 | [2,2,2] | n4,n5,n9 |
| 3 | line3 | Growth Stem | 3 | [1,1,2] | n7,n12,n16 |
| 4 | fork | Tendril Fork | 4 | [1,1,1,3] | n10,n13,n14,n18 (hub=n14) |
| 5 | line4 | Long Vine | 4 | [1,1,2,2] | n2,n6,n11,n15 |

Unclaimed after all 5 rounds: n3, n8, n17.
Multiple valid placements exist per pattern — canonical is just for tests.

Exports: `patterns[]`, `TOTAL_ROUNDS` (= 5), `getPatternForRound(index)`

---

## 7. usePatternMatcher.js — Graph Isomorphism

`checkPattern(selectedIds, allEdges, pattern) → boolean`

Algorithm:
1. nodeCount check
2. induced-subgraph edge count check
3. BFS connectivity check (no disconnected fragments)
4. sorted degree-sequence check

`describeSubgraph(selectedIds, allEdges)` → `{edgeCount, degreeSignature, connected}`
(used by verify_patterns.py)

---

## 8. useGameState.js — State Machine

Key refs: `phase`, `score`, `roundIndex`, `selectedIds`, `correctIds`,
`claimedByRound` (map nodeId→roundNum), `attemptsLeft`, `isLocked`

Key computed: `currentPattern`, `currentRound`, `totalRounds`, `isPlaying`

Key actions: `startGame()`, `toggleNode(id)`, `resetSelection()`,
`submitAnswer()`, `restartGame()`

`MAX_ATTEMPTS = 3` (exported for App.vue)
`ADVANCE_DELAY_MS = 1400` (pause after correct before advancing)

---

## 9. Component API Summary

### GameBoard.vue
Props: `selectedIds[]`, `correctIds[]`, `hasError:bool`, `claimedByRound:{}`
Emits: `nodeClick(id)`
Imports nodes/edges from boardGraph.js directly.

### NodeButton.vue
Props: `node`, `selected:bool`, `correct:bool`, `claimedRound:number|null`
Visual states: hover, selected, correct (bloom), claimed (coloured by round)
Round colours: `['#a78bfa','#60a5fa','#2dd4bf','#fbbf24','#f472b6','#fb7185','#38bdf8']`
data attributes: `data-node-id`, `data-testid="node-{id}"`

### GameHud.vue
Props: `currentRound`, `totalRounds`, `score`, `attemptsLeft`, `maxAttempts`
data-testid: `round-value`

### TargetPatternCard.vue
Props: `pattern` (full pattern object)
Renders a 100×100 SVG preview using `previewNodes`/`previewEdges`

### EndScreen.vue
Props: `score`
Emits: `restart`
Shows "Garden Complete!", final score, star rating, "Patterns Found" count
data-testid: `btn-restart`

### FailScreen.vue
Props: `score`, `failedRound`, `totalRounds`
Emits: `restart`
Shows "Garden Blocked!"
data-testid: `btn-try-again`

### StartScreen.vue
Emits: `start`
data-testid: `btn-start`

---

## 10. E2E Test Summary (Playwright)

File: `e2e/game.spec.js` — **15 tests, all passing** as of v1.4.0

Test canonical node selectors:
```js
R1 = ['[data-node-id="n0"]', '[data-node-id="n1"]']
R2 = ['[data-node-id="n4"]', '[data-node-id="n5"]', '[data-node-id="n9"]']
R3 = ['[data-node-id="n7"]', '[data-node-id="n12"]', '[data-node-id="n16"]']
R4 = ['[data-node-id="n14"]', '[data-node-id="n10"]', '[data-node-id="n13"]', '[data-node-id="n18"]']
R5 = ['[data-node-id="n2"]', '[data-node-id="n6"]', '[data-node-id="n11"]', '[data-node-id="n15"]']
FREE_A = '[data-node-id="n8"]'   // never claimed, safe for interaction tests
FREE_B = '[data-node-id="n3"]'
```

---

## 11. Git Workflow

Branches: `main` ← `staging` ← `dev` ← `feature/TICKET-XXX-name`

Current tags: `v1.2.0`, `v1.3.0` (rejected zone-unlock design), `v1.4.0` (current)

Commit pattern:
```
feat(TICKET-XXX): short description

- bullet details
```

---

## 12. PLANNED NEXT FEATURE — Multi-Level Hex Expansion (TICKET-022)

### Concept
When the player completes all 5 rounds of Level 1, instead of going to the
End Screen, the game transitions to **Level 2** where a second 19-node hex
is added to the right of the first, sharing an edge (2–3 shared nodes,
reducing total from 38 to ~35 unique nodes). The board grows visually and
the new nodes become available. Level 2 has 5 harder patterns using both
hexes. Goal: **7–8 levels**, then a true "Game Complete" screen.

### Board Geometry

The two hexes share their joining edge. In the triangular lattice, the
right edge of hex 1 consists of: n2, n6, n11, n15, n18 (5 nodes, the
rightmost column). The second hex is placed so its **leftmost column
overlaps exactly** with this right edge — giving 5 shared nodes, 14 new
nodes (total = 19 + 14 = 33 nodes for Level 2 board).

This is the cleanest mathematical join: the second hex's left column IS
the first hex's right column. They share the same x-coordinates along
that edge. The second hex centre shifts by `+3*H = +180px` to the right,
so `CX2 = 430`. The combined board fits within a ~740px wide SVG.

**Level boards:**
- L1: 1 hex, 19 nodes, 42 edges (CX=250)
- L2: 2 hexes joined right, 33 nodes (5 shared), ~75 edges (CX2=430)
- L3: 3 hexes in a row, 47 nodes, ~108 edges (CX3=610) OR arrange as a
  triangle cluster
- L4+: continue expanding, or arrange as a flower pattern

**SVG viewBox scaling:** For L2 (two hexes wide) use viewBox="0 0 680 500"
or scale the SVG to fit. The board component should accept a dynamic viewBox.

### Architecture Changes Required

1. **`src/data/boardGraph.js`** — add a `getLevelBoard(levelIndex)` function
   that returns `{nodes, edges}` for each level's combined board. OR create
   separate `boardL1.js`, `boardL2.js` etc. The nodes for Lv2+ need new IDs
   like `n19`–`n32` for the new hex's unique nodes.

2. **`src/data/patterns.js`** — change from a flat array to a level-indexed
   structure: `levelPatterns[levelIndex]` returns that level's 5-round array.
   Patterns for higher levels use more nodes (5–6 node shapes like `kite`,
   `diamond`, `star`, `hexRing` etc.). Each must be Python-verified
   non-overlapping on their specific board.

3. **`src/composables/useGameState.js`** — add:
   - `levelIndex` ref (0-based, 0 = Level 1)
   - `currentLevelBoard` computed → `getLevelBoard(levelIndex)`
   - `currentLevelPatterns` computed → `levelPatterns[levelIndex]`
   - `_advanceLevel()` function: called when roundIndex hits 5; increments
     levelIndex, resets roundIndex to 0, clears selection/correctIds,
     resets attemptsLeft, keeps cumulative score, shows level-transition UI
   - New phase: `'level-complete'` (brief 2s screen before advancing)
   - After final level (7 or 8): `phase = 'end'`

4. **`src/components/GameBoard.vue`** — must accept `nodes` and `edges` as
   props (passed down from App.vue via useGameState) rather than importing
   from boardGraph.js directly. The SVG `viewBox` should also be a prop or
   computed from the level's board bounds.

5. **`src/App.vue`** — pass `currentLevelBoard.nodes` and
   `currentLevelBoard.edges` down to GameBoard.

6. **`src/components/LevelCompleteScreen.vue`** (NEW) — brief splash screen
   between levels: "Level N complete! The garden expands…" with a bloom
   animation, then auto-advances to Level N+1 after ~2s.

7. **`src/components/GameHud.vue`** — add a Level indicator alongside Round.

8. **`e2e/game.spec.js`** — update to test level transitions; add selectors
   for L2 nodes (n19–n32).

### New Pattern Shapes for Higher Levels

The `usePatternMatcher.js` algorithm already handles any graph shape via
degree-sequence + connectivity. New patterns to introduce in L2–L8:

| ID | Name | Nodes | Edges | Degrees | Notes |
|----|------|-------|-------|---------|-------|
| kite | Diamond Kite | 4 | 4 | [1,2,2,3] | small diamond |
| square | Square Loop | 4 | 4 | [2,2,2,2] | 4-cycle |
| line5 | Long Tendril | 5 | 4 | [1,1,2,2,2] | path of 5 |
| fork5 | Wide Fork | 5 | 4 | [1,1,1,1,4] | hub+4 leaves |
| house | Bloom House | 5 | 5 | [1,2,2,2,3] | triangle+tail |
| hexRing | Hex Ring | 6 | 6 | [2,2,2,2,2,2] | 6-cycle |
| star | Star Burst | 7 | 6 | [1,1,1,1,1,1,6] | hub+6 leaves |

> IMPORTANT: Before adding any new pattern to a level, run verify_patterns.py
> to confirm the canonical placement is valid on THAT LEVEL'S BOARD
> (i.e. the edges array for the combined hex board, not just the L1 edges).

### verify_patterns.py

Located at project root. Uses `describeSubgraph` logic reimplemented in
Python against the board's edge list. Usage:
```
python verify_patterns.py
```
Should output PASS for each round with degs/edges/connected info.
Must be updated for L2+ to use the expanded edge list.

---

## 13. Known Issues / Decisions to Revisit

- `ZONES` array in `boardGraph.js` is unused dead code — can be deleted.
- `getZoneForNode()`, `getNode()`, `edgesForNodes()` exports are unused
  in current game logic but kept for potential future utility.
- `NodeButton.vue` has dead CSS classes `.node-locked-ghost` and
  `.node-newly-unlocked` from the rejected zone-unlock design (v1.3.0).
  They are harmless but can be cleaned up.
- The SVG viewBox is hardcoded to `0 0 500 500` in GameBoard.vue. For
  multi-level boards this MUST become dynamic.
- `EndScreen.vue` shows "Patterns Found: 5" — this is hardcoded and will
  need to reflect total patterns across all levels for the full game.

---

## 14. Version History

| Tag | Description |
|-----|-------------|
| v1.1.0 | Initial complete game (TICKET-001–019) |
| v1.2.0 | Persistent board, fail mechanic (TICKET-020) |
| v1.3.0 | REJECTED zone-unlock design — 7 rounds, 4× repeated triangles |
| v1.4.0 | **Current** — redesigned 5-round open board, zone UI removed |

---

## 15. Continuation Plan for TICKET-022

**Recommended approach: one level at a time to stay within context.**

### Step A — Level 2 Board Geometry
1. Write Python to compute the L2 node positions (shared right-edge, CX2=430)
2. Generate the full L2 edge list
3. Verify 5 non-overlapping patterns that use the new area
4. Export `boardL2` from boardGraph.js

### Step B — Architecture Refactor
1. Refactor `boardGraph.js` to export `getBoardForLevel(n)`
2. Refactor `patterns.js` to export `getPatternsForLevel(n)`
3. Add `levelIndex`, `_advanceLevel()`, `'level-complete'` phase to useGameState.js
4. Make GameBoard.vue accept `nodes`/`edges`/`viewBox` as props

### Step C — Level 2 UI
1. Build `LevelCompleteScreen.vue`
2. Update `GameHud.vue` with level indicator
3. Update `App.vue` to pass board props + handle `'level-complete'` phase

### Step D — Verify & Test
1. `npm run build` (catch errors)
2. `npm run test:e2e` (update tests for L2 node IDs)
3. Git commit `feat(TICKET-022): level 2 — dual hex board`

Repeat Steps A→D for each subsequent level.
