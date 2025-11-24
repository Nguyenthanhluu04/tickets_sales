<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
        <div class="text-center mb-8">
          <div class="inline-block p-4 bg-indigo-100 rounded-full mb-4">
            <font-awesome-icon icon="user-plus" class="text-5xl text-indigo-600" />
          </div>
          <h1 class="text-3xl font-extrabold text-gray-900 mb-2">Đăng Ký</h1>
          <p class="text-gray-600">Kết nối ví MetaMask để tạo tài khoản</p>
        </div>

        <div class="space-y-6">
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex gap-3">
              <div class="flex-shrink-0">
                <font-awesome-icon icon="info-circle" class="text-blue-600 text-xl" />
              </div>
              <div class="text-sm text-blue-800">
                Hệ thống sử dụng ví MetaMask làm phương thức đăng nhập an toàn. Tài khoản của bạn sẽ được tạo tự động khi bạn kết nối ví lần đầu.
              </div>
            </div>
          </div>

          <div v-if="!walletStore.isConnected">
            <button
              @click="connectWallet"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg transition-colors text-lg"
            >
              <div v-if="loading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <font-awesome-icon v-else icon="wallet" />
              Kết nối ví MetaMask
            </button>
          </div>

          <div v-else class="space-y-4">
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex gap-3">
                <div class="flex-shrink-0">
                  <font-awesome-icon icon="check-circle" class="text-green-600 text-xl" />
                </div>
                <div>
                  <div class="text-sm font-semibold text-green-800 mb-1">Ví đã kết nối</div>
                  <div class="text-xs text-green-700 font-mono">{{ formatAddress(walletStore.address) }}</div>
                </div>
              </div>
            </div>

            <button
              @click="goToLogin"
              class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              <font-awesome-icon icon="sign-in-alt" />
              Tiếp tục đăng nhập
            </button>
          </div>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Chưa có ví MetaMask?</span>
            </div>
          </div>

          <a
            href="https://metamask.io/download/"
            target="_blank"
            class="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-600 text-gray-700 font-medium rounded-lg transition-colors"
          >
            <font-awesome-icon icon="download" />
            Tải MetaMask miễn phí
          </a>

          <div class="text-center pt-4 border-t border-gray-200">
            <span class="text-gray-600">Đã có tài khoản? </span>
            <button 
              @click="$router.push('/login')"
              class="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>

        <div class="mt-8 text-center">
          <button 
            @click="$router.push('/')"
            class="text-gray-600 hover:text-gray-800 inline-flex items-center gap-2"
          >
            <font-awesome-icon icon="arrow-left" /> Về trang chủ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'

const router = useRouter()
const walletStore = useWalletStore()

const loading = ref(false)

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const connectWallet = async () => {
  loading.value = true
  try {
    await walletStore.connectWallet()
    window.$message?.success('Kết nối ví thành công! Vui lòng đăng nhập để tiếp tục.')
  } catch (error) {
    console.error('Connection error:', error)
    window.$message?.error('Không thể kết nối ví: ' + (error.message || 'Vui lòng thử lại'))
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
/* Tailwind CSS handles all styling */
</style>
