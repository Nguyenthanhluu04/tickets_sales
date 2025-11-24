<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="space-y-8">
        <!-- Page Header -->
        <div class="text-center">
          <h1 class="text-4xl font-extrabold text-gray-900 mb-2">Check-In</h1>
          <p class="text-lg text-gray-600">Scan ticket QR codes</p>
        </div>

        <!-- Input Card -->
        <div class="bg-white shadow-lg rounded-2xl p-8">
          <div class="space-y-6">
            <div>
              <input
                v-model="ticketId"
                type="text"
                placeholder="Enter Ticket ID or scan QR code"
                class="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            
            <button 
              @click="checkInTicket" 
              :disabled="loading"
              class="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg transition-colors text-lg flex items-center justify-center gap-2"
            >
              <div v-if="loading" class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span v-else>Check In</span>
            </button>
          </div>
        </div>

        <!-- Ticket Information Card -->
        <div v-if="ticketInfo" class="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div class="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h2 class="text-2xl font-bold">Ticket Information</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <div class="text-sm text-gray-600 font-medium">Ticket ID</div>
                <div class="text-lg font-semibold text-gray-900 font-mono">{{ ticketInfo.tokenId }}</div>
              </div>
              <div class="space-y-2">
                <div class="text-sm text-gray-600 font-medium">Event</div>
                <div class="text-lg font-semibold text-gray-900">{{ ticketInfo.eventName }}</div>
              </div>
              <div class="space-y-2">
                <div class="text-sm text-gray-600 font-medium">Owner</div>
                <div class="text-lg font-semibold text-gray-900 font-mono truncate">{{ ticketInfo.owner }}</div>
              </div>
              <div class="space-y-2">
                <div class="text-sm text-gray-600 font-medium">Status</div>
                <span :class="[
                  'inline-flex items-center px-4 py-2 rounded-full font-semibold text-base',
                  ticketInfo.used ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                ]">
                  {{ ticketInfo.used ? 'Already Used' : 'Valid' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTicketsStore } from '@/stores/tickets'

const ticketsStore = useTicketsStore()
const ticketId = ref('')
const ticketInfo = ref(null)
const loading = ref(false)

const checkInTicket = async () => {
  if (!ticketId.value) {
    window.$message?.warning('Please enter a ticket ID')
    return
  }

  loading.value = true
  try {
    const result = await ticketsStore.checkInTicket(ticketId.value)
    ticketInfo.value = result
    window.$message?.success('Ticket checked in successfully!')
  } catch (error) {
    window.$message?.error('Check-in failed: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Tailwind CSS handles all styling */
</style>
