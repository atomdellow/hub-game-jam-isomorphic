/**
 * patterns.js
 *
 * Defines twelve puzzle rounds in ascending difficulty.
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
 * This cleanly distinguishes all twelve patterns below without ambiguity.
 *
 * ── Pattern degree signatures (unique per row) ───────────────────────────────
 *   line2      : n=2, e=1, [1,1]
 *   line3      : n=3, e=2, [1,1,2]
 *   triangle   : n=3, e=3, [2,2,2]
 *   fork       : n=4, e=3, [1,1,1,3]
 *   line4      : n=4, e=3, [1,1,2,2]
 *   kite       : n=4, e=4, [1,2,2,3]   (triangle + pendant)
 *   diamond    : n=4, e=5, [2,2,3,3]   (K₄-e, two triangles sharing one edge)
 *   line5      : n=5, e=4, [1,1,2,2,2]
 *   caterpillar: n=5, e=4, [1,1,1,2,3] (fork + one arm extended)
 *   tadpole    : n=5, e=5, [1,2,2,2,3] (triangle + two-node tail)
 *   bull       : n=5, e=5, [1,1,2,3,3] (triangle + two single pendants)
 *   doubleCat  : n=6, e=5, [1,1,1,2,2,3] (Y-fork with two arms extended)
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

  // ── Round 7 ──────────────────────────────────────────────────────────────
  {
    id:              'diamond',
    name:            'Twin Bloom',
    round:           7,
    nodeCount:       4,
    edgeCount:       5,
    degreeSignature: [2, 2, 3, 3],
    description:     'Two triangular circuits sharing a common nutrient bond.',
    hint:            'Find a shared edge where each endpoint has one additional unique neighbour — two triangles sharing one side.',
    flavor:          'Symmetry doubles the bloom — two petals from a single stem.',
    previewNodes: [
      { x: 50, y: 15 },   // top (degree 2)
      { x: 20, y: 55 },   // left hub (degree 3)
      { x: 80, y: 55 },   // right hub (degree 3)
      { x: 50, y: 88 },   // bottom (degree 2)
    ],
    previewEdges: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3]],
  },

  // ── Round 8 ──────────────────────────────────────────────────────────────
  {
    id:              'line5',
    name:            'Long Stem',
    round:           8,
    nodeCount:       5,
    edgeCount:       4,
    degreeSignature: [1, 1, 2, 2, 2],
    description:     'Five pods stretching in a single unbroken chain.',
    hint:            'Select 5 nodes that form a straight, unbranching path — no diagonals allowed.',
    flavor:          'Energy flows from seed to sky — the longest reach yet.',
    previewNodes: [
      { x: 10, y: 50 },
      { x: 30, y: 50 },
      { x: 50, y: 50 },
      { x: 70, y: 50 },
      { x: 90, y: 50 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },

  // ── Round 9 ──────────────────────────────────────────────────────────────
  {
    id:              'caterpillar',
    name:            'Arching Tendril',
    round:           9,
    nodeCount:       5,
    edgeCount:       4,
    degreeSignature: [1, 1, 1, 2, 3],
    description:     'A Y-fork with one arm reaching one step further.',
    hint:            'Find a hub with 3 branches, then extend exactly one branch by one more node.',
    flavor:          'One shoot grows bolder than the rest — the reaching tendril.',
    previewNodes: [
      { x: 60, y: 50 },   // hub (degree 3)
      { x: 85, y: 20 },   // arm A tip (degree 1)
      { x: 85, y: 80 },   // arm B tip (degree 1)
      { x: 30, y: 50 },   // arm C inner (degree 2)
      { x: 10, y: 50 },   // arm C extension tip (degree 1)
    ],
    previewEdges: [[0, 1], [0, 2], [0, 3], [3, 4]],
  },

  // ── Round 10 ─────────────────────────────────────────────────────────────
  {
    id:              'tadpole',
    name:            'Comet Bloom',
    round:           10,
    nodeCount:       5,
    edgeCount:       5,
    degreeSignature: [1, 2, 2, 2, 3],
    description:     'A closed triangular circuit with a two-node tail trailing behind.',
    hint:            'Enclose a triangle, then extend a two-node chain from one of its vertices.',
    flavor:          'The tail draws energy behind the spinning triad — a living comet.',
    previewNodes: [
      { x: 22, y: 30 },   // triangle left (degree 2)
      { x: 50, y: 55 },   // triangle vertex — tail root (degree 3)
      { x: 22, y: 75 },   // triangle right (degree 2)
      { x: 75, y: 45 },   // tail mid (degree 2)
      { x: 93, y: 30 },   // tail tip (degree 1)
    ],
    previewEdges: [[0, 1], [0, 2], [1, 2], [1, 3], [3, 4]],
  },

  // ── Round 11 ─────────────────────────────────────────────────────────────
  {
    id:              'bull',
    name:            'Horned Bloom',
    round:           11,
    nodeCount:       5,
    edgeCount:       5,
    degreeSignature: [1, 1, 2, 3, 3],
    description:     'A triangular core with two antennae sprouting from different corners.',
    hint:            'Form a triangle, then add a single pendant node at two different corners.',
    flavor:          'Paired horns reach for the light — the sacred bull of the garden.',
    previewNodes: [
      { x: 15, y: 15 },   // left horn tip (degree 1)
      { x: 30, y: 48 },   // left triangle hub (degree 3)
      { x: 70, y: 48 },   // right triangle hub (degree 3)
      { x: 85, y: 15 },   // right horn tip (degree 1)
      { x: 50, y: 82 },   // triangle base (degree 2)
    ],
    previewEdges: [[0, 1], [1, 2], [1, 4], [2, 4], [2, 3]],
  },

  // ── Round 12 ─────────────────────────────────────────────────────────────
  {
    id:              'doubleCat',
    name:            'Twin Tendril Fork',
    round:           12,
    nodeCount:       6,
    edgeCount:       5,
    degreeSignature: [1, 1, 1, 2, 2, 3],
    description:     'A central hub with three branches, two of which grow one step further.',
    hint:            'Find a Y-junction, then extend two of its three arms by one extra node each.',
    flavor:          'The double reaching — two shoots breaking free of the junction.',
    previewNodes: [
      { x: 50, y: 55 },   // hub (degree 3)
      { x: 75, y: 25 },   // arm A inner (degree 2)
      { x: 93, y: 10 },   // arm A tip (degree 1)
      { x: 25, y: 55 },   // arm B inner (degree 2)
      { x: 10, y: 55 },   // arm B tip (degree 1)
      { x: 75, y: 82 },   // arm C tip (degree 1)
    ],
    previewEdges: [[0, 1], [1, 2], [0, 3], [3, 4], [0, 5]],
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
