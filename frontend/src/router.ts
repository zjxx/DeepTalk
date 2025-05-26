import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Profile from './views/Profile.vue'
// 你可以后续添加Profile等页面

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
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  // { path: '/profile', component: () => import('./views/Profile.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加导航守卫来调试路由问题
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', { to, from })
  
  // 检查是否需要登录权限
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      // 如果没有token，重定向到登录页
      next('/login')
      return
    }
  }
  
  next()
})

export default router 