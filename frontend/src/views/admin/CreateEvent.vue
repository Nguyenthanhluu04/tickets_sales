<template>
  <div class="create-event">
    <n-space vertical size="large">
      <n-page-header title="Create Event" @back="$router.back()" />

      <n-card>
        <n-form ref="formRef" :model="formValue" :rules="rules">
          <n-form-item label="Event Name" path="name">
            <n-input v-model:value="formValue.name" placeholder="Event name" />
          </n-form-item>

          <n-form-item label="Description" path="description">
            <n-input
              v-model:value="formValue.description"
              type="textarea"
              placeholder="Event description"
              :rows="4"
            />
          </n-form-item>

          <n-grid :cols="2" :x-gap="12">
            <n-gi>
              <n-form-item label="Start Date" path="startTime">
                <n-date-picker v-model:value="formValue.startTime" type="datetime" style="width: 100%" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="End Date" path="endTime">
                <n-date-picker v-model:value="formValue.endTime" type="datetime" style="width: 100%" />
              </n-form-item>
            </n-gi>
          </n-grid>

          <n-space>
            <n-button type="primary" @click="handleSubmit" :loading="loading">
              Create Event
            </n-button>
            <n-button @click="$router.back()">
              Cancel
            </n-button>
          </n-space>
        </n-form>
      </n-card>
    </n-space>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'

const router = useRouter()
const eventsStore = useEventsStore()

const formRef = ref(null)
const loading = ref(false)
const formValue = ref({
  name: '',
  description: '',
  startTime: null,
  endTime: null
})

const rules = {
  name: { required: true, message: 'Please input event name', trigger: 'blur' },
  description: { required: true, message: 'Please input description', trigger: 'blur' },
  startTime: { required: true, message: 'Please select start date', trigger: 'blur' },
  endTime: { required: true, message: 'Please select end date', trigger: 'blur' }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    await eventsStore.createEvent(formValue.value)
    window.$message.success('Event created successfully!')
    router.push('/admin/dashboard')
  } catch (error) {
    window.$message.error('Failed to create event')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-event {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
