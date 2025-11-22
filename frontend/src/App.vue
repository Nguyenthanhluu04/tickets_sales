<template>
  <div id="app">
    <n-config-provider :theme-overrides="themeOverrides">
      <n-message-provider>
        <router-view />
      </n-message-provider>
    </n-config-provider>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'

const themeOverrides = {
  common: {
    primaryColor: '#4F46E5',
    primaryColorHover: '#6366F1',
    primaryColorPressed: '#4338CA',
  },
}

const walletStore = useWalletStore()
const userStore = useUserStore()

// Auto-connect wallet and login on app start
onMounted(async () => {
  try {
    // Auto-connect wallet if was previously connected
    await walletStore.autoConnect()
    
    // If wallet connected, try to auto-login
    if (walletStore.isConnected && !userStore.isAuthenticated) {
      await userStore.walletLogin()
    }
  } catch (error) {
    console.log('Auto-connect/login skipped:', error.message)
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f9fafb;
}

#app {
  min-height: 100vh;
}
</style>
