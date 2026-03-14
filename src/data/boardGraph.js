/**
 * boardGraph.js
 *
 * Sacred geometry board — 19-node hexagonal (triangular) lattice.
 * Inspired by the Flower of Life / Seed of Life.
 *
 * Layout (pointy-top rows, centred in a 500×500 SVG viewport):
 *
 *   Row +2 (3 nodes)  ·  n0   n1   n2
 *   Row +1 (4 nodes)  ·  n3   n4   n5   n6
 *   Row  0 (5 nodes)  ·  n7   n8   n9  n10  n11   ← centre
 *   Row -1 (4 nodes)  ·  n12  n13  n14  n15
 *   Row -2 (3 nodes)  ·  n16  n17  n18
 *
 * Each node connects to:
 *   - horizontal neighbours in the same row
 *   - the two diagonal neighbours in each adjacent row
 *     (nodes whose x differs by exactly H/2 = 30 px)
 *
 * This produces a dense triangular lattice with 42 edges total.
 */

const CX = 250   // SVG centre-x
const CY = 250   // SVG centre-y
const H  = 60    // horizontal spacing between nodes
const V  = 52    // vertical spacing  (≈ H × √3/2)

// ── Node catalogue ──────────────────────────────────────────────────────────
export const nodes = [
  // Row +2
  { id: 'n0',  x: CX - H,       y: CY - 2 * V, neighbors: ['n1', 'n3', 'n4'] },
  { id: 'n1',  x: CX,           y: CY - 2 * V, neighbors: ['n0', 'n2', 'n4', 'n5'] },
  { id: 'n2',  x: CX + H,       y: CY - 2 * V, neighbors: ['n1', 'n5', 'n6'] },

  // Row +1
  { id: 'n3',  x: CX - 1.5 * H, y: CY - V,     neighbors: ['n0', 'n4', 'n7', 'n8'] },
  { id: 'n4',  x: CX - 0.5 * H, y: CY - V,     neighbors: ['n0', 'n1', 'n3', 'n5', 'n8', 'n9'] },
  { id: 'n5',  x: CX + 0.5 * H, y: CY - V,     neighbors: ['n1', 'n2', 'n4', 'n6', 'n9', 'n10'] },
  { id: 'n6',  x: CX + 1.5 * H, y: CY - V,     neighbors: ['n2', 'n5', 'n10', 'n11'] },

  // Row 0 (middle)
  { id: 'n7',  x: CX - 2 * H,   y: CY,         neighbors: ['n3', 'n8', 'n12'] },
  { id: 'n8',  x: CX - H,       y: CY,         neighbors: ['n3', 'n4', 'n7', 'n9', 'n12', 'n13'] },
  { id: 'n9',  x: CX,           y: CY,         neighbors: ['n4', 'n5', 'n8', 'n10', 'n13', 'n14'] },
  { id: 'n10', x: CX + H,       y: CY,         neighbors: ['n5', 'n6', 'n9', 'n11', 'n14', 'n15'] },
  { id: 'n11', x: CX + 2 * H,   y: CY,         neighbors: ['n6', 'n10', 'n15'] },

  // Row -1
  { id: 'n12', x: CX - 1.5 * H, y: CY + V,     neighbors: ['n7', 'n8', 'n13', 'n16'] },
  { id: 'n13', x: CX - 0.5 * H, y: CY + V,     neighbors: ['n8', 'n9', 'n12', 'n14', 'n16', 'n17'] },
  { id: 'n14', x: CX + 0.5 * H, y: CY + V,     neighbors: ['n9', 'n10', 'n13', 'n15', 'n17', 'n18'] },
  { id: 'n15', x: CX + 1.5 * H, y: CY + V,     neighbors: ['n10', 'n11', 'n14', 'n18'] },

  // Row -2
  { id: 'n16', x: CX - H,       y: CY + 2 * V, neighbors: ['n12', 'n13', 'n17'] },
  { id: 'n17', x: CX,           y: CY + 2 * V, neighbors: ['n13', 'n14', 'n16', 'n18'] },
  { id: 'n18', x: CX + H,       y: CY + 2 * V, neighbors: ['n14', 'n15', 'n17'] },
]

// ── Edge catalogue (42 edges, each listed once as [a, b]) ───────────────────
export const edges = [
  // Row +2 horizontal
  ['n0','n1'], ['n1','n2'],
  // Row +1 horizontal
  ['n3','n4'], ['n4','n5'], ['n5','n6'],
  // Row 0 horizontal
  ['n7','n8'], ['n8','n9'], ['n9','n10'], ['n10','n11'],
  // Row -1 horizontal
  ['n12','n13'], ['n13','n14'], ['n14','n15'],
  // Row -2 horizontal
  ['n16','n17'], ['n17','n18'],

  // Row +2 ↔ Row +1 diagonals
  ['n0','n3'], ['n0','n4'],
  ['n1','n4'], ['n1','n5'],
  ['n2','n5'], ['n2','n6'],

  // Row +1 ↔ Row 0 diagonals
  ['n3','n7'], ['n3','n8'],
  ['n4','n8'], ['n4','n9'],
  ['n5','n9'], ['n5','n10'],
  ['n6','n10'],['n6','n11'],

  // Row 0 ↔ Row -1 diagonals
  ['n7','n12'],
  ['n8','n12'], ['n8','n13'],
  ['n9','n13'], ['n9','n14'],
  ['n10','n14'],['n10','n15'],
  ['n11','n15'],

  // Row -1 ↔ Row -2 diagonals
  ['n12','n16'],
  ['n13','n16'], ['n13','n17'],
  ['n14','n17'], ['n14','n18'],
  ['n15','n18'],
]

// ── Convenience lookup ───────────────────────────────────────────────────────
/** Returns a node object by id, or undefined. */
export function getNode(id) {
  return nodes.find(n => n.id === id)
}

/** Returns all edges that include at least one node in the given id set. */
export function edgesForNodes(idSet) {
  return edges.filter(([a, b]) => idSet.has(a) || idSet.has(b))
}
