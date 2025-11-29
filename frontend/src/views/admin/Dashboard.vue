<template>
  <app-layout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-br from-indigo-600 to-purple-700 py-12 px-8 text-white">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-5xl font-extrabold mb-2">Admin Dashboard</h1>
          <p class="text-xl opacity-95">Quản lý hệ thống và sự kiện</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-8 -mt-8 pb-16">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium mb-1">Tổng sự kiện</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.totalEvents }}</p>
              </div>
              <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <font-awesome-icon icon="calendar" class="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium mb-1">Vé đã bán</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.totalTickets }}</p>
              </div>
              <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <font-awesome-icon icon="ticket" class="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium mb-1">Người dùng</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
              </div>
              <div class="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <font-awesome-icon icon="users" class="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium mb-1">Doanh thu</p>
                <p class="text-3xl font-bold text-gray-900">{{ parseFloat(stats.totalRevenue).toFixed(2) }}</p>
                <p class="text-xs text-gray-500">MATIC</p>
              </div>
              <div class="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                <font-awesome-icon icon="dollar-sign" class="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Thao tác nhanh</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              @click="$router.push('/admin/create-event')"
              class="flex items-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              <font-awesome-icon icon="plus" class="text-xl" />
              Tạo sự kiện mới
            </button>
            <button
              @click="$router.push('/admin/events')"
              class="flex items-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              <font-awesome-icon icon="list" class="text-xl" />
              Quản lý sự kiện
            </button>
            <button
              @click="showUsersModal = true; fetchUsers()"
              class="flex items-center gap-3 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              <font-awesome-icon icon="users" class="text-xl" />
              Quản lý người dùng
            </button>
          </div>
        </div>

        <!-- Top Events -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Sự kiện hàng đầu</h2>
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <div v-else-if="stats.topEvents && stats.topEvents.length > 0" class="space-y-4">
            <div
              v-for="(event, index) in stats.topEvents"
              :key="event._id"
              class="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              @click="$router.push(`/events/${event.eventId}`)"
            >
              <div class="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span class="text-indigo-600 font-bold text-lg">{{ index + 1 }}</span>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">{{ event.name }}</h3>
                <p class="text-sm text-gray-600">{{ event.totalTicketsSold || 0 }} vé đã bán</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-indigo-600">{{ parseFloat(event.revenue || 0).toFixed(2) }} MATIC</p>
                <span :class="[
                  'inline-block px-3 py-1 rounded-full text-xs font-medium',
                  event.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ event.isActive ? 'Đang hoạt động' : 'Đã kết thúc' }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            Chưa có sự kiện nào
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Giao dịch gần đây</h2>
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <div v-else-if="stats.recentTransactions && stats.recentTransactions.length > 0" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Loại</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Người dùng</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Số tiền</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thời gian</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="tx in stats.recentTransactions"
                  :key="tx._id"
                  class="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td class="py-3 px-4">
                    <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {{ tx.type }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono text-sm text-gray-600">{{ formatAddress(tx.from) }}</td>
                  <td class="py-3 px-4 font-semibold text-gray-900">{{ parseFloat(tx.amount || 0).toFixed(4) }} MATIC</td>
                  <td class="py-3 px-4 text-sm text-gray-600">{{ formatDate(tx.createdAt) }}</td>
                  <td class="py-3 px-4">
                    <span :class="[
                      'inline-block px-3 py-1 text-xs font-medium rounded-full',
                      tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    ]">
                      {{ tx.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            Chưa có giao dịch nào
          </div>
        </div>
      </div>

      <!-- Users Management Modal -->
      <div v-if="showUsersModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showUsersModal = false">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-white">Quản lý người dùng</h2>
            <button @click="showUsersModal = false" class="text-white hover:text-gray-200">
              <font-awesome-icon icon="times" class="text-2xl" />
            </button>
          </div>
          <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 80px)">
            <div v-if="loadingUsers" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="user in users"
                :key="user._id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div class="flex-1">
                  <div class="font-semibold text-gray-900">{{ user.name || 'Unnamed User' }}</div>
                  <div class="text-sm font-mono text-gray-600">{{ user.walletAddress }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ user.email || 'No email' }}</div>
                </div>
                <div class="flex items-center gap-3">
                  <select
                    :value="user.role"
                    @change="updateUserRole(user, $event.target.value)"
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="user">User</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <span :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'organizer' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  ]">
                    {{ user.role }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { api } from '@/stores/user'
import { format } from 'date-fns'

const router = useRouter()
const loading = ref(false)
const loadingUsers = ref(false)
const showUsersModal = ref(false)

const stats = ref({
  totalEvents: 0,
  totalTickets: 0,
  totalUsers: 0,
  totalRevenue: '0',
  topEvents: [],
  recentTransactions: []
})

const users = ref([])

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/dashboard')
    if (data.success) {
      stats.value = data.data.stats
      stats.value.topEvents = data.data.topEvents || []
      stats.value.recentTransactions = data.data.recentTransactions || []
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    window.$message?.error('Không thể tải dữ liệu dashboard')
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  loadingUsers.value = true
  try {
    const { data } = await api.get('/admin/users?limit=50')
    if (data.success) {
      users.value = data.data.users || []
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    window.$message?.error('Không thể tải danh sách người dùng')
  } finally {
    loadingUsers.value = false
  }
}

const updateUserRole = async (user, newRole) => {
  try {
    const { data } = await api.put(`/users/${user.walletAddress}`, { role: newRole })
    if (data.success) {
      window.$message?.success(`Đã cập nhật role của ${user.name || user.walletAddress} thành ${newRole}`)
      await fetchUsers()
    }
  } catch (error) {
    console.error('Failed to update user role:', error)
    window.$message?.error('Không thể cập nhật role')
  }
}

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
  } catch {
    return ''
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
