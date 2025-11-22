<template>
  <app-layout>
    <div class="event-detail">
      <n-spin :show="loading" size="large">
        <div v-if="event" class="event-container">
          <!-- Event Hero -->
          <div class="event-hero">
            <div class="hero-image">
              <img 
                :src="event.imageUrl || getDefaultImage(event.category)" 
                :alt="event.name"
                @error="handleImageError"
              >
              <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
              <n-button 
                text 
                class="back-button"
                @click="$router.back()"
              >
                <template #icon>
                  <font-awesome-icon icon="arrow-right" rotation="180" :style="{ fontSize: '1.2em' }" />
                </template>
                Quay lại danh sách
              </n-button>
              
              <div class="hero-info">
                <n-space>
                  <n-tag :type="event.isActive ? 'success' : 'default'" size="large" round strong>
                    <font-awesome-icon v-if="event.isActive" icon="circle-check" />
                    <font-awesome-icon v-else icon="times" />
                    {{ event.isActive ? ' Đang diễn ra' : ' Ngừng hoạt động' }}
                  </n-tag>
                  <n-tag size="large" round>{{ getCategoryLabel(event.category) }}</n-tag>
                </n-space>
                <h1 class="event-title">{{ event.name }}</h1>
                <p class="event-subtitle">{{ event.description }}</p>
              </div>
            </div>
          </div>

          <div class="content-wrapper">
            <!-- Main Content -->
            <div class="main-content">
              <!-- Event Details Card -->
              <n-card class="info-card">
                <template #header>
                  <span><font-awesome-icon icon="info-circle" /> Thông tin sự kiện</span>
                </template>
                <div class="event-details-grid">
                  <div class="detail-box">
                    <div class="detail-icon"><font-awesome-icon icon="calendar" /></div>
                    <div class="detail-content">
                      <div class="detail-label">Ngày bắt đầu</div>
                      <div class="detail-value">{{ formatDate(event.startTime) }}</div>
                    </div>
                  </div>
                  
                  <div class="detail-box">
                    <div class="detail-icon"><font-awesome-icon icon="clock" /></div>
                    <div class="detail-content">
                      <div class="detail-label">Ngày kết thúc</div>
                      <div class="detail-value">{{ formatDate(event.endTime) }}</div>
                    </div>
                  </div>
                  
                  <div class="detail-box">
                    <div class="detail-icon"><font-awesome-icon icon="location-dot" /></div>
                    <div class="detail-content">
                      <div class="detail-label">Địa điểm</div>
                      <div class="detail-value">{{ event.location || 'Sẽ thông báo sau' }}</div>
                    </div>
                  </div>
                  
                  <div class="detail-box">
                    <div class="detail-icon"><font-awesome-icon icon="user" /></div>
                    <div class="detail-content">
                      <div class="detail-label">Ban tổ chức</div>
                      <div class="detail-value">{{ event.organizerName || 'Ban tổ chức sự kiện' }}</div>
                      <n-ellipsis style="max-width: 200px; font-size: 0.85em; opacity: 0.7;">
                        {{ event.organizer }}
                      </n-ellipsis>
                    </div>
                  </div>
                </div>
              </n-card>

              <!-- Description -->
              <n-card class="description-card" v-if="event.description">
                <template #header>
                  <span><font-awesome-icon icon="info-circle" /> Giới thiệu sự kiện</span>
                </template>
                <p class="full-description">{{ event.description }}</p>
              </n-card>

              <!-- Tickets Section -->
              <n-card class="tickets-card">
                <template #header>
                  <div class="tickets-header">
                    <h2><font-awesome-icon icon="ticket" /> Loại vé có sẵn</h2>
                    <n-text depth="3">{{ ticketTypes.length }} loại vé đang bán</n-text>
                  </div>
                </template>

                <!-- Wallet Alert -->
                <n-alert 
                  v-if="!walletStore.isConnected" 
                  type="warning" 
                  title="Chưa kết nối ví"
                  style="margin-bottom: 1.5rem;"
                >
                  Vui lòng kết nối ví để mua vé
                  <template #action>
                    <n-button size="small" @click="connectWallet">
                      Kết nối ví
                    </n-button>
                  </template>
                </n-alert>

                <!-- Tickets List -->
                <div v-if="ticketTypes.length > 0" class="tickets-list">
                  <div 
                    v-for="ticket in ticketTypes" 
                    :key="ticket.tokenId"
                    class="ticket-item"
                  >
                    <div class="ticket-info-section">
                      <div class="ticket-header">
                        <h3 class="ticket-name">{{ ticket.name }}</h3>
                        <div class="ticket-price">
                          <span class="price-amount">{{ formatPrice(ticket.price) }}</span>
                          <span class="price-currency">MATIC</span>
                        </div>
                      </div>
                      
                      <p class="ticket-description">{{ ticket.description || 'Vé vào cổng thường' }}</p>
                      
                      <div class="ticket-meta">
                        <div class="meta-item">
                          <span class="meta-icon"><font-awesome-icon icon="ticket" /></span>
                          <span>{{ ticket.maxSupply - ticket.currentSupply }} / {{ ticket.maxSupply }} còn lại</span>
                        </div>
                        <div class="meta-item">
                          <span class="meta-icon"><font-awesome-icon icon="clock" /></span>
                          <span>Kết thúc bán {{ formatSaleEnd(ticket.endSaleTime) }}</span>
                        </div>
                      </div>

                      <!-- Benefits -->
                      <div v-if="ticket.benefits && ticket.benefits.length > 0" class="ticket-benefits">
                        <div class="benefits-title"><font-awesome-icon icon="star" /> Quyền lợi:</div>
                        <div class="benefits-list">
                          <n-tag 
                            v-for="(benefit, idx) in ticket.benefits" 
                            :key="idx"
                            size="small"
                            round
                          >
                            {{ benefit }}
                          </n-tag>
                        </div>
                      </div>
                    </div>

                    <div class="ticket-actions">
                      <div class="quantity-selector">
                        <n-button 
                          circle 
                          size="small"
                          @click="decrementQuantity(ticket.tokenId)"
                          :disabled="!canPurchase(ticket) || getQuantity(ticket.tokenId) <= 1"
                        >
                          <template #icon>
                            <font-awesome-icon icon="minus" />
                          </template>
                        </n-button>
                        <n-input-number
                          v-model:value="ticketQuantities[ticket.tokenId]"
                          :min="1"
                          :max="Math.min(10, ticket.maxSupply - ticket.currentSupply)"
                          size="small"
                          :disabled="!canPurchase(ticket)"
                          style="width: 80px"
                        />
                        <n-button 
                          circle 
                          size="small"
                          @click="incrementQuantity(ticket.tokenId)"
                          :disabled="!canPurchase(ticket) || getQuantity(ticket.tokenId) >= Math.min(10, ticket.maxSupply - ticket.currentSupply)"
                        >
                          <template #icon>
                            <font-awesome-icon icon="plus" />
                          </template>
                        </n-button>
                      </div>

                      <n-button
                        type="primary"
                        size="large"
                        strong
                        :disabled="!canPurchase(ticket)"
                        :loading="purchasingTicket === ticket.tokenId"
                        @click="purchaseTicket(ticket)"
                        class="buy-button"
                      >
                        <template #icon>
                          <font-awesome-icon icon="wallet" />
                        </template>
                        {{ getPurchaseButtonText(ticket) }}
                      </n-button>
                    </div>
                  </div>
                </div>

                <!-- No Tickets -->
                <n-empty v-else description="Không có vé cho sự kiện này" class="no-tickets">
                  <template #icon>
                    <font-awesome-icon icon="ticket" :style="{ fontSize: '3em' }" />
                  </template>
                </n-empty>
              </n-card>
            </div>

            <!-- Sidebar -->
            <div class="sidebar">
              <!-- Quick Info -->
              <n-card class="quick-info-card">
                <div class="quick-info-item">
                  <div class="quick-icon"><font-awesome-icon icon="chart-line" /></div>
                  <div>
                    <div class="quick-label">Vé đã bán</div>
                    <div class="quick-value">{{ event.totalTicketsSold || 0 }}</div>
                  </div>
                </div>
                
                <n-divider />
                
                <div class="quick-info-item">
                  <div class="quick-icon"><font-awesome-icon icon="money-bill" /></div>
                  <div>
                    <div class="quick-label">Doanh thu</div>
                    <div class="quick-value">{{ formatEther(event.revenue || '0') }} MATIC</div>
                  </div>
                </div>

                <n-divider />

                <div class="quick-info-item">
                  <div class="quick-icon"><font-awesome-icon icon="globe" /></div>
                  <div>
                    <div class="quick-label">Blockchain</div>
                    <div class="quick-value">Polygon Amoy</div>
                  </div>
                </div>
              </n-card>

              <!-- Share Card -->
              <n-card class="share-card">
                <template #header>
                  <span><font-awesome-icon icon="share" /> Chia sẻ sự kiện</span>
                </template>
                <n-space vertical>
                  <n-button block ghost>
                    <template #icon><font-awesome-icon icon="share" /></template>
                    Chia sẻ lên Twitter
                  </n-button>
                  <n-button block ghost>
                    <template #icon><font-awesome-icon icon="info-circle" /></template>
                    Sao chép liên kết
                  </n-button>
                </n-space>
              </n-card>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon"><font-awesome-icon icon="triangle-exclamation" :style="{ fontSize: '4rem', color: '#ff6b6b' }" /></div>
          <h2>Không tìm thấy sự kiện</h2>
          <p>{{ error }}</p>
          <n-button type="primary" @click="$router.push('/events')">
            Quay lại danh sách
          </n-button>
        </div>
      </n-spin>
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
  const saleStart = new Date(ticket.startSaleTime)
  const saleEnd = new Date(ticket.endSaleTime)
  
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
  const saleStart = new Date(ticket.startSaleTime)
  const saleEnd = new Date(ticket.endSaleTime)
  
  if (now < saleStart) return 'Chưa mở bán'
  if (now > saleEnd) return 'Đã kết thúc bán'
  
  const quantity = getQuantity(ticket.tokenId)
  const totalPrice = parseFloat(ethers.formatEther(ticket.price)) * quantity
  return `Mua ${quantity} vé × ${totalPrice.toFixed(4)} MATIC`
}

