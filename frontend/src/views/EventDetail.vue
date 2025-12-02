<template>
  <app-layout>
    <div class="w-full min-h-screen bg-gray-50">
      <!-- Loading Spinner -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Event Content -->
      <div v-else-if="event">
        <!-- Event Hero -->
        <div class="relative h-96 overflow-hidden">
          <div class="absolute w-full h-full">
            <img 
              :src="event.imageUrl || getDefaultImage(event.category)" 
              :alt="event.name"
              @error="handleImageError"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"></div>
          
          <div class="relative z-10 max-w-7xl mx-auto px-8 h-full flex flex-col justify-between text-white">
            <button 
              @click="$router.back()"
              class="self-start mt-8 flex items-center gap-2 text-white text-lg hover:opacity-80 transition-opacity"
            >
              <font-awesome-icon icon="arrow-right" rotation="180" class="text-xl" />
              Quay lại danh sách
            </button>
            
            <div class="mb-8">
              <div class="flex gap-3 mb-4">
                <span :class="[
                  'inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-base',
                  event.isActive ? 'bg-green-500' : 'bg-gray-500'
                ]">
                  <font-awesome-icon :icon="event.isActive ? 'circle-check' : 'times'" />
                  {{ event.isActive ? 'Đang diễn ra' : 'Ngừng hoạt động' }}
                </span>
                <span class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur rounded-full font-medium text-base">
                  {{ getCategoryLabel(event.category) }}
                </span>
              </div>
              <h1 class="text-5xl font-extrabold mb-4 drop-shadow-lg">{{ event.name }}</h1>
              <p class="text-xl opacity-95 max-w-3xl">{{ event.description }}</p>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-8 pb-16">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Event Details Card -->
              <div class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 class="text-xl font-semibold flex items-center gap-2">
                    <font-awesome-icon icon="info-circle" /> Thông tin sự kiện
                  </h2>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div class="text-3xl flex-shrink-0"><font-awesome-icon icon="calendar" /></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Ngày bắt đầu</div>
                        <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatDate(event.startTime) }}</div>
                      </div>
                    </div>
                    
                    <div class="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div class="text-3xl flex-shrink-0"><font-awesome-icon icon="clock" /></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Ngày kết thúc</div>
                        <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatDate(event.endTime) }}</div>
                      </div>
                    </div>
                    
                    <div class="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div class="text-3xl flex-shrink-0"><font-awesome-icon icon="location-dot" /></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Địa điểm</div>
                        <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ event.location || 'Sẽ thông báo sau' }}</div>
                      </div>
                    </div>
                    
                    <div class="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div class="text-3xl flex-shrink-0"><font-awesome-icon icon="user" /></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Ban tổ chức</div>
                        <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ event.organizerName || 'Ban tổ chức sự kiện' }}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] mt-1">{{ event.organizer }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div v-if="event.description" class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 class="text-xl font-semibold flex items-center gap-2">
                    <font-awesome-icon icon="info-circle" /> Giới thiệu sự kiện
                  </h2>
                </div>
                <div class="px-6 py-4">
                  <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{{ event.description }}</p>
                </div>
              </div>

              <!-- Tickets Section -->
              <div class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-semibold flex items-center gap-2">
                      <font-awesome-icon icon="ticket" /> Loại vé có sẵn
                    </h2>
                    <span class="text-gray-500 dark:text-gray-400">{{ ticketTypes.length }} loại vé đang bán</span>
                  </div>
                </div>

                <div class="p-6">
                  <!-- Wallet Alert -->
                  <div v-if="!walletStore.isConnected" class="mb-6 p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <div class="flex justify-between items-center">
                      <div>
                        <h3 class="font-semibold text-yellow-800 dark:text-yellow-200">Chưa kết nối ví</h3>
                        <p class="text-yellow-700 dark:text-yellow-300 text-sm">Vui lòng kết nối ví để mua vé</p>
                      </div>
                      <button 
                        @click="connectWallet"
                        class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Kết nối ví
                      </button>
                    </div>
                  </div>

                  <!-- Tickets List -->
                  <div v-if="ticketTypes.length > 0" class="space-y-6">
                    <div 
                      v-for="ticket in ticketTypes" 
                      :key="ticket.tokenId"
                      class="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 transition-all hover:border-indigo-500 hover:shadow-lg"
                    >
                      <div class="mb-6">
                        <div class="flex justify-between items-start mb-3">
                          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ ticket.name }}</h3>
                          <div class="text-right">
                            <div class="text-3xl font-bold text-indigo-600">{{ formatPrice(ticket.price) }}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">MATIC</div>
                          </div>
                        </div>
                        
                        <p class="text-gray-600 dark:text-gray-300 mb-4">{{ ticket.description || 'Vé vào cổng thường' }}</p>
                        
                        <div class="flex flex-wrap gap-6 mb-4">
                          <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <span class="text-lg"><font-awesome-icon icon="ticket" /></span>
                            <span>{{ ticket.maxSupply - ticket.currentSupply }} / {{ ticket.maxSupply }} còn lại</span>
                          </div>
                          <div class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <span class="text-lg"><font-awesome-icon icon="clock" /></span>
                            <span>Kết thúc bán {{ formatSaleEnd(ticket.endSaleTime) }}</span>
                          </div>
                        </div>

                        <!-- Benefits -->
                        <div v-if="ticket.benefits && ticket.benefits.length > 0" class="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div class="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                            <font-awesome-icon icon="star" /> Quyền lợi:
                          </div>
                          <div class="flex flex-wrap gap-2">
                            <span 
                              v-for="(benefit, idx) in ticket.benefits" 
                              :key="idx"
                              class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full"
                            >
                              {{ benefit }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div class="flex items-center gap-2">
                          <button 
                            @click="decrementQuantity(ticket.tokenId)"
                            :disabled="!canPurchase(ticket) || getQuantity(ticket.tokenId) <= 1"
                            class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <font-awesome-icon icon="minus" />
                          </button>
                          <input
                            v-model.number="ticketQuantities[ticket.tokenId]"
                            type="number"
                            :min="1"
                            :max="Math.min(10, ticket.maxSupply - ticket.currentSupply)"
                            :disabled="!canPurchase(ticket)"
                            class="w-20 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
                          />
                          <button 
                            @click="incrementQuantity(ticket.tokenId)"
                            :disabled="!canPurchase(ticket) || getQuantity(ticket.tokenId) >= Math.min(10, ticket.maxSupply - ticket.currentSupply)"
                            class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <font-awesome-icon icon="plus" />
                          </button>
                        </div>

                        <button
                          @click="purchaseTicket(ticket)"
                          :disabled="!canPurchase(ticket) || purchasingTicket === ticket.tokenId"
                          class="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <font-awesome-icon icon="wallet" v-if="purchasingTicket !== ticket.tokenId" />
                          <div v-if="purchasingTicket === ticket.tokenId" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {{ getPurchaseButtonText(ticket) }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- No Tickets -->
                  <div v-else class="text-center py-12">
                    <font-awesome-icon icon="ticket" class="text-6xl text-gray-400 mb-4" />
                    <p class="text-gray-600 dark:text-gray-400">Không có vé cho sự kiện này</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6 pt-[95px] ">
              <!-- Quick Info -->
              <div class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
                <div class="p-6 space-y-4">
                  <div class="flex items-center gap-4">
                    <div class="text-3xl flex-shrink-0"><font-awesome-icon icon="chart-line" /></div>
                    <div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">Vé đã bán</div>
                      <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ event.totalTicketsSold || 0 }}</div>
                    </div>
                  </div>
                  
                  <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div class="flex items-center gap-4">
                      <div class="text-3xl flex-shrink-0"><font-awesome-icon icon="money-bill" /></div>
                      <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Doanh thu</div>
                        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatEther(event.revenue || '0') }} MATIC</div>
                      </div>
                    </div>
                  </div>

                  <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div class="flex items-center gap-4">
                      <div class="text-3xl flex-shrink-0"><font-awesome-icon icon="globe" /></div>
                      <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">Blockchain</div>
                        <div class="text-2xl font-bold text-gray-900 dark:text-white">Polygon Amoy</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Share Card -->
              <!-- <div class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 class="text-xl font-semibold flex items-center gap-2">
                    <font-awesome-icon icon="share" /> Chia sẻ sự kiện
                  </h2>
                </div>
                <div class="p-6 space-y-3">
                  <button class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <font-awesome-icon icon="share" />
                    Chia sẻ lên Twitter
                  </button>
                  <button class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <font-awesome-icon icon="info-circle" />
                    Sao chép liên kết
                  </button>
                </div>
              </div> -->
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16 max-w-2xl mx-auto px-8">
        <div class="mb-4">
          <font-awesome-icon icon="triangle-exclamation" class="text-6xl text-red-500" />
        </div>
        <h2 class="text-3xl font-bold mb-4 text-gray-900">Không tìm thấy sự kiện</h2>
        <p class="text-gray-600 mb-8">{{ error }}</p>
        <button 
          @click="$router.push('/events')"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'
