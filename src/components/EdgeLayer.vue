<template>
  <!-- SVG <g> that draws every board edge.
       Edges shared between two selected/correct nodes glow accordingly. -->
  <g class="edge-layer" aria-hidden="true">
    <line
      v-for="(edge, i) in edges"
      :key="i"
      :x1="nodeMap[edge[0]]?.x"
      :y1="nodeMap[edge[0]]?.y"
      :x2="nodeMap[edge[1]]?.x"
      :y2="nodeMap[edge[1]]?.y"
      :class="edgeClass(edge)"
      class="board-edge"
    />
  </g>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Tile objects for the current board — used to look up x/y coordinates. */
  tiles:        { type: Array,  required: true },
  /** Full board edge list — array of [idA, idB] pairs */
  edges:        { type: Array,  required: true },
  /** Array of tile IDs currently selected by the player */
  selectedIds:  { type: Array,  default: () => [] },
  /** Array of tile IDs that were part of the last correct solve */
  correctIds:   { type: Array,  default: () => [] },
})

const nodeMap = computed(() => {
  const m = {}
  props.tiles.forEach(t => { m[t.id] = t })
  return m
})

function edgeClass([a, b]) {
  const selA = props.selectedIds.includes(a)
  const selB = props.selectedIds.includes(b)
  const corA = props.correctIds.includes(a)
  const corB = props.correctIds.includes(b)

  if (corA && corB) return 'edge-correct'
  if (selA && selB) return 'edge-selected'
  if (selA || selB) return 'edge-partial'
  return ''
}
</script>

<style scoped>
.board-edge {
  stroke:         #1e3060;
  stroke-width:   2;
  stroke-linecap: round;
  transition:     stroke 0.2s, stroke-width 0.2s, filter 0.2s;
}

.edge-partial {
  stroke:       #2d508a;
  stroke-width: 2.5;
}

.edge-selected {
  stroke:       #00e8c8;
  stroke-width: 3;
  filter:       drop-shadow(0 0 4px #00e8c8aa);
}

.edge-correct {
  stroke:       #4ade80;
  stroke-width: 4;
  filter:       drop-shadow(0 0 8px #4ade80cc);
  animation:    edgePulse 0.8s ease-in-out infinite alternate;
}

@keyframes edgePulse {
  from { filter: drop-shadow(0 0 4px #4ade8088); }
  to   { filter: drop-shadow(0 0 14px #4ade80ff); }
}
</style>
