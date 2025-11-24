<template>
  <app-layout>
    <div class="w-full min-h-screen">
      <!-- Hero Section with Gradient Background -->
      <div class="bg-gradient-to-br from-indigo-600 to-purple-700 py-16 px-8 text-white text-center">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-6xl font-extrabold mb-4">
            <span class="bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">Nền tảng Vé NFT</span>
          </h1>
          <p class="text-2xl opacity-95 mb-12">
            Bán vé sự kiện an toàn, minh bạch dựa trên công nghệ blockchain
          </p>
          <div class="flex justify-center gap-16 my-12">
            <div class="text-center">
              <div class="text-4xl font-bold mb-2">{{ events.length }}</div>
              <div class="text-sm opacity-90 uppercase tracking-wider">Sự kiện đang diễn ra</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold mb-2">1,150+</div>
              <div class="text-sm opacity-90 uppercase tracking-wider">Tổng số vé</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold mb-2">100%</div>
              <div class="text-sm opacity-90 uppercase tracking-wider">Bảo mật</div>
            </div>
          </div>
          <div class="flex justify-center gap-4">
            <button 
              @click="$router.push('/events')"
              class="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-lg flex items-center gap-2 min-w-[200px] h-[60px] justify-center"
            >
              <font-awesome-icon icon="ticket" />
              Khám phá sự kiện
            </button>
            <button 
              v-if="!walletStore.isConnected"
              @click="connectWallet"
              class="px-8 py-4 bg-white hover:bg-gray-100 text-indigo-700 font-bold rounded-lg transition-colors text-lg flex items-center gap-2 min-w-[200px] h-[60px] justify-center"
            >
              <font-awesome-icon icon="wallet" />
              Kết nối ví
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-8 py-16">
        <!-- Features Grid -->
        <div class="mb-16">
          <h2 class="text-4xl font-bold text-center mb-8 text-gray-800">Tại sao chọn Vé NFT?</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center p-8 rounded-xl bg-gray-50 hover:-translate-y-2 hover:shadow-xl transition-all">
              <div class="text-5xl mb-4"><font-awesome-icon icon="shield-alt" /></div>
              <h3 class="text-xl font-semibold mb-4 text-gray-800">Bảo mật Blockchain</h3>
              <p class="text-gray-600 leading-relaxed">Mỗi vé được bảo mật trên blockchain, không thể giả mạo hoặc sao chép</p>
            </div>
            <div class="text-center p-8 rounded-xl bg-gray-50 hover:-translate-y-2 hover:shadow-xl transition-all">
              <div class="text-5xl mb-4"><font-awesome-icon icon="star" /></div>
              <h3 class="text-xl font-semibold mb-4 text-gray-800">Quyền sở hữu thật sự</h3>
              <p class="text-gray-600 leading-relaxed">Sở hữu vé của bạn dưới dạng NFT với quyền chuyển nhượng, bán lại hoặc sưu tầm</p>
            </div>
            <div class="text-center p-8 rounded-xl bg-gray-50 hover:-translate-y-2 hover:shadow-xl transition-all">
              <div class="text-5xl mb-4"><font-awesome-icon icon="clock" /></div>
              <h3 class="text-xl font-semibold mb-4 text-gray-800">Giao dịch nhanh chóng</h3>
              <p class="text-gray-600 leading-relaxed">Vé được gửi ngay lập tức vào ví với mã QR check-in tiện lợi</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Events -->
        <div v-if="events.length > 0" class="mb-16">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-4xl font-bold text-gray-800">Sự kiện nổi bật</h2>
            <button 
              @click="$router.push('/events')"
              class="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Xem tất cả →
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              v-for="event in events.slice(0, 2)" 
              :key="event._id"
              @click="$router.push(`/events/${event.eventId}`)"
              class="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl cursor-pointer flex flex-col"
            >
              <div class="relative h-64 overflow-hidden">
                <img 
                  :src="event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'" 
                  :alt="event.name"
                  @error="handleImageError"
                  class="w-full h-full object-cover"
                />
                <div class="absolute top-4 right-4">
                  <span :class="[
                    'inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold text-base',
                    event.isActive ? 'bg-green-500' : 'bg-gray-500'
                  ]">
                    <font-awesome-icon :icon="event.isActive ? 'circle-check' : 'times'" />
                    {{ event.isActive ? 'Đang diễn ra' : 'Ngừng' }}
                  </span>
                </div>
              </div>
              <div class="p-6 flex-1 flex flex-col">
                <div class="mb-3">
                  <span class="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">
                    {{ event.category || 'Event' }}
                  </span>
                </div>
                <h3 class="text-2xl font-bold mb-3 text-gray-900">{{ event.name }}</h3>
                <p class="text-gray-600 mb-6 leading-relaxed flex-1 line-clamp-2">{{ event.description }}</p>
                <div class="flex flex-col gap-3 mb-6">
                  <div class="flex items-center gap-3">
                    <span class="text-lg"><font-awesome-icon icon="calendar" /></span>
                    <span class="text-gray-700">{{ formatDate(event.startTime) }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-lg"><font-awesome-icon icon="location-dot" /></span>
                    <span class="text-gray-700">{{ event.location || 'TBA' }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-lg"><font-awesome-icon icon="ticket" /></span>
                    <span class="text-gray-700">{{ event.totalTicketsSold || 0 }} sold</span>
                  </div>
                </div>
                <button class="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                  Xem chi tiết & Mua vé
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Wallet Status -->
        <div v-if="walletStore.isConnected" class="mb-16">
          <div class="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-lg p-8">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <font-awesome-icon icon="wallet" /> Ví đã kết nối
              </h3>
              <span class="px-4 py-2 bg-green-500 text-white rounded-full font-semibold text-base">Đang hoạt động</span>
            </div>
            <div class="border-t border-purple-200 pt-6 mb-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div class="text-sm text-gray-600 mb-2">Địa chỉ ví</div>
                  <div class="text-lg font-mono font-semibold text-gray-900 truncate">{{ walletStore.address }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-600 mb-2">Mạng</div>
                  <div class="text-lg font-semibold text-gray-900">{{ getNetworkName(walletStore.chainId) }}</div>
                </div>
              </div>
            </div>
            <button 
              @click="$router.push('/my-tickets')"
              class="w-full px-6 py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg transition-colors"
            >
              Xem vé của tôi
            </button>
          </div>
        </div>

        <!-- Call to Action -->
        <div v-if="!walletStore.isConnected" class="mt-16">
          <div class="bg-gradient-to-br from-pink-100 to-red-100 rounded-2xl shadow-lg p-12 text-center">
            <h2 class="text-3xl font-bold mb-4 text-gray-800">Sẵn sàng bắt đầu?</h2>
            <p class="text-lg text-gray-700 mb-8 opacity-95">Kết nối ví của bạn để bắt đầu mua vé NFT cho các sự kiện tuyệt vời</p>
            <button 
              @click="connectWallet"
              class="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-lg inline-flex items-center gap-2"
            >
              <font-awesome-icon icon="wallet" />
              Kết nối ví ngay
            </button>
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
import { useEventsStore } from '@/stores/events'
import { format } from 'date-fns'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const walletStore = useWalletStore()
const eventsStore = useEventsStore()

const events = ref([])

const connectWallet = async () => {
  try {
    await walletStore.connectWallet()
    window.$message?.success('Đã kết nối ví thành công!')
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    window.$message?.error('Kết nối ví thất bại: ' + error.message)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'TBA'
  try {
    return format(new Date(dateString), 'MMM dd, yyyy • h:mm a')
  } catch {
    return 'TBA'
  }
}

const getNetworkName = (chainId) => {
  const networks = {
    80002: 'Polygon Amoy Testnet',
    137: 'Polygon Mainnet',
    1: 'Ethereum Mainnet',
  }
  return networks[chainId] || `Chain ${chainId}`
}

const handleImageError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
}

onMounted(async () => {
  try {
    await eventsStore.fetchEvents()
    events.value = eventsStore.events
  } catch (error) {
    console.error('Failed to load events:', error)
  }
})
</script>

<style scoped>
/* Tailwind CSS handles all styling */
</style>