import { useTicketsStore } from '@/stores/tickets'
import { format, formatDistanceToNow } from 'date-fns'
import { ethers } from 'ethers'
import axios from 'axios'
import { EVENT_CATEGORIES, CONTRACT_ADDRESS, IPFS_GATEWAY, API_URL } from '@/utils/constants'
import contractABI from '@/utils/contractABI.json'
import AppLayout from '@/components/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const userStore = useUserStore()
const ticketsStore = useTicketsStore()

const loading = ref(false)
const event = ref(null)
const ticketTypes = ref([])
const error = ref(null)
const purchasingTicket = ref(null)
const ticketQuantities = reactive({})

const canPurchase = (ticket) => {
  if (!event.value?.isActive) return false
  if (!walletStore.isConnected) return false
  if (ticket.currentSupply >= ticket.maxSupply) return false
  
  const now = new Date()
  // Convert Unix timestamp (seconds) to milliseconds
  const saleStart = typeof ticket.startSaleTime === 'number' 
    ? new Date(ticket.startSaleTime * 1000) 
    : new Date(ticket.startSaleTime)
  const saleEnd = typeof ticket.endSaleTime === 'number' 
    ? new Date(ticket.endSaleTime * 1000) 
    : new Date(ticket.endSaleTime)
  
  return now >= saleStart && now <= saleEnd
}

