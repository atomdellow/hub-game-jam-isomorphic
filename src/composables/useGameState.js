/**
 * useGameState.js
 *
 * Central game state composable.
 * Manages the full lifecycle: start → playing rounds (zone-unlock board) → end / failed.
 *
 * v1.3 — Flower of Life zone-unlock mechanic:
 *   • Board starts with just the 7-node Seed of Life hex.
 *   • Each round begins by unlocking the next petal zone (+2 nodes).
 *   • Correctly-placed patterns claim their nodes; those nodes are locked
 *     for all subsequent rounds (tracked in `claimedByRound`).
 *   • Each round allows MAX_ATTEMPTS wrong submissions before the game fails.
 *   • phase can now be 'start' | 'playing' | 'end' | 'failed'.
 */

import { ref, computed } from 'vue'
import { patterns, TOTAL_ROUNDS }    from '../data/patterns.js'
import { ZONES }                     from '../data/boardGraph.js'
import { checkPattern }              from './usePatternMatcher.js'
import { edges }                     from '../data/boardGraph.js'

// ── Scoring constants ─────────────────────────────────────────────────────────
const BASE_SCORE          = 100
const FIRST_ATTEMPT_BONUS = 50
const ADVANCE_DELAY_MS    = 1400   // pause after correct solve before next round
const ZONE_REVEAL_MS      = 600    // brief highlight before gameplay starts

/** Wrong-submission budget per round before the run fails. */
export const MAX_ATTEMPTS = 3

// ── Game phases ──────────────────────────────────────────────────────────────
/**
 * @typedef {'start'|'zone-reveal'|'playing'|'end'|'failed'} GamePhase
 */

