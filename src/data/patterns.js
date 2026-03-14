/**
 * patterns.js
 *
 * Defines the six puzzle rounds in ascending difficulty.
 *
 * ── Isomorphism detection strategy ──────────────────────────────────────────
 * Rather than solving the full graph-isomorphism problem, we use a
 * "jam-practical" signature approach:
 *
 *   1. Count selected nodes  →  must equal pattern.nodeCount
 *   2. Count edges within the selection  →  must equal pattern.edgeCount
 *   3. Compute sorted degree-sequence of the induced subgraph
 *      →  must match pattern.degreeSignature
 *
 * This cleanly distinguishes all six patterns below without ambiguity.
 *
 * ── Pattern degree signatures ────────────────────────────────────────────────
 *   line2   : [1,1]
 *   line3   : [1,1,2]
 *   triangle: [2,2,2]
 *   fork    : [1,1,1,3]
 *   line4   : [1,1,2,2]
 *   kite    : [1,2,2,3]   (triangle + one pendant node)
 *
 * ── Preview SVG positions ────────────────────────────────────────────────────
 * Each pattern supplies `previewNodes` (100×100 canvas) and `previewEdges`
 * (index pairs into previewNodes) so TargetPatternCard can render a clean
 * abstract diagram without touching the real board.
 */

export const patterns = [
  // ── Round 1 ──────────────────────────────────────────────────────────────
  {
    id:              'line2',
    name:            'Sprout Pair',
    round:           1,
    nodeCount:       2,
    edgeCount:       1,
    degreeSignature: [1, 1],
    description:     'Two pods connected by a single nutrient line.',
    hint:            'Select any 2 adjacent nodes.',
    flavor:          'A twin-sprout circuit — the simplest bloom.',
    previewNodes: [
      { x: 20, y: 50 },
      { x: 80, y: 50 },
    ],
    previewEdges: [[0, 1]],
  },

  // ── Round 2 ──────────────────────────────────────────────────────────────
  {
    id:              'line3',
    name:            'Growth Stem',
    round:           2,
    nodeCount:       3,
    edgeCount:       2,
    degreeSignature: [1, 1, 2],
    description:     'Three pods in a straight nutrient chain.',
    hint:            'Select 3 nodes in a line (no branching).',
    flavor:          'Energy flows from root to tip — a living stem.',
    previewNodes: [
      { x: 15, y: 50 },
      { x: 50, y: 50 },
      { x: 85, y: 50 },
    ],
    previewEdges: [[0, 1], [1, 2]],
  },

  // ── Round 3 ──────────────────────────────────────────────────────────────
  {
    id:              'triangle',
    name:            'Seed Triangle',
    round:           3,
    nodeCount:       3,
    edgeCount:       3,
    degreeSignature: [2, 2, 2],
    description:     'Three pods forming a closed triangular circuit.',
    hint:            'Select 3 mutually connected nodes.',
    flavor:          'A sacred triad — the first closed growth loop.',
    previewNodes: [
      { x: 50, y: 18 },
      { x: 18, y: 74 },
      { x: 82, y: 74 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 0]],
  },

  // ── Round 4 ──────────────────────────────────────────────────────────────
  {
    id:              'fork',
    name:            'Hydro Fork',
    round:           4,
    nodeCount:       4,
    edgeCount:       3,
    degreeSignature: [1, 1, 1, 3],
    description:     'One hub pod with three branches — a Y-junction.',
    hint:            'Select a central node and 3 neighbours that don\'t connect to each other.',
    flavor:          'Nutrients split three ways at the junction node.',
    previewNodes: [
      { x: 50, y: 15 },   // stem tip
      { x: 50, y: 50 },   // hub (degree 3)
      { x: 18, y: 82 },   // branch left
      { x: 82, y: 82 },   // branch right
    ],
    previewEdges: [[0, 1], [1, 2], [1, 3]],
  },

  // ── Round 5 ──────────────────────────────────────────────────────────────
  {
    id:              'line4',
    name:            'Long Runner',
    round:           5,
    nodeCount:       4,
    edgeCount:       3,
    degreeSignature: [1, 1, 2, 2],
    description:     'Four pods in a straight chain — two interior, two end-caps.',
    hint:            'Select 4 nodes in a line (no branching or loops).',
    flavor:          'A long hydro runner — the backbone of the garden.',
    previewNodes: [
      { x: 10, y: 50 },
      { x: 37, y: 50 },
      { x: 63, y: 50 },
      { x: 90, y: 50 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 3]],
  },

  // ── Round 6 ──────────────────────────────────────────────────────────────
  {
    id:              'kite',
    name:            'Bloom Kite',
    round:           6,
    nodeCount:       4,
    edgeCount:       4,
    degreeSignature: [1, 2, 2, 3],
    description:     'A triangle with one extra pod branching from a corner.',
    hint:            'Find a triangle of 3 nodes, then add 1 more node connected to exactly one corner.',
    flavor:          'A sacred kite — geometry flowering into new growth.',
    previewNodes: [
      { x: 82, y: 18 },   // pendant (degree 1)
      { x: 50, y: 40 },   // triangle top (degree 3 — connects to pendant + 2 in triangle)
      { x: 20, y: 82 },   // triangle left (degree 2)
      { x: 80, y: 82 },   // triangle right (degree 2)
    ],
    previewEdges: [[0, 1], [1, 2], [2, 3], [3, 1]],
  },
]

/**
 * Returns the pattern definition for a given round index (0-based).
 * Returns null if index is out of range.
 */
export function getPatternForRound(index) {
  return patterns[index] ?? null
}

/** Total number of rounds. */
export const TOTAL_ROUNDS = patterns.length