const getQuantity = (tokenId) => {
  return ticketQuantities[tokenId] || 1
}

const incrementQuantity = (tokenId) => {
  const ticket = ticketTypes.value.find(t => t.tokenId === tokenId)
  const max = Math.min(10, ticket.maxSupply - ticket.currentSupply)
  if (ticketQuantities[tokenId] < max) {
    ticketQuantities[tokenId] = (ticketQuantities[tokenId] || 1) + 1
  }
}

const decrementQuantity = (tokenId) => {
  if (ticketQuantities[tokenId] > 1) {
    ticketQuantities[tokenId]--
  }
}

const getPurchaseButtonText = (ticket) => {
  if (!event.value?.isActive) return 'Sự kiện ngừng hoạt động'
  if (!walletStore.isConnected) return 'Kết nối ví để mua'
  if (ticket.currentSupply >= ticket.maxSupply) return 'Hết vé'
  
  const now = new Date()
  // Convert Unix timestamp (seconds) to milliseconds
  const saleStart = typeof ticket.startSaleTime === 'number' 
    ? new Date(ticket.startSaleTime * 1000) 
    : new Date(ticket.startSaleTime)
  const saleEnd = typeof ticket.endSaleTime === 'number' 
    ? new Date(ticket.endSaleTime * 1000) 
    : new Date(ticket.endSaleTime)
  
  if (now < saleStart) return 'Chưa mở bán'
  if (now > saleEnd) return 'Đã kết thúc bán'
  
  const quantity = getQuantity(ticket.tokenId)
  const totalPrice = parseFloat(ethers.formatEther(ticket.price)) * quantity
  return `Mua ${quantity} vé × ${totalPrice.toFixed(4)} MATIC`
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'TBA'
  try {
    // Convert Unix timestamp (seconds) to milliseconds
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp)
    return format(date, 'dd/MM/yyyy HH:mm')
  } catch {
    return 'TBA'
  }
}

