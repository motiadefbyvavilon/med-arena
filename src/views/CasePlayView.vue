<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { cases } from '../data/cases'

const route = useRoute()
const router = useRouter()
const store = useGameStore()

const caseData = computed(() => store.caseById(route.params.id))

const stage = ref('intro') // intro | question | done
const qIndex = ref(0)
const selected = ref(null)
const answered = ref(false)
const wasCorrect = ref(false)
const earnedThisRun = ref(0)

watch(
  () => route.params.id,
  () => {
    stage.value = 'intro'
    qIndex.value = 0
    selected.value = null
    answered.value = false
    earnedThisRun.value = 0
  },
)

const question = computed(() => caseData.value?.questions[qIndex.value])
const isLast = computed(() => caseData.value && qIndex.value === caseData.value.questions.length - 1)

function start() {
  stage.value = 'question'
}

function submit() {
  if (selected.value == null || answered.value) return
  answered.value = true
  wasCorrect.value = selected.value === question.value.correct
  const before = store.progress[caseData.value.id]?.earnedPoints || 0
  store.submitAnswer(
    caseData.value.id,
    qIndex.value,
    wasCorrect.value,
    caseData.value.points,
    caseData.value.questions.length,
  )
  const after = store.progress[caseData.value.id]?.earnedPoints || 0
  earnedThisRun.value += after - before
}

function next() {
  if (isLast.value) {
    store.finishCase(caseData.value.id, caseData.value.questions.length)
    stage.value = 'done'
    if (wasCorrect.value) store.pushToast(`Кейс завершён: +${earnedThisRun.value} баллов`, 'success')
    return
  }
  qIndex.value += 1
  selected.value = null
  answered.value = false
  wasCorrect.value = false
}

const nextCase = computed(() => {
  const unsolved = cases.find((c) => !store.progress[c.id]?.solved && c.id !== caseData.value?.id)
  return unsolved || null
})

const diffLabel = (d) => ['', 'Интерн', 'Ординатор', 'Врач'][d]
</script>

<template>
  <section v-if="caseData" class="play">
    <button class="back" type="button" @click="router.push('/cases')">← К банку кейсов</button>

    <header class="case-head">
      <div class="badges">
        <span class="badge">{{ caseData.specialty }}</span>
        <span class="badge amber">{{ diffLabel(caseData.difficulty) }}</span>
        <span class="badge mono">{{ caseData.points }} баллов</span>
      </div>
      <h1>{{ caseData.title }}</h1>
    </header>

    <!-- Клиническая картина -->
    <div class="card vignette">
      <h2 class="h2">Клиническая картина</h2>
      <p class="patient">{{ caseData.presentation.patient }}</p>
      <div class="block">
        <h3>Жалобы</h3>
        <p>{{ caseData.presentation.complaint }}</p>
      </div>
      <div class="block">
        <h3>Анамнез и осмотр</h3>
        <ul>
          <li v-for="(a, i) in caseData.presentation.anamnesis" :key="i">{{ a }}</li>
        </ul>
      </div>
      <div class="vitals">
        <div v-for="v in caseData.presentation.vitals" :key="v.k" class="vital">
          <span class="vital-k">{{ v.k }}</span>
          <span class="vital-v mono">{{ v.v }}</span>
        </div>
      </div>
      <div class="block">
        <h3>Дополнительные данные</h3>
        <ul>
          <li v-for="(e, i) in caseData.presentation.exams" :key="i">{{ e }}</li>
        </ul>
      </div>
    </div>

    <!-- Старт -->
    <div v-if="stage === 'intro'" class="card start-card">
      <p>
        В кейсе {{ caseData.questions.length }} вопроса. За каждый верный ответ с первой попытки —
        {{ Math.round(caseData.points / caseData.questions.length) }} баллов. После ответа откроется разбор.
      </p>
      <button class="btn btn-primary" type="button" @click="start">Приступить к решению</button>
    </div>

    <!-- Вопрос -->
    <div v-else-if="stage === 'question'" class="card question-card">
      <div class="q-progress mono">Вопрос {{ qIndex + 1 }} / {{ caseData.questions.length }}</div>
      <h2 class="q-text">{{ question.text }}</h2>

      <div class="options" role="radiogroup" :aria-label="question.text">
        <button
          v-for="(opt, i) in question.options"
          :key="i"
          type="button"
          class="option"
          :class="{
            selected: selected === i && !answered,
            correct: answered && i === question.correct,
            wrong: answered && selected === i && i !== question.correct,
          }"
          :disabled="answered"
          role="radio"
          :aria-checked="selected === i"
          @click="selected = i"
        >
          <span class="opt-letter mono">{{ ['A', 'B', 'C', 'D'][i] }}</span>
          {{ opt }}
        </button>
      </div>

      <div v-if="!answered" class="q-actions">
        <button class="btn btn-primary" type="button" :disabled="selected == null" @click="submit">
          Ответить
        </button>
      </div>

      <div v-else class="verdict" :class="wasCorrect ? 'ok' : 'bad'">
        <h3>{{ wasCorrect ? 'Верно! Баллы начислены.' : 'Неверно. Верный ответ выделен зелёным.' }}</h3>
        <p class="explanation">{{ question.explanation }}</p>
        <button class="btn btn-primary" type="button" @click="next">
          {{ isLast ? 'Завершить кейс' : 'Следующий вопрос →' }}
        </button>
      </div>
    </div>

    <!-- Финиш -->
    <div v-else class="card done-card">
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="23" stroke="var(--ok)" stroke-width="3" />
        <path d="m16 27 7 7 13-15" stroke="var(--ok)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <h2>Кейс решён</h2>
      <p class="done-points">Заработано за это прохождение: <strong class="mono">+{{ earnedThisRun }} баллов</strong></p>
      <p class="done-total">Всего на счету: {{ store.totalPoints }} баллов · уровень «{{ store.level.name }}»</p>
      <div class="done-actions">
        <RouterLink class="btn btn-ghost" to="/cases">К банку кейсов</RouterLink>
        <RouterLink v-if="nextCase" class="btn btn-primary" :to="`/case/${nextCase.id}`">Следующий кейс →</RouterLink>
        <RouterLink v-else class="btn btn-primary" to="/leaderboard">К рейтингу →</RouterLink>
      </div>
    </div>
  </section>

  <section v-else class="card empty">
    <p>Кейс не найден.</p>
    <RouterLink class="btn btn-ghost" to="/cases">К банку кейсов</RouterLink>
  </section>
