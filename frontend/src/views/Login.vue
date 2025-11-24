<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <font-awesome-icon icon="wallet" class="text-3xl text-indigo-600" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Đăng Nhập</h1>
        <p class="mt-2 text-sm text-gray-600">Kết nối ví MetaMask để tiếp tục</p>
      </div>

      <!-- Alert -->
      <div v-if="!walletStore.isConnected" class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <font-awesome-icon icon="info-circle" class="h-5 w-5 text-blue-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-blue-700">
              Vui lòng kết nối ví MetaMask của bạn để đăng nhập vào hệ thống.
            </p>
          </div>
        </div>
      </div>

      <!-- Connect Button -->
      <div class="space-y-4">
        <button
          v-if="!walletStore.isConnected"
          @click="connectAndLogin"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <font-awesome-icon icon="wallet" class="text-xl" />
          <span v-if="!loading">Kết nối ví MetaMask</span>
          <span v-else class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang kết nối...
          </span>
        </button>

        <button
          v-else
          @click="handleWalletLogin"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <font-awesome-icon icon="check-circle" class="text-xl" />
          <span v-if="!loading">Đăng nhập với {{ formatAddress(walletStore.address) }}</span>
          <span v-else class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang đăng nhập...
          </span>
        </button>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">hoặc</span>
          </div>
        </div>

        <!-- Download MetaMask -->
        <div class="text-center text-sm text-gray-600 mb-4">
          Chưa có ví MetaMask?
        </div>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          class="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium rounded-lg transition-all duration-200"
        >
          <font-awesome-icon icon="download" />
          Tải MetaMask miễn phí
        </a>

        <!-- Back to Home -->
        <div class="mt-8 text-center">
          <button
            @click="$router.push('/')"
            class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
          >
            <font-awesome-icon icon="arrow-left" />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'

const router = useRouter()
const userStore = useUserStore()
const walletStore = useWalletStore()

const loading = ref(false)

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const connectAndLogin = async () => {
  loading.value = true
  try {
    await walletStore.connectWallet()
    await handleWalletLogin()
  } catch (error) {
    console.error('Connection error:', error)
    window.$message?.error('Không thể kết nối ví: ' + (error.message || 'Vui lòng thử lại'))
  } finally {
    loading.value = false
  }
}

const handleWalletLogin = async () => {
  loading.value = true
  try {
    await userStore.walletLogin()
    window.$message?.success('Đăng nhập thành công!')
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
    window.$message?.error('Đăng nhập thất bại: ' + (error.message || 'Vui lòng thử lại'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Tailwind CSS handles all styling */
</style>
