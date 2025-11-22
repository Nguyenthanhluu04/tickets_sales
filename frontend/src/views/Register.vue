<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <font-awesome-icon icon="user-plus" class="wallet-icon" />
        <h1>Đăng Ký</h1>
        <p>Kết nối ví MetaMask để tạo tài khoản</p>
      </div>

      <n-space vertical size="large">
        <n-alert type="info">
          <template #icon>
            <font-awesome-icon icon="info-circle" />
          </template>
          Hệ thống sử dụng ví MetaMask làm phương thức đăng nhập an toàn. Tài khoản của bạn sẽ được tạo tự động khi bạn kết nối ví lần đầu.
        </n-alert>

        <n-button
          v-if="!walletStore.isConnected"
          type="primary"
          block
          size="large"
          :loading="loading"
          @click="connectWallet"
          strong
        >
          <template #icon>
            <font-awesome-icon icon="wallet" />
          </template>
          Kết nối ví MetaMask
        </n-button>

        <div v-else>
          <n-alert type="success" style="margin-bottom: 1rem;">
            <template #icon>
              <font-awesome-icon icon="check-circle" />
            </template>
            Ví đã kết nối: {{ formatAddress(walletStore.address) }}
          </n-alert>

          <n-button
            type="success"
            block
            size="large"
            @click="goToLogin"
            strong
          >
            <template #icon>
              <font-awesome-icon icon="sign-in-alt" />
            </template>
            Tiếp tục đăng nhập
          </n-button>
        </div>

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

        <div class="auth-footer">
          <n-text depth="3">Đã có tài khoản?</n-text>
          <n-button text type="primary" @click="$router.push('/login')">
            Đăng nhập ngay
          </n-button>
        </div>
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
import { useWalletStore } from '@/stores/wallet'
import { useMessage } from 'naive-ui'

const router = useRouter()
const walletStore = useWalletStore()
const message = useMessage()

const loading = ref(false)

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const connectWallet = async () => {
  loading.value = true
  try {
    await walletStore.connectWallet()
    message.success('Kết nối ví thành công! Vui lòng đăng nhập để tiếp tục.')
  } catch (error) {
    console.error('Connection error:', error)
    message.error('Không thể kết nối ví: ' + (error.message || 'Vui lòng thử lại'))
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
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

.auth-footer {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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
