import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0, behavior: 'instant' }),
  routes: [
    { path: '/', name: 'overview', component: () => import('../views/OverviewView.vue') },
    { path: '/paises', name: 'paises', component: () => import('../views/PaisesView.vue') },
    {
      path: '/paises/:id',
      name: 'pais-detalhe',
      component: () => import('../views/PaisDetalheView.vue'),
    },
    {
      path: '/milestones',
      name: 'milestones',
      component: () => import('../views/MilestonesView.vue'),
    },
    {
      path: '/desembolsos',
      name: 'desembolsos',
      component: () => import('../views/DesembolsosView.vue'),
    },
    {
      path: '/indicadores',
      name: 'indicadores',
      component: () => import('../views/IndicadoresView.vue'),
    },
    {
      path: '/cronologia',
      name: 'cronologia',
      component: () => import('../views/CronologiaView.vue'),
    },
    {
      path: '/comparacao',
      name: 'comparacao',
      component: () => import('../views/ComparacaoView.vue'),
    },
  ],
})

export default router
