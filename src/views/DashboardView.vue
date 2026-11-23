<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import { cases, SPECIALTIES } from '../data/cases'

const store = useGameStore()

const recommended = computed(() =>
  cases
    .filter((c) => !store.progress[c.id]?.solved)
    .sort((a, b) => a.difficulty - b.difficulty)
    .slice(0, 3),
)

const levelProgress = computed(() => {
  if (!store.level.next) return 100
  const prev = store.level.name === 'Интерн' ? 300 : store.level.name === 'Ординатор' ? 800 : 0
  return Math.round(((store.totalPoints - prev) / (store.level.next - prev)) * 100)
})

const specialtyStats = computed(() =>
  SPECIALTIES.map((sp) => {
    const inSpec = cases.filter((c) => c.specialty === sp)
    const solved = inSpec.filter((c) => store.progress[c.id]?.solved).length
    return { name: sp, total: inSpec.length, solved }
  }).filter((s) => s.total > 0),
)

const recentHistory = computed(() =>
  store.history.slice(0, 5).map((h) => ({ ...h, case: store.caseById(h.caseId) })).filter((h) => h.case),
)

const diffLabel = (d) => ['', 'Интерн', 'Ординатор', 'Врач'][d]
</script>

<template>
  <section class="dashboard">
    <header class="page-head">
      <h1>Тренировка клинического мышления</h1>
      <p class="subtitle">Решайте интерактивные кейсы, зарабатывайте баллы и растите в уровне — как в спортивном программировании, только про медицину</p>
    </header>

    <div class="stats">
      <div class="card stat">
        <span class="stat-value">{{ store.totalPoints }}</span>
        <span class="stat-label">баллов заработано</span>
      </div>
      <div class="card stat">
        <span class="stat-value">{{ store.solvedCount }} / {{ cases.length }}</span>
        <span class="stat-label">кейсов решено</span>
      </div>
      <div class="card stat">
        <span class="stat-value">{{ store.accuracy }}%</span>
        <span class="stat-label">точность ответов</span>
      </div>
      <div class="card stat level-stat">
        <span class="stat-value">{{ store.level.name }}</span>
        <span class="stat-label">текущий уровень</span>
        <div class="level-bar" role="progressbar" :aria-valuenow="levelProgress" aria-valuemin="0" aria-valuemax="100">
          <div class="level-fill" :style="{ width: levelProgress + '%' }" />
        </div>
        <span v-if="store.level.next" class="level-next">до «{{ store.level.next === 1500 ? 'Врача' : store.level.next === 800 ? 'Ординатора' : 'Интерна' }}»: {{ store.level.next - store.totalPoints }} баллов</span>
      </div>
    </div>

    <div class="cols">
      <div class="col">
        <h2 class="h2">Рекомендуем решить</h2>
        <div v-if="recommended.length" class="rec-list">
          <RouterLink v-for="c in recommended" :key="c.id" class="card rec" :to="`/case/${c.id}`">
            <div class="rec-head">
              <span class="badge">{{ c.specialty }}</span>
              <span class="badge diff">{{ diffLabel(c.difficulty) }}</span>
            </div>
            <h3>{{ c.title }}</h3>
            <span class="rec-points mono">{{ c.points }} баллов · {{ c.questions.length }} вопроса</span>
          </RouterLink>
        </div>
        <div v-else class="card empty">
          <p>Все кейсы решены — вы на вершине! Проверьте позицию в <RouterLink to="/leaderboard">рейтинге</RouterLink>.</p>
        </div>
      </div>

      <div class="col">
        <h2 class="h2">Прогресс по специальностям</h2>
        <div class="card spec-card">
          <div v-for="s in specialtyStats" :key="s.name" class="spec-row">
            <span class="spec-name">{{ s.name }}</span>
            <div class="spec-bar">
              <div class="spec-fill" :style="{ width: (s.solved / s.total) * 100 + '%' }" />
            </div>
            <span class="spec-count mono">{{ s.solved }}/{{ s.total }}</span>
          </div>
        </div>

        <template v-if="recentHistory.length">
          <h2 class="h2">Недавно решённые</h2>
          <div class="card history-card">
            <RouterLink v-for="h in recentHistory" :key="h.finishedAt" class="history-row" :to="`/case/${h.case.id}`">
              {{ h.case.title }}
              <span class="mono">+{{ store.progress[h.case.id]?.earnedPoints || 0 }}</span>
            </RouterLink>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-head h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
}

.subtitle {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 15px;
  max-width: 70ch;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.stat {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 26px;
  font-weight: 800;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.level-bar {
  margin-top: 8px;
  height: 8px;
  background: var(--surface-2);
  border-radius: 999px;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 0.3s ease-out;
}

.level-next {
  font-size: 12px;
  color: var(--text-faint);
}

.cols {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  align-items: start;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.rec-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rec {
  padding: 16px 18px;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
}

.rec:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-pop);
}

.rec-head {
  display: flex;
  gap: 8px;
}

.diff {
  background: var(--p-amber-100);
  color: var(--p-amber-600);
}

.rec h3 {
  margin: 0;
  font-size: 16.5px;
}

.rec-points {
  font-size: 12.5px;
  color: var(--text-faint);
}

.mono {
  font-family: var(--mono);
}

.spec-card,
.history-card {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spec-row {
  display: grid;
  grid-template-columns: 130px 1fr 40px;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.spec-bar {
  height: 8px;
  background: var(--surface-2);
  border-radius: 999px;
  overflow: hidden;
}

.spec-fill {
  height: 100%;
  background: var(--ok);
  border-radius: 999px;
}

.spec-count {
  font-size: 12.5px;
  color: var(--text-faint);
  text-align: right;
}

.history-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 14.5px;
  text-decoration: none;
  color: var(--text);
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}

.history-row:last-child {
  border-bottom: none;
}

.history-row .mono {
  color: var(--ok);
  font-size: 13px;
}

.empty {
  padding: 24px;
  color: var(--text-secondary);
}

@media (max-width: 900px) {
  .cols {
    grid-template-columns: 1fr;
  }
}
</style>
