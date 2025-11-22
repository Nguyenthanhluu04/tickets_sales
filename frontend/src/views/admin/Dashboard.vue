<template>
  <div class="admin-dashboard">
    <n-space vertical size="large">
      <n-page-header title="Admin Dashboard" subtitle="Manage your events" />

      <n-grid :cols="4" :x-gap="12">
        <n-gi>
          <n-statistic label="Total Events" :value="stats.totalEvents" />
        </n-gi>
        <n-gi>
          <n-statistic label="Active Events" :value="stats.activeEvents" />
        </n-gi>
        <n-gi>
          <n-statistic label="Tickets Sold" :value="stats.ticketsSold" />
        </n-gi>
        <n-gi>
          <n-statistic label="Total Revenue" :value="stats.revenue" suffix=" MATIC" />
        </n-gi>
      </n-grid>

      <n-space>
        <n-button type="primary" @click="$router.push('/admin/create-event')">
          Create New Event
        </n-button>
        <n-button @click="$router.push('/admin/manage-events')">
          Manage Events
        </n-button>
      </n-space>

      <n-card title="Recent Activity">
        <n-empty description="No recent activity" />
      </n-card>
    </n-space>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  totalEvents: 0,
  activeEvents: 0,
  ticketsSold: 0,
  revenue: 0
})

onMounted(() => {
  // TODO: Fetch admin stats
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
