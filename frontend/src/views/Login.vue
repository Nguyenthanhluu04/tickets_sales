<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <font-awesome-icon icon="wallet" class="wallet-icon" />
        <h1>Đăng Nhập</h1>
        <p>Kết nối ví MetaMask để tiếp tục</p>
      </div>

      <n-space vertical size="large">
        <n-alert v-if="!walletStore.isConnected" type="info">
          <template #icon>
            <font-awesome-icon icon="info-circle" />
          </template>
          Vui lòng kết nối ví MetaMask của bạn để đăng nhập vào hệ thống.
        </n-alert>

        <n-button
          v-if="!walletStore.isConnected"
          type="primary"
          block
          size="large"
          :loading="loading"
          @click="connectAndLogin"
          strong
        >
          <template #icon>
            <font-awesome-icon icon="wallet" />
          </template>
          Kết nối ví MetaMask
        </n-button>

        <n-button
          v-else
          type="success"
          block
          size="large"
          :loading="loading"
          @click="handleWalletLogin"
          strong
        >
          <template #icon>
            <font-awesome-icon icon="check-circle" />
          </template>
          Đăng nhập với {{ formatAddress(walletStore.address) }}
        </n-button>

        <n-divider />

        <n-text depth="3" style="text-align: center; display: block;">
          Chưa có ví MetaMask?
        </n-text>
        <n-button
          text
          type="primary"
          block
          tag="a"
          href="https://metamask.io/download/"
          target="_blank"
        >
          <template #icon>
            <font-awesome-icon icon="download" />
          </template>
          Tải MetaMask miễn phí
        </n-button>
      </n-space>

      <n-space justify="center" style="margin-top: 2rem;">
        <n-button text @click="$router.push('/')">
          <font-awesome-icon icon="arrow-left" /> Về trang chủ
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { useMessage } from 'naive-ui'

const router = useRouter()
const userStore = useUserStore()
const walletStore = useWalletStore()
const message = useMessage()

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
    message.error('Không thể kết nối ví: ' + (error.message || 'Vui lòng thử lại'))
  } finally {
    loading.value = false
  }
}

const handleWalletLogin = async () => {
  loading.value = true
  try {
    await userStore.walletLogin()
    message.success('Đăng nhập thành công!')
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
    message.error('Đăng nhập thất bại: ' + (error.message || 'Vui lòng thử lại'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.wallet-icon {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.auth-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.auth-header p {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

@media (max-width: 576px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }

  .auth-header h1 {
    font-size: 1.5rem;
  }
}
</style>
