<script setup>
import { useGameStore } from '../stores/game'

const store = useGameStore()

function medal(i) {
  return ['1', '2', '3'][i] || null
}
</script>

<template>
  <section class="board">
    <header class="page-head">
      <h1>Рейтинг врачей</h1>
      <p class="subtitle">Сезон «Ноябрь» · баллы начисляются за верные ответы с первой попытки</p>
    </header>

    <div class="card table-card">
      <table>
        <thead>
          <tr>
            <th class="rank-col">#</th>
            <th>Участник</th>
            <th>Город</th>
            <th class="points-col">Баллы</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in store.leaderboard" :key="p.name + i" :class="{ me: p.me }">
            <td class="rank-col">
              <span class="rank" :class="`r${i + 1}`">{{ medal(i) || i + 1 }}</span>
            </td>
            <td class="name-cell">
              {{ p.name }}
              <span v-if="p.me" class="you">это вы</span>
            </td>
            <td class="city">{{ p.city }}</td>
            <td class="points-col mono">{{ p.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="hint">Соперники — учебные заглушки; ваша строка считается из реально заработанных баллов.</p>
  </section>
</template>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 720px;
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

.table-card {
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding: 12px 18px;
  font-size: 14.5px;
}

th {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
  border-bottom: 1px solid var(--border);
}

td {
  border-bottom: 1px solid var(--surface-2);
}

tr:last-child td {
  border-bottom: none;
}

tr.me {
  background: var(--accent-soft);
}

.rank-col {
  width: 48px;
}

.rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  background: var(--surface-2);
  color: var(--text-secondary);
}

.rank.r1 {
  background: oklch(75% 0.15 85);
  color: oklch(35% 0.08 80);
}

.rank.r2 {
  background: oklch(85% 0.01 260);
  color: oklch(40% 0.02 260);
}

.rank.r3 {
  background: oklch(75% 0.09 55);
  color: oklch(35% 0.06 50);
}

.you {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-strong);
}

.city {
  color: var(--text-secondary);
}

.points-col {
  text-align: right;
  font-weight: 700;
}

.mono {
  font-family: var(--mono);
}

.hint {
  margin: 0;
  font-size: 13px;
  color: var(--text-faint);
}
</style>
