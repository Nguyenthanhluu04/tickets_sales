<template>
  <app-layout>
    <div class="event-list">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Khám phá sự kiện</h1>
          <p class="page-subtitle">Tìm kiếm và đặt vé cho các sự kiện tuyệt vời</p>
        </div>
      </div>

      <div class="content-container">
        <!-- Filters -->
        <div class="filters-section">
          <n-space size="large">
            <n-input
              v-model:value="searchQuery"
              placeholder="Tìm kiếm sự kiện theo tên hoặc mô tả..."
              clearable
              size="large"
              style="min-width: 300px"
            >
              <template #prefix>
                <font-awesome-icon icon="search" />
              </template>
            </n-input>
            
            <n-select
              v-model:value="categoryFilter"
              :options="categoryOptions"
              placeholder="All Categories"
              clearable
              size="large"
              style="min-width: 200px"
            />

            <n-select
              v-model:value="statusFilter"
              :options="statusOptions"
              placeholder="All Status"
              clearable
              size="large"
              style="min-width: 150px"
            />
          </n-space>

          <div class="results-info">
            <n-text depth="3">
              {{ filteredEvents.length }} sự kiện{{ filteredEvents.length !== 1 ? '' : '' }}
            </n-text>
          </div>
        </div>

        <!-- Events Grid -->
        <n-spin :show="loading">
          <div v-if="filteredEvents.length > 0" class="events-grid">
            <div 
              v-for="event in filteredEvents" 
              :key="event._id"
              class="event-card-wrapper"
            >
              <div class="event-card" @click="goToEvent(event)">
                <div class="event-image-container">
                  <img 
                    :src="event.imageUrl || getDefaultImage(event.category)" 
                    :alt="event.name"
                    class="event-image"
                    @error="handleImageError"
                  >
                  <div class="image-overlay">
                    <n-tag :type="event.isActive ? 'success' : 'default'" size="large" round strong>
                      <font-awesome-icon v-if="event.isActive" icon="circle-check" />
                      <font-awesome-icon v-else icon="times" />
                      {{ event.isActive ? ' Đang diễn ra' : ' Ngừng' }}
                    </n-tag>
                  </div>
                  <div class="event-category-badge">
                    <n-tag size="medium" round>{{ event.category || 'Event' }}</n-tag>
                  </div>
                </div>
                
                <div class="event-card-content">
                  <h3 class="event-name">{{ event.name }}</h3>
                  <p class="event-description">{{ event.description }}</p>
                  
                  <div class="event-info">
                    <div class="info-item">
                      <span class="info-icon"><font-awesome-icon icon="calendar" /></span>
                      <span class="info-text">{{ formatDate(event.startTime) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-icon"><font-awesome-icon icon="location-dot" /></span>
                      <span class="info-text">{{ event.location || 'Sẽ thông báo sau' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-icon"><font-awesome-icon icon="ticket" /></span>
                      <span class="info-text">{{ event.totalTicketsSold || 0 }} vé đã bán</span>
                    </div>
                    <div class="info-item" v-if="event.organizerName">
                      <span class="info-icon"><font-awesome-icon icon="user" /></span>
                      <span class="info-text">{{ event.organizerName }}</span>
                    </div>
                  </div>

                  <n-button 
                    type="primary" 
                    block 
                    strong
                    size="large"
                    class="view-details-button"
                  >
                    <template #icon>
                      <font-awesome-icon icon="ticket" />
                    </template>
                    Xem chi tiết & Mua vé
                  </n-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon"><font-awesome-icon icon="search" :style="{ fontSize: '4rem', opacity: 0.5 }" /></div>
            <h3>Không tìm thấy sự kiện</h3>
            <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            <n-button @click="clearFilters" type="primary" ghost>
              Xóa bộ lọc
            </n-button>
          </div>
        </n-spin>
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

const goToEvent = (event) => {
  // Use blockchain eventId, not MongoDB _id
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
.event-list {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2rem 4rem 2rem;
  color: white;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.25rem;
  opacity: 0.95;
  margin: 0;
}

/* Content Container */
.content-container {
  max-width: 1200px;
  margin: -2rem auto 0;
  padding: 0 2rem 4rem 2rem;
}

/* Filters Section */
.filters-section {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.results-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e8e8e8;
}

/* Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.event-card-wrapper {
  position: relative;
}

.event-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.event-image-container {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-card:hover .event-image {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.event-category-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

/* Event Card Content */
.event-card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-name {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: #1a1a1a;
  line-height: 1.3;
}

.event-description {
  color: #666;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info-icon {
  font-size: 1.2rem;
  min-width: 24px;
}

.info-text {
  font-size: 0.95rem;
  color: #444;
  line-height: 1.4;
}

.view-details-button {
  margin-top: auto;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.empty-state p {
  color: #666;
  margin: 0 0 1.5rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
  }

  .filters-section {
    padding: 1.5rem;
  }
}
</style>
