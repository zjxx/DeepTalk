import { ref } from 'vue'

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
})

export function useSnackbar() {
  const showSuccess = (message: string) => {
    snackbar.value = {
      show: true,
      text: message,
      color: 'success',
      timeout: 3000
    }
  }

  const showError = (message: string) => {
    snackbar.value = {
      show: true,
      text: message,
      color: 'error',
      timeout: 3000
    }
  }

  return {
    snackbar,
    showSuccess,
    showError
  }
} 