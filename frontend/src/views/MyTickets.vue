<template>
  <app-layout>
    <div class="my-tickets">
      <n-space vertical size="large">
      <n-page-header title="My Tickets" subtitle="View and manage your NFT tickets" />

      <n-alert v-if="!walletStore.isConnected" type="warning">
        Please connect your wallet to view your tickets
      </n-alert>

      <n-spin :show="loading" v-else>
        <n-grid v-if="tickets.length > 0" :cols="2" :x-gap="12" :y-gap="12">
          <n-gi v-for="ticket in tickets" :key="ticket.id">
            <n-card :title="`Ticket #${ticket.tokenId}`">
              <n-space vertical>
                <n-text strong>{{ ticket.eventName }}</n-text>
                <n-text depth="3">{{ ticket.ticketType }}</n-text>
                
                <n-space vertical size="small">
                  <n-text depth="3">📅 {{ formatDate(ticket.eventDate) }}</n-text>
                  <n-tag :type="ticket.used ? 'default' : 'success'">
                    {{ ticket.used ? 'Used' : 'Valid' }}
                  </n-tag>
                </n-space>

                <n-button type="primary" block @click="showQRCode(ticket)" v-if="!ticket.used">
                  Show QR Code
                </n-button>
              </n-space>
            </n-card>
          </n-gi>
        </n-grid>

        <n-empty v-else description="You don't have any tickets yet" />
      </n-spin>
      </n-space>

      <!-- QR Code Modal -->
      <n-modal v-model:show="showModal" preset="card" title="Ticket QR Code" style="width: 400px">
        <n-space vertical align="center" v-if="selectedTicket">
          <div ref="qrcodeContainer"></div>
          <n-text>Ticket #{{ selectedTicket.tokenId }}</n-text>
          <n-text depth="3">Show this QR code at the event entrance</n-text>
        </n-space>
      </n-modal>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { useUserStore } from '@/stores/user'
import { useTicketsStore } from '@/stores/tickets'
import { format } from 'date-fns'
import AppLayout from '@/components/AppLayout.vue'

const walletStore = useWalletStore()
const ticketsStore = useTicketsStore()

const loading = ref(false)
const tickets = ref([])
const showModal = ref(false)
const selectedTicket = ref(null)
const qrcodeContainer = ref(null)

const formatDate = (timestamp) => {
  return format(new Date(timestamp * 1000), 'PPP')
}

const showQRCode = (ticket) => {
  selectedTicket.value = ticket
  showModal.value = true
}

onMounted(async () => {
  if (walletStore.isConnected) {
    loading.value = true
    try {
      const userStore = useUserStore()
      // Auto login if not authenticated
      if (!userStore.isAuthenticated) {
        await userStore.walletLogin()
      }
      const result = await ticketsStore.fetchMyTickets()
      tickets.value = result.data || []
    } catch (error) {
      console.error('Failed to load tickets:', error)
      window.$message?.error('Không thể tải danh sách vé: ' + error.message)
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.my-tickets {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem 2rem 2rem;
}

@media (max-width: 768px) {
  .my-tickets {
    padding: 0 1rem 1rem 1rem;
  }
}
</style>
