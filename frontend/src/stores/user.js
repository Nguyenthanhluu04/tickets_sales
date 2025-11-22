import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWalletStore } from './wallet'
import axios from 'axios'
import { API_URL } from '@/utils/constants'

const api = axios.create({
  baseURL: API_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || '')
  const isAuthenticated = ref(!!localStorage.getItem('authToken'))

  // Auto-load user if token exists (run in background, don't block UI)
  if (token.value && !user.value) {
    fetchUser().catch(err => {
      console.error('Auto-fetch user failed:', err)
      // Clear invalid token
      token.value = ''
      isAuthenticated.value = false
      localStorage.removeItem('authToken')
    })
  }

  async function register(userData) {
    // For email/password registration, we just need wallet connection
    // The actual registration happens on first wallet login
    const walletStore = useWalletStore()
    
    if (!walletStore.isConnected) {
      throw new Error('Vui lòng kết nối ví để đăng ký')
    }

    // User data like name/email can be updated later via profile
    return { success: true, message: 'Vui lòng đăng nhập bằng ví' }
  }

  async function login(email, password) {
    // For now, redirect to wallet login
    // In production, you might want to link email to wallet address
    const walletStore = useWalletStore()
    
    if (!walletStore.isConnected) {
      throw new Error('Vui lòng kết nối ví để đăng nhập')
    }

    return walletLogin()
  }

  async function walletLogin() {
    const walletStore = useWalletStore()
    
    if (!walletStore.isConnected) {
      throw new Error('Ví chưa được kết nối')
    }

    try {
      // Get nonce
      const { data: nonceData } = await api.get(`/auth/nonce/${walletStore.address}`)
      const message = nonceData.data.message

      // Sign message
      const signature = await walletStore.signMessage(message)

      // Login
      const { data: loginData } = await api.post('/auth/login', {
        walletAddress: walletStore.address,
        signature,
      })

      if (loginData.success) {
        token.value = loginData.data.token
        user.value = loginData.data.user
        isAuthenticated.value = true

        localStorage.setItem('authToken', token.value)
        
        return loginData.data
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function logout() {
    user.value = null
    token.value = ''
    isAuthenticated.value = false
    localStorage.removeItem('authToken')
    
    const walletStore = useWalletStore()
    await walletStore.disconnectWallet()
  }

  async function fetchUser() {
    try {
      const { data } = await api.get('/auth/me')
      if (data.success) {
        user.value = data.data
        isAuthenticated.value = true
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      await logout()
    }
  }

  async function updateProfile(profileData) {
    try {
      const { data } = await api.put(`/users/${user.value.walletAddress}`, profileData)
      if (data.success) {
        user.value = data.data
        return data.data
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    walletLogin,
    logout,
    fetchUser,
    updateProfile,
  }
})

// Export api instance for use in other modules
export { api }
