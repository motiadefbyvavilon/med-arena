import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import CasesView from '../views/CasesView.vue'
import CasePlayView from '../views/CasePlayView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView, meta: { title: 'Мой прогресс' } },
    { path: '/cases', name: 'cases', component: CasesView, meta: { title: 'Кейсы' } },
    { path: '/case/:id', name: 'case', component: CasePlayView, meta: { title: 'Кейс' } },
    { path: '/leaderboard', name: 'leaderboard', component: LeaderboardView, meta: { title: 'Рейтинг' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  document.title = `${to.meta.title} — МедАрена`
})
