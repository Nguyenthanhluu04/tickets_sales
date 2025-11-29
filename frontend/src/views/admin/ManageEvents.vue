<template>
  <app-layout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-br from-indigo-600 to-purple-700 py-12 px-8 text-white">
        <div class="max-w-7xl mx-auto">
          <button
            @click="$router.back()"
            class="flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-4"
          >
            <font-awesome-icon icon="arrow-left" />
            Quay lại
          </button>
          <h1 class="text-5xl font-extrabold mb-2">Quản lý sự kiện</h1>
          <p class="text-xl opacity-95">Xem và quản lý tất cả các sự kiện</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-8 -mt-8 pb-16">
        <!-- Filters and Actions -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div class="flex flex-wrap gap-4 items-center justify-between">
            <div class="flex gap-4 flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <select
                v-model="statusFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã kết thúc</option>
              </select>
            </div>
            <button
              @click="$router.push('/admin/create-event')"
              class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <font-awesome-icon icon="plus" />
              Tạo mới
            </button>
          </div>
        </div>

        <!-- Events Table -->
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>

          <div v-else-if="filteredEvents.length > 0" class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left py-4 px-6 text-sm font-semibold text-gray-700">Sự kiện</th>
                  <th class="text-left py-4 px-6 text-sm font-semibold text-gray-700">Danh mục</th>
                  <th class="text-left py-4 px-6 text-sm font-semibold text-gray-700">Thời gian</th>
                  <th class="text-left py-4 px-6 text-sm font-semibold text-gray-700">Vé đã bán</th>
                  <th class="text-left py-4 px-6 text-sm font-semibold text-gray-700">Doanh thu</th>
                  <th class="text-left py-4 px-6 text-sm font-semibold text-gray-700">Trạng thái</th>
                  <th class="text-left py-4 px-6 text-sm font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="event in paginatedEvents"
                  :key="event._id"
                  class="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <img
                        :src="event.imageUrl || 'https://via.placeholder.com/150'"
                        :alt="event.name"
                        class="w-12 h-12 rounded-lg object-cover"
                        @error="handleImageError"
                      />
                      <div>
                        <div class="font-semibold text-gray-900">{{ event.name }}</div>
                        <div class="text-xs text-gray-500">ID: {{ event.eventId }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    <span class="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                      {{ event.category || 'N/A' }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-sm text-gray-600">
                    {{ formatDate(event.startTime) }}
                  </td>
                  <td class="py-4 px-6 font-semibold text-gray-900">
                    {{ event.totalTicketsSold || 0 }}
                  </td>
                  <td class="py-4 px-6 font-semibold text-indigo-600">
                    {{ parseFloat(event.revenue || 0).toFixed(2) }} MATIC
                  </td>
                  <td class="py-4 px-6">
                    <span :class="[
                      'inline-block px-3 py-1 text-xs font-medium rounded-full',
                      event.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]">
                      {{ event.isActive ? 'Đang hoạt động' : 'Đã kết thúc' }}
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex gap-2">
                      <button
                        @click="$router.push(`/events/${event.eventId}`)"
                        class="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        Xem
                      </button>
                      <button
                        @click="toggleEventStatus(event)"
                        class="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        {{ event.isActive ? 'Tắt' : 'Bật' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <div class="text-sm text-gray-600">
                Hiển thị {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredEvents.length) }} trong tổng số {{ filteredEvents.length }} sự kiện
              </div>
              <div class="flex gap-2">
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="currentPage = page"
                  :class="[
                    'px-4 py-2 border rounded-lg',
                    currentPage === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-500">
            <font-awesome-icon icon="calendar" class="text-5xl mb-4 opacity-50" />
            <p class="text-lg">Không tìm thấy sự kiện nào</p>
          </div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import AppLayout from '@/components/AppLayout.vue'
import { format } from 'date-fns'

const router = useRouter()
const eventsStore = useEventsStore()

const loading = ref(false)
const events = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 10

const filteredEvents = computed(() => {
  let result = events.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(event =>
      event.name.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (statusFilter.value === 'active') {
    result = result.filter(event => event.isActive)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter(event => !event.isActive)
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredEvents.value.length / pageSize))

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredEvents.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  try {
    const date = new Date(timestamp * 1000)
    return format(date, 'dd/MM/yyyy')
  } catch {
    return 'N/A'
  }
}

const handleImageError = (e) => {
  e.target.src = 'https://via.placeholder.com/150'
}

const toggleEventStatus = (event) => {
  window.$message?.info('Chức năng bật/tắt sự kiện đang được phát triển')
  // TODO: Implement toggle event status
}

onMounted(async () => {
  loading.value = true
  try {
    await eventsStore.fetchEvents()
    events.value = eventsStore.events
  } catch (error) {
    console.error('Failed to fetch events:', error)
    window.$message?.error('Không thể tải danh sách sự kiện')
  } finally {
    loading.value = false
  }
})
</script>
