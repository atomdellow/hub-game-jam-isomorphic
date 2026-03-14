/**
 * useGameState.js
 *
 * Central game state composable.
 * Manages the full lifecycle: start → playing rounds → end.
 *
 * Consumed by App.vue; exposes reactive refs and action functions.
 */

import { ref, computed } from 'vue'
import { patterns, TOTAL_ROUNDS } from '../data/patterns.js'
import { checkPattern }           from './usePatternMatcher.js'
import { edges }                  from '../data/boardGraph.js'

// ── Scoring constants ─────────────────────────────────────────────────────────
const BASE_SCORE          = 100
const FIRST_ATTEMPT_BONUS = 50
const ADVANCE_DELAY_MS    = 1400   // pause after correct solve before next round

// ── Game phases ──────────────────────────────────────────────────────────────
/**
 * @typedef {'start'|'playing'|'end'} GamePhase
 */

/**
 * useGameState — singleton-style composable (module-level state so the same
 * reactive tree is shared if imported multiple times, which is fine for a
 * single-page jam game).
 */
export function useGameState() {
  /** @type {import('vue').Ref<GamePhase>} */
  const phase          = ref('start')
  const score          = ref(0)
  const roundIndex     = ref(0)           // 0-based index into patterns[]
  const selectedIds    = ref([])          // node IDs currently selected
  const correctIds     = ref([])          // node IDs to flash on correct solve
  const attemptCount   = ref(0)           // attempts for the current round
  const feedbackMsg    = ref('')          // '' | success text | error text
  const feedbackType   = ref('')          // '' | 'success' | 'error'
  const isLocked       = ref(false)       // true while success animation plays

  // ── Computed helpers ───────────────────────────────────────────────────────
  const currentPattern  = computed(() => patterns[roundIndex.value] ?? null)
  const currentRound    = computed(() => roundIndex.value + 1)     // 1-based display
  const totalRounds     = computed(() => TOTAL_ROUNDS)
  const isPlaying       = computed(() => phase.value === 'playing')

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Transition from title screen to the first round. */
  function startGame() {
    score.value        = 0
    roundIndex.value   = 0
    selectedIds.value  = []
    correctIds.value   = []
    attemptCount.value = 0
    feedbackMsg.value  = ''
    feedbackType.value = ''
    isLocked.value     = false
    phase.value        = 'playing'
  }

  /** Toggle a node's selection; no-op when the round is locked (success anim). */
  function toggleNode(id) {
    if (isLocked.value) return
    const idx = selectedIds.value.indexOf(id)
    if (idx === -1) {
      selectedIds.value = [...selectedIds.value, id]
    } else {
      selectedIds.value = selectedIds.value.filter(n => n !== id)
    }
    // Clear feedback as soon as the player re-interacts
    feedbackMsg.value  = ''
    feedbackType.value = ''
  }

  /** Clear the current node selection. */
  function resetSelection() {
    if (isLocked.value) return
    selectedIds.value  = []
    feedbackMsg.value  = ''
    feedbackType.value = ''
  }

  /**
   * Validate the current selection against the active pattern.
   * Awards points on success, shows feedback, and advances after a delay.
   */
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

      setTimeout(() => {
        _advanceRound()
      }, ADVANCE_DELAY_MS)
    } else {
      // ── Incorrect ──────────────────────────────────────────────────────────
      feedbackMsg.value  = _incorrectHint(pattern)
      feedbackType.value = 'error'
    }
  }

  /** Move to the next round or end the game. */
  function _advanceRound() {
    const nextIdx = roundIndex.value + 1
    if (nextIdx >= TOTAL_ROUNDS) {
      phase.value = 'end'
    } else {
      roundIndex.value   = nextIdx
      selectedIds.value  = []
      correctIds.value   = []
      attemptCount.value = 0
      feedbackMsg.value  = ''
      feedbackType.value = ''
      isLocked.value     = false
    }
  }

  /** Produces a gentle, non-punishing hint message. */
  function _incorrectHint(pattern) {
    const sel = selectedIds.value.length
    if (sel !== pattern.nodeCount) {
      return `Select exactly ${pattern.nodeCount} node${pattern.nodeCount > 1 ? 's' : ''}.`
    }
    return `Not quite — check the connections. ${pattern.hint}`
  }

  /** Reset everything back to the title screen. */
  function restartGame() {
    phase.value        = 'start'
    score.value        = 0
    roundIndex.value   = 0
    selectedIds.value  = []
    correctIds.value   = []
    attemptCount.value = 0
    feedbackMsg.value  = ''
    feedbackType.value = ''
    isLocked.value     = false
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
