<template>
  <n-layout>
    <n-layout-header bordered style="padding: 0 2rem; height: 64px; display: flex; align-items: center;">
      <n-space justify="space-between" style="width: 100%;">
        <n-space align="center">
          <h2 style="margin: 0; cursor: pointer;" @click="$router.push('/')">
            <font-awesome-icon icon="ticket" /> Vé NFT
          </h2>
          <n-menu
            mode="horizontal"
            :options="menuOptions"
            :value="activeKey"
            @update:value="handleMenuSelect"
          />
        </n-space>
        
        <n-space>
          <!-- User Info when authenticated -->
          <n-popover v-if="userStore.isAuthenticated && walletStore.isConnected" trigger="hover">
            <template #trigger>
              <n-tag type="success" size="large" style="cursor: pointer;">
                <template #icon>
                  <font-awesome-icon icon="user-circle" />
                </template>
                {{ formatAddress(walletStore.address) }}
              </n-tag>
            </template>
            <n-space vertical size="small">
              <n-text strong>Tài khoản</n-text>
              <n-text depth="3">Địa chỉ ví: {{ walletStore.address }}</n-text>
              <n-text depth="3">Chain ID: {{ walletStore.chainId }}</n-text>
              <n-text depth="3">Mạng: {{ getNetworkName(walletStore.chainId) }}</n-text>
              <n-text v-if="userStore.user?.role" depth="3">Vai trò: {{ userStore.user.role }}</n-text>
              <n-button size="small" type="error" @click="handleDisconnect">
                Ngắt kết nối
              </n-button>
            </n-space>
          </n-popover>
          
          <!-- Wallet Info only (not authenticated yet) -->
          <n-popover v-else-if="walletStore.isConnected && !userStore.isAuthenticated" trigger="hover">
            <template #trigger>
              <n-tag type="warning" size="large" style="cursor: pointer;">
                <template #icon>
                  <font-awesome-icon icon="wallet" />
                </template>
                {{ formatAddress(walletStore.address) }}
              </n-tag>
            </template>
            <n-space vertical size="small">
              <n-text strong>Ví đã kết nối</n-text>
              <n-text depth="3">Đang đăng nhập...</n-text>
              <n-button size="small" type="primary" @click="handleLogin">
                Đăng nhập
              </n-button>
              <n-button size="small" type="error" @click="handleDisconnect">
                Ngắt kết nối
              </n-button>
            </n-space>
          </n-popover>
          
          <!-- Not connected -->
          <n-button v-else type="success" @click="connectWallet" size="large">
            <template #icon>
              <font-awesome-icon icon="wallet" />
            </template>
            Kết nối ví
          </n-button>
          
          <!-- User Menu for admin -->
          <n-dropdown v-if="userStore.user?.role === 'admin'" :options="adminMenuOptions" @select="handleUserMenuSelect">
            <n-button circle type="primary">
              <template #icon>
                <font-awesome-icon icon="gear" />
              </template>
            </n-button>
          </n-dropdown>
        </n-space>
      </n-space>
    </n-layout-header>

    <n-layout-content style="min-height: calc(100vh - 64px); padding: 2rem;">
      <slot />
    </n-layout-content>
  </n-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'
import { useMessage } from 'naive-ui'

const router = useRouter()
const route = useRoute()
const walletStore = useWalletStore()
const userStore = useUserStore()
const message = useMessage()

const menuOptions = [
  { label: 'Trang chủ', key: '/' },
  { label: 'Sự kiện', key: '/events' },
  { label: 'Vé của tôi', key: '/my-tickets' },
  { label: 'Hồ sơ', key: '/profile' },
]

const adminMenuOptions = [
  { label: 'Bảng điều khiển', key: 'admin-dashboard' },
  { label: 'Quản lý sự kiện', key: 'admin-events' },
  { label: 'Đăng xuất', key: 'logout' },
]

const activeKey = computed(() => route.path)

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getNetworkName = (chainId) => {
  const networks = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    80002: 'Polygon Amoy Testnet',
    137: 'Polygon Mainnet',
  }
  return networks[chainId] || `Chain ID: ${chainId}`
}

const handleMenuSelect = (key) => {
  router.push(key)
}

const handleUserMenuSelect = (key) => {
  if (key === 'logout') {
    handleDisconnect()
  } else if (key === 'admin-dashboard') {
    router.push('/admin/dashboard')
  } else if (key === 'admin-events') {
    router.push('/admin/events')
  }
}

const connectWallet = async () => {
  try {
    await walletStore.connectWallet()
    message.success('Kết nối ví thành công!')
    
    // Auto-login after connecting wallet
    await handleLogin()
  } catch (err) {
    message.error('Kết nối ví thất bại: ' + err.message)
  }
}

const handleLogin = async () => {
  try {
    if (!walletStore.isConnected) {
      throw new Error('Ví chưa kết nối')
    }
    
    await userStore.walletLogin()
    message.success('Đăng nhập thành công!')
  } catch (err) {
    console.error('Login error:', err)
    message.error('Đăng nhập thất bại: ' + err.message)
  }
}

const handleDisconnect = async () => {
  try {
    await userStore.logout()
    await walletStore.disconnectWallet()
    message.success('Đã ngắt kết nối')
    router.push('/')
  } catch (err) {
    message.error('Lỗi: ' + err.message)
  }
}
</script>

<style scoped>
:deep(.n-layout-header) {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