const formatDate = (dateString) => {
  if (!dateString) return 'TBA'
  try {
    return format(new Date(dateString), 'EEEE, MMMM dd, yyyy • h:mm a')
  } catch {
    return 'TBA'
  }
}

const formatSaleEnd = (dateString) => {
  if (!dateString) return 'TBA'
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
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
  // Check wallet connection first
  if (!walletStore.isConnected) {
    window.$message?.warning('Vui lòng kết nối ví')
    return
  }

  if (!canPurchase(ticket)) return
  
  purchasingTicket.value = ticket.tokenId
  const quantity = getQuantity(ticket.tokenId)
  
  try {
    // Auto-login if not authenticated
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

    // Purchase ticket
    await ticketsStore.purchaseTicket(event.value.eventId, ticket.tokenId, quantity, ticket.price)
    window.$message?.success(`Mua thành công ${quantity} vé!`)
    
    // Reload event data to update ticket availability
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
  // Load event data first (don't wait for wallet/auth)
  loading.value = true
  
  try {
    const eventId = route.params.id
    const response = await axios.get(`http://localhost:5000/api/events/${eventId}`)
    
    if (response.data.success) {
      event.value = response.data.data
      // Get ticket types from event data
      ticketTypes.value = response.data.data.ticketTypes || []
      // Initialize quantities
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
.event-detail {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
}

/* Hero Section */
.event-hero {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  width: 100%;
  height: 100%;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
}

.back-button {
  align-self: flex-start;
  color: white !important;
  font-size: 1.1rem;
}

.hero-info {
  margin-bottom: 2rem;
}

.event-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 1rem 0 0.5rem 0;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.event-subtitle {
  font-size: 1.25rem;
  opacity: 0.95;
  margin: 0;
  max-width: 800px;
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: -4rem auto 0;
  padding: 0 2rem 4rem 2rem;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Cards */
.info-card,
.description-card,
.tickets-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Event Details Grid */
.event-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.detail-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.detail-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
}

.detail-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* Description */
.full-description {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #444;
  margin: 0;
}

/* Tickets */
.tickets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tickets-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ticket-item {
  border: 2px solid #e8e8e8;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.ticket-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
}

.ticket-info-section {
  margin-bottom: 1.5rem;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.ticket-name {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.ticket-price {
  text-align: right;
}

.price-amount {
  font-size: 1.75rem;
  font-weight: 700;
  color: #667eea;
}

.price-currency {
  font-size: 0.9rem;
  color: #666;
  margin-left: 0.25rem;
}

.ticket-description {
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.ticket-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #444;
}

.meta-icon {
  font-size: 1.1rem;
}

.ticket-benefits {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e8e8e8;
}

.benefits-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #444;
}

.benefits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ticket-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e8e8e8;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.buy-button {
  flex: 1;
}

.no-tickets {
  padding: 3rem 0;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quick-info-card,
.share-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.quick-info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quick-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.quick-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.quick-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.error-icon {
  margin-bottom: 1rem;
}

.error-state h2 {
  font-size: 2rem;
  margin: 0 0 1rem 0;
}

.error-state p {
  color: #666;
  margin: 0 0 2rem 0;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .event-title {
    font-size: 2rem;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
    margin-top: -2rem;
  }

  .event-details-grid {
    grid-template-columns: 1fr;
  }

  .ticket-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .quantity-selector {
    justify-content: center;
  }
}
</style>
