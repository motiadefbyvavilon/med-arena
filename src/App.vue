<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useGameStore } from './stores/game'
import ToastStack from './components/ToastStack.vue'

const store = useGameStore()
</script>

<template>
  <div class="layout">
    <header class="topbar">
      <div class="topbar-inner">
        <RouterLink to="/" class="brand">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M3 14h5l2.5-7 4 14 3-9 1.8 2H25" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="brand-name">МедАрена</span>
        </RouterLink>

        <nav class="nav" aria-label="Основная навигация">
          <RouterLink to="/" class="nav-item">Прогресс</RouterLink>
          <RouterLink to="/cases" class="nav-item">Кейсы</RouterLink>
          <RouterLink to="/leaderboard" class="nav-item">Рейтинг</RouterLink>
        </nav>

        <div class="me" :title="`Уровень: ${store.level.name}`">
          <span class="me-level">{{ store.level.name }}</span>
          <span class="me-points mono">{{ store.totalPoints }} баллов</span>
        </div>
      </div>
    </header>

    <main class="main">
      <RouterView />
    </main>

    <ToastStack />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.topbar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: var(--z-nav);
}

.topbar-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--accent-strong);
}

.brand-name {
  font-weight: 800;
  font-size: 18px;
  color: var(--text);
}

.nav {
  display: flex;
  gap: 4px;
}

.nav-item {
  padding: 8px 14px;
  border-radius: 999px;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 14.5px;
  transition: background-color 0.15s ease-out, color 0.15s ease-out;
}

.nav-item:hover {
  background: var(--surface-2);
  color: var(--text);
}

.nav-item.router-link-active {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.me {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.me-level {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-strong);
  background: var(--accent-soft);
  border-radius: 999px;
  padding: 4px 12px;
}

.me-points {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-secondary);
}

.mono {
  font-family: var(--mono);
}

.main {
  flex: 1;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 24px 56px;
}

@media (max-width: 720px) {
  .topbar-inner {
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 16px;
  }
  .me {
    margin-left: 0;
  }
  .main {
    padding: 16px 16px 40px;
  }
}
</style>