</template>

<style scoped>
.play {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 820px;
}

.back {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 14.5px;
  padding: 6px 0;
}

.back:hover {
  color: var(--accent-strong);
}

.case-head .badges {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.amber {
  background: var(--p-amber-100);
  color: var(--p-amber-600);
}

.mono {
  font-family: var(--mono);
}

.case-head h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.vignette {
  padding: 22px 26px;
}

.h2 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 700;
}

.patient {
  margin: 0 0 14px;
  font-weight: 700;
  color: var(--accent-strong);
}

.block {
  margin-bottom: 14px;
}

.block h3 {
  margin: 0 0 6px;
  font-size: 12.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
}

.block p {
  margin: 0;
}

.block ul {
  margin: 0;
  padding-left: 20px;
}

.block li {
  margin-bottom: 4px;
}

.vitals {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin: 16px 0;
}

.vital {
  background: var(--surface-2);
  border-radius: var(--radius-s);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.vital-k {
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
  font-weight: 600;
}

.vital-v {
  font-size: 13.5px;
  font-weight: 600;
}

.start-card {
  padding: 22px 26px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.start-card p {
  margin: 0;
  color: var(--text-secondary);
}

.question-card {
  padding: 22px 26px;
}

.q-progress {
  font-size: 12.5px;
  color: var(--text-faint);
  margin-bottom: 8px;
}

.q-text {
  margin: 0 0 18px;
  font-size: 19px;
  font-weight: 700;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  border: 1.5px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius-m);
  padding: 13px 16px;
  font-size: 15px;
  line-height: 1.45;
  transition: border-color 0.15s ease-out, background-color 0.15s ease-out;
}

.option:hover:not(:disabled) {
  border-color: var(--accent);
}

.option.selected {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.option.correct {
  border-color: var(--ok);
  background: var(--ok-soft);
}

.option.wrong {
  border-color: var(--danger);
  background: var(--danger-soft);
}

.option:disabled {
  cursor: default;
}

.opt-letter {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: var(--surface-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  font-weight: 600;
}

.option.correct .opt-letter {
  background: var(--ok);
  color: var(--surface);
}

.option.wrong .opt-letter {
  background: var(--danger);
  color: var(--surface);
}

.q-actions {
  margin-top: 18px;
}

.verdict {
  margin-top: 20px;
  border-radius: var(--radius-m);
  padding: 16px 18px;
}

.verdict.ok {
  background: var(--ok-soft);
}

.verdict.bad {
  background: var(--danger-soft);
}

.verdict h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.verdict.ok h3 {
  color: var(--ok);
}

.verdict.bad h3 {
  color: var(--danger);
}

.explanation {
  margin: 0 0 14px;
  font-size: 14.5px;
  color: var(--text);
  line-height: 1.6;
}

.done-card {
  padding: 36px 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.done-card h2 {
  margin: 6px 0 0;
  font-size: 22px;
}

.done-points {
  margin: 0;
  font-size: 16px;
}

.done-points strong {
  color: var(--ok);
}

.done-total {
  margin: 0 0 14px;
  color: var(--text-secondary);
  font-size: 14.5px;
}

.done-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.empty {
  padding: 48px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
</style>
