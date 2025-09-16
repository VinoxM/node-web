import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/calendar'
    },
    {
      path: '/calendar',
      component: () => import('../components/AnimeCalendar.vue')
    },
    {
      path: '/404',
      component: () => import('../components/NotFound.vue')
    },
    {
      path: '/*',
      redirect: '/404'
    }
  ],
})

export default router
