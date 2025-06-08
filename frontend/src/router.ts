import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Profile from './views/Profile.vue'
import ForgotPassword from './views/ForgotPassword.vue'
import Versus from './views/Versus.vue'
import Community from './views/Community.vue'
import Home from './views/Home.vue'
import WebSocketDemo from './views/WebSocketDemo.vue'
import SecuritySettings from './views/SecuritySettings.vue'
import Evaluation from './views/Evaluation.vue'
import Matching from './views/Matching.vue'
import PostDetail from './views/PostDetail.vue'
import Shop from './views/Shop.vue'
import ShopLive2dView from './views/ShopLive2dView.vue'
import MyRepositories from './views/MyRepositories.vue'
import RepositoriesLive2dView from './views/RepositoriesLive2dView.vue'
import PostAdding from './views/PostAdding.vue'

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
  path: '/post/create',
  name: 'PostAdding',
  component: PostAdding,
  meta: { requiresAuth: true }
  },
  {
    path: '/shop',
    name: 'Shop',
    component: Shop,
    meta: { requiresAuth: true }
  },
  {
    path: '/shop/live2d/:id',
    name: 'ShopLive2dView',
    component: ShopLive2dView,
    meta: { requiresAuth: true }
  },
  {
    path: '/versus',
    name: 'Versus',
    component: Versus,
    meta: { requiresAuth: true }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/testws',
    name: 'ws',
    component: WebSocketDemo,
    meta: { requiresAuth: false }
  },
  {
    path: '/security',
    name: 'SecuritySettings',
    component: SecuritySettings,
    meta: { requiresAuth: true }
  },
  {
    path: '/matching',
    name: 'Matching',
    component: Matching,
    meta: { requiresAuth: true }
  },
  {
    path: '/evaluation',
    name: 'Evaluation',
    component: Evaluation,
    meta: { requiresAuth: true }
  },
  {
    path: '/repositories',
    name: 'MyRepositories',
    component: MyRepositories,
    meta: { requiresAuth: true }
  },
  {
    path: '/repositories/live2d/:id',
    name: 'RepositoriesLive2dView',
    component: RepositoriesLive2dView,
    meta: { requiresAuth: true }
  },
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
