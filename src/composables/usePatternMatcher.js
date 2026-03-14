/**
 * usePatternMatcher.js
 *
 * Pure-function pattern-matching engine.
 *
 * ── Algorithm ────────────────────────────────────────────────────────────────
 * Given a set of selected node IDs and the full board edge list:
 *
 *  1. Node-count check   – must equal pattern.nodeCount
 *  2. Induced-subgraph   – collect all board edges whose BOTH endpoints are
 *                          in the selected set
 *  3. Edge-count check   – must equal pattern.edgeCount
 *  4. Degree sequence    – compute degree of each selected node inside the
 *                          induced subgraph, sort ascending, compare to
 *                          pattern.degreeSignature
 *
 * This is sufficient to distinguish every pattern in our set because:
 *   line2   [1,1]      – 2 nodes, 1 edge
 *   line3   [1,1,2]    – 3 nodes, 2 edges
 *   triangle[2,2,2]    – 3 nodes, 3 edges
 *   fork    [1,1,1,3]  – 4 nodes, 3 edges
 *   line4   [1,1,2,2]  – 4 nodes, 3 edges  (distinguishable from fork by sig)
 *   kite    [1,2,2,3]  – 4 nodes, 4 edges
 *
 * ── Connectivity check ───────────────────────────────────────────────────────
 * We also verify the induced subgraph is *connected* (via BFS) so that the
 * player must actually select a coherent structure rather than two disconnected
 * fragments that happen to match a degree signature.
 */

/**
 * Build an adjacency map for a set of nodes, using only edges internal to the set.
 *
 * @param {string[]} selectedIds  - node IDs selected by the player
 * @param {[string,string][]} allEdges - full board edge list
 * @returns {Map<string, string[]>} adjacency list restricted to the selection
 */
function buildSubgraphAdj(selectedIds, allEdges) {
  const nodeSet = new Set(selectedIds)
  const adj     = new Map(selectedIds.map(id => [id, []]))

  for (const [a, b] of allEdges) {
    if (nodeSet.has(a) && nodeSet.has(b)) {
      adj.get(a).push(b)
      adj.get(b).push(a)
    }
  }
  return adj
}

/**
 * Return the number of internal edges within the selection.
 *
 * @param {string[]} selectedIds
 * @param {[string,string][]} allEdges
 * @returns {number}
 */
function countSubgraphEdges(selectedIds, allEdges) {
  const nodeSet = new Set(selectedIds)
  return allEdges.filter(([a, b]) => nodeSet.has(a) && nodeSet.has(b)).length
}

/**
 * Compute the sorted degree sequence (ascending) of the induced subgraph.
 *
 * @param {Map<string, string[]>} adj
 * @returns {number[]}
 */
function degreeSequence(adj) {
  return [...adj.values()].map(nbrs => nbrs.length).sort((a, b) => a - b)
}

/**
 * BFS connectivity check — returns true iff every selected node can be
 * reached from the first node through internal edges.
 *
 * @param {string[]} selectedIds
 * @param {Map<string, string[]>} adj
 * @returns {boolean}
 */
function isConnected(selectedIds, adj) {
  if (selectedIds.length === 0) return false
  const visited = new Set()
  const queue   = [selectedIds[0]]
  visited.add(selectedIds[0])

  while (queue.length > 0) {
    const node = queue.shift()
    for (const nbr of (adj.get(node) ?? [])) {
      if (!visited.has(nbr)) {
        visited.add(nbr)
        queue.push(nbr)
      }
    }
  }
  return visited.size === selectedIds.length
}

/**
 * Main pattern-checking function.
 *
 * @param {string[]} selectedIds          - IDs selected by the player
 * @param {[string,string][]} allEdges    - full board edge list (from boardGraph.js)
 * @param {{ nodeCount: number, edgeCount: number, degreeSignature: number[] }} pattern
 * @returns {boolean} true if the selection is isomorphic to the target pattern
 */
export function checkPattern(selectedIds, allEdges, pattern) {
  // 1. Node count
  if (selectedIds.length !== pattern.nodeCount) return false

  // 2. Edge count
  const edgeCount = countSubgraphEdges(selectedIds, allEdges)
  if (edgeCount !== pattern.edgeCount) return false

  // 3. Build adjacency for further checks
  const adj = buildSubgraphAdj(selectedIds, allEdges)

  // 4. Connectivity (all nodes must form one connected component)
  if (!isConnected(selectedIds, adj)) return false

  // 5. Degree sequence
  const sig = degreeSequence(adj)
  if (sig.length !== pattern.degreeSignature.length) return false
  for (let i = 0; i < sig.length; i++) {
    if (sig[i] !== pattern.degreeSignature[i]) return false
  }

  return true
}

/**
 * Returns debug info about the induced subgraph — useful for testing.
 *
 * @param {string[]} selectedIds
 * @param {[string,string][]} allEdges
 * @returns {{ edgeCount: number, degreeSignature: number[], connected: boolean }}
 */
export function describeSubgraph(selectedIds, allEdges) {
  const edgeCount = countSubgraphEdges(selectedIds, allEdges)
  const adj       = buildSubgraphAdj(selectedIds, allEdges)
  return {
    edgeCount,
    degreeSignature: degreeSequence(adj),
    connected:       isConnected(selectedIds, adj),
  }
}
