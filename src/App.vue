<template>
  <div class="app-shell">
    <!-- Always-on subtle particle background -->
    <ParticleBg />

    <!-- ── Title screen ──────────────────────────────────────────────── -->
    <Transition name="fade">
      <StartScreen
        v-if="phase === 'start'"
        @start="startGame"
      />
    </Transition>

    <!-- ── Playing screen ───────────────────────────────────────── -->
    <Transition name="fade">
      <div v-if="phase === 'playing'" class="playing-layout">
        <!-- Top HUD bar -->
        <GameHud
          :currentRound="currentRound"
          :totalRounds="totalRounds"
          :score="score"
          :attemptsLeft="attemptsLeft"
          :maxAttempts="MAX_ATTEMPTS"
        />

        <!-- Main play area -->
        <main class="play-area">
          <!-- Left / top: pattern target card -->
          <aside class="panel-left" aria-label="Target pattern">
            <TargetPatternCard :pattern="currentPattern" />

            <!-- Instruction blurb -->
            <p class="play-instructions">
              Select tiles on the board that form the same structure as the target pattern.
              Rotation and position don't matter — only the <em>connections</em> do.
            </p>
          </aside>

          <!-- Centre: game board -->
          <section class="panel-center" aria-label="Game board">
            <GameBoard
              :boardTiles="boardTiles"
              :boardEdges="boardEdges"
              :boardViewBox="boardViewBox"
              :selectedIds="selectedIds"
              :correctIds="correctIds"
              :hasError="feedbackType === 'error'"
              :claimedByRound="claimedByRound"
              :currentLevel="level"
              @nodeClick="toggleNode"
            />

            <!-- Feedback banner -->
            <Transition name="feedback-slide">
              <div
                v-if="feedbackMsg"
                class="feedback-banner"
                :class="`feedback-${feedbackType}`"
                role="status"
                aria-live="polite"
              >
                {{ feedbackMsg }}
              </div>
            </Transition>

            <!-- Control buttons -->
            <div class="controls-row">
              <button
                class="btn-secondary"
                :disabled="isLocked || selectedIds.length === 0"
                @click="resetSelection"
                data-testid="btn-reset"
              >
                ↺ Reset
              </button>
              <button
                class="btn-primary"
                :disabled="isLocked || selectedIds.length === 0"
                @click="submitAnswer"
                data-testid="btn-submit"
              >
                ✦ Submit Pattern
              </button>
            </div>

            <!-- Selection counter -->
            <p class="selection-count" aria-live="polite">
              {{ selectedIds.length }} node{{ selectedIds.length !== 1 ? 's' : '' }} selected
              <span v-if="currentPattern"> / {{ currentPattern.nodeCount }} needed</span>
            </p>
          </section>
        </main>
      </div>
    </Transition>

    <!-- ── Level transition (board expands between levels) ──────────── -->
    <Transition name="fade">
      <div v-if="phase === 'levelTransition'" class="level-transition-layout">
        <div class="level-transition-card">
          <p class="lvl-trans-super">Garden Complete</p>
          <h2 class="lvl-trans-title">Level {{ level }} Mastered</h2>
          <p class="lvl-trans-hint">New territory emerging…</p>
        </div>
        <GameBoard
          :boardTiles="boardTiles"
          :boardEdges="boardEdges"
          :boardViewBox="boardViewBox"
          :selectedIds="[]"
          :correctIds="correctIds"
          :hasError="false"
          :claimedByRound="claimedByRound"
          :currentLevel="level"
        />
      </div>
    </Transition>

    <!-- ── End screen ─────────────────────────────────────────────── -->
    <Transition name="fade">
      <EndScreen
        v-if="phase === 'end'"
        :score="score"
        @restart="restartGame"
      />
    </Transition>
    <!-- ── Fail screen ────────────────────────────────────────────────── -->
    <Transition name="fade">
      <FailScreen
        v-if="phase === 'failed'"
        :score="score"
        :failedRound="currentRound"
        :totalRounds="totalRounds"
        @restart="restartGame"
      />
    </Transition>  </div>
</template>

<script setup>
import { useGameState }      from './composables/useGameState.js'
import { MAX_ATTEMPTS }      from './composables/useGameState.js'
import ParticleBg            from './components/ParticleBg.vue'
import StartScreen           from './components/StartScreen.vue'
import EndScreen             from './components/EndScreen.vue'
import FailScreen            from './components/FailScreen.vue'
import GameHud               from './components/GameHud.vue'
import GameBoard             from './components/GameBoard.vue'
import TargetPatternCard     from './components/TargetPatternCard.vue'

const {
  phase,
  level,
  score,
  selectedIds,
  correctIds,
  feedbackMsg,
  feedbackType,
  isLocked,
  currentPattern,
  currentRound,
  totalRounds,
  claimedByRound,
  attemptsLeft,
  boardTiles,
  boardEdges,
  boardViewBox,
  startGame,
  toggleNode,
  resetSelection,
  submitAnswer,
  restartGame,
} = useGameState()
</script>

