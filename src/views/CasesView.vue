<script setup>
import { computed, reactive } from 'vue'
import { useGameStore } from '../stores/game'
import { cases, SPECIALTIES } from '../data/cases'

const store = useGameStore()

const filters = reactive({ specialty: '', difficulty: '', status: '' })

const filtered = computed(() =>
  cases.filter((c) => {
    if (filters.specialty && c.specialty !== filters.specialty) return false
    if (filters.difficulty && c.difficulty !== Number(filters.difficulty)) return false
    if (filters.status === 'solved' && !store.progress[c.id]?.solved) return false
    if (filters.status === 'unsolved' && store.progress[c.id]?.solved) return false
    return true
  }),
)

const diffLabel = (d) => ['', 'Интерн', 'Ординатор', 'Врач'][d]
const diffClass = (d) => ['', 'd1', 'd2', 'd3'][d]
</script>

<template>
  <section class="cases-page">
    <header class="page-head">
      <div>
        <h1>Банк кейсов</h1>
        <p class="subtitle">{{ cases.length }} клинических задач · отвечайте верно с первой попытки — получайте полные баллы</p>
      </div>
    </header>

    <div class="filters card">
      <select v-model="filters.specialty" aria-label="Специальность">
        <option value="">Все специальности</option>
        <option v-for="sp in SPECIALTIES" :key="sp" :value="sp">{{ sp }}</option>
      </select>
      <select v-model="filters.difficulty" aria-label="Сложность">
        <option value="">Любая сложность</option>
        <option value="1">Интерн</option>
        <option value="2">Ординатор</option>
        <option value="3">Врач</option>
      </select>
      <select v-model="filters.status" aria-label="Статус">
        <option value="">Все кейсы</option>
        <option value="unsolved">Нерешённые</option>
        <option value="solved">Решённые</option>
      </select>
    </div>

    <div v-if="filtered.length" class="grid">
      <RouterLink
        v-for="c in filtered"
        :key="c.id"
        class="card case-card"
        :class="{ solved: store.progress[c.id]?.solved }"
        :to="`/case/${c.id}`"
      >
        <div class="case-top">
          <span class="badge">{{ c.specialty }}</span>
          <span class="badge" :class="diffClass(c.difficulty)">{{ diffLabel(c.difficulty) }}</span>
        </div>
        <h3>{{ c.title }}</h3>
        <div class="case-bottom">
          <span class="mono points">{{ c.points }} баллов</span>
          <span v-if="store.progress[c.id]?.solved" class="solved-mark">
            ✓ решён · +{{ store.progress[c.id].earnedPoints }}
          </span>
          <span v-else class="questions-count">{{ c.questions.length }} вопроса</span>
        </div>
      </RouterLink>
    </div>

    <div v-else class="card empty">
      <p>Под выбранные фильтры кейсов нет.</p>
    </div>
  </section>
</template>

<style scoped>
.cases-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
}

.subtitle {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 14.5px;
}

.filters {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  flex-wrap: wrap;
}

.filters select {
  border: 1px solid var(--border);
  border-radius: var(--radius-m);
  background: var(--surface);
  padding: 9px 12px;
  font-size: 14.5px;
  font-weight: 500;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.case-card {
  padding: 18px;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
}

.case-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-pop);
}

.case-card.solved {
  opacity: 0.75;
}

.case-top {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.d1 {
  background: var(--ok-soft);
  color: var(--ok);
}

.d2 {
  background: var(--p-amber-100);
  color: var(--p-amber-600);
}

.d3 {
  background: var(--danger-soft);
  color: var(--danger);
}

.case-card h3 {
  margin: 0;
  font-size: 17px;
  line-height: 1.3;
}

.case-bottom {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.mono {
  font-family: var(--mono);
}

.points {
  font-size: 13px;
  color: var(--accent-strong);
  font-weight: 600;
}

.solved-mark {
  font-size: 13px;
  color: var(--ok);
  font-weight: 600;
}

.questions-count {
  font-size: 13px;
  color: var(--text-faint);
}

.empty {
  padding: 32px;
  text-align: center;
  color: var(--text-secondary);
}
</style>