const formatSaleEnd = (timestamp) => {
  if (!timestamp) return 'TBA'
  try {
    // Convert Unix timestamp (seconds) to milliseconds
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
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

const formatEther = (value) => {
  try {
    return parseFloat(ethers.formatEther(value)).toFixed(4)
  } catch {
    return '0.0000'
  }
}

const getDefaultImage = (category) => {
  const images = {
    'music': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200',
    'technology': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200',
    'conference': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    'theater': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200',
    'festival': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200',
    'workshop': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200',
    'art': 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200',
  }
  return images[category] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'
}

const getCategoryLabel = (category) => {
  const categoryItem = EVENT_CATEGORIES.find(cat => cat.value === category)
  return categoryItem ? categoryItem.label : 'Event'
}

const handleImageError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'
}

const connectWallet = async () => {
  try {
    await walletStore.connectWallet()
    window.$message?.success('Đã kết nối ví!')
  } catch (err) {
    window.$message?.error('Kết nối ví thất bại: ' + err.message)
  }
}

const purchaseTicket = async (ticket) => {
  if (!walletStore.isConnected) {
    window.$message?.warning('Vui lòng kết nối ví')
    return
  }

  if (!canPurchase(ticket)) return
  
  purchasingTicket.value = ticket.tokenId
  const quantity = getQuantity(ticket.tokenId)
  
  try {
    if (!userStore.isAuthenticated) {
      window.$message?.info('Đang đăng nhập...')
      try {
        await userStore.walletLogin()
        window.$message?.success('Đăng nhập thành công!')
      } catch (loginErr) {
        console.error('Auto-login failed:', loginErr)
        window.$message?.error('Đăng nhập thất bại: ' + loginErr.message)
        purchasingTicket.value = null
        return
      }
    }

    await ticketsStore.purchaseTicket(event.value.eventId, ticket.tokenId, quantity, ticket.price)
    window.$message?.success(`Mua thành công ${quantity} vé!`)
    
    const response = await axios.get(`http://localhost:5000/api/events/${event.value.eventId}`)
    if (response.data.success) {
      event.value = response.data.data
      ticketTypes.value = response.data.data.ticketTypes || []
    }
  } catch (err) {
    console.error('Purchase error:', err)
    window.$message?.error('Mua vé thất bại: ' + (err.message || 'Lỗi không xác định'))
  } finally {
    purchasingTicket.value = null
  }
}

onMounted(async () => {
  loading.value = true
  
  try {
    const eventId = route.params.id
    const response = await axios.get(`http://localhost:5000/api/events/${eventId}`)
    
    if (response.data.success) {
      event.value = response.data.data
      ticketTypes.value = response.data.data.ticketTypes || []
      ticketTypes.value.forEach(ticket => {
        if (!ticketQuantities[ticket.tokenId]) {
          ticketQuantities[ticket.tokenId] = 1
        }
      })
    } else {
      error.value = 'Không tìm thấy sự kiện'
    }
  } catch (err) {
    console.error('Failed to fetch event:', err)
    error.value = err.response?.data?.message || 'Không thể tải sự kiện'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Tailwind CSS handles all styling */
</style>
