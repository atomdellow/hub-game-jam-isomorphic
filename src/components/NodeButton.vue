<template>
  <!-- SVG <g> representing a single clickable plant-pod node.
       Composed of two concentric circles + an optional inner glyph. -->
  <g
    :class="['node-group', { 'node-selected': selected, 'node-correct': correct, 'node-hover': hover }]"
    :data-node-id="node.id"
    :data-testid="`node-${node.id}`"
    :aria-label="`Node ${node.id}${selected ? ' selected' : ''}`"
    role="button"
    tabindex="0"
    @click="emit('click')"
    @keydown.enter.space.prevent="emit('click')"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- Outer glow ring (visible on hover / selected / correct) -->
    <circle
      :cx="node.x"
      :cy="node.y"
      :r="OUTER_R"
      class="node-glow-ring"
    />
    <!-- Main pod body -->
    <circle
      :cx="node.x"
      :cy="node.y"
      :r="INNER_R"
      class="node-body"
    />
    <!-- Centre dot -->
    <circle
      :cx="node.x"
      :cy="node.y"
      :r="DOT_R"
      class="node-dot"
    />
  </g>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  /** Node data object from boardGraph.js { id, x, y, neighbors } */
  node:     { type: Object,  required: true },
  /** Is this node currently selected by the player? */
  selected: { type: Boolean, default: false },
  /** Was this node part of the last correct solve (bloom state)? */
  correct:  { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
const hover = ref(false)

// Node radii — kept here so they're easy to tweak
const OUTER_R = 18
const INNER_R = 12
const DOT_R   = 3
</script>

<style scoped>
/* ── Shared transitions ─────────────────────────────────────────────────────── */
.node-group {
  cursor: pointer;
  outline: none;
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
</style>
