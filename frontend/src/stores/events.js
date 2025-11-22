import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from './user'

export const useEventsStore = defineStore('events', () => {
  const events = ref([])
  const currentEvent = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchEvents(params = {}) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get('/events', { params })
      
      if (data.success) {
        events.value = data.data.data
        return data.data
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEventById(id) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get(`/events/${id}`)
      
      if (data.success) {
        currentEvent.value = data.data
        return data.data
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEventStats(id) {
    try {
      const { data } = await api.get(`/events/${id}/stats`)
      return data.data
    } catch (err) {
      console.error('Failed to fetch event stats:', err)
      throw err
    }
  }

  function clearCurrentEvent() {
    currentEvent.value = null
  }

  return {
    events,
    currentEvent,
    loading,
    error,
    fetchEvents,
    fetchEventById,
    fetchEventStats,
    clearCurrentEvent,
  }
})
