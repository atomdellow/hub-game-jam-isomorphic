<template>
  <!-- Lightweight CSS-only particle background — purely decorative -->
  <div class="particle-bg" aria-hidden="true">
    <span v-for="n in 28" :key="n" class="particle" :style="particleStyle(n)" />
  </div>
</template>

<script setup>
/** Generate deterministic-random but visually varied per-particle styles */
function particleStyle(n) {
  const seed = n * 137.508   // golden angle spread
  const x    = ((seed * 7.3)  % 100).toFixed(2)
  const y    = ((seed * 13.1) % 100).toFixed(2)
  const size = (1 + (n % 3) * 0.7).toFixed(1)
  const dur  = (12 + (n % 8) * 2.5).toFixed(1)
  const del  = ((n * 1.7) % 10).toFixed(1)
  return {
    left:             `${x}%`,
    top:              `${y}%`,
    width:            `${size}px`,
    height:           `${size}px`,
    animationDuration:`${dur}s`,
    animationDelay:   `-${del}s`,
  }
}
</script>

<style scoped>
.particle-bg {
  position: fixed;
  inset:    0;
  pointer-events: none;
  z-index:  0;
  overflow: hidden;
}

.particle {
  position:      absolute;
  border-radius: 50%;
  background:    var(--clr-teal, #00e8c8);
  opacity:       0;
  animation:     floatParticle linear infinite;
}

/* Alternate particle colours via nth-child */
.particle:nth-child(3n)   { background: var(--clr-cyan,   #38bdf8); }
.particle:nth-child(5n)   { background: var(--clr-purple, #a78bfa); }
.particle:nth-child(7n)   { background: var(--clr-green,  #4ade80); }

@keyframes floatParticle {
  0%   { opacity: 0;    transform: translateY(0)   scale(1);   }
  15%  { opacity: 0.25; }
  50%  { opacity: 0.12; transform: translateY(-30px) scale(1.3); }
  85%  { opacity: 0.2;  }
  100% { opacity: 0;    transform: translateY(-60px) scale(0.8); }
}
</style>
