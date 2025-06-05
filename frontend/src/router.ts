import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Profile from './views/Profile.vue'
import ForgotPassword from './views/ForgotPassword.vue'
import Versus from './views/Versus.vue'
import Community from './views/Community.vue'
import Home from './views/Home.vue'
import PostDetail from './views/PostDetail.vue'
// 你可以后续添加Profile等页面

const routes = [
  {
    path: '/',
    redirect: '/home',
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
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
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
    path: '/community',
    name: 'Community',
    component: Community,
    meta: { requiresAuth: true }
  },
  {
    path: '/versus',
    name: 'Versus',
    component: Versus,
    meta: { requiresAuth: false }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail,
    meta: { requiresAuth: true }
  }
  // { path: '/profile', component: () => import('./views/Profile.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 } // 统一滚动行为
  }
})

// 添加导航守卫来调试路由问题
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', { to, from })
  const localToken = localStorage.getItem('token')
  const sessionToken = sessionStorage.getItem('token')
  const token = localToken || sessionToken

  // 特殊处理根路径
  if (to.path === '/') {
    next('/login')
    return
  }

  // 需要登录的页面且没有token
  if (to.meta.requiresAuth && !token) {
    console.log('需要登录权限，重定向到登录页')
    next('/login')
    return
  }

  next()
})

export default router
