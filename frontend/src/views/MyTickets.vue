<template>
  <app-layout>
    <div class="my-tickets">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Vé của tôi</h1>
          <p class="page-subtitle">Quản lý và xem các vé NFT của bạn</p>
        </div>
      </div>

      <div class="content-container">
        <n-alert v-if="!walletStore.isConnected" type="warning" title="Chưa kết nối ví" style="margin-bottom: 2rem;">
          Vui lòng kết nối ví để xem vé của bạn
          <template #action>
            <n-button size="small" @click="connectWallet">
              Kết nối ví
            </n-button>
          </template>
        </n-alert>

        <n-spin :show="loading" v-else size="large">
          <div v-if="tickets.length > 0" class="tickets-grid">
            <div 
              v-for="ticket in tickets" 
              :key="ticket._id"
              class="ticket-card"
            >
              <div class="ticket-image-section">
                <img 
                  :src="ticket.event?.imageUrl || getDefaultImage(ticket.event?.category)" 
                  :alt="ticket.event?.name"
                  class="ticket-image"
                  @error="handleImageError"
                >
                <div class="ticket-status-badge">
                  <n-tag :type="ticket.isUsed ? 'default' : 'success'" size="large" round strong>
                    <font-awesome-icon v-if="!ticket.isUsed" icon="circle-check" />
                    <font-awesome-icon v-else icon="ban" />
                    {{ ticket.isUsed ? ' Đã sử dụng' : ' Hợp lệ' }}
                  </n-tag>
                </div>
              </div>

              <div class="ticket-content">
                <div class="ticket-header">
                  <h3 class="event-name">{{ ticket.event?.name || 'Sự kiện' }}</h3>
                  <div class="ticket-type-badge">
                    <n-tag size="medium" round>{{ ticket.ticketTypeName || 'VIP' }}</n-tag>
                  </div>
                </div>

                <div class="ticket-info">
                  <div class="info-row" v-if="ticket.ticketNumber">
                    <span class="info-label">
                      <font-awesome-icon icon="hashtag" />
                      Số vé
                    </span>
                    <span class="info-value">{{ ticket.ticketNumber }}/{{ ticket.totalTickets }}</span>
                  </div>

                  <div class="info-row">
                    <span class="info-label">
                      <font-awesome-icon icon="calendar" />
                      Ngày diễn ra
                    </span>
                    <span class="info-value">{{ formatDate(ticket.event?.startTime) }}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">
                      <font-awesome-icon icon="location-dot" />
                      Địa điểm
                    </span>
                    <span class="info-value">{{ ticket.event?.location || 'Sẽ thông báo sau' }}</span>
                  </div>

                  <div class="info-row">
                    <span class="info-label">
                      <font-awesome-icon icon="ticket" />
                      Mã vé
                    </span>
                    <span class="info-value ticket-id">{{ ticket.tokenId }}</span>
                  </div>

                  <div class="info-row">
                    <span class="info-label">
                      <font-awesome-icon icon="money-bill" />
                      Giá vé
                    </span>
                    <span class="info-value">{{ formatPrice(ticket.price) }} MATIC</span>
                  </div>
                </div>

                <div class="ticket-actions">
                  <n-button 
                    type="primary" 
                    block 
                    strong
                    size="large"
                    @click="showQRCode(ticket)" 
                    v-if="!ticket.isUsed"
                  >
                    <template #icon>
                      <font-awesome-icon icon="qrcode" />
                    </template>
                    Hiển thị QR Code
                  </n-button>
                  <n-button 
                    block 
                    size="large"
                    disabled
                    v-else
                  >
                    <template #icon>
                      <font-awesome-icon icon="ban" />
                    </template>
                    Vé đã được sử dụng
                  </n-button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">
              <font-awesome-icon icon="ticket" :style="{ fontSize: '4rem', opacity: 0.5 }" />
            </div>
            <h3>Chưa có vé nào</h3>
            <p>Bạn chưa mua vé nào. Hãy khám phá các sự kiện thú vị!</p>
            <n-button type="primary" @click="$router.push('/events')">
              <template #icon>
                <font-awesome-icon icon="ticket" />
              </template>
              Khám phá sự kiện
            </n-button>
          </div>
        </n-spin>
      </div>

      <!-- QR Code Modal -->
      <n-modal 
        v-model:show="showModal" 
        preset="card" 
        title="QR Code Vé" 
        style="width: 500px"
      >
        <n-space vertical align="center" size="large" v-if="selectedTicket">
          <div class="qr-code-container">
            <img :src="selectedTicket.qrCode" alt="QR Code" class="qr-code-image" />
          </div>
          <div style="text-align: center;">
            <n-text strong style="font-size: 1.1rem;">{{ selectedTicket.event?.name }}</n-text>
            <br>
            <n-text depth="3">{{ selectedTicket.ticketTypeName }}</n-text>
            <br><br>
            <n-text depth="2" style="font-size: 0.9rem;">
              Vui lòng xuất trình mã QR này tại cổng vào sự kiện
            </n-text>
          </div>
        </n-space>
      </n-modal>
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
    // Auto-load tickets after connecting
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
    // Auto login if not authenticated
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
.my-tickets {
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

/* Tickets Grid */
.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.ticket-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.ticket-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.ticket-image-section {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.ticket-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ticket-status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.ticket-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.event-name {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
  line-height: 1.3;
  flex: 1;
}

.ticket-type-badge {
  flex-shrink: 0;
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
  flex: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 0.95rem;
  color: #1a1a1a;
  font-weight: 600;
  text-align: right;
  flex: 1;
}

.ticket-id {
  font-family: monospace;
  font-size: 0.85rem;
  word-break: break-all;
}

.ticket-actions {
  margin-top: auto;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-top: 2rem;
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

/* QR Code Modal */
.qr-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
}

.qr-code-image {
  width: 300px;
  height: 300px;
  object-fit: contain;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .tickets-grid {
    grid-template-columns: 1fr;
  }

  .content-container {
    padding: 0 1rem 2rem 1rem;
  }
}
</style>
