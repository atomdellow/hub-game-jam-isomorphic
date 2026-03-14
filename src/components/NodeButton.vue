<template>
  <!-- SVG <g> representing a single clickable plant-pod node. -->
  <g
    :class="['node-group', {
      'node-selected': selected && claimedRound === null,
      'node-correct':  correct,
      'node-hover':    hover && claimedRound === null,
      'node-claimed':  claimedRound !== null,
    }]"
    :style="claimedRound !== null ? { '--claimed-clr': ROUND_COLORS[claimedRound - 1] } : {}"
    :data-node-id="node.id"
    :data-testid="`node-${node.id}`"
    :aria-label="`Node ${node.id}${
      claimedRound !== null ? ` (placed round ${claimedRound})` : selected ? ' selected' : ''
    }`"
    role="button"
    :tabindex="claimedRound !== null ? -1 : 0"
    @click="claimedRound !== null ? undefined : emit('click')"
    @keydown.enter.space.prevent="claimedRound !== null ? undefined : emit('click')"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- Outer glow ring -->
    <circle :cx="node.x" :cy="node.y" :r="OUTER_R" class="node-glow-ring" />
    <!-- Main pod body -->
    <circle :cx="node.x" :cy="node.y" :r="INNER_R" class="node-body" />
    <!-- Centre dot -->
    <circle :cx="node.x" :cy="node.y" :r="DOT_R"   class="node-dot" />
    <!-- Round badge shown when claimed -->
    <text
      v-if="claimedRound !== null"
      :x="node.x"
      :y="node.y + 4"
      text-anchor="middle"
      dominant-baseline="middle"
      class="node-claimed-label"
    >{{ claimedRound }}</text>
  </g>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  /** Node data object from boardGraph.js { id, x, y, neighbors } */
  node:            { type: Object,  required: true },
  /** Is this node currently selected by the player? */
  selected:        { type: Boolean, default: false },
  /** Was this node part of the last correct solve (bloom state)? */
  correct:         { type: Boolean, default: false },
  /**
   * null  = free to select
   * 1–5   = locked; claimed by that round number
   */
  claimedRound: { type: Number,  default: null },
})

const emit = defineEmits(['click'])
const hover = ref(false)

const OUTER_R = 18
const INNER_R = 12
const DOT_R   = 3

// One accent colour per round (purple → blue → teal → amber → pink → rose → cyan)
const ROUND_COLORS = ['#a78bfa', '#60a5fa', '#2dd4bf', '#fbbf24', '#f472b6', '#fb7185', '#38bdf8']
</script>

<style scoped>
/* ── Shared transitions ─────────────────────────────────────────────────────── */
.node-group {
  cursor: pointer;
  outline: none;
}

/* ── Locked ghost (zone not yet unlocked) ──────────────────────────────────── */
.node-locked-ghost {
  cursor:         default;
  pointer-events: none;
}
.node-locked-ghost .node-body {
  fill:         #070e1e;
  stroke:       #1a2d60;
  stroke-width: 1.5;
  opacity:      0.35;
}
.node-locked-ghost .node-dot {
  fill:    #1a2d60;
  opacity: 0.25;
}

/* ── Newly unlocked (pulse animation) ──────────────────────────────────────── */
.node-newly-unlocked .node-body {
  animation: newlyUnlockedPulse 0.6s ease-out;
}
.node-newly-unlocked .node-glow-ring {
  stroke:  #d8b4fe;
  opacity: 0.8;
  animation: newlyUnlockedRing 0.6s ease-out forwards;
}

@keyframes newlyUnlockedPulse {
  0%   { fill: #2a0a4a; stroke: #d8b4fe; filter: drop-shadow(0 0 10px #d8b4fecc); }
  100% { fill: #0f1d3e; stroke: #2a4080; filter: none; }
}

@keyframes newlyUnlockedRing {
  0%   { opacity: 0.9; }
  100% { opacity: 0; }
}

/* Glow ring — hidden by default, expands on interaction */
.node-glow-ring {
  fill:    none;
  stroke:  transparent;
  stroke-width: 2;
  opacity: 0;
  transition: opacity 0.2s, stroke 0.2s, r 0.2s;
}

/* Pod body */
.node-body {
  fill:   #0f1d3e;
  stroke: #2a4080;
  stroke-width: 2;
  transition: fill 0.2s, stroke 0.2s, filter 0.2s;
}

/* Centre dot */
.node-dot {
  fill: #2a4080;
  transition: fill 0.2s;
}

/* ── Hover ──────────────────────────────────────────────────────────────────── */
.node-hover .node-glow-ring {
  stroke:  #38bdf8;
  opacity: 0.4;
}
.node-hover .node-body {
  fill:   #0d254a;
  stroke: #38bdf8;
  filter: drop-shadow(0 0 5px #38bdf866);
}
.node-hover .node-dot { fill: #38bdf8; }

/* ── Selected ───────────────────────────────────────────────────────────────── */
.node-selected .node-glow-ring {
  stroke:  #00e8c8;
  opacity: 0.6;
}
.node-selected .node-body {
  fill:   #072e30;
  stroke: #00e8c8;
  stroke-width: 2.5;
  filter: drop-shadow(0 0 8px #00e8c8aa);
}
.node-selected .node-dot { fill: #00e8c8; }

/* ── Correct (bloom state) ──────────────────────────────────────────────────── */
.node-correct .node-glow-ring {
  stroke:  #4ade80;
  opacity: 0.8;
  animation: bloomRing 0.9s ease-in-out infinite alternate;
}
.node-correct .node-body {
  fill:   #072e18;
  stroke: #4ade80;
  stroke-width: 3;
  filter: drop-shadow(0 0 12px #4ade80cc);
  animation: bloomPulse 0.9s ease-in-out infinite alternate;
}
.node-correct .node-dot { fill: #4ade80; }

@keyframes bloomRing {
  from { opacity: 0.5; }
  to   { opacity: 1.0; }
}
@keyframes bloomPulse {
  from { filter: drop-shadow(0 0 6px #4ade8088); }
  to   { filter: drop-shadow(0 0 18px #4ade80ff); }
}

/* ── Claimed (locked by a previous round) ───────────────────────────────────── */
.node-claimed {
  cursor: not-allowed;
  pointer-events: none;
}
.node-claimed .node-glow-ring {
  stroke:  var(--claimed-clr, #888);
  opacity: 0.3;
}
.node-claimed .node-body {
  fill:         #070e1e;
  stroke:       var(--claimed-clr, #888);
  stroke-width: 2;
  opacity:      0.80;
  filter:       none;
}
.node-claimed .node-dot {
  fill:    var(--claimed-clr, #888);
  opacity: 0.80;
}
.node-claimed-label {
  font-size:      9px;
  font-weight:    700;
  fill:           var(--claimed-clr, #fff);
  opacity:        0.95;
  pointer-events: none;
  user-select:    none;
}
</style>
