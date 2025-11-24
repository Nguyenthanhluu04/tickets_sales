<template>
  <app-layout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage your account</p>
      </div>

      <!-- Warning Alert -->
      <div v-if="!walletStore.isConnected" class="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700 dark:text-yellow-300">
              Please connect your wallet to view your profile
            </p>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else class="space-y-6">
        <!-- Wallet Information Card -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Wallet Information</h2>
          </div>
          <div class="px-6 py-4">
            <dl class="space-y-4">
              <div class="flex justify-between items-start">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                <dd class="text-sm text-gray-900 dark:text-white font-mono break-all ml-4 text-right">
                  {{ walletStore.address }}
                </dd>
              </div>
              <div class="flex justify-between items-start">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Network</dt>
                <dd class="text-sm text-gray-900 dark:text-white ml-4 text-right">
                  Chain ID: {{ walletStore.chainId }}
                </dd>
              </div>
              <div class="flex justify-between items-start">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Balance</dt>
                <dd class="text-sm text-gray-900 dark:text-white font-semibold ml-4 text-right">
                  {{ balance }} MATIC
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Statistics Card -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Statistics</h2>
          </div>
          <div class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {{ stats.ticketsOwned }}
                </div>
                <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Tickets Owned
                </div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600 dark:text-green-400">
                  {{ stats.eventsAttended }}
                </div>
                <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Events Attended
                </div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {{ stats.totalSpent }}
                </div>
                <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Total Spent (MATIC)
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Card -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Actions</h2>
          </div>
          <div class="px-6 py-4">
            <div class="flex flex-wrap gap-4">
              <button 
                @click="walletStore.disconnectWallet"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Disconnect Wallet
              </button>
              <button 
                @click="$router.push('/tickets')"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                View My Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
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
/* Tailwind CSS handles all styling */
</style>
