<template>
  <!-- Title / start screen — first thing the player sees -->
  <div class="start-screen">
    <!-- Decorative sacred geometry SVG background -->
    <div class="geo-bg" aria-hidden="true">
      <svg viewBox="0 0 400 400" class="geo-svg">
        <!-- Seed of Life rings -->
        <circle v-for="(c, i) in seedCircles" :key="i"
          :cx="c.cx" :cy="c.cy" r="100"
          fill="none" stroke="#1e3a6e" stroke-width="1" opacity="0.35"
        />
      </svg>
    </div>

    <div class="start-content">
      <!-- Logo / Title -->
      <div class="title-block">
        <p class="game-super">Pi Day 2026 · Game Jam</p>
        <h1 class="game-title">
          <span class="title-iso">Iso</span><span class="title-bloom">Bloom</span>
        </h1>
        <p class="game-subtitle">The Flower Garden</p>
      </div>

      <!-- Flavour copy -->
      <div class="start-blurb">
        <p>
          A sacred geometry pattern puzzle.<br/>
          Find the hidden <strong>isomorphic structure</strong> within the Flower of Life lattice.
        </p>
        <p class="blurb-small">
          Select nodes on the board that form the same connectivity as the target pattern —<br/>
          position, rotation, and reflection don't matter. Only the <em>structure</em> does.
        </p>
      </div>

      <!-- CTA -->
      <button class="btn-start" @click="emit('start')" data-testid="btn-start">
        ✦ Begin Growing ✦
      </button>

      <!-- Credit -->
      <p class="start-credit">Inspired by hydroponic growing systems &amp; the geometry of growth.</p>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['start'])

// Seven circles of the Seed of Life (centre + 6 around at 60° spacing)
const R = 100
const seedCircles = [
  { cx: 200, cy: 200 },
  ...Array.from({ length: 6 }, (_, i) => ({
    cx: 200 + R * Math.cos((i * Math.PI) / 3),
    cy: 200 + R * Math.sin((i * Math.PI) / 3),
  })),
]
</script>

<style scoped>
.start-screen {
  position:        relative;
  min-height:      100vh;
  display:         flex;
  align-items:     center;
  justify-content: center;
  overflow:        hidden;
}

/* ── Background geometry ─────────────────────────────────────────────────── */
.geo-bg {
  position:   absolute;
  inset:      0;
  display:    flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.geo-svg {
  width:   min(80vw, 600px);
  height:  min(80vw, 600px);
  opacity: 0.6;
  animation: geoSpin 60s linear infinite;
}
@keyframes geoSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ── Content ──────────────────────────────────────────────────────────────── */
.start-content {
  position:        relative;
  z-index:         1;
  display:         flex;
  flex-direction:  column;
  align-items:     center;
  gap:             1.75rem;
  text-align:      center;
  padding:         2rem 1.5rem;
  max-width:       560px;
}

.title-block { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }

.game-super {
  font-size:      0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color:          var(--clr-muted, #7090b0);
  margin:         0;
}

.game-title {
  font-size:   clamp(2.8rem, 8vw, 4.5rem);
  font-weight: 900;
  line-height: 1;
  margin:      0;
  letter-spacing: -0.01em;
}
.title-iso   { color: var(--clr-teal,  #00e8c8); text-shadow: 0 0 24px #00e8c866; }
.title-bloom { color: var(--clr-green, #4ade80); text-shadow: 0 0 24px #4ade8066; }

.game-subtitle {
  font-size:   1.2rem;
  font-weight: 300;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color:       var(--clr-cyan, #38bdf8);
  margin:      0.25rem 0 0;
  opacity:     0.9;
}

.start-blurb {
  display:        flex;
  flex-direction: column;
  gap:            0.6rem;
  color:          var(--clr-text, #e0f0ff);
  font-size:      0.95rem;
  line-height:    1.6;
  opacity:        0.9;
}
.blurb-small {
  font-size: 0.78rem;
  color:     var(--clr-muted, #7090b0);
}

/* Start button */
.btn-start {
  background:    linear-gradient(135deg, #00e8c822, #4ade8022);
  border:        1.5px solid var(--clr-teal, #00e8c8);
  color:         var(--clr-teal, #00e8c8);
  border-radius: var(--radius-lg, 20px);
  padding:       0.85rem 2.5rem;
  font-size:     1.1rem;
  font-weight:   700;
  letter-spacing: 0.06em;
  cursor:        pointer;
  transition:    background 0.2s, box-shadow 0.2s, transform 0.15s;
  box-shadow:    0 0 18px #00e8c822;
}
.btn-start:hover {
  background: linear-gradient(135deg, #00e8c833, #4ade8033);
  box-shadow: 0 0 32px #00e8c855;
  transform:  translateY(-2px);
}
.btn-start:active { transform: translateY(0); }

.start-credit {
  font-size:  0.68rem;
  color:      var(--clr-muted, #7090b0);
  opacity:    0.6;
  margin:     0;
}

</style>
