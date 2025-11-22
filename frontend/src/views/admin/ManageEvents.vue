<template>
  <div class="manage-events">
    <n-space vertical size="large">
      <n-page-header title="Manage Events" @back="$router.back()" />

      <n-spin :show="loading">
        <n-data-table
          :columns="columns"
          :data="events"
          :pagination="pagination"
          :bordered="false"
        />
      </n-spin>
    </n-space>
  </div>
</template>

<script setup>
import { ref, h, onMounted } from 'vue'
import { NButton, NSpace, NTag } from 'naive-ui'
import { useEventsStore } from '@/stores/events'

const eventsStore = useEventsStore()
const loading = ref(false)
const events = ref([])

const pagination = {
  pageSize: 10
}

const columns = [
  {
    title: 'Event Name',
    key: 'name'
  },
  {
    title: 'Status',
    key: 'isActive',
    render: (row) =>
      h(NTag, { type: row.isActive ? 'success' : 'default' }, { default: () => row.isActive ? 'Active' : 'Inactive' })
  },
  {
    title: 'Start Date',
    key: 'startTime',
    render: (row) => new Date(row.startTime * 1000).toLocaleDateString()
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (row) =>
      h(NSpace, null, {
        default: () => [
          h(NButton, { size: 'small', onClick: () => editEvent(row) }, { default: () => 'Edit' }),
          h(NButton, { size: 'small', type: 'error', onClick: () => deleteEvent(row) }, { default: () => 'Delete' })
        ]
      })
  }
]

const editEvent = (event) => {
  window.$message.info('Edit functionality coming soon')
}

const deleteEvent = (event) => {
  window.$message.info('Delete functionality coming soon')
}

onMounted(async () => {
  loading.value = true
  try {
    await eventsStore.fetchEvents()
    events.value = eventsStore.events
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.manage-events {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
