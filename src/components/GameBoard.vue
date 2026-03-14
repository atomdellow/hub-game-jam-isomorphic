<template>
  <!-- Hex tile game board rendered as a responsive SVG. -->
  <div class="board-wrapper" :class="{ 'board-shake': shaking }">
    <svg
      class="board-svg"
      :viewBox="boardViewBox"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Hex tile game board"
    >
      <!-- Edges layer (drawn below tiles so tile bodies sit on top) -->
      <EdgeLayer
        :tiles="boardTiles"
        :edges="boardEdges"
        :selectedIds="selectedIds"
        :correctIds="correctIds"
      />

      <!-- Tile layer -->
      <NodeButton
        v-for="tile in boardTiles"
        :key="tile.id"
        :node="tile"
        :selected="selectedIds.includes(tile.id)"
        :correct="correctIds.includes(tile.id)"
        :claimedRound="claimedByRound[tile.id] ?? null"
        :clusterLocked="tile.activeFromLevel > currentLevel"
        @click="emit('nodeClick', tile.id)"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import EdgeLayer  from './EdgeLayer.vue'
import NodeButton from './NodeButton.vue'

const props = defineProps({
  /** Tile objects for the current board */
  boardTiles:      { type: Array,   required: true },
  /** Edge list for the current board */
  boardEdges:      { type: Array,   required: true },
  /** SVG viewBox string for the current board */
  boardViewBox:    { type: String,  default: '0 0 500 500' },
  /** Array of tile IDs currently selected */
  selectedIds:     { type: Array,   default: () => [] },
  /** Array of tile IDs in the last correct solve */
  correctIds:      { type: Array,   default: () => [] },
  /** True while the "wrong answer" feedback is showing */
  hasError:        { type: Boolean, default: false },
  /** Map of tileId → round number (1-based) for claimed tiles */
  claimedByRound:  { type: Object,  default: () => ({}) },
  /** Current game level — tiles with activeFromLevel > this are locked */
  currentLevel:     { type: Number,  default: 1 },
})

const emit = defineEmits(['nodeClick'])

// ── Shake animation on error ──────────────────────────────────────────────────
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
  max-width:        720px;
  margin:           0 auto;
}

.board-svg {
  width:  100%;
  height: auto;
  filter: drop-shadow(0 0 24px #00e8c811);
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
