import { createRouter, createWebHistory } from 'vue-router'
import FoodsView from '@/views/FoodsView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/foods' },
    { path: '/foods', name: 'foods', component: FoodsView },
  ],
})