<style scoped>
/* ── App shell ──────────────────────────────────────────────────────────── */
.app-shell {
  position:   relative;
  min-height: 100vh;
  display:    flex;
  flex-direction: column;
  z-index:    1;
}

/* ── Playing layout ─────────────────────────────────────────────────────── */
.playing-layout {
  display:        flex;
  flex-direction: column;
  min-height:     100vh;
}

.play-area {
  flex:           1;
  display:        flex;
  flex-wrap:      wrap;
  align-items:    flex-start;
  justify-content: center;
  gap:            1.5rem;
  padding:        1.5rem 1rem 2rem;
  max-width:      1100px;
  margin:         0 auto;
  width:          100%;
}

/* Sidebar (pattern card + instructions) */
.panel-left {
  display:        flex;
  flex-direction: column;
  gap:            1rem;
  flex-shrink:    0;
}

.play-instructions {
  font-size:   0.78rem;
  color:       var(--clr-muted, #7090b0);
  max-width:   210px;
  line-height: 1.55;
  text-align:  center;
}

/* Board panel */
.panel-center {
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  gap:             0.9rem;
  flex:            1;
  min-width:       300px;
}

/* ── Feedback banner ────────────────────────────────────────────────────── */
.feedback-banner {
  width:         100%;
  max-width:     500px;
  padding:       0.65rem 1.2rem;
  border-radius: var(--radius-sm, 6px);
  font-size:     0.9rem;
  font-weight:   600;
  text-align:    center;
  border:        1px solid transparent;
}
.feedback-success {
  background:   #07290f;
  border-color: var(--clr-green, #4ade80);
  color:        var(--clr-green, #4ade80);
  box-shadow:   0 0 12px #4ade8033;
}
.feedback-error {
  background:   #290707;
  border-color: var(--clr-red, #f87171);
  color:        var(--clr-red, #f87171);
}

/* ── Controls ───────────────────────────────────────────────────────────── */
.controls-row {
  display:   flex;
  gap:       0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  border-radius: var(--radius-sm, 6px);
  padding:       0.6rem 1.5rem;
  font-size:     0.9rem;
  font-weight:   600;
  cursor:        pointer;
  transition:    background 0.2s, box-shadow 0.2s, opacity 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #007a6a, #00503c);
  border:     1px solid var(--clr-teal, #00e8c8);
  color:      var(--clr-teal, #00e8c8);
  box-shadow: 0 0 10px #00e8c822;
}
.btn-primary:not(:disabled):hover { box-shadow: 0 0 20px #00e8c855; }

.btn-secondary {
  background: #0d1530;
  border:     1px solid #2a4080;
  color:      var(--clr-muted, #7090b0);
}
.btn-secondary:not(:disabled):hover {
  border-color: var(--clr-cyan, #38bdf8);
  color:        var(--clr-cyan, #38bdf8);
}

.btn-primary:disabled, .btn-secondary:disabled {
  opacity: 0.35;
  cursor:  not-allowed;
}

.selection-count {
  font-size: 0.72rem;
  color:     var(--clr-muted, #7090b0);
  margin:    0;
}

/* ── Level transition layout ────────────────────────────────────────────── */
.level-transition-layout {
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  justify-content: center;
  min-height:      100vh;
  gap:             2rem;
  padding:         2rem 1rem;
}

.level-transition-card {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            0.35rem;
  text-align:     center;
}

.lvl-trans-super {
  font-size:      0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color:          var(--clr-muted, #7090b0);
  margin:         0;
}

.lvl-trans-title {
  font-size:   clamp(2rem, 6vw, 3.2rem);
  font-weight: 900;
  color:       var(--clr-teal, #00e8c8);
  text-shadow: 0 0 32px #00e8c866;
  margin:      0;
  animation:   titleGlow 1.8s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  from { text-shadow: 0 0 16px #00e8c844; }
  to   { text-shadow: 0 0 40px #00e8c8cc; }
}

.lvl-trans-hint {
  font-size:   0.88rem;
  color:       var(--clr-cyan, #38bdf8);
  opacity:     0.8;
  margin:      0;
  animation:   hintFade 1.2s ease-in-out infinite alternate;
}

@keyframes hintFade {
  from { opacity: 0.5; }
  to   { opacity: 1.0; }
}

/* ── Transitions ────────────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }

.feedback-slide-enter-active { transition: opacity 0.25s, transform 0.25s; }
.feedback-slide-leave-active { transition: opacity 0.2s; }
.feedback-slide-enter-from   { opacity: 0; transform: translateY(-6px); }
.feedback-slide-leave-to     { opacity: 0; }
</style>
