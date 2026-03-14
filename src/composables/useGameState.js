/**
 * useGameState.js
 *
 * Central game state composable.
 *
 * Level progression is fully automatic:
 *   start → playing (level 1) → levelTransition → playing (level 2) → … → end
 *
 * The board is a single fixed 103-tile Flower-of-Life structure used at every
 * level.  Each tile carries `activeFromLevel`; rendering decides lock state as:
 *
 *   tileLocked = tile.activeFromLevel > currentLevel
 *
 * On the final round of a level:
 *   1. Correct solve detected — score awarded, isLocked = true
 *   2. ADVANCE_DELAY_MS pause (feedback visible)
 *   3. phase = 'levelTransition'
 *   4. After REVEAL_DELAY_MS  — level.value increments → new tiles animate in
 *   5. After TRANSITION_TOTAL_MS — phase = 'playing', new level rounds begin
 *
 * phase: 'start' | 'playing' | 'levelTransition' | 'end' | 'failed'
 */

import { ref, computed }                        from 'vue'
import { getPatternsForLevel,
         getTotalRoundsForLevel,
         MAX_LEVEL }                            from '../data/patterns.js'
import { checkPattern }                         from './usePatternMatcher.js'
import { getBoardConfig }                       from '../data/boardGraph.js'

// ── Constants ─────────────────────────────────────────────────────────────────
const BASE_SCORE          = 100
const FIRST_ATTEMPT_BONUS = 50
const ADVANCE_DELAY_MS    = 1400   // pause after correct solve before advancing
const REVEAL_DELAY_MS     = 600    // delay before newly-unlocked tiles animate in
const TRANSITION_TOTAL_MS = 2600   // total levelTransition duration

export const MAX_ATTEMPTS = 3

export function useGameState() {
  // ── Phase / level ──────────────────────────────────────────────────────────
  const phase = ref('start')
  const level = ref(1)

  // ── Board state (loaded once; same board for all levels) ──────────────────
  const BOARD        = getBoardConfig()
  const boardTiles   = ref(BOARD.tiles)
  const boardEdges   = ref(BOARD.edges)
  const boardViewBox = ref(BOARD.viewBox)

  // ── Round / selection ──────────────────────────────────────────────────────
  const score          = ref(0)
  const roundIndex     = ref(0)
  const selectedIds    = ref([])
  const correctIds     = ref([])
  const attemptCount   = ref(0)
  const attemptsLeft   = ref(MAX_ATTEMPTS)
  const feedbackMsg    = ref('')
  const feedbackType   = ref('')
  const isLocked       = ref(false)
  const claimedByRound = ref({})

  // ── Computed ───────────────────────────────────────────────────────────────
  const currentPattern = computed(() =>
    getPatternsForLevel(level.value)[roundIndex.value] ?? null
  )
  const currentRound = computed(() => roundIndex.value + 1)
  const totalRounds  = computed(() => getTotalRoundsForLevel(level.value))
  const isPlaying    = computed(() => phase.value === 'playing')

  // ── Internal helpers ───────────────────────────────────────────────────────

  function _resetRoundState() {
    selectedIds.value  = []
    correctIds.value   = []
    attemptCount.value = 0
    attemptsLeft.value = MAX_ATTEMPTS
    feedbackMsg.value  = ''
    feedbackType.value = ''
    isLocked.value     = false
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Begin a fresh game from level 1. */
  function startGame() {
    level.value          = 1
    score.value          = 0
    roundIndex.value     = 0
    claimedByRound.value = {}
    _resetRoundState()
    phase.value          = 'playing'
  }

  /** Toggle a tile's selection. Blocked when board is locked, tile is claimed, or tile is not yet active. */
  function toggleNode(id) {
    if (isLocked.value) return
    if (claimedByRound.value[id] !== undefined) return

    const tile = boardTiles.value.find(t => t.id === id)
    if (tile && tile.activeFromLevel > level.value) return

    const idx = selectedIds.value.indexOf(id)
    selectedIds.value = idx === -1
      ? [...selectedIds.value, id]
      : selectedIds.value.filter(n => n !== id)

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

    const matched = checkPattern(selectedIds.value, boardEdges.value, pattern)

    if (matched) {
      const bonus        = attemptCount.value === 1 ? FIRST_ATTEMPT_BONUS : 0
      const isLevelFinal = roundIndex.value + 1 >= getTotalRoundsForLevel(level.value)
      const isGameFinal  = isLevelFinal && level.value >= MAX_LEVEL

      score.value      += BASE_SCORE + bonus
      correctIds.value  = [...selectedIds.value]
      isLocked.value    = true

      if (isLevelFinal && !isGameFinal) {
        feedbackMsg.value  = `✓ Level ${level.value} mastered! The garden expands...`
        feedbackType.value = 'success'
      } else {
        feedbackMsg.value  = bonus > 0
          ? `✓ Perfect bloom! +${BASE_SCORE + bonus} pts`
          : `✓ Pattern matched! +${BASE_SCORE} pts`
        feedbackType.value = 'success'
      }

      // Claim tiles for this round
      const roundNum = currentRound.value
      const claimed  = { ...claimedByRound.value }
      for (const id of selectedIds.value) claimed[id] = roundNum
      claimedByRound.value = claimed

      setTimeout(() => { _advanceRound() }, ADVANCE_DELAY_MS)

    } else {
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
    const nextIdx    = roundIndex.value + 1
    const levelTotal = getTotalRoundsForLevel(level.value)

    if (nextIdx >= levelTotal) {
      // ── Level complete ────────────────────────────────────────────────────
      if (level.value < MAX_LEVEL) {
        const nextLevel = level.value + 1

        phase.value = 'levelTransition'

        // Increment level after a beat: tiles with activeFromLevel === nextLevel
        // will transition from locked → active, triggering their unlock animation
        setTimeout(() => {
          level.value = nextLevel
        }, REVEAL_DELAY_MS)

        // After the animation settles: begin playing the next level
        setTimeout(() => {
          roundIndex.value     = 0
          claimedByRound.value = {}
          _resetRoundState()
          phase.value          = 'playing'
        }, TRANSITION_TOTAL_MS)

      } else {
        phase.value = 'end'
      }
      return
    }

    // ── Normal round advance ──────────────────────────────────────────────
    roundIndex.value = nextIdx
    _resetRoundState()
  }

  function _incorrectHint(pattern) {
    const sel = selectedIds.value.length
    if (sel !== pattern.nodeCount) {
      return `Select exactly ${pattern.nodeCount} tile${pattern.nodeCount > 1 ? 's' : ''}.`
    }
    return `Not quite — check the connections. ${pattern.hint}`
  }

  function restartGame() {
    phase.value          = 'start'
    level.value          = 1
    score.value          = 0
    roundIndex.value     = 0
    claimedByRound.value = {}
    _resetRoundState()
  }

  return {
    phase,
    level,
    score,
    roundIndex,
    selectedIds,
    correctIds,
    feedbackMsg,
    feedbackType,
    isLocked,
    claimedByRound,
    attemptsLeft,
    boardTiles,
    boardEdges,
    boardViewBox,
    currentPattern,
    currentRound,
    totalRounds,
    isPlaying,
    startGame,
    toggleNode,
    resetSelection,
    submitAnswer,
    restartGame,
  }
}
