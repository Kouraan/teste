import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0, behavior: 'instant' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/country/:country',
      name: 'country-dashboard',
      component: () => import('../views/CountryDashboardView.vue')
    },
    {
      path: '/milestones',
      name: 'milestones',
      component: () => import('../views/MilestonesView.vue')
    },
    {
      path: '/disbursements',
      name: 'disbursements',
      component: () => import('../views/DisbursementsView.vue')
    },
    {
      path: '/common-indicators',
      name: 'common-indicators',
      component: () => import('../views/CommonIndicatorsView.vue')
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: () => import('../views/TimelineView.vue')
    },
    {
      path: '/pillar/:id',
      name: 'pillar-detail',
      component: () => import('../views/PillarDetailView.vue')
    }
  ]
})

export default router
