/**
 * patterns.js
 *
 * Per-level puzzle sequences for IsoBloom.
 *
 * Level 1 — 19-tile board, 5 rounds, escalating from pairs to 4-tile shapes.
 * Level 2 — expanded board, 5 rounds, new and harder shapes
 *            including a 5-tile bowtie and a 5-tile path.
 *
 * Patterns are described by graph-theoretic invariants so the player can place
 * them anywhere on the board — position, rotation, and reflection don't matter:
 *   nodeCount       number of tiles to select
 *   edgeCount       number of adjacencies in the induced subgraph
 *   degreeSignature sorted degree sequence of the induced subgraph
 *
 * All level-2 patterns verified achievable on the 35-tile radius-2+2 board.
 */

// ── Level 1 patterns (5 rounds) ───────────────────────────────────────────────

const level1Patterns = [
  {
    id:              'line2',
    name:            'Sprout Pair',
    round:           1,
    nodeCount:       2,
    edgeCount:       1,
    degreeSignature: [1, 1],
    description:     'Two pods connected by a single nutrient line.',
    hint:            'Select any 2 adjacent tiles.',
    flavor:          'The seed stirs. Two cells reach toward each other.',
    previewNodes: [
      { x: 22, y: 50 },
      { x: 78, y: 50 },
    ],
    previewEdges: [[0, 1]],
  },

  {
    id:              'triangle',
    name:            'Sacred Triangle',
    round:           2,
    nodeCount:       3,
    edgeCount:       3,
    degreeSignature: [2, 2, 2],
    description:     'Three pods forming a closed triangular circuit.',
    hint:            'Find 3 tiles that are ALL connected to each other.',
    flavor:          'Sacred triad — the first closed growth loop blooms.',
    previewNodes: [
      { x: 50, y: 15 },
      { x: 15, y: 76 },
      { x: 85, y: 76 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 0]],
  },

  {
    id:              'line3',
    name:            'Growth Stem',
    round:           3,
    nodeCount:       3,
    edgeCount:       2,
    degreeSignature: [1, 1, 2],
    description:     'Three pods in a straight nutrient chain.',
    hint:            'Select 3 tiles in a row — one in the middle, two at the ends.',
    flavor:          'A shoot extends, reaching for the outer ring.',
    previewNodes: [
      { x: 12, y: 50 },
      { x: 50, y: 50 },
      { x: 88, y: 50 },
    ],
    previewEdges: [[0, 1], [1, 2]],
  },

  {
    id:              'fork',
    name:            'Tendril Fork',
    round:           4,
    nodeCount:       4,
    edgeCount:       3,
    degreeSignature: [1, 1, 1, 3],
    description:     'One central pod branching out to three separate pods.',
    hint:            'Find a hub tile connected to 3 others — none of the 3 connect to each other.',
    flavor:          'The stem divides — three tendrils reach outward in unison.',
    previewNodes: [
      { x: 50, y: 20 },
      { x: 12, y: 78 },
      { x: 50, y: 78 },
      { x: 88, y: 78 },
    ],
    previewEdges: [[0, 1], [0, 2], [0, 3]],
  },

  {
    id:              'line4',
    name:            'Long Vine',
    round:           5,
    nodeCount:       4,
    edgeCount:       3,
    degreeSignature: [1, 1, 2, 2],
    description:     'Four pods linked in a continuous winding vine.',
    hint:            'Select 4 tiles where each step connects — no branches, no loops.',
    flavor:          'The vine winds its way across the garden floor.',
    previewNodes: [
      { x: 10, y: 50 },
      { x: 36, y: 50 },
      { x: 64, y: 50 },
      { x: 90, y: 50 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 3]],
  },
]

// ── Level 2 patterns (5 rounds) ───────────────────────────────────────────────
//
// The expanded 35-tile board gives room for 5-tile patterns and shapes that
// span both clusters. Patterns escalate from the familiar to the novel.

