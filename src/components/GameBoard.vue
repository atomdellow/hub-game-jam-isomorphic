<template>
  <!-- The sacred geometry game board rendered as a responsive SVG. -->
  <div class="board-wrapper" :class="{ 'board-shake': shaking }">
    <!-- Zone-reveal banner -->
    <Transition name="zone-banner">
      <div v-if="newlyUnlockedZone !== null" class="zone-reveal-banner" aria-live="polite">
        🌸 New zone unlocked!
      </div>
    </Transition>

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

      <!-- Zone-unlock pulse rings (rendered below node layer) -->
      <circle
        v-for="nodeId in newlyUnlockedNodeIds"
        :key="`pulse-${nodeId}`"
        :cx="getNode(nodeId).x"
        :cy="getNode(nodeId).y"
        r="22"
        class="zone-unlock-pulse"
        aria-hidden="true"
      />

      <!-- Node layer -->
      <NodeButton
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        :selected="selectedIds.includes(node.id)"
        :correct="correctIds.includes(node.id)"
        :claimedRound="claimedByRound[node.id] ?? null"
        :isUnlocked="unlockedNodeIds.has(node.id)"
        :isNewlyUnlocked="newlyUnlockedNodeIds.has(node.id)"
        @click="emit('nodeClick', node.id)"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { nodes, edges, getNode, ZONES } from '../data/boardGraph.js'
import EdgeLayer        from './EdgeLayer.vue'
import NodeButton       from './NodeButton.vue'

const props = defineProps({
  /** Array of node IDs currently selected */
  selectedIds:    { type: Array,   default: () => [] },
  /** Array of node IDs in the last correct solve */
  correctIds:     { type: Array,   default: () => [] },
  /** True while the "wrong answer" feedback is showing */
  hasError:       { type: Boolean, default: false },
  /** Map of nodeId → round number (1-based) for claimed nodes */
  claimedByRound: { type: Object,  default: () => ({}) },
  /** Set of zone IDs that have been revealed so far */
  unlockedZones:  { type: Object,  default: () => new Set([0]) },
  /** Zone ID currently being revealed (null = none) */
  newlyUnlockedZone: { type: Number, default: null },
})

const emit = defineEmits(['nodeClick'])

// ── Derived sets ───────────────────────────────────────────────────────────
const unlockedNodeIds = computed(() => {
  const ids = new Set()
  for (const zone of ZONES) {
    if (props.unlockedZones.has(zone.id)) {
      zone.nodes.forEach(id => ids.add(id))
    }
  }
  return ids
})

const newlyUnlockedNodeIds = computed(() => {
  if (props.newlyUnlockedZone === null) return new Set()
  const zone = ZONES.find(z => z.id === props.newlyUnlockedZone)
  return zone ? new Set(zone.nodes) : new Set()
})

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
  flex-direction:   column;
  align-items:      center;
  justify-content:  center;
  width:            100%;
  max-width:        520px;
  margin:           0 auto;
  position:         relative;
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

/* ── Zone-reveal banner ────────────────────────────────────────────────────── */
.zone-reveal-banner {
  width:         100%;
  text-align:    center;
  padding:       0.45rem 1rem;
  font-size:     0.85rem;
  font-weight:   700;
  letter-spacing: 0.06em;
  color:         #d8b4fe;
  background:    #1a0a3a;
  border:        1px solid #7c3aed66;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  box-shadow:    0 0 16px #7c3aed44;
}

.zone-banner-enter-active { transition: opacity 0.3s, transform 0.3s; }
.zone-banner-leave-active { transition: opacity 0.25s; }
.zone-banner-enter-from   { opacity: 0; transform: translateY(-6px); }
.zone-banner-leave-to     { opacity: 0; }

/* ── Zone-unlock pulse ring ────────────────────────────────────────────────── */
.zone-unlock-pulse {
  fill:         none;
  stroke:       #d8b4fe;
  stroke-width: 2;
  opacity:      0;
  animation:    zoneUnlockPulse 0.6s ease-out forwards;
}

@keyframes zoneUnlockPulse {
  0%   { opacity: 0.9; r: 14; stroke-width: 3; }
  100% { opacity: 0;   r: 28; stroke-width: 1; }
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
