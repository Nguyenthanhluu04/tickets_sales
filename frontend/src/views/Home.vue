<template>
  <app-layout>
    <div class="home">
      <!-- Hero Section with Gradient Background -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="gradient-text">Nền tảng Vé NFT</span>
          </h1>
          <p class="hero-subtitle">
            Bán vé sự kiện an toàn, minh bạch dựa trên công nghệ blockchain
          </p>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-value">{{ events.length }}</div>
              <div class="stat-label">Sự kiện đang diễn ra</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">1,150+</div>
              <div class="stat-label">Tổng số vé</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">100%</div>
              <div class="stat-label">Bảo mật</div>
            </div>
          </div>
          <n-space class="hero-actions" justify="center">
            <n-button 
              type="primary" 
              size="large" 
              strong
              @click="$router.push('/events')"
              class="hero-button"
            >
              <template #icon>
                <font-awesome-icon icon="ticket" />
              </template>
              Khám phá sự kiện
            </n-button>
            <n-button 
              size="large" 
              strong
              secondary
              @click="connectWallet" 
              v-if="!walletStore.isConnected"
              class="hero-button"
            >
              <template #icon>
                <font-awesome-icon icon="wallet" />
              </template>
              Kết nối ví
            </n-button>
          </n-space>
        </div>
      </div>

      <div class="content-section">
        <!-- Features Grid -->
        <div class="features-section">
          <h2 class="section-title">Tại sao chọn Vé NFT?</h2>
          <n-grid :cols="3" :x-gap="24" :y-gap="24" responsive="screen">
            <n-gi>
              <div class="feature-card">
                <div class="feature-icon"><font-awesome-icon icon="shield-alt" :style="{ fontSize: '3rem' }" /></div>
                <h3>Bảo mật Blockchain</h3>
                <p>Mỗi vé được bảo mật trên blockchain, không thể giả mạo hoặc sao chép</p>
              </div>
            </n-gi>
            <n-gi>
              <div class="feature-card">
                <div class="feature-icon"><font-awesome-icon icon="star" :style="{ fontSize: '3rem' }" /></div>
                <h3>Quyền sở hữu thật sự</h3>
                <p>Sở hữu vé của bạn dưới dạng NFT với quyền chuyển nhượng, bán lại hoặc sưu tầm</p>
              </div>
            </n-gi>
            <n-gi>
              <div class="feature-card">
                <div class="feature-icon"><font-awesome-icon icon="clock" :style="{ fontSize: '3rem' }" /></div>
                <h3>Giao dịch nhanh chóng</h3>
                <p>Vé được gửi ngay lập tức vào ví với mã QR check-in tiện lợi</p>
              </div>
            </n-gi>
          </n-grid>
        </div>

        <!-- Upcoming Events -->
        <div class="events-section" v-if="events.length > 0">
          <div class="section-header">
            <h2 class="section-title">Sự kiện nổi bật</h2>
            <n-button text type="primary" @click="$router.push('/events')">
              Xem tất cả →
            </n-button>
          </div>
          
          <n-grid :cols="2" :x-gap="24" :y-gap="24" responsive="screen">
            <n-gi v-for="event in events.slice(0, 2)" :key="event._id">
              <div class="event-card" @click="$router.push(`/events/${event.eventId}`)">
                <div class="event-image">
                  <img :src="event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'" 
                       :alt="event.name"
                       @error="handleImageError">
                  <div class="event-badge">
                    <n-tag :type="event.isActive ? 'success' : 'default'" size="large" round>
                      <font-awesome-icon v-if="event.isActive" icon="circle-check" /> {{ event.isActive ? 'Đang diễn ra' : 'Ngừng' }}
                    </n-tag>
                  </div>
                </div>
                <div class="event-content">
                  <div class="event-category">
                    <n-tag size="small" round>{{ event.category || 'Event' }}</n-tag>
                  </div>
                  <h3 class="event-title">{{ event.name }}</h3>
                  <p class="event-description">{{ event.description }}</p>
                  <div class="event-details">
                    <div class="detail-item">
                      <span class="detail-icon"><font-awesome-icon icon="calendar" /></span>
                      <span>{{ formatDate(event.startTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-icon"><font-awesome-icon icon="location-dot" /></span>
                      <span>{{ event.location || 'TBA' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-icon"><font-awesome-icon icon="ticket" /></span>
                      <span>{{ event.totalTicketsSold || 0 }} sold</span>
                    </div>
                  </div>
                  <n-button type="primary" block strong class="view-button">
                    Xem chi tiết & Mua vé
                  </n-button>
                </div>
              </div>
            </n-gi>
          </n-grid>
        </div>

        <!-- Wallet Status -->
        <div class="wallet-section" v-if="walletStore.isConnected">
          <n-card class="wallet-card" size="large">
            <div class="wallet-content">
              <div class="wallet-header">
                <h3><font-awesome-icon icon="wallet" /> Ví đã kết nối</h3>
                <n-tag type="success" size="large" round>Đang hoạt động</n-tag>
              </div>
              <n-divider />
              <n-grid :cols="2" :x-gap="24">
                <n-gi>
                  <n-statistic label="Địa chỉ ví" tabular-nums>
                    <template #default>
                      <n-ellipsis style="max-width: 240px">
                        {{ walletStore.address }}
                      </n-ellipsis>
                    </template>
                  </n-statistic>
                </n-gi>
                <n-gi>
                  <n-statistic label="Mạng" :value="getNetworkName(walletStore.chainId)" />
                </n-gi>
              </n-grid>
              <n-button type="primary" ghost block @click="$router.push('/my-tickets')">
                Xem vé của tôi
              </n-button>
            </div>
          </n-card>
        </div>

        <!-- Call to Action -->
        <div class="cta-section" v-if="!walletStore.isConnected">
          <n-card class="cta-card">
            <div class="cta-content">
              <h2>Sẵn sàng bắt đầu?</h2>
              <p>Kết nối ví của bạn để bắt đầu mua vé NFT cho các sự kiện tuyệt vời</p>
              <n-button type="primary" size="large" strong @click="connectWallet">
                <template #icon>
                  <font-awesome-icon icon="wallet" />
                </template>
                Kết nối ví ngay
              </n-button>
            </div>
          </n-card>
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
.home {
  width: 100%;
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 4rem 2rem;
  color: white;
  text-align: center;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.95;
  margin: 0 0 2rem 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin: 3rem 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-actions {
  margin-top: 2rem;
}

.hero-button {
  min-width: 180px;
  height: 50px;
  font-size: 1.1rem;
}

/* Content Section */
.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-align: center;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header .section-title {
  margin: 0;
  text-align: left;
}

/* Features Section */
.features-section {
  margin-bottom: 4rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  background: #f8f9fa;
  height: 100%;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* Events Section */
.events-section {
  margin-bottom: 4rem;
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

.event-image {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.05);
}

.event-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.event-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-category {
  margin-bottom: 0.75rem;
}

.event-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: #1a1a1a;
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

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #444;
}

.detail-icon {
  font-size: 1.1rem;
}

.view-button {
  margin-top: auto;
}

/* Wallet Section */
.wallet-section {
  margin-bottom: 4rem;
}

.wallet-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.wallet-content {
  color: white;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.wallet-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

/* CTA Section */
.cta-section {
  margin-top: 4rem;
}

.cta-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  text-align: center;
}

.cta-content {
  padding: 2rem;
}

.cta-content h2 {
  font-size: 2rem;
  margin: 0 0 1rem 0;
}

.cta-content p {
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
  opacity: 0.95;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-stats {
    gap: 1.5rem;
  }
  
  .stat-value {
    font-size: 2rem;
  }
  
  .event-image {
    height: 200px;
  }
}
</style>