const level2Patterns = [
  {
    id:              'triangle',
    name:            'Sacred Triangle',
    round:           1,
    nodeCount:       3,
    edgeCount:       3,
    degreeSignature: [2, 2, 2],
    description:     'Three pods forming a closed triangular circuit.',
    hint:            'Find 3 tiles that are ALL connected to each other.',
    flavor:          'The second garden stirs — a familiar triangle takes root.',
    previewNodes: [
      { x: 50, y: 15 },
      { x: 15, y: 76 },
      { x: 85, y: 76 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 0]],
  },

  {
    id:              'fork',
    name:            'Tendril Fork',
    round:           2,
    nodeCount:       4,
    edgeCount:       3,
    degreeSignature: [1, 1, 1, 3],
    description:     'One central pod branching out to three separate pods.',
    hint:            'Find a hub tile connected to 3 others — none of the 3 connect to each other.',
    flavor:          'Roots spread across the new territory.',
    previewNodes: [
      { x: 50, y: 20 },
      { x: 12, y: 78 },
      { x: 50, y: 78 },
      { x: 88, y: 78 },
    ],
    previewEdges: [[0, 1], [0, 2], [0, 3]],
  },

  // Kite: hub (degree 3) + two pods that connect to each other + one lone leaf.
  // Degrees: [1, 2, 2, 3] — 4 tiles, 4 edges.
  // Example: centre tile connected to A, B, C; where B and C are also adjacent.
  {
    id:              'kite',
    name:            'Diamond Kite',
    round:           3,
    nodeCount:       4,
    edgeCount:       4,
    degreeSignature: [1, 2, 2, 3],
    description:     'A hub pod with three connections — two of which are also linked.',
    hint:            'Find a tile connected to 3 neighbours where 2 of those neighbours are also connected to each other.',
    flavor:          'Two petals fuse, forming the kite of the deep garden.',
    previewNodes: [
      { x: 50, y: 16 },
      { x: 16, y: 60 },
      { x: 84, y: 60 },
      { x: 50, y: 86 },
    ],
    previewEdges: [[0, 1], [0, 2], [0, 3], [1, 2]],
  },

  // Bowtie: two triangles that share one central tile.
  // Centre has degree 4; the four outer tiles each have degree 2.
  // Achievable on hex: centre + two neighbours that also connect to each other
  // on one side, plus two more neighbours that also connect to each other on the
  // opposite side — no cross-links between the two pairs.
  // Degrees: [2, 2, 2, 2, 4] — 5 tiles, 6 edges.
  {
    id:              'bowtie',
    name:            'Twin Bloom',
    round:           4,
    nodeCount:       5,
    edgeCount:       6,
    degreeSignature: [2, 2, 2, 2, 4],
    description:     'Two triangular clusters joined at a shared central pod.',
    hint:            'Find a tile that sits at the corner of two separate triangles — it belongs to both.',
    flavor:          'Two petals fuse at their root — a double bloom takes shape.',
    previewNodes: [
      { x: 50, y: 50 },
      { x: 20, y: 25 },
      { x: 20, y: 75 },
      { x: 80, y: 25 },
      { x: 80, y: 75 },
    ],
    previewEdges: [[0, 1], [0, 2], [1, 2], [0, 3], [0, 4], [3, 4]],
  },

  // Path of 5: a simple chain A-B-C-D-E, no branches.
  // Degrees: [1, 1, 2, 2, 2] — 5 tiles, 4 edges.
  {
    id:              'path5',
    name:            'Winding Path',
    round:           5,
    nodeCount:       5,
    edgeCount:       4,
    degreeSignature: [1, 1, 2, 2, 2],
    description:     'Five pods linked in a single winding chain.',
    hint:            'Select 5 tiles where you can trace a single path from one end to the other with no branches.',
    flavor:          'The garden vine weaves its longest journey yet.',
    previewNodes: [
      { x: 8,  y: 50 },
      { x: 29, y: 22 },
      { x: 50, y: 50 },
      { x: 71, y: 22 },
      { x: 92, y: 50 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
]

// ── Placeholder patterns for levels 3–7 ──────────────────────────────────────
// Full pattern sets to be designed once the board geometry is finalised.
// Each placeholder reuses known-achievable shapes so the game remains playable.

function makePlaceholder(levelNum) {
  return [
    { ...level2Patterns[0], round: 1, flavor: `Level ${levelNum} — round 1.` },
    { ...level2Patterns[1], round: 2, flavor: `Level ${levelNum} — round 2.` },
    { ...level2Patterns[2], round: 3, flavor: `Level ${levelNum} — round 3.` },
    { ...level2Patterns[3], round: 4, flavor: `Level ${levelNum} — round 4.` },
    { ...level2Patterns[4], round: 5, flavor: `Level ${levelNum} — round 5.` },
  ]
}

// ── Level registry ────────────────────────────────────────────────────────────

export const patternsByLevel = {
  1: level1Patterns,
  2: level2Patterns,
  3: makePlaceholder(3),
  4: makePlaceholder(4),
  5: makePlaceholder(5),
  6: makePlaceholder(6),
  7: makePlaceholder(7),
}

export const MAX_LEVEL = Object.keys(patternsByLevel).length

/** Returns the pattern array for a given level (falls back to level 1). */
export function getPatternsForLevel(level) {
  return patternsByLevel[level] ?? level1Patterns
}

/** Returns the total round count for a given level. */
export function getTotalRoundsForLevel(level) {
  return getPatternsForLevel(level).length
}

// ── Backward-compat exports (level 1) ────────────────────────────────────────

export const patterns    = level1Patterns
export const TOTAL_ROUNDS = level1Patterns.length

export function getPatternForRound(index) {
  return level1Patterns[index] ?? null
}
