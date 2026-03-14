<template>
  <!-- End / completion screen shown after the final round -->
  <div class="end-screen">
    <div class="end-content">
      <!-- Trophy / star header -->
      <div class="end-icon" aria-hidden="true">✦</div>

      <h2 class="end-title">Garden Complete!</h2>
      <p class="end-subtitle">The Flower of Life has bloomed.</p>

      <!-- Score display -->
      <div class="score-display">
        <p class="score-label">Final Score</p>
        <p class="score-number">{{ score }}</p>
        <p class="score-rating">{{ ratingText }}</p>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-block">
          <span class="stat-value">{{ totalRounds }}</span>
          <span class="stat-label">Patterns Found</span>
        </div>
        <div class="stat-divider" aria-hidden="true">·</div>
        <div class="stat-block">
          <span class="stat-value">{{ maxScore }}</span>
          <span class="stat-label">Max Possible</span>
        </div>
        <div class="stat-divider" aria-hidden="true">·</div>
        <div class="stat-block">
          <span class="stat-value">{{ pct }}%</span>
          <span class="stat-label">Efficiency</span>
        </div>
      </div>

      <!-- Flavour -->
      <p class="end-flavor">{{ flavorQuote }}</p>

      <!-- Play again -->
      <button class="btn-restart" @click="emit('restart')" data-testid="btn-restart">
        ↺ Grow Again
      </button>

      <p class="end-credit">IsoBloom · Pi Day 2026 · Inspired by hydroponic growing systems</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TOTAL_ROUNDS } from '../data/patterns.js'

const props = defineProps({
  score: { type: Number, required: true },
})

const emit = defineEmits(['restart'])

// 100 base + 50 first-attempt bonus per round, 6 rounds
const MAX_BONUS  = 50
const BASE       = 100
const maxScore   = computed(() => TOTAL_ROUNDS * (BASE + MAX_BONUS))
const totalRounds = TOTAL_ROUNDS
const pct         = computed(() => Math.round((props.score / maxScore.value) * 100))

const QUOTES = [
  '"In every pattern, the whole is reflected." — The Garden',
  '"Two structures are one when their connections align."',
  '"Sacred geometry shows us: form is relationship."',
  '"The Flower of Life blooms in isomorphic harmony."',
  '"Every bloom remembers its original structure."',
]

const flavorQuote = computed(() => QUOTES[Math.floor((props.score / 10) % QUOTES.length)])

const ratingText = computed(() => {
  const p = pct.value
  if (p === 100) return '🌸 Perfect Bloom — All first-attempt!'
  if (p >= 80)   return '🌿 Master Gardener'
  if (p >= 60)   return '🌱 Growing Strong'
  if (p >= 40)   return '🌾 Budding Botanist'
  return              '🪴 Keep Tending'
})
</script>

<style scoped>
.end-screen {
  min-height:      100vh;
  display:         flex;
  align-items:     center;
  justify-content: center;
  padding:         2rem;
}

.end-content {
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  gap:             1.2rem;
  text-align:      center;
  max-width:       480px;
}

.end-icon {
  font-size:   3.5rem;
  color:       var(--clr-teal, #00e8c8);
  text-shadow: 0 0 30px #00e8c8;
  animation:   iconSpin 8s linear infinite;
}
@keyframes iconSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.end-title {
  font-size:   2.4rem;
  font-weight: 900;
  color:       var(--clr-green, #4ade80);
  text-shadow: 0 0 24px #4ade8066;
  margin:      0;
}

.end-subtitle {
  font-size: 1rem;
  color:     var(--clr-muted, #7090b0);
  margin:    0;
}

/* Score */
.score-display {
  background:    var(--bg-card, #0f1a38);
  border:        1px solid var(--clr-teal, #00e8c8);
  border-radius: var(--radius-md, 12px);
  padding:       1.2rem 2.5rem;
  box-shadow:    0 0 20px #00e8c822;
}
.score-label {
  font-size:      0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color:          var(--clr-muted, #7090b0);
  margin:         0 0 0.2rem;
}
.score-number {
  font-size:   3rem;
  font-weight: 900;
  color:       var(--clr-teal, #00e8c8);
  text-shadow: 0 0 16px #00e8c877;
  margin:      0;
  line-height: 1;
}
.score-rating {
  font-size:  0.85rem;
  color:      var(--clr-text, #e0f0ff);
  margin:     0.4rem 0 0;
  opacity:    0.9;
}

/* Stats row */
.stats-row {
  display:     flex;
  align-items: center;
  gap:         1.5rem;
  color:       var(--clr-text, #e0f0ff);
}
.stat-block { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat-value { font-size: 1.4rem; font-weight: 700; color: var(--clr-cyan, #38bdf8); }
.stat-label { font-size: 0.65rem; color: var(--clr-muted, #7090b0); text-transform: uppercase; letter-spacing: 0.08em; }
.stat-divider { font-size: 1.5rem; color: #1e3060; }

/* Flavor */
.end-flavor {
  font-size:   0.82rem;
  font-style:  italic;
  color:       var(--clr-muted, #7090b0);
  max-width:   380px;
  line-height: 1.6;
  margin:      0;
}

/* Restart button */
.btn-restart {
  background:    linear-gradient(135deg, #4ade8022, #00e8c822);
  border:        1.5px solid var(--clr-green, #4ade80);
  color:         var(--clr-green, #4ade80);
  border-radius: var(--radius-lg, 20px);
  padding:       0.8rem 2.2rem;
  font-size:     1rem;
  font-weight:   700;
  cursor:        pointer;
  transition:    background 0.2s, box-shadow 0.2s, transform 0.15s;
  box-shadow:    0 0 16px #4ade8022;
}
.btn-restart:hover {
  background: linear-gradient(135deg, #4ade8033, #00e8c833);
  box-shadow: 0 0 28px #4ade8055;
  transform:  translateY(-2px);
}
.btn-restart:active { transform: translateY(0); }

.end-credit {
  font-size:  0.65rem;
  color:      var(--clr-muted, #7090b0);
  opacity:    0.5;
  margin:     0;
}
</style>
