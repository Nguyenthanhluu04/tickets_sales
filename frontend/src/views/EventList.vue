<template>
  <app-layout>
    <div class="w-full min-h-screen bg-gray-50">
      <!-- Header Section -->
      <div class="bg-gradient-to-br from-indigo-600 to-purple-700 py-12 px-8 text-white text-center">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-5xl font-extrabold mb-2">Khám phá sự kiện</h1>
          <p class="text-xl opacity-95">Tìm kiếm và đặt vé cho các sự kiện tuyệt vời</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto -mt-8 px-8 pb-16">
        <!-- Filters -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div class="flex flex-wrap gap-6 mb-4">
            <div class="relative flex-1 min-w-[300px]">
              <font-awesome-icon icon="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm sự kiện theo tên hoặc mô tả..."
                class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            
            <select
              v-model="categoryFilter"
              class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[200px]"
            >
              <option :value="null">All Categories</option>
              <option v-for="opt in categoryOptions.slice(1)" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>

            <select
              v-model="statusFilter"
              class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[150px]"
            >
              <option :value="null">All Status</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>

          <div class="pt-4 border-t border-gray-200">
            <span class="text-gray-500">
              {{ filteredEvents.length }} sự kiện
            </span>
          </div>
        </div>

        <!-- Events Grid -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        
        <div v-else-if="filteredEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="event in filteredEvents" 
            :key="event._id"
            @click="goToEvent(event)"
            class="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer flex flex-col"
          >
            <div class="relative h-56 overflow-hidden">
              <img 
                :src="event.imageUrl || event.bannerImageIPFS || event.bannerImage || getDefaultImage(event.category)" 
                :alt="event.name"
                class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                @error="handleImageError($event, event.category)"
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
              <div class="absolute top-4 left-4">
                <span class="inline-block px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-sm font-medium">
                  {{ getCategoryLabel(event.category) }}
                </span>
              </div>
            </div>
            
            <div class="p-6 flex-1 flex flex-col">
              <h3 class="text-2xl font-bold mb-3 text-gray-900 leading-tight">{{ event.name }}</h3>
              <p class="text-gray-600 mb-6 leading-relaxed flex-1 line-clamp-2">{{ event.description }}</p>
              
              <div class="flex flex-col gap-3 mb-6 p-5 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-3">
                  <span class="text-xl min-w-[24px]"><font-awesome-icon icon="calendar" /></span>
                  <span class="text-base text-gray-700">{{ formatDate(event.startTime) }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xl min-w-[24px]"><font-awesome-icon icon="location-dot" /></span>
                  <span class="text-base text-gray-700">{{ event.location || 'Sẽ thông báo sau' }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xl min-w-[24px]"><font-awesome-icon icon="ticket" /></span>
                  <span class="text-base text-gray-700">{{ event.totalTicketsSold || 0 }} vé đã bán</span>
                </div>
                <div v-if="event.organizerName" class="flex items-center gap-3">
                  <span class="text-xl min-w-[24px]"><font-awesome-icon icon="user" /></span>
                  <span class="text-base text-gray-700">{{ event.organizerName }}</span>
                </div>
              </div>

              <button class="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                <font-awesome-icon icon="ticket" />
                Xem chi tiết & Mua vé
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16 bg-white rounded-2xl shadow-lg">
          <div class="mb-4">
            <font-awesome-icon icon="search" class="text-6xl opacity-50" />
          </div>
          <h3 class="text-2xl font-semibold mb-2 text-gray-800">Không tìm thấy sự kiện</h3>
          <p class="text-gray-600 mb-6">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
          <button 
            @click="clearFilters"
            class="px-6 py-2 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium rounded-lg transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import { format } from 'date-fns'
import { EVENT_CATEGORIES } from '@/utils/constants'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const eventsStore = useEventsStore()
const loading = ref(false)
const searchQuery = ref('')
const categoryFilter = ref(null)
const statusFilter = ref(null)

const categoryOptions = [
  { label: 'Tất cả danh mục', value: null },
  ...EVENT_CATEGORIES.map(cat => ({
    label: cat.label,
    value: cat.value
  }))
]

const statusOptions = [
  { label: 'Tất cả trạng thái', value: null },
  { label: 'Đang hoạt động', value: 'active' },
  { label: 'Ngừng hoạt động', value: 'inactive' }
]

const filteredEvents = computed(() => {
  let events = eventsStore.events || []

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    events = events.filter(e => 
      e.name?.toLowerCase().includes(query) ||
      e.description?.toLowerCase().includes(query) ||
      e.location?.toLowerCase().includes(query)
    )
  }

  if (categoryFilter.value) {
    events = events.filter(e => e.category === categoryFilter.value)
  }

  if (statusFilter.value === 'active') {
    events = events.filter(e => e.isActive === true)
  } else if (statusFilter.value === 'inactive') {
    events = events.filter(e => e.isActive === false)
  }

  return events
})

const formatDate = (dateString) => {
  if (!dateString) return 'TBA'
  try {
    return format(new Date(dateString), 'MMM dd, yyyy • h:mm a')
  } catch {
    return 'TBA'
  }
}

const getCategoryLabel = (category) => {
  const categoryItem = EVENT_CATEGORIES.find(cat => cat.value === category)
  return categoryItem ? categoryItem.label : 'Event'
}

const getDefaultImage = (category) => {
  const images = {
    'music': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    'technology': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'conference': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    'theater': 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    'festival': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    'workshop': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    'art': 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
  }
  return images[category] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
}

const handleImageError = (e, category) => {
  e.target.src = getDefaultImage(category)
}

const goToEvent = (event) => {
  router.push(`/events/${event.eventId}`)
}

const clearFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = null
  statusFilter.value = null
}

onMounted(async () => {
  loading.value = true
  try {
    await eventsStore.fetchEvents()
  } catch (error) {
    console.error('Failed to fetch events:', error)
    window.$message?.error('Không thể tải danh sách sự kiện')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Tailwind CSS handles all styling */
</style>
