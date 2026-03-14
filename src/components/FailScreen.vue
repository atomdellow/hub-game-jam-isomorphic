<template>
  <!-- Shown when the player exhausts all attempts on a round -->
  <div class="fail-screen">
    <div class="fail-content">
      <!-- Wilted flower icon -->
      <div class="fail-icon" aria-hidden="true">🥀</div>

      <h2 class="fail-title">Garden Blocked!</h2>
      <p class="fail-subtitle">
        Round {{ failedRound }} ran out of attempts.<br>
        The remaining board space could no longer grow.
      </p>

      <!-- Progress display -->
      <div class="progress-display">
        <div class="prog-block">
          <span class="prog-value">{{ failedRound - 1 }}</span>
          <span class="prog-label">Patterns Placed</span>
        </div>
        <div class="prog-divider" aria-hidden="true">·</div>
        <div class="prog-block">
          <span class="prog-value">{{ totalRounds }}</span>
          <span class="prog-label">Total Rounds</span>
        </div>
        <div class="prog-divider" aria-hidden="true">·</div>
        <div class="prog-block">
          <span class="prog-value">{{ score }}</span>
          <span class="prog-label">Points Earned</span>
        </div>
      </div>

      <!-- Strategy tip -->
      <div class="fail-tip">
        <p class="tip-head">💡 Strategy Tip</p>
        <p class="tip-body">
          Place small patterns in corners first — they're hardest to tuck in later.
          Leave the board centre free for shapes that need a dense triangle zone.
        </p>
      </div>

      <button
        class="btn-try-again"
        @click="emit('restart')"
        data-testid="btn-try-again"
      >
        ↺ Try Again
      </button>

      <p class="fail-credit">IsoBloom · Pi Day 2026</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  score:       { type: Number, required: true },
  failedRound: { type: Number, required: true },
  totalRounds: { type: Number, required: true },
})

const emit = defineEmits(['restart'])
</script>

<style scoped>
.fail-screen {
  min-height:      100vh;
  display:         flex;
  align-items:     center;
  justify-content: center;
  padding:         2rem;
}

.fail-content {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            1.2rem;
  text-align:     center;
  max-width:      480px;
  background:     var(--bg-card, #0f1a38);
  border:         1px solid #3a1020;
  border-radius:  var(--radius-lg, 16px);
  padding:        2.5rem 2rem;
  box-shadow:     0 0 40px #f4723210;
}

.fail-icon {
  font-size:  4rem;
  line-height: 1;
  animation:  wilt 1.2s ease forwards;
}
@keyframes wilt {
  from { transform: rotate(0deg) scale(1.2); opacity: 0; }
  to   { transform: rotate(-15deg) scale(1);  opacity: 1; }
}

.fail-title {
  font-size:      2rem;
  font-weight:    800;
  color:          #f87171;
  letter-spacing: 0.04em;
  margin:         0;
}

.fail-subtitle {
  color:       var(--clr-muted, #7090b0);
  font-size:   0.92rem;
  line-height: 1.6;
  margin:      0;
}

/* Progress row */
.progress-display {
  display:     flex;
  align-items: center;
  gap:         1.2rem;
  background:  #080f22;
  border:      1px solid #1e3060;
  border-radius: var(--radius-sm, 8px);
  padding:     1rem 1.5rem;
}
.prog-block {
  display:        flex;
  flex-direction: column;
  align-items:    center;
}
.prog-value {
  font-size:   1.6rem;
  font-weight: 700;
  color:       #f87171;
}
.prog-label {
  font-size:      0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color:          var(--clr-muted, #7090b0);
}
.prog-divider {
  color:     #2a4080;
  font-size: 1.4rem;
}

/* Tip box */
.fail-tip {
  background:    #090e1c;
  border:        1px solid #1e3060;
  border-radius: var(--radius-sm, 8px);
  padding:       0.9rem 1.2rem;
  max-width:     360px;
}
.tip-head {
  font-size:   0.78rem;
  font-weight: 700;
  color:       #fbbf24;
  margin:      0 0 0.4rem;
}
.tip-body {
  font-size:   0.8rem;
  color:       var(--clr-muted, #7090b0);
  line-height: 1.55;
  margin:      0;
}

.btn-try-again {
  background: linear-gradient(135deg, #7a0020, #50001a);
  border:     1px solid #f87171;
  color:      #f87171;
  border-radius: var(--radius-sm, 8px);
  padding:    0.7rem 2rem;
  font-size:  1rem;
  font-weight: 700;
  cursor:     pointer;
  transition: box-shadow 0.2s;
}
.btn-try-again:hover {
  box-shadow: 0 0 20px #f8717155;
}

.fail-credit {
  font-size: 0.65rem;
  color:     #2a3060;
  margin:    0;
}
</style>
