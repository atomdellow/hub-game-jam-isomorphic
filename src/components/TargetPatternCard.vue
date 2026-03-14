<template>
  <!-- Target pattern preview panel.
       Shows the abstract shape the player needs to find on the board. -->
  <Transition name="pattern-swap" mode="out-in">
  <div class="pattern-card" :class="`pattern-card--${pattern.id}`" :key="pattern.id">
    <p class="pattern-label">Find this pattern</p>
    <h2 class="pattern-name">{{ pattern.name }}</h2>

    <!-- Mini SVG preview of the abstract pattern shape -->
    <div class="pattern-preview-wrap">
      <svg
        class="pattern-preview-svg"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="`Pattern preview: ${pattern.name}`"
      >
        <!-- Edges first -->
        <line
          v-for="([ai, bi], i) in pattern.previewEdges"
          :key="`pe-${i}`"
          :x1="pattern.previewNodes[ai].x"
          :y1="pattern.previewNodes[ai].y"
          :x2="pattern.previewNodes[bi].x"
          :y2="pattern.previewNodes[bi].y"
          class="preview-edge"
        />
        <!-- Nodes on top -->
        <circle
          v-for="(pn, i) in pattern.previewNodes"
          :key="`pn-${i}`"
          :cx="pn.x"
          :cy="pn.y"
          r="6"
          class="preview-node"
        />
      </svg>
    </div>

    <p class="pattern-description">{{ pattern.description }}</p>
    <p class="pattern-hint-text">💡 {{ pattern.hint }}</p>
  </div>
  </Transition>
</template>

<script setup>
defineProps({
  /** Pattern definition object from patterns.js */
  pattern: { type: Object, required: true },
})
</script>

<style scoped>
.pattern-card {
  background:    var(--bg-card, #0f1a38);
  border:        1px solid #1e3a6e;
  border-radius: var(--radius-md, 12px);
  padding:       1.25rem 1.5rem;
  min-width:     190px;
  max-width:     220px;
  display:       flex;
  flex-direction: column;
  align-items:   center;
  gap:           0.5rem;
  box-shadow:    0 0 20px #00e8c80e, inset 0 0 20px #0d1530;
  transition:    border-color 0.3s;
}

.pattern-label {
  font-size:      0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color:          var(--clr-muted, #7090b0);
  margin:         0;
}

.pattern-name {
  font-size:   1.1rem;
  font-weight: 700;
  color:       var(--clr-teal, #00e8c8);
  margin:      0;
  text-align:  center;
  text-shadow: 0 0 10px #00e8c855;
}

/* Preview SVG wrapper */
.pattern-preview-wrap {
  background:    #070f20;
  border:        1px solid #1e3060;
  border-radius: 50%;
  width:         110px;
  height:        110px;
  display:       flex;
  align-items:   center;
  justify-content: center;
  box-shadow:    0 0 14px #00e8c811;
}

.pattern-preview-svg {
  width:  80px;
  height: 80px;
}

.preview-edge {
  stroke:        #00e8c8;
  stroke-width:  2.5;
  stroke-linecap: round;
  filter:        drop-shadow(0 0 3px #00e8c877);
}

.preview-node {
  fill:   #00e8c8;
  filter: drop-shadow(0 0 5px #00e8c8bb);
}

.pattern-description {
  font-size:  0.78rem;
  color:      var(--clr-text, #e0f0ff);
  text-align: center;
  margin:     0;
  opacity:    0.85;
}

.pattern-hint-text {
  font-size:  0.70rem;
  color:      var(--clr-muted, #7090b0);
  text-align: center;
  margin:     0;
  font-style: italic;
}

/* Round-swap transition */
.pattern-swap-enter-active { transition: opacity 0.3s, transform 0.3s; }
.pattern-swap-leave-active { transition: opacity 0.2s, transform 0.2s; }
.pattern-swap-enter-from   { opacity: 0; transform: translateY(8px) scale(0.97); }
.pattern-swap-leave-to     { opacity: 0; transform: translateY(-6px) scale(0.97); }
</style>
