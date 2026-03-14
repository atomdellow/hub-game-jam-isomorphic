/**
 * useGameState.js
 *
 * Central game state composable.
 * Manages the full lifecycle: start → playing rounds (persistent board) → end / failed.
 *
 * v1.2 — Persistent Board mechanic:
 *   • Correctly-placed patterns claim their nodes; those nodes are locked for
 *     all subsequent rounds (tracked in `claimedByRound`).
 *   • Each round allows MAX_ATTEMPTS wrong submissions before the game fails.
 *   • phase can now be 'start' | 'playing' | 'end' | 'failed'.
 */

import { ref, computed } from 'vue'
import { patterns, TOTAL_ROUNDS } from '../data/patterns.js'
import { checkPattern }           from './usePatternMatcher.js'
import { edges }                  from '../data/boardGraph.js'

// ── Scoring constants ─────────────────────────────────────────────────────────
const BASE_SCORE          = 100
const FIRST_ATTEMPT_BONUS = 50
const ADVANCE_DELAY_MS    = 1400   // pause after correct solve before next round

/** Wrong-submission budget per round before the run fails. */
export const MAX_ATTEMPTS = 3

// ── Game phases ──────────────────────────────────────────────────────────────
/**
 * @typedef {'start'|'playing'|'end'|'failed'} GamePhase
 */

export function useGameState() {
  /** @type {import('vue').Ref<GamePhase>} */
  const phase          = ref('start')
  const score          = ref(0)
  const roundIndex     = ref(0)
  const selectedIds    = ref([])
  const correctIds     = ref([])
  const attemptCount   = ref(0)           // first-attempt bonus tracker
  const attemptsLeft   = ref(MAX_ATTEMPTS) // wrong-answer budget for current round
  const feedbackMsg    = ref('')
  const feedbackType   = ref('')
  const isLocked       = ref(false)

  /**
   * claimedByRound: nodeId → 1-based round number that claimed it.
   * Survives across rounds within a session; reset only on full restart.
   * @type {import('vue').Ref<Record<string, number>>}
   */
  const claimedByRound = ref({})

  // ── Computed helpers ───────────────────────────────────────────────────────
  const currentPattern  = computed(() => patterns[roundIndex.value] ?? null)
  const currentRound    = computed(() => roundIndex.value + 1)
  const totalRounds     = computed(() => TOTAL_ROUNDS)
  const isPlaying       = computed(() => phase.value === 'playing')

  // ── Actions ────────────────────────────────────────────────────────────────

  function startGame() {
    score.value          = 0
    roundIndex.value     = 0
    selectedIds.value    = []
    correctIds.value     = []
    attemptCount.value   = 0
    attemptsLeft.value   = MAX_ATTEMPTS
    feedbackMsg.value    = ''
    feedbackType.value   = ''
    isLocked.value       = false
    claimedByRound.value = {}
    phase.value          = 'playing'
  }

  /** Toggle a node's selection. Blocked for claimed or locked nodes. */
  function toggleNode(id) {
    if (isLocked.value) return
    if (claimedByRound.value[id] !== undefined) return   // already claimed
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
    } else {
      roundIndex.value   = nextIdx
      selectedIds.value  = []
      correctIds.value   = []
      attemptCount.value = 0
      attemptsLeft.value = MAX_ATTEMPTS
      feedbackMsg.value  = ''
      feedbackType.value = ''
      isLocked.value     = false
      // claimedByRound persists across rounds — intentional
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
    phase.value          = 'start'
    score.value          = 0
    roundIndex.value     = 0
    selectedIds.value    = []
    correctIds.value     = []
    attemptCount.value   = 0
    attemptsLeft.value   = MAX_ATTEMPTS
    feedbackMsg.value    = ''
    feedbackType.value   = ''
    isLocked.value       = false
    claimedByRound.value = {}
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
    // computed
    currentPattern,
    currentRound,
    totalRounds,
    isPlaying,
    // actions
    startGame,
    toggleNode,
    resetSelection,
    submitAnswer,
    restartGame,
  }
}
