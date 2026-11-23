<script setup>
import { useGameStore } from '../stores/game'

const store = useGameStore()
</script>

<template>
  <div class="toast-stack" aria-live="polite">
    <TransitionGroup name="fade">
      <div v-for="t in store.toasts" :key="t.id" class="toast" :class="`toast-${t.tone}`" role="status">
        {{ t.text }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: var(--z-toast);
  max-width: min(420px, calc(100vw - 48px));
}

.toast {
  background: var(--text);
  color: var(--surface);
  padding: 12px 16px;
  border-radius: var(--radius-m);
  box-shadow: var(--shadow-pop);
  font-size: 14.5px;
  font-weight: 500;
}
</style>
