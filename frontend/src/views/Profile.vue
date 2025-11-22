<template>
  <app-layout>
    <div class="profile">
      <n-space vertical size="large">
      <n-page-header title="Profile" subtitle="Manage your account" />

      <n-alert v-if="!walletStore.isConnected" type="warning">
        Please connect your wallet to view your profile
      </n-alert>

      <template v-else>
        <n-card title="Wallet Information">
          <n-descriptions :column="1">
            <n-descriptions-item label="Address">
              {{ walletStore.address }}
            </n-descriptions-item>
            <n-descriptions-item label="Network">
              Chain ID: {{ walletStore.chainId }}
            </n-descriptions-item>
            <n-descriptions-item label="Balance">
              {{ balance }} MATIC
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <n-card title="Statistics">
          <n-grid :cols="3" :x-gap="12">
            <n-gi>
              <n-statistic label="Tickets Owned" :value="stats.ticketsOwned" />
            </n-gi>
            <n-gi>
              <n-statistic label="Events Attended" :value="stats.eventsAttended" />
            </n-gi>
            <n-gi>
              <n-statistic label="Total Spent" :value="stats.totalSpent" suffix=" MATIC" />
            </n-gi>
          </n-grid>
        </n-card>

        <n-card title="Actions">
          <n-space>
            <n-button @click="walletStore.disconnectWallet">
              Disconnect Wallet
            </n-button>
            <n-button @click="$router.push('/tickets')">
              View My Tickets
            </n-button>
          </n-space>
        </n-card>
      </template>
      </n-space>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'
import { ethers } from 'ethers'
import AppLayout from '@/components/AppLayout.vue'

const walletStore = useWalletStore()
const balance = ref('0')
const stats = ref({
  ticketsOwned: 0,
  eventsAttended: 0,
  totalSpent: 0
})

onMounted(async () => {
  if (walletStore.isConnected) {
    try {
      const userStore = useUserStore()
      // Auto login if not authenticated
      if (!userStore.isAuthenticated) {
        await userStore.walletLogin()
      }
      
      if (walletStore.provider) {
        const bal = await walletStore.provider.getBalance(walletStore.address)
        balance.value = ethers.formatEther(bal)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      window.$message?.error('Không thể tải thông tin: ' + error.message)
    }
  }
})
</script>

<style scoped>
.profile {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 2rem 2rem 2rem;
}

@media (max-width: 768px) {
  .profile {
    padding: 0 1rem 1rem 1rem;
  }
}
</style>
