import { defineStore } from 'pinia'
import { cases } from '../data/cases'

const STORAGE_KEY = 'medarena-state-v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { progress: {}, history: [] }
    const parsed = JSON.parse(raw)
    return { progress: parsed.progress || {}, history: parsed.history || [] }
  } catch {
    return { progress: {}, history: [] }
  }
}

const LEADERS = [
  { name: 'Айгерим Т.', city: 'Алматы', points: 2400 },
  { name: 'Даниил Р.', city: 'Казань', points: 2100 },
  { name: 'Софья М.', city: 'Москва', points: 1800 },
  { name: 'Тимур А.', city: 'Новосибирск', points: 1500 },
  { name: 'Елена К.', city: 'Самара', points: 1200 },
  { name: 'Руслан Б.', city: 'Минск', points: 900 },
  { name: 'Ольга Д.', city: 'Тверь', points: 600 },
]

export const useGameStore = defineStore('game', {
  state: () => ({
    ...load(),
    toasts: [],
  }),

  getters: {
    caseById: () => (id) => cases.find((c) => c.id === id) || null,

    solvedCount: (s) => Object.values(s.progress).filter((p) => p.solved).length,

    totalPoints: (s) => Object.values(s.progress).reduce((sum, p) => sum + (p.earnedPoints || 0), 0),

    totalQuestions: () => cases.reduce((n, c) => n + c.questions.length, 0),

    correctCount: (s) => Object.values(s.progress).reduce((n, p) => n + (p.correctAnswers || 0), 0),

    accuracy: (s) => {
      const attempts = Object.values(s.progress).reduce((n, p) => n + (p.answeredQuestions || 0), 0)
      if (!attempts) return 0
      const correct = Object.values(s.progress).reduce((n, p) => n + (p.correctAnswers || 0), 0)
      return Math.round((correct / attempts) * 100)
    },

    level() {
      const pts = this.totalPoints
      if (pts >= 1500) return { name: 'Врач', next: null }
      if (pts >= 800) return { name: 'Ординатор', next: 1500 }
      if (pts >= 300) return { name: 'Интерн', next: 800 }
      return { name: 'Студент', next: 300 }
    },

    leaderboard() {
      const me = { name: 'Вы', city: '—', points: this.totalPoints, me: true }
      return [...LEADERS, me].sort((a, b) => b.points - a.points)
    },

    pointsBySpecialty: (s) => {
      const map = {}
      for (const c of cases) {
        const p = s.progress[c.id]
        if (p?.earnedPoints) {
          map[c.specialty] = (map[c.specialty] || 0) + p.earnedPoints
        }
      }
      return map
    },
  },

  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress: this.progress, history: this.history }))
    },

    /**
     * Фиксация ответа на вопрос кейса.
     * correct — верно ли с первой попытки; points — полные баллы кейса (делятся между вопросами).
     */
    submitAnswer(caseId, questionIndex, isCorrect, casePoints, totalQuestions) {
      const perQuestion = Math.round(casePoints / totalQuestions)
      const p = this.progress[caseId] || { answeredQuestions: 0, correctAnswers: 0, earnedPoints: 0, solved: false }
      p.answeredQuestions += 1
      if (isCorrect) {
        p.correctAnswers += 1
        p.earnedPoints += perQuestion
      }
      this.progress[caseId] = p
      this.persist()
      return p
    },

    finishCase(caseId, totalQuestionsInCase) {
      const p = this.progress[caseId]
      if (p && p.answeredQuestions >= totalQuestionsInCase) {
        p.solved = true
        this.history.unshift({ caseId, finishedAt: new Date().toISOString() })
        this.persist()
      }
    },

    resetProgress() {
      this.progress = {}
      this.history = []
      this.persist()
    },

    pushToast(text, tone = 'info') {
      const id = `t-${Date.now()}-${Math.random()}`
      this.toasts.push({ id, text, tone })
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id)
      }, 4200)
    },
  },
})