export function useGameState() {
  /** @type {import('vue').Ref<GamePhase>} */
  const phase          = ref('start')
  const score          = ref(0)
  const roundIndex     = ref(0)
  const selectedIds    = ref([])
  const correctIds     = ref([])
  const attemptCount   = ref(0)
  const attemptsLeft   = ref(MAX_ATTEMPTS)
  const feedbackMsg    = ref('')
  const feedbackType   = ref('')
  const isLocked       = ref(false)

  /**
   * claimedByRound: nodeId → 1-based round number that claimed it.
   * Survives across rounds; reset only on full restart.
   * @type {import('vue').Ref<Record<string, number>>}
   */
  const claimedByRound = ref({})

  /**
   * unlockedZones: set of zone IDs that have been revealed so far.
   * Zone 0 (Seed) is always unlocked from the start.
   * @type {import('vue').Ref<Set<number>>}
   */
  const unlockedZones = ref(new Set([0]))

  /**
   * newlyUnlockedZone: the zone ID that was just revealed this round
   * (null between rounds or on round 1 seed). Used to drive the glow animation.
   * @type {import('vue').Ref<number|null>}
   */
  const newlyUnlockedZone = ref(null)

  // ── Computed helpers ───────────────────────────────────────────────────────
  const currentPattern  = computed(() => patterns[roundIndex.value] ?? null)
  const currentRound    = computed(() => roundIndex.value + 1)
  const totalRounds     = computed(() => TOTAL_ROUNDS)
  const isPlaying       = computed(() => phase.value === 'playing' || phase.value === 'zone-reveal')

  /**
   * Set of node IDs that are currently unlocked (visible + interactive).
   * A node is unlocked if its zone has been revealed.
   */
  const unlockedNodeIds = computed(() => {
    const ids = new Set()
    for (const zone of ZONES) {
      if (unlockedZones.value.has(zone.id)) {
        zone.nodes.forEach(id => ids.add(id))
      }
    }
    return ids
  })

  // ── Actions ────────────────────────────────────────────────────────────────

  function startGame() {
    score.value             = 0
    roundIndex.value        = 0
    selectedIds.value       = []
    correctIds.value        = []
    attemptCount.value      = 0
    attemptsLeft.value      = MAX_ATTEMPTS
    feedbackMsg.value       = ''
    feedbackType.value      = ''
    isLocked.value          = false
    claimedByRound.value    = {}
    unlockedZones.value     = new Set([0])
    newlyUnlockedZone.value = null
    phase.value             = 'playing'
  }

  /** Toggle a node's selection. Blocked for claimed, locked, or not-yet-unlocked nodes. */
  function toggleNode(id) {
    if (isLocked.value) return
    if (!unlockedNodeIds.value.has(id)) return          // zone not yet revealed
    if (claimedByRound.value[id] !== undefined) return  // already claimed
    const idx = selectedIds.value.indexOf(id)
    if (idx === -1) {
      selectedIds.value = [...selectedIds.value, id]
    } else {
      selectedIds.value = selectedIds.value.filter(n => n !== id)
    }
    feedbackMsg.value  = ''
    feedbackType.value = ''
  }

  function resetSelection() {
    if (isLocked.value) return
    selectedIds.value  = []
    feedbackMsg.value  = ''
    feedbackType.value = ''
  }

  function submitAnswer() {
    if (isLocked.value) return
    const pattern = currentPattern.value
    if (!pattern) return

    attemptCount.value++

    const matched = checkPattern(selectedIds.value, edges, pattern)

    if (matched) {
      // ── Correct ────────────────────────────────────────────────────────────
      const bonus = attemptCount.value === 1 ? FIRST_ATTEMPT_BONUS : 0
      score.value       += BASE_SCORE + bonus
      correctIds.value   = [...selectedIds.value]
      feedbackMsg.value  = bonus > 0
        ? `✓ Perfect bloom! +${BASE_SCORE + bonus} pts`
        : `✓ Pattern matched! +${BASE_SCORE} pts`
      feedbackType.value = 'success'
      isLocked.value     = true

      // Claim these nodes for the current round
      const roundNum = currentRound.value
      const claimed  = { ...claimedByRound.value }
      for (const id of selectedIds.value) {
        claimed[id] = roundNum
      }
      claimedByRound.value = claimed

      setTimeout(() => { _advanceRound() }, ADVANCE_DELAY_MS)

    } else {
      // ── Incorrect ──────────────────────────────────────────────────────────
      attemptsLeft.value--

      if (attemptsLeft.value <= 0) {
        feedbackMsg.value  = `✗ No attempts left — the garden is blocked!`
        feedbackType.value = 'error'
        isLocked.value     = true
        setTimeout(() => { phase.value = 'failed' }, ADVANCE_DELAY_MS)
      } else {
        const plural = attemptsLeft.value === 1 ? 'attempt' : 'attempts'
        feedbackMsg.value  = `${_incorrectHint(pattern)} (${attemptsLeft.value} ${plural} left)`
        feedbackType.value = 'error'
      }
    }
  }

  function _advanceRound() {
    const nextIdx = roundIndex.value + 1
    if (nextIdx >= TOTAL_ROUNDS) {
      phase.value = 'end'
      return
    }

    // Unlock the next zone before showing the new round
    const nextPattern = patterns[nextIdx]
    if (nextPattern && nextPattern.unlocksZone != null) {
      const zoneId = nextPattern.unlocksZone
      newlyUnlockedZone.value = zoneId
      const newSet = new Set(unlockedZones.value)
      newSet.add(zoneId)
      unlockedZones.value = newSet

      // Brief "zone reveal" phase so the player sees the new nodes light up
      phase.value = 'zone-reveal'
      setTimeout(() => {
        newlyUnlockedZone.value = null
        roundIndex.value   = nextIdx
        selectedIds.value  = []
        correctIds.value   = []
        attemptCount.value = 0
        attemptsLeft.value = MAX_ATTEMPTS
        feedbackMsg.value  = ''
        feedbackType.value = ''
        isLocked.value     = false
        phase.value        = 'playing'
      }, ZONE_REVEAL_MS)
    } else {
      roundIndex.value   = nextIdx
      selectedIds.value  = []
      correctIds.value   = []
      attemptCount.value = 0
      attemptsLeft.value = MAX_ATTEMPTS
      feedbackMsg.value  = ''
      feedbackType.value = ''
      isLocked.value     = false
    }
  }

  function _incorrectHint(pattern) {
    const sel = selectedIds.value.length
    if (sel !== pattern.nodeCount) {
      return `Select exactly ${pattern.nodeCount} node${pattern.nodeCount > 1 ? 's' : ''}.`
    }
    return `Not quite — check the connections. ${pattern.hint}`
  }

  function restartGame() {
    phase.value             = 'start'
    score.value             = 0
    roundIndex.value        = 0
    selectedIds.value       = []
    correctIds.value        = []
    attemptCount.value      = 0
    attemptsLeft.value      = MAX_ATTEMPTS
    feedbackMsg.value       = ''
    feedbackType.value      = ''
    isLocked.value          = false
    claimedByRound.value    = {}
    unlockedZones.value     = new Set([0])
    newlyUnlockedZone.value = null
  }

  return {
    // state
    phase,
    score,
    roundIndex,
    selectedIds,
    correctIds,
    feedbackMsg,
    feedbackType,
    isLocked,
    claimedByRound,
    attemptsLeft,
    unlockedZones,
    newlyUnlockedZone,
    // computed
    currentPattern,
    currentRound,
    totalRounds,
    isPlaying,
    unlockedNodeIds,
    // actions
    startGame,
    toggleNode,
    resetSelection,
    submitAnswer,
    restartGame,
  }
}
