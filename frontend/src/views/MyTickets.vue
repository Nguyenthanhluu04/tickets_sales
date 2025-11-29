<template>
  <app-layout>
    <div class="w-full min-h-screen bg-gray-50">
      <!-- Header Section -->
      <div class="bg-gradient-to-br from-indigo-600 to-purple-700 py-12 px-8 text-white text-center">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-5xl font-extrabold mb-2">Vé của tôi</h1>
          <p class="text-xl opacity-95">Quản lý và xem các vé NFT của bạn</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto -mt-8 px-8 pb-16">
        <!-- Wallet Alert -->
        <div v-if="!walletStore.isConnected" class="mb-8 p-6 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-yellow-800 text-lg mb-1">Chưa kết nối ví</h3>
              <p class="text-yellow-700">Vui lòng kết nối ví để xem vé của bạn</p>
            </div>
            <button 
              @click="connectWallet"
              class="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
            >
              Kết nối ví
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        </div>

        <!-- Tickets Grid -->
        <div v-else-if="tickets.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <div 
            v-for="ticket in tickets" 
            :key="ticket._id"
            class="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col"
          >
            <div class="relative h-52 overflow-hidden">
              <img 
                :src="ticket.event?.imageUrl || getDefaultImage(ticket.event?.category)" 
                :alt="ticket.event?.name"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div class="absolute top-4 right-4">
                <span :class="[
                  'inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold text-base',
                  ticket.isUsed ? 'bg-gray-500' : 'bg-green-500'
                ]">
                  <font-awesome-icon :icon="ticket.isUsed ? 'ban' : 'circle-check'" />
                  {{ ticket.isUsed ? 'Đã sử dụng' : 'Hợp lệ' }}
                </span>
              </div>
            </div>

            <div class="p-6 flex-1 flex flex-col">
              <div class="flex justify-between items-start mb-4 gap-4">
                <h3 class="text-2xl font-bold text-gray-900 leading-tight flex-1">{{ ticket.event?.name || 'Sự kiện' }}</h3>
                <span class="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium flex-shrink-0">
                  {{ ticket.ticketTypeName || 'VIP' }}
                </span>
              </div>

              <div class="flex flex-col gap-4 mb-6 p-5 bg-gray-50 rounded-xl flex-1">
                <div v-if="ticket.ticketNumber" class="flex justify-between items-center">
                  <span class="flex items-center gap-2 text-gray-600">
                    <font-awesome-icon icon="hashtag" />
                    Số vé
                  </span>
                  <span class="font-semibold text-gray-900">{{ ticket.ticketNumber }}/{{ ticket.totalTickets }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="flex items-center gap-2 text-gray-600">
                    <font-awesome-icon icon="calendar" />
                    Ngày diễn ra
                  </span>
                  <span class="font-semibold text-gray-900 text-right">{{ formatDate(ticket.event?.startTime) }}</span>
                </div>
                
                <div class="flex justify-between items-center">
                  <span class="flex items-center gap-2 text-gray-600">
                    <font-awesome-icon icon="location-dot" />
                    Địa điểm
                  </span>
                  <span class="font-semibold text-gray-900 text-right">{{ ticket.event?.location || 'Sẽ thông báo sau' }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="flex items-center gap-2 text-gray-600 ">
                    <font-awesome-icon icon="ticket" />
                    Mã vé
                  </span>
                  <span class="font-semibold text-gray-900 w-52 line-clamp-2 font-mono text-sm">{{ ticket.tokenId }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="flex items-center gap-2 text-gray-600">
                    <font-awesome-icon icon="money-bill" />
                    Giá vé
                  </span>
                  <span class="font-semibold text-gray-900">{{ formatPrice(ticket.price) }} MATIC</span>
                </div>
              </div>

              <div class="mt-auto">
                <button 
                  v-if="!ticket.isUsed"
                  @click="showQRCode(ticket)" 
                  class="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <font-awesome-icon icon="qrcode" />
                  Hiển thị QR Code
                </button>
                <button 
                  v-else
                  disabled
                  class="w-full px-6 py-3 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <font-awesome-icon icon="ban" />
                  Vé đã được sử dụng
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16 bg-white rounded-2xl shadow-lg mt-8">
          <div class="mb-4">
            <font-awesome-icon icon="ticket" class="text-6xl opacity-50" />
          </div>
          <h3 class="text-2xl font-semibold mb-2 text-gray-800">Chưa có vé nào</h3>
          <p class="text-gray-600 mb-6">Bạn chưa mua vé nào. Hãy khám phá các sự kiện thú vị!</p>
          <button 
            @click="$router.push('/events')"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <font-awesome-icon icon="ticket" />
            Khám phá sự kiện
          </button>
        </div>
      </div>

      <!-- QR Code Modal -->
      <div v-if="showModal" @click.self="showModal = false" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">QR Code Vé</h2>
            <button 
              @click="showModal = false"
              class="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div v-if="selectedTicket" class="text-center space-y-6">
            <div class="flex justify-center p-8 bg-white rounded-xl">
              <img :src="selectedTicket.qrCode" alt="QR Code" class="w-72 h-72 object-contain" />
            </div>
            <div>
              <div class="font-bold text-xl text-gray-900 mb-1">{{ selectedTicket.event?.name }}</div>
              <div class="text-gray-600 mb-4">{{ selectedTicket.ticketTypeName }}</div>
              <p class="text-gray-500 text-sm">
                Vui lòng xuất trình mã QR này tại cổng vào sự kiện
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'
import { useTicketsStore } from '@/stores/tickets'
import { format } from 'date-fns'
import { ethers } from 'ethers'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const walletStore = useWalletStore()
const userStore = useUserStore()
const ticketsStore = useTicketsStore()

const loading = ref(false)
const tickets = ref([])
const showModal = ref(false)
const selectedTicket = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return 'TBA'
  try {
    return format(new Date(dateString), 'dd/MM/yyyy • HH:mm')
  } catch {
    return 'TBA'
  }
}

const formatPrice = (price) => {
  try {
    return parseFloat(ethers.formatEther(price)).toFixed(4)
  } catch {
    return '0.0000'
  }
}

const getDefaultImage = (category) => {
  const images = {
    'Music': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    'Technology': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'Art': 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
  }
  return images[category] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
}

const handleImageError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
}

const connectWallet = async () => {
  try {
    await walletStore.connectWallet()
    window.$message?.success('Đã kết nối ví!')
    loadTickets()
  } catch (err) {
    window.$message?.error('Kết nối ví thất bại: ' + err.message)
  }
}

const showQRCode = (ticket) => {
  selectedTicket.value = ticket
  showModal.value = true
}

const loadTickets = async () => {
  if (!walletStore.isConnected) return
  
  loading.value = true
  try {
    if (!userStore.isAuthenticated) {
      console.log('Auto-login for tickets...')
      await userStore.walletLogin()
    }
    
    const result = await ticketsStore.fetchMyTickets()
    tickets.value = result.data || []
    console.log('Loaded tickets:', tickets.value.length)
  } catch (error) {
    console.error('Failed to load tickets:', error)
    window.$message?.error('Không thể tải danh sách vé: ' + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadTickets()
})
</script>

<style scoped>
/* Tailwind CSS handles all styling */
</style>
