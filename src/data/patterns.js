/**
 * patterns.js
 *
 * Defines the 7-round Flower of Life puzzle sequence.
 *
 * ── Zone-unlock mechanic ─────────────────────────────────────────────────────
 * The 19-node board is divided into a centre "Seed of Life" hex (7 nodes) and
 * six 2-node petal zones arranged around it. At the START of each round the
 * next petal zone unlocks — its nodes become visible and interactive for the
 * first time. The player must then place the target pattern using only the
 * currently-unlocked, unclaimed nodes.
 *
 * Round → zone unlocked before the round begins:
 *   R1  Zone 0  Seed of Life  (7 nodes)  — always active
 *   R2  Zone 1  NW Petal      (+2 nodes)
 *   R3  Zone 2  N Petal       (+2 nodes)
 *   R4  Zone 3  NE Petal      (+2 nodes)
 *   R5  Zone 4  SE Petal      (+2 nodes)
 *   R6  Zone 5  S Petal       (+2 nodes)
 *   R7  Zone 6  SW Petal      (+2 nodes)  — board complete
 *
 * ── Canonical node placements (verified non-overlapping, all 19 nodes used) ──
 *   R1  line2      n4-n9                       seed only
 *   R2  line3      n0-n3-n8                    uses NW petal
 *   R3  triangle   n1-n2-n5 (all 3 edges)      uses N petal
 *   R4  triangle   n6-n10-n11 (all 3 edges)    uses NE petal
 *   R5  triangle   n14-n15-n18                 uses SE petal
 *   R6  triangle   n13-n16-n17                 uses S petal
 *   R7  line2      n7-n12                      uses SW petal
 *
 * ── Isomorphism detection strategy ──────────────────────────────────────────
 * "Jam-practical" signature check (sufficient for all patterns used here):
 *   1. nodeCount match
 *   2. edgeCount of induced subgraph match
 *   3. sorted degree-sequence of induced subgraph match
 *   4. BFS connectivity check
 *
 * ── Preview SVG positions ────────────────────────────────────────────────────
 * Each pattern supplies `previewNodes` (100×100 canvas) and `previewEdges`
 * (index pairs into previewNodes) for TargetPatternCard.
 */

export const patterns = [
  // ── Round 1 — Seed of Life (7 nodes active) ──────────────────────────────
  {
    id:              'line2',
    name:            'Sprout Pair',
    round:           1,
    unlocksZone:     0,        // zone unlocked AT THE START of this round
    nodeCount:       2,
    edgeCount:       1,
    degreeSignature: [1, 1],
    description:     'Two pods connected by a single nutrient line.',
    hint:            'Select any 2 adjacent nodes.',
    flavor:          'The seed stirs. Two cells reach toward each other.',
    previewNodes: [
      { x: 20, y: 50 },
      { x: 80, y: 50 },
    ],
    previewEdges: [[0, 1]],
  },

  // ── Round 2 — NW Petal unlocks ───────────────────────────────────────────
  {
    id:              'line3',
    name:            'Growth Stem',
    round:           2,
    unlocksZone:     1,
    nodeCount:       3,
    edgeCount:       2,
    degreeSignature: [1, 1, 2],
    description:     'Three pods in a straight nutrient chain.',
    hint:            'Select 3 nodes in a line — the new petal nodes form the tip.',
    flavor:          'A shoot extends northward into the first new petal.',
    previewNodes: [
      { x: 15, y: 50 },
      { x: 50, y: 50 },
      { x: 85, y: 50 },
    ],
    previewEdges: [[0, 1], [1, 2]],
  },

  // ── Round 3 — N Petal unlocks ─────────────────────────────────────────────
  {
    id:              'triangle',
    name:            'Seed Triangle',
    round:           3,
    unlocksZone:     2,
    nodeCount:       3,
    edgeCount:       3,
    degreeSignature: [2, 2, 2],
    description:     'Three pods forming a closed triangular circuit.',
    hint:            'The two new top nodes and one bridge form a tight triangle.',
    flavor:          'Sacred triad — the first closed growth loop blooms at the crown.',
    previewNodes: [
      { x: 50, y: 18 },
      { x: 18, y: 74 },
      { x: 82, y: 74 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 0]],
  },

  // ── Round 4 — NE Petal unlocks ────────────────────────────────────────────
  {
    id:              'triangle',
    name:            'Mirror Triangle',
    round:           4,
    unlocksZone:     3,
    nodeCount:       3,
    edgeCount:       3,
    degreeSignature: [2, 2, 2],
    description:     'Three pods forming a closed triangular circuit on the right side.',
    hint:            'The two new NE nodes plus the shared bridge close a triangle.',
    flavor:          'The crown\'s mirror — twin triangles now frame the centre hex.',
    previewNodes: [
      { x: 50, y: 18 },
      { x: 18, y: 74 },
      { x: 82, y: 74 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 0]],
  },

  // ── Round 5 — SE Petal unlocks ────────────────────────────────────────────
  {
    id:              'triangle',
    name:            'Root Triangle',
    round:           5,
    unlocksZone:     4,
    nodeCount:       3,
    edgeCount:       3,
    degreeSignature: [2, 2, 2],
    description:     'Three pods forming a closed triangular circuit in the lower right.',
    hint:            'The two SE petal nodes plus the lower-right bridge close a triangle.',
    flavor:          'The roots mirror the crown — sacred symmetry takes shape.',
    previewNodes: [
      { x: 50, y: 18 },
      { x: 18, y: 74 },
      { x: 82, y: 74 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 0]],
  },

  // ── Round 6 — S Petal unlocks ─────────────────────────────────────────────
  {
    id:              'triangle',
    name:            'Base Triangle',
    round:           6,
    unlocksZone:     5,
    nodeCount:       3,
    edgeCount:       3,
    degreeSignature: [2, 2, 2],
    description:     'Three pods forming a closed triangular circuit at the base.',
    hint:            'The two S petal nodes plus the lower-left bridge form a triangle.',
    flavor:          'The garden floor crystallises — five of six petals are in bloom.',
    previewNodes: [
      { x: 50, y: 18 },
      { x: 18, y: 74 },
      { x: 82, y: 74 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 0]],
  },

  // ── Round 7 — SW Petal unlocks — Board Complete! ──────────────────────────
  {
    id:              'line2',
    name:            'Final Sprout',
    round:           7,
    unlocksZone:     6,
    nodeCount:       2,
    edgeCount:       1,
    degreeSignature: [1, 1],
    description:     'The last two pods — the Flower of Life is complete.',
    hint:            'Select the 2 newly unlocked SW nodes — they connect directly.',
    flavor:          'The seventh petal opens. The Flower of Life is complete.',
    previewNodes: [
      { x: 20, y: 50 },
      { x: 80, y: 50 },
    ],
    previewEdges: [[0, 1]],
  },
]

/**
 * Returns the pattern definition for a given round index (0-based).
 * Returns null if index is out of range.
 */
export function getPatternForRound(index) {
  return patterns[index] ?? null
}

/**
 * Total number of rounds in a session.
 * One round per zone: 1 seed + 6 petals = 7 rounds.
 */
export const TOTAL_ROUNDS = patterns.length
