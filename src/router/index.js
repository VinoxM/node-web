import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/torrent/:torrentId',
    //   name: 'home',
    //   component: () => import('../components/WebTorrent.vue')
    // },
    {
      path: '/',
      redirect: '/calendar'
    },
    {
      path: '/calendar',
      component: () => import('../components/AnimeCalender.vue')
    },
    {
      path: '/404',
      component: () => import('../components/404NotFound.vue')
    },
    {
      path: '/*',
      redirect: '/404'
    }
  ],
})

export default router
