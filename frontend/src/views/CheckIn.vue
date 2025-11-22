<template>
  <div class="checkin">
    <n-space vertical size="large">
      <n-page-header title="Check-In" subtitle="Scan ticket QR codes" />

      <n-card>
        <n-space vertical align="center">
          <n-input
            v-model:value="ticketId"
            placeholder="Enter Ticket ID or scan QR code"
            size="large"
            clearable
          />
          
          <n-button type="primary" size="large" @click="checkInTicket" :loading="loading">
            Check In
          </n-button>
        </n-space>
      </n-card>

      <n-card v-if="ticketInfo" title="Ticket Information">
        <n-descriptions :column="2">
          <n-descriptions-item label="Ticket ID">
            {{ ticketInfo.tokenId }}
          </n-descriptions-item>
          <n-descriptions-item label="Event">
            {{ ticketInfo.eventName }}
          </n-descriptions-item>
          <n-descriptions-item label="Owner">
            {{ ticketInfo.owner }}
          </n-descriptions-item>
          <n-descriptions-item label="Status">
            <n-tag :type="ticketInfo.used ? 'error' : 'success'">
              {{ ticketInfo.used ? 'Already Used' : 'Valid' }}
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
    </n-space>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTicketsStore } from '@/stores/tickets'

const ticketsStore = useTicketsStore()
const ticketId = ref('')
const ticketInfo = ref(null)
const loading = ref(false)

const checkInTicket = async () => {
  if (!ticketId.value) {
    window.$message.warning('Please enter a ticket ID')
    return
  }

  loading.value = true
  try {
    const result = await ticketsStore.checkInTicket(ticketId.value)
    ticketInfo.value = result
    window.$message.success('Ticket checked in successfully!')
  } catch (error) {
    window.$message.error('Check-in failed: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.checkin {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
