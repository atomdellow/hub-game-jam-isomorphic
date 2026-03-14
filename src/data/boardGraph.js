/**
 * boardGraph.js
 *
 * Full Flower-of-Life hex board — one fixed 103-tile board for all 7 levels.
 *
 * Seven radius-2 axial clusters arranged in the Flower of Life pattern:
 *   one central cluster (A, level 1) surrounded by six petals (B–G, levels 2–7).
 *
 * Each tile stores:
 *   id             — canonical string key "hQ_R"
 *   q, r           — axial coordinates
 *   x, y           — SVG pixel centre
 *   points         — SVG polygon points string
 *   neighbors      — ids of adjacent tiles in the full board
 *   ring           — axial distance from its home cluster's centre
 *   clusters       — names of every cluster this tile belongs to
 *   activeFromLevel — the earliest level at which this tile becomes playable
 *
 * getBoardConfig(level) always returns the SAME full board.
 * Rendering uses:   tileLocked = tile.activeFromLevel > currentLevel
 * Selection blocks: tile.activeFromLevel > level
 */

// ── Cluster centres (Flower of Life geometry) ─────────────────────────────────
//
// Adjacent clusters are at axial distance 4, so they share exactly 3 tiles
// (one complete flat edge).  All 6 outer centres are equidistant from A.
//
const CLUSTERS = [
  { name: 'A', level: 1, center: [ 0,  0] },
  { name: 'B', level: 2, center: [ 4, -2] },
  { name: 'C', level: 3, center: [ 2, -4] },
  { name: 'D', level: 4, center: [-2, -2] },
  { name: 'E', level: 5, center: [-4,  2] },
  { name: 'F', level: 6, center: [-2,  4] },
  { name: 'G', level: 7, center: [ 2,  2] },
]

// ── Layout constants ───────────────────────────────────────────────────────────
const CX        = 390   // SVG centre-x  (viewport 780 px wide)
const CY        = 410   // SVG centre-y  (viewport 820 px tall)
const SIZE      = 38    // hex circumradius for layout, px
const DRAW_SIZE = 34    // polygon draw radius — inset to create visible gap

const AXIAL_DIRS = [
  [ 1,  0],
  [ 1, -1],
  [ 0, -1],
  [-1,  0],
  [-1,  1],
  [ 0,  1],
]

// ── Pure math helpers ─────────────────────────────────────────────────────────

function hexDistance(q1, r1, q2, r2) {
  return Math.max(
    Math.abs(q1 - q2),
    Math.abs(r1 - r2),
    Math.abs((-q1 - r1) - (-q2 - r2)),
  )
}

function generateClusterTiles(centerQ, centerR, radius = 2) {
  const tiles = []
  for (let q = centerQ - radius; q <= centerQ + radius; q++) {
    for (let r = centerR - radius; r <= centerR + radius; r++) {
      if (hexDistance(q, r, centerQ, centerR) <= radius) {
        tiles.push({ q, r })
      }
    }
  }
  return tiles
}

function axialToPixel(q, r) {
  return {
    x: CX + SIZE * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r),
    y: CY + SIZE * (1.5 * r),
  }
}

function hexPoints(cx, cy) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30)
    return `${(cx + DRAW_SIZE * Math.cos(angle)).toFixed(2)},${(cy + DRAW_SIZE * Math.sin(angle)).toFixed(2)}`
  }).join(' ')
}

const tileId = (q, r) => `h${q}_${r}`

// ── Full board builder ────────────────────────────────────────────────────────

function buildFullFlowerBoard() {
  // 1. Union all cluster tiles, recording which clusters each tile belongs to
  const tileMap = new Map()

  for (const cluster of CLUSTERS) {
    const [cq, cr] = cluster.center
    for (const { q, r } of generateClusterTiles(cq, cr, 2)) {
      const key = tileId(q, r)
      if (!tileMap.has(key)) {
        tileMap.set(key, { q, r, clusters: [] })
      }
      const entry = tileMap.get(key)
      if (!entry.clusters.includes(cluster.name)) {
        entry.clusters.push(cluster.name)
      }
    }
  }

  // 2. Compute activeFromLevel = earliest level among owning clusters
  const allCoords = new Set(tileMap.keys())

  const tiles = Array.from(tileMap.entries()).map(([id, { q, r, clusters }]) => {
    const activeFromLevel = Math.min(
      ...clusters.map(name => CLUSTERS.find(c => c.name === name).level),
    )

    const { x, y } = axialToPixel(q, r)

    // Home cluster = the one that owns this tile at the earliest level
    const homeCluster = CLUSTERS.find(c => c.name === clusters[0])
    const ring = hexDistance(q, r, homeCluster.center[0], homeCluster.center[1])

    const neighbors = AXIAL_DIRS
      .map(([dq, dr]) => tileId(q + dq, r + dr))
      .filter(nid => allCoords.has(nid))

    return {
      id,
      q,
      r,
      x,
      y,
      points: hexPoints(x, y),
      neighbors,
      ring,
      clusters,
      activeFromLevel,
    }
  })

  // 3. Derive unique edges from adjacency
  const edgeSet = new Set()
  const edges   = []
  for (const tile of tiles) {
    for (const nbrId of tile.neighbors) {
      const key = [tile.id, nbrId].sort().join('|')
      if (!edgeSet.has(key)) {
        edgeSet.add(key)
        edges.push([tile.id, nbrId])
      }
    }
  }

  return { tiles, edges, viewBox: '0 0 780 820' }
}

// ── Module-level singleton ────────────────────────────────────────────────────
// Built once at module load; shared by all callers.

const FULL_BOARD = buildFullFlowerBoard()

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the full board configuration.
 * The same board is used for every level; rendering uses
 * `tile.activeFromLevel > currentLevel` to decide which tiles are locked.
 *
 * @returns {{ tiles, edges, viewBox }}
 */
export function getBoardConfig() {
  return FULL_BOARD
}

// ── Backward-compat exports ───────────────────────────────────────────────────

export const tiles = FULL_BOARD.tiles
export const nodes = tiles
export const edges = FULL_BOARD.edges

export function getTile(id) {
  return tiles.find(t => t.id === id)
}
export const getNode = getTile

export function edgesForNodes(idSet) {
  return edges.filter(([a, b]) => idSet.has(a) || idSet.has(b))
}
