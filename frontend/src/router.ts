import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
// 你可以后续添加Register和Profile等页面

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  // { path: '/register', component: () => import('./views/Register.vue') },
  // { path: '/profile', component: () => import('./views/Profile.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加导航守卫来调试路由问题
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', { to, from })
  next()
})

export default router 