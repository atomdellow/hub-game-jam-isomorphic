<template>
  <!-- The sacred geometry game board rendered as a responsive SVG. -->
  <div class="board-wrapper" :class="{ 'board-shake': shaking }">
    <svg
      class="board-svg"
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sacred geometry game board"
    >
      <!-- Subtle background geometry circles (decorative Flower of Life hint) -->
      <g class="bg-geometry" aria-hidden="true">
        <circle cx="250" cy="250" r="104" class="bg-ring" />
        <circle cx="250" cy="250" r="62"  class="bg-ring bg-ring--inner" />
      </g>

      <!-- Edges layer (drawn below nodes) -->
      <EdgeLayer
        :edges="edges"
        :selectedIds="selectedIds"
        :correctIds="correctIds"
      />

      <!-- Node layer -->
      <NodeButton
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        :selected="selectedIds.includes(node.id)"
        :correct="correctIds.includes(node.id)"
        @click="emit('nodeClick', node.id)"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { nodes, edges } from '../data/boardGraph.js'
import EdgeLayer        from './EdgeLayer.vue'
import NodeButton       from './NodeButton.vue'

const props = defineProps({
  /** Array of node IDs currently selected */
  selectedIds: { type: Array, default: () => [] },
  /** Array of node IDs in the last correct solve */
  correctIds:  { type: Array, default: () => [] },
  /** True while the "wrong answer" feedback is showing */
  hasError:    { type: Boolean, default: false },
})

const emit = defineEmits(['nodeClick'])

// ── Shake animation on error ───────────────────────────────────────────────
const shaking = ref(false)
let shakeTimer = null

watch(() => props.hasError, (val) => {
  if (val) {
    shaking.value = true
    clearTimeout(shakeTimer)
    shakeTimer = setTimeout(() => { shaking.value = false }, 600)
  }
})
</script>

<style scoped>
.board-wrapper {
  display:          flex;
  align-items:      center;
  justify-content:  center;
  width:            100%;
  max-width:        520px;
  margin:           0 auto;
}

.board-svg {
  width:  100%;
  height: auto;
  /* Soft outer glow on the board container */
  filter: drop-shadow(0 0 24px #00e8c811);
}

/* Decorative background rings */
.bg-ring {
  fill:         none;
  stroke:       #1a2d60;
  stroke-width: 1;
  opacity:      0.5;
}
.bg-ring--inner {
  stroke-dasharray: 4 6;
  opacity:          0.3;
}

/* ── Shake on wrong answer ─────────────────────────────────────────────────── */
.board-shake {
  animation: boardShake 0.55s ease;
}

@keyframes boardShake {
  0%   { transform: translateX(0); }
  15%  { transform: translateX(-8px); }
  30%  { transform: translateX(7px); }
  45%  { transform: translateX(-6px); }
  60%  { transform: translateX(5px); }
  75%  { transform: translateX(-3px); }
  100% { transform: translateX(0); }
}
</style>
