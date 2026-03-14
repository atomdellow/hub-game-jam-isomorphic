/**
 * patterns.js
 *
 * Defines the 5-round puzzle sequence for IsoBloom.
 *
 * The full 19-node board is available from round 1. Each round the player
 * finds the target graph shape anywhere in the unclaimed nodes.
 * Difficulty escalates: 2 nodes -> 3 -> 3 -> 4 -> 4, with distinct shapes.
 *
 * Canonical non-overlapping packing (verified, Python 2026-03-14):
 *   R1  line2     [n0, n1]                 degrees [1,1]       edges 1
 *   R2  triangle  [n4, n5, n9]             degrees [2,2,2]     edges 3
 *   R3  line3     [n7, n12, n16]           degrees [1,1,2]     edges 2
 *   R4  fork      [n10, n13, n14, n18]     degrees [1,1,1,3]   edges 3  hub=n14
 *   R5  line4     [n2, n6, n11, n15]       degrees [1,1,2,2]   edges 3
 *   Unclaimed: n3, n8, n17 (3 nodes)
 *
 * Isomorphism detection:
 * usePatternMatcher checks: nodeCount, edgeCount, degree-sequence, connectivity.
 * The player can place the pattern anywhere on the board - not just at the
 * canonical nodes above. Multiple valid placements exist for all patterns.
 */

export const patterns = [
  // Round 1 - First contact
  {
    id:              'line2',
    name:            'Sprout Pair',
    round:           1,
    nodeCount:       2,
    edgeCount:       1,
    degreeSignature: [1, 1],
    description:     'Two pods connected by a single nutrient line.',
    hint:            'Select any 2 adjacent nodes.',
    flavor:          'The seed stirs. Two cells reach toward each other.',
    previewNodes: [
      { x: 22, y: 50 },
      { x: 78, y: 50 },
    ],
    previewEdges: [[0, 1]],
  },

  // Round 2 - Closed loop
  {
    id:              'triangle',
    name:            'Sacred Triangle',
    round:           2,
    nodeCount:       3,
    edgeCount:       3,
    degreeSignature: [2, 2, 2],
    description:     'Three pods forming a closed triangular circuit.',
    hint:            'Find 3 nodes that are ALL connected to each other.',
    flavor:          'Sacred triad - the first closed growth loop blooms.',
    previewNodes: [
      { x: 50, y: 15 },
      { x: 15, y: 76 },
      { x: 85, y: 76 },
    ],
    previewEdges: [[0, 1], [1, 2], [2, 0]],
  },

  // Round 3 - Open chain
  {
    id:              'line3',
    name:            'Growth Stem',
    round:           3,
    nodeCount:       3,
    edgeCount:       2,
    degreeSignature: [1, 1, 2],
    description:     'Three pods in a straight nutrient chain.',
    hint:            'Select 3 nodes in a row - one in the middle, two at the ends.',
    flavor:          'A shoot extends, reaching for the outer ring.',
    previewNodes: [
      { x: 12, y: 50 },
      { x: 50, y: 50 },
      { x: 88, y: 50 },
    ],
    previewEdges: [[0, 1], [1, 2]],
  },

  // Round 4 - Y-fork
  {
    id:              'fork',
    name:            'Tendril Fork',
    round:           4,
    nodeCount:       4,
    edgeCount:       3,
    degreeSignature: [1, 1, 1, 3],
    description:     'One central pod branching out to three separate pods.',
    hint:            'Find a hub node connected to 3 others - none of the 3 connect to each other.',
    flavor:          'The stem divides - three tendrils reach outward in unison.',
    previewNodes: [
      { x: 50, y: 20 },
      { x: 12, y: 78 },
      { x: 50, y: 78 },
      { x: 88, y: 78 },
    ],
    previewEdges: [[0, 1], [0, 2], [0, 3]],
  },

  // Round 5 - Long path
  {
    id:              'line4',
    name:            'Long Vine',
    round:           5,
    nodeCount:       4,
    edgeCount:       3,
    degreeSignature: [1, 1, 2, 2],
    description:     'Four pods linked in a continuous winding vine.',
    hint:            'Select 4 nodes where each step connects - no branches, no loops.',
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

/**
 * Returns the pattern definition for a given round index (0-based).
 * Returns null if index is out of range.
 */
export function getPatternForRound(index) {
  return patterns[index] ?? null
}

/**
 * Total number of rounds in a session.
 */
export const TOTAL_ROUNDS = patterns.length