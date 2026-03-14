<template>
  <!-- HUD bar displayed above the game board during play -->
  <header class="game-hud" role="banner">
    <div class="hud-block hud-round">
      <span class="hud-label">Round</span>
      <span class="hud-value">{{ currentRound }}<span class="hud-total"> / {{ totalRounds }}</span></span>
    </div>

    <!-- Progress dots -->
    <div class="hud-progress" aria-label="Round progress">
      <span
        v-for="r in totalRounds"
        :key="r"
        class="progress-dot"
        :class="{
          'dot-done':    r < currentRound,
          'dot-current': r === currentRound,
        }"
        :aria-label="`Round ${r} ${r < currentRound ? 'complete' : r === currentRound ? 'current' : 'upcoming'}`"
      />
    </div>

    <div class="hud-block hud-score">
      <span class="hud-label">Score</span>
      <span class="hud-value score-value" :key="score">{{ score }}</span>
    </div>
  </header>
</template>

<script setup>
defineProps({
  currentRound: { type: Number, required: true },
  totalRounds:  { type: Number, required: true },
  score:        { type: Number, required: true },
})
</script>

<style scoped>
.game-hud {
  display:          flex;
  align-items:      center;
  justify-content:  space-between;
  padding:          0.75rem 1.5rem;
  background:       var(--bg-card, #0f1a38);
  border-bottom:    1px solid #1e3060;
  gap:              1rem;
  user-select:      none;
}

.hud-block {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  min-width:      60px;
}

.hud-label {
  font-size:      0.60rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color:          var(--clr-muted, #7090b0);
}

.hud-value {
  font-size:   1.3rem;
  font-weight: 700;
  color:       var(--clr-teal, #00e8c8);
  line-height: 1.1;
}

.hud-total {
  font-size:   0.85rem;
  font-weight: 400;
  color:       var(--clr-muted, #7090b0);
}

/* Score flash on change */
.score-value {
  animation: scoreBump 0.35s ease;
}
@keyframes scoreBump {
  0%   { transform: scale(1);    color: var(--clr-teal, #00e8c8); }
  40%  { transform: scale(1.25); color: var(--clr-green, #4ade80); }
  100% { transform: scale(1);    color: var(--clr-teal, #00e8c8); }
}

/* Progress dots */
.hud-progress {
  display: flex;
  gap:     6px;
  align-items: center;
}

.progress-dot {
  width:         10px;
  height:        10px;
  border-radius: 50%;
  background:    #1e3060;
  border:        1.5px solid #2a4080;
  transition:    background 0.3s, box-shadow 0.3s;
}

.dot-done {
  background:  var(--clr-purple, #a78bfa);
  border-color: var(--clr-purple, #a78bfa);
  box-shadow:  0 0 6px #a78bfa66;
}

.dot-current {
  background:  var(--clr-teal, #00e8c8);
  border-color: var(--clr-teal, #00e8c8);
  box-shadow:  0 0 8px #00e8c8aa;
  animation:   dotPulse 1s ease-in-out infinite alternate;
}

@keyframes dotPulse {
  from { box-shadow: 0 0 4px #00e8c877; }
  to   { box-shadow: 0 0 12px #00e8c8cc; }
}
</style>
