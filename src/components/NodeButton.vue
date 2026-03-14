<template>
  <!-- SVG <g> representing a single clickable hex tile. -->
  <g
    :class="['tile-group', {
      'tile-selected':      selected && claimedRound === null && !clusterLocked,
      'tile-correct':       correct,
      'tile-hover':         hover && claimedRound === null && !clusterLocked,
      'tile-claimed':       claimedRound !== null,
      'tile-cluster-locked': clusterLocked,
      'tile-just-unlocked': justUnlocked,
    }]"
    :style="claimedRound !== null ? { '--claimed-clr': ROUND_COLORS[claimedRound - 1] } : {}"
    :data-tile-id="node.id"
    :data-testid="`tile-${node.id}`"
    :aria-label="`Tile ${node.id}${
      clusterLocked ? ' (locked)' :
      claimedRound !== null ? ` (placed round ${claimedRound})` :
      selected ? ' selected' : ''
    }`"
    role="button"
    :tabindex="clusterLocked || claimedRound !== null ? -1 : 0"
    @click="clusterLocked || claimedRound !== null ? undefined : emit('click')"
    @keydown.enter.space.prevent="clusterLocked || claimedRound !== null ? undefined : emit('click')"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- Hex body polygon -->
    <polygon :points="node.points" class="tile-body" />
    <!-- Centre dot — hidden when cluster-locked -->
    <circle v-if="!clusterLocked" :cx="node.x" :cy="node.y" :r="DOT_R" class="tile-dot" />
    <!-- Round badge shown when claimed -->
    <text
      v-if="claimedRound !== null"
      :x="node.x"
      :y="node.y + 1"
      text-anchor="middle"
      dominant-baseline="middle"
      class="tile-claimed-label"
    >{{ claimedRound }}</text>
  </g>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  /** Tile data object { id, q, r, x, y, points, neighbors, ring, cluster } */
  node:          { type: Object,  required: true },
  /** Is this tile currently selected by the player? */
  selected:      { type: Boolean, default: false },
  /** Was this tile part of the last correct solve (bloom state)? */
  correct:       { type: Boolean, default: false },
  /**
   * null  = free to select
   * 1–5   = locked; claimed by that round number
   */
  claimedRound:  { type: Number,  default: null },
  /**
   * true  = cluster B tile that has not yet been unlocked
   *         (ghost appearance, not interactive)
   */
  clusterLocked: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
const hover = ref(false)

const DOT_R = 4

const ROUND_COLORS = ['#a78bfa', '#60a5fa', '#2dd4bf', '#fbbf24', '#f472b6', '#fb7185', '#38bdf8']

// ── Unlock animation ──────────────────────────────────────────────────────────
// When clusterLocked transitions true → false, briefly apply the unlock class.
const justUnlocked = ref(false)
let unlockTimer = null

watch(() => props.clusterLocked, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    justUnlocked.value = true
    clearTimeout(unlockTimer)
    unlockTimer = setTimeout(() => { justUnlocked.value = false }, 1100)
  }
})
</script>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────────────── */
.tile-group {
  cursor:  pointer;
  outline: none;
}

.tile-body {
  fill:            #0f1d3e;
  stroke:          #2a4080;
  stroke-width:    1.5;
  stroke-linejoin: round;
  transition:      fill 0.2s, stroke 0.2s, filter 0.2s;
}

.tile-dot {
  fill:           #2a4080;
  transition:     fill 0.2s;
  pointer-events: none;
}

/* ── Hover ────────────────────────────────────────────────────────────────── */
.tile-hover .tile-body {
  fill:   #0d254a;
  stroke: #38bdf8;
  filter: drop-shadow(0 0 6px #38bdf855);
}
.tile-hover .tile-dot { fill: #38bdf8; }

/* ── Selected ─────────────────────────────────────────────────────────────── */
.tile-selected .tile-body {
  fill:         #072e30;
  stroke:       #00e8c8;
  stroke-width: 2;
  filter:       drop-shadow(0 0 10px #00e8c8aa);
}
.tile-selected .tile-dot { fill: #00e8c8; }

/* ── Correct (bloom) ──────────────────────────────────────────────────────── */
.tile-correct .tile-body {
  fill:         #072e18;
  stroke:       #4ade80;
  stroke-width: 2.5;
  filter:       drop-shadow(0 0 14px #4ade80cc);
  animation:    bloomPulse 0.9s ease-in-out infinite alternate;
}
.tile-correct .tile-dot { fill: #4ade80; }

@keyframes bloomPulse {
  from { filter: drop-shadow(0 0 8px #4ade8088); }
  to   { filter: drop-shadow(0 0 20px #4ade80ff); }
}

/* ── Claimed ──────────────────────────────────────────────────────────────── */
.tile-claimed {
  cursor:         not-allowed;
  pointer-events: none;
}
.tile-claimed .tile-body {
  fill:         #070e1e;
  stroke:       var(--claimed-clr, #888);
  stroke-width: 1.5;
  opacity:      0.80;
  filter:       none;
}
.tile-claimed .tile-dot {
  fill:    var(--claimed-clr, #888);
  opacity: 0.80;
}
.tile-claimed-label {
  font-size:      11px;
  font-weight:    700;
  fill:           var(--claimed-clr, #fff);
  opacity:        0.95;
  pointer-events: none;
  user-select:    none;
}

/* ── Cluster-locked (cluster B, not yet unlocked) ─────────────────────────── */
.tile-cluster-locked {
  cursor:         default;
  pointer-events: none;
}
.tile-cluster-locked .tile-body {
  fill:             #050a18;
  stroke:           #1a3060;
  stroke-width:     1;
  stroke-dasharray: 5 4;
  opacity:          0.35;
  filter:           none;
}

/* ── Just-unlocked pulse animation ───────────────────────────────────────── */
.tile-just-unlocked .tile-body {
  animation: clusterUnlock 1.0s ease-out forwards;
}
.tile-just-unlocked .tile-dot {
  animation: dotUnlock 1.0s ease-out forwards;
}

@keyframes clusterUnlock {
  0%   { fill: #091f3a; stroke: #38bdf8; stroke-dasharray: none;
         filter: drop-shadow(0 0 22px #38bdf8cc); opacity: 0.4; }
  40%  { fill: #0d2a4e; stroke: #38bdf8;
         filter: drop-shadow(0 0 14px #38bdf8aa); opacity: 0.85; }
  100% { fill: #0f1d3e; stroke: #2a4080;
         filter: none; opacity: 1; }
}

@keyframes dotUnlock {
  0%   { fill: #38bdf8; opacity: 0; }
  40%  { fill: #38bdf8; opacity: 1; }
  100% { fill: #2a4080; opacity: 1; }
}
</style>
