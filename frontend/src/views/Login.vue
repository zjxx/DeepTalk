<template>
  <div class="login-container">
    <h2>Log In</h2>
    <form @submit.prevent="handleLogin">
      <label>Email Address</label>
      <input v-model="email" type="email" placeholder="Placeholder" required />

      <label>Password</label>
      <input v-model="password" type="password" placeholder="Placeholder" required />
      <small>It must be a combination of minimum 8 letters, numbers, and symbols.</small>

      <div>
        <input type="checkbox" v-model="rememberMe" /> Remember me
        <a href="#" class="forgot">Forgot Password?</a>
      </div>

      <button type="submit">Log In</button>
    </form>
    <div>
      No account yet? <a href="/register">Sign Up</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { login } from '../controllers/userController'
import type { LoginRequest } from '../interface/auth'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const handleLogin = async () => {
  const loginRequest: LoginRequest = {
    email: email.value,
    password: password.value
  }
  await login(loginRequest, rememberMe.value)
}
</script>

<style scoped>
/* 这里可根据你的UI草图自定义样式 */
</style> 