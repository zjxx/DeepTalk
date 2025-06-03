import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Profile from './views/Profile.vue'
import ForgotPassword from './views/ForgotPassword.vue'
import Versus from './views/Versus.vue'
import Home from './views/Home.vue'
// 你可以后续添加Profile等页面

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/live2d',
    name: 'Live2D',
    component: Versus,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  // { path: '/profile', component: () => import('./views/Profile.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 添加导航守卫来调试路由问题
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', { to, from })
  const token = localStorage.getItem('token')

  // 如果页面需要认证
  if (to.meta.requiresAuth) {
    // 没有token则跳转到登录页
    if (!token) {
      next('/login')
      return
    }
  }

  // 如果已登录用户访问登录/注册页面，重定向到首页
  if (token && (to.path === '/login' || to.path === '/register')) {
    next('/home')
    return
  }

  next()
})

export default router
