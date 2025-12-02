<template>
  <app-layout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-br from-indigo-600 to-purple-700 py-12 px-8 text-white">
        <div class="max-w-4xl mx-auto">
          <button
            @click="$router.back()"
            class="flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-4"
          >
            <font-awesome-icon icon="arrow-left" />
            Quay lại
          </button>
          <h1 class="text-5xl font-extrabold mb-2">Tạo sự kiện mới</h1>
          <p class="text-xl opacity-95">Tạo sự kiện và phát hành vé NFT trên blockchain</p>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-8 -mt-8 pb-16">
        <!-- Notice -->
        <div v-if="userStore.user && userStore.user.role !== 'organizer' && userStore.user.role !== 'admin'" class="mb-6 p-4 border-l-4 border-red-500 bg-red-50 rounded-lg">
          <div class="flex gap-3">
            <font-awesome-icon icon="exclamation-triangle" class="text-red-600 text-xl mt-1" />
            <div>
              <h3 class="font-semibold text-red-800 mb-1">Không có quyền tạo sự kiện</h3>
              <p class="text-red-700 text-sm">
                Tài khoản của bạn là <strong>User</strong>. Để tạo sự kiện, bạn cần có role <strong>Organizer</strong> hoặc <strong>Admin</strong>.
                Vui lòng liên hệ admin để được nâng cấp quyền.
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-8">
          <form @submit.prevent="handleSubmit">
            <!-- Event Name -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Tên sự kiện <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formValue.name"
                type="text"
                required
                placeholder="Nhập tên sự kiện"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <!-- Description -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Mô tả <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="formValue.description"
                required
                rows="4"
                placeholder="Mô tả chi tiết về sự kiện"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              ></textarea>
            </div>

            <!-- Category -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Danh mục <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formValue.category"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="">Chọn danh mục</option>
                <option value="music">Music</option>
                <option value="concert">Concert</option>
                <option value="conference">Conference</option>
                <option value="sports">Sports</option>
                <option value="theater">Theater</option>
                <option value="festival">Festival</option>
                <option value="workshop">Workshop</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Location -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Địa điểm <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formValue.location"
                type="text"
                required
                placeholder="Địa chỉ tổ chức sự kiện"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <!-- Date and Time -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Thời gian bắt đầu <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formValue.startTime"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <p class="text-xs text-gray-500 mt-1"> Lưu ý : Sự kiện bắt đầu phải ít nhất 2 giờ sau </p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Thời gian kết thúc <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formValue.endTime"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <p class="text-xs text-gray-500 mt-1">Phải sau thời gian bắt đầu</p>
              </div>
            </div>

            <!-- Time Info Box -->
            <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-start gap-2">
                <font-awesome-icon icon="info-circle" class="text-yellow-600 mt-1" />
                <div class="text-sm text-green-800">
                  <strong>Lưu ý về thời gian:</strong>
                  <ul class="list-disc list-inside mt-2 space-y-1">
                    <li>Thời gian bắt đầu phải ít nhất <strong>3 giờ sau</strong> hiện tại</li>
                    <li>Vé sẽ bắt đầu bán <strong>2 phút sau</strong> khi tạo mỗi loại vé</li>
                    <li>Vé ngừng bán <strong>1 giờ trước</strong> khi sự kiện bắt đầu</li>
                    <li>Thời gian kết thúc phải sau thời gian bắt đầu</li>
                    <li class="text-red-600 font-semibold">⚠️ Nếu có nhiều loại vé (3+), cần xác nhận MetaMask NHANH!</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Image URL -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                URL hình ảnh banner
              </label>
              <input
                v-model="formValue.imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <p class="text-sm text-gray-500 mt-2">Hoặc bạn có thể tải lên sau khi tạo sự kiện</p>
            </div>

            <!-- Ticket Types Section -->
            <div class="mb-6 p-6 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-900">Loại vé</h3>
                <button
                  type="button"
                  @click="addTicketType"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  <font-awesome-icon icon="plus" />
                  Thêm loại vé
                </button>
              </div>

              <div v-for="(ticket, index) in formValue.ticketTypes" :key="index" class="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-semibold text-gray-900">Loại vé #{{ index + 1 }}</h4>
                  <button
                    v-if="formValue.ticketTypes.length > 1"
                    type="button"
                    @click="removeTicketType(index)"
                    class="text-red-600 hover:text-red-700"
                  >
                    <font-awesome-icon icon="trash" />
                  </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tên loại vé</label>
                    <input
                      v-model="ticket.name"
                      type="text"
                      required
                      placeholder="VD: VIP, Standard"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Giá (POL)</label>
                    <input
                      v-model.number="ticket.price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                    <input
                      v-model.number="ticket.maxSupply"
                      type="number"
                      min="1"
                      required
                      placeholder="100"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div v-if="formValue.ticketTypes.length === 0" class="text-center py-4 text-gray-500">
                Chưa có loại vé nào. Nhấn "Thêm loại vé" để bắt đầu.
              </div>
            </div>

            <!-- MetaMask Notice -->
            <div class="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div class="flex items-start gap-2">
                <font-awesome-icon icon="wallet" class="text-orange-600 mt-1" />
                <div class="text-sm text-green-800">
                  <strong>Lưu ý về MetaMask:</strong>
                  <p class="mt-1">Phải cần xác nhận <strong>{{ formValue.ticketTypes.length + 1 }} giao dịch</strong> trên MetaMask:</p>
                  <ul class="list-disc list-inside mt-1 space-y-1">
                    <li>1 giao dịch để tạo sự kiện</li>
                    <li>{{ formValue.ticketTypes.length }} giao dịch để tạo các loại vé</li>
                  </ul>
                  <p class="mt-2 text-red-700 font-semibold">⚠️ QUAN TRỌNG:</p>
                  <ul class="list-disc list-inside mt-1 space-y-1 text-red-700">
                    <li>Không đóng popup MetaMask</li>
                    <li><strong>Xác nhận nhanh liên tục</strong> - không để quá lâu giữa các lần xác nhận</li>
                    <li>Nếu chờ quá lâu, thời gian bán vé có thể hết hạn → giao dịch thất bại</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex gap-4">
              <button
                type="submit"
                :disabled="loading || !userStore.user || (userStore.user.role !== 'organizer' && userStore.user.role !== 'admin')"
                class="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <div v-if="loading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <font-awesome-icon v-else icon="plus" />
                {{ loading ? 'Đang tạo sự kiện...' : 'Tạo sự kiện' }}
              </button>
              <button
                type="button"
                @click="$router.back()"
                :disabled="loading"
                class="px-6 py-3 border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-bold rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { useEventsStore } from '@/stores/events'
import AppLayout from '@/components/AppLayout.vue'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS } from '@/utils/constants'
import ContractABI from '@/utils/contractABI.json'
import { api } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const walletStore = useWalletStore()
const eventsStore = useEventsStore()
const loading = ref(false)

const formValue = ref({
  name: '',
  description: '',
  category: '',
  location: '',
  startTime: '',
  endTime: '',
  imageUrl: '',
  ticketTypes: [
    { name: 'Regular Pass', price: 0.01, maxSupply: 100 }
  ]
})

const addTicketType = () => {
  formValue.value.ticketTypes.push({
    name: '',
    price: 0,
    maxSupply: 0
  })
}

const removeTicketType = (index) => {
  formValue.value.ticketTypes.splice(index, 1)
}

const handleSubmit = async () => {
  // Prevent multiple submissions
  if (loading.value) {
    console.log('Already creating event, ignoring duplicate submission')
    return
  }

  // Check user role - only organizer and admin can create events
  if (!userStore.user) {
    window.$message?.error('Vui lòng đăng nhập trước')
    return
  }
  
  if (userStore.user.role !== 'organizer' && userStore.user.role !== 'admin') {
    window.$message?.error('Chỉ Organizer và Admin mới có quyền tạo sự kiện. Role hiện tại: ' + userStore.user.role)
    return
  }

  // Check wallet connection
  if (!walletStore.isConnected) {
    window.$message?.error('Vui lòng kết nối ví MetaMask trước')
    return
  }

  // Validate times
  const now = new Date()
  
  console.log('=== FORM VALUES DEBUG ===')
  console.log('Raw formValue:', JSON.stringify(formValue.value, null, 2))
  console.log('startTime raw:', formValue.value.startTime, typeof formValue.value.startTime)
  console.log('endTime raw:', formValue.value.endTime, typeof formValue.value.endTime)
  
  // Parse datetime-local input correctly (it's in local timezone)
  // Need to treat the input as local time, not UTC
  const startTime = new Date(formValue.value.startTime)
  const endTime = new Date(formValue.value.endTime)
  
  console.log('Parsed startTime:', startTime, 'isValid:', !isNaN(startTime.getTime()))
  console.log('Parsed endTime:', endTime, 'isValid:', !isNaN(endTime.getTime()))

  // Validate parsed dates
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    window.$message?.error('Thời gian không hợp lệ. Vui lòng chọn lại thời gian.')
    return
  }

  if (startTime <= now) {
    window.$message?.error('Thời gian bắt đầu phải là tương lai')
    return
  }

  if (endTime <= startTime) {
    window.$message?.error('Thời gian kết thúc phải sau thời gian bắt đầu')
    return
  }

  // Check if start time is at least 2 hours in the future
  // This ensures: sale can start now + 1 min, end 1 hour before event = at least 1 hour sale window
  const minFutureTime = new Date(now.getTime() + 3 * 60 * 60 * 1000) // 3 hours from now (safe for multiple tickets)
  if (startTime < minFutureTime) {
    const hoursNeeded = Math.ceil((minFutureTime - startTime) / (60 * 60 * 1000))
    window.$message?.error(
      `Thời gian bắt đầu sự kiện phải ít nhất 3 giờ sau thời điểm hiện tại. ` +
      `Vui lòng chọn thời gian muộn hơn ${hoursNeeded} giờ nữa. ` +
      `(Cần thời gian đủ để:\n` +
      `• Mở bán vé với buffer time 2 phút\n` +
      `• Xác nhận nhiều loại vé trên MetaMask\n` +
      `• Vé ngừng bán 1 giờ trước sự kiện)`
    )
    return
  }

  // Set loading state BEFORE any async operations
  loading.value = true
  console.log(' Form locked - Starting event creation...')
  
  try {
    // Calculate total MetaMask confirmations needed
    const totalConfirmations = 1 + formValue.value.ticketTypes.length // 1 for event + N for tickets
    window.$message?.info(` Bạn sẽ cần xác nhận ${totalConfirmations} giao dịch trên MetaMask: 1 tạo sự kiện + ${formValue.value.ticketTypes.length} tạo loại vé`)
    
    // Step 1: Create event on blockchain
    window.$message?.info(' [1/${totalConfirmations}] Đang tạo sự kiện trên blockchain...')
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI.abi, signer)

    // Convert datetime to Unix timestamp (seconds since epoch)
    // getTime() returns milliseconds, so divide by 1000
    const startTimeStamp = Math.floor(startTime.getTime() / 1000)
    const endTimeStamp = Math.floor(endTime.getTime() / 1000)
    const nowTimestamp = Math.floor(Date.now() / 1000)

    console.log('Creating event with timestamps:', {
      startTime: startTimeStamp,
      endTime: endTimeStamp,
      now: nowTimestamp,
      startTimeISO: startTime.toISOString(),
      endTimeISO: endTime.toISOString(),
      startTimeLocal: startTime.toLocaleString('vi-VN'),
      endTimeLocal: endTime.toLocaleString('vi-VN'),
      name: formValue.value.name,
      nameLength: formValue.value.name.length,
      nameBytes: new Blob([formValue.value.name]).size,
      descriptionLength: formValue.value.description.length,
      descriptionBytes: new Blob([formValue.value.description]).size,
      walletAddress: walletStore.address,
      timeDiff: `${Math.floor((startTimeStamp - nowTimestamp) / 3600)} hours ${Math.floor(((startTimeStamp - nowTimestamp) % 3600) / 60)} minutes`,
      startInFuture: startTimeStamp > nowTimestamp ? 'YES ✓' : 'NO ❌'
    })

    // Validate timestamps before sending to blockchain
    const minimumFutureTime = nowTimestamp + 120 // At least 2 minutes in future to account for block time
    if (startTimeStamp < minimumFutureTime) {
      throw new Error('Thời gian bắt đầu quá gần! Vui lòng chọn thời gian ít nhất 2 phút sau.')
    }

    // Validate contract is accessible
    try {
      const contractName = await contract.name()
      console.log('Contract accessible, name:', contractName)
    } catch (e) {
      throw new Error('Không thể kết nối với smart contract. Vui lòng kiểm tra CONTRACT_ADDRESS trong .env')
    }

    // Estimate gas first
    let estimatedGas
    try {
      estimatedGas = await contract.createEvent.estimateGas(
        formValue.value.name,
        formValue.value.description,
        startTimeStamp,
        endTimeStamp
      )
      console.log('Estimated gas:', estimatedGas.toString())
    } catch (gasError) {
      console.error('Gas estimation failed:', gasError)
      console.error('Estimation failed with params:', {
        name: formValue.value.name,
        nameLength: formValue.value.name.length,
        nameBytes: new Blob([formValue.value.name]).size,
        description: formValue.value.description.substring(0, 50) + '...',
        descriptionLength: formValue.value.description.length,
        descriptionBytes: new Blob([formValue.value.description]).size,
        startTimeStamp,
        endTimeStamp,
        nowTimestamp: Math.floor(Date.now() / 1000),
        startInFuture: startTimeStamp > Math.floor(Date.now() / 1000),
        timeDiff: startTimeStamp - Math.floor(Date.now() / 1000)
      })
      
      // Try to parse the actual error from smart contract
      if (gasError.message?.includes('Start time must be in future')) {
        throw new Error(
          `❌ Smart Contract từ chối: "Start time must be in future"\n\n` +
          `Thời gian hiện tại: ${new Date().toLocaleString('vi-VN')}\n` +
          `Thời gian bắt đầu: ${startTime.toLocaleString('vi-VN')}\n` +
          `Block timestamp hiện tại: ${Math.floor(Date.now() / 1000)}\n` +
          `Start timestamp: ${startTimeStamp}\n` +
          `Chênh lệch: ${startTimeStamp - Math.floor(Date.now() / 1000)} giây\n\n` +
          `Vui lòng chọn thời gian xa hơn (ít nhất 3 giờ).`
        )
      } else if (gasError.message?.includes('End time must be after start time')) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu')
      } else if (gasError.message?.includes('Name cannot be empty')) {
        throw new Error('Tên sự kiện không được để trống')
      } else if (gasError.data) {
        // Try to decode revert reason
        console.error('Revert data:', gasError.data)
        throw new Error(
          `Smart Contract từ chối tạo sự kiện!\n\n` +
          `Có thể do:\n` +
          `• Thời gian không hợp lệ (cần >= 3 giờ sau)\n` +
          `• Tên/mô tả chứa ký tự đặc biệt không hợp lệ\n` +
          `• Ví không có quyền (cần ORGANIZER role)\n\n` +
          `Chi tiết lỗi: ${gasError.message}\n` +
          `Revert data: ${gasError.data}`
        )
      }
      throw new Error('Giao dịch sẽ thất bại: ' + (gasError.shortMessage || gasError.message))
    }

    // Add 50% buffer for Vietnamese Unicode characters
    const gasLimit = estimatedGas * 150n / 100n
    console.log('Using gas limit:', gasLimit.toString(), '(estimated:', estimatedGas.toString(), ')')

    // Check wallet balance before sending transaction
    const balance = await provider.getBalance(walletStore.address)
    const balanceInMatic = ethers.formatEther(balance)
    console.log('Wallet balance:', balanceInMatic, 'MATIC')
    
    if (balance < gasLimit * 50000000000n) { // Rough estimate: gasLimit * 50 Gwei
      throw new Error(
        `⚠️ Không đủ MATIC để trả gas fee!\n\n` +
        `Số dư hiện tại: ${balanceInMatic} MATIC\n` +
        `Gas cần thiết: ~${ethers.formatEther(gasLimit * 50000000000n)} MATIC\n\n` +
        `Vui lòng nạp thêm MATIC từ faucet: https://faucet.polygon.technology/`
      )
    }

    // Create event transaction with estimated gas + buffer
    console.log('Sending createEvent transaction...')
    let createEventTx
    try {
      createEventTx = await contract.createEvent(
        formValue.value.name,
        formValue.value.description,
        startTimeStamp,
        endTimeStamp,
        {
          gasLimit: gasLimit
        }
      )
      console.log('Transaction sent, hash:', createEventTx.hash)
    } catch (txError) {
      console.error('Transaction failed to send:', txError)
      
      // Parse MetaMask/RPC errors
      if (txError.code === 'ACTION_REJECTED' || txError.code === 4001) {
        throw new Error('❌ Bạn đã từ chối giao dịch trên MetaMask')
      } else if (txError.message?.includes('insufficient funds')) {
        throw new Error(
          `❌ Không đủ MATIC!\n\n` +
          `Số dư: ${balanceInMatic} MATIC\n` +
          `Vui lòng nạp thêm từ faucet.`
        )
      } else if (txError.message?.includes('nonce')) {
        throw new Error(
          `❌ Lỗi Nonce (transaction ordering)!\n\n` +
          `Vui lòng:\n` +
          `1. Mở MetaMask\n` +
          `2. Settings → Advanced → Clear activity tab data\n` +
          `3. Thử lại`
        )
      } else if (txError.data) {
        // Try to decode revert reason from error data
        try {
          const decodedError = contract.interface.parseError(txError.data)
          throw new Error(`Smart Contract revert: ${decodedError?.name || 'Unknown'}\n${txError.message}`)
        } catch (e) {
          console.error('Could not decode error:', e)
        }
      }
      
      throw new Error(
        `❌ Giao dịch thất bại!\n\n` +
        `Lỗi: ${txError.shortMessage || txError.message}\n\n` +
        `Có thể do:\n` +
        `• Không đủ MATIC (cần ~0.01 MATIC)\n` +
        `• Thời gian không hợp lệ\n` +
        `• Network congestion\n\n` +
        `Vui lòng kiểm tra console để biết chi tiết.`
      )
    }

    window.$message?.info('Đang chờ xác nhận giao dịch...')
    const receipt = await createEventTx.wait()
    
    // Get event ID from the transaction receipt
    const eventCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log)
        return parsed?.name === 'EventCreated'
      } catch {
        return false
      }
    })

    if (!eventCreatedEvent) {
      throw new Error('Không tìm thấy event ID từ blockchain')
    }

    const parsedEvent = contract.interface.parseLog(eventCreatedEvent)
    const eventId = Number(parsedEvent.args.eventId)

    window.$message?.success(` Sự kiện đã được tạo trên blockchain! Event ID: ${eventId}`)

    // Step 2: Create ticket types on blockchain
    const totalTicketTypes = formValue.value.ticketTypes.length
    window.$message?.info(` Đang tạo ${totalTicketTypes} loại vé (mỗi loại cần 1 lần xác nhận MetaMask)...`)
    
    // Sale ends 1 hour before event starts (this is fixed for all tickets)
    const saleEndTime = startTimeStamp - 3600
    
    // Initial validation - ensure event is far enough in future
    // Need enough time for: buffer (120s) + user confirmations + 1 hour before event
    const nowForCheck = Math.floor(Date.now() / 1000)
    const initialSaleStartTime = nowForCheck + 120 // 2 minutes buffer for multiple tickets
    
    // Minimum safe window for multiple tickets: at least 30 minutes of sale time
    const minSaleWindow = 30 * 60 // 30 minutes
    const currentSaleWindow = saleEndTime - initialSaleStartTime
    
    if (currentSaleWindow < minSaleWindow) {
      throw new Error(
        `⚠️ Thời gian sự kiện quá gần!\n\n` +
        `Cần ít nhất 30 phút cửa sổ bán vé để xử lý nhiều loại vé.\n` +
        `Hiện tại: ${Math.floor(currentSaleWindow / 60)} phút\n` +
        `Yêu cầu: 30 phút\n\n` +
        `✓ Vui lòng chọn thời gian sự kiện ít nhất 3 giờ sau hiện tại.`
      )
    }
    
    console.log('Initial sale time check:', {
      now: nowForCheck,
      initialSaleStartTime,
      saleEndTime,
      eventStartTime: startTimeStamp,
      saleEndISO: new Date(saleEndTime * 1000).toISOString(),
      currentSaleWindow: `${Math.floor(currentSaleWindow / 60)} minutes`,
      saleDurationEstimate: `${(currentSaleWindow / 3600).toFixed(2)} hours`
    })

    for (let i = 0; i < formValue.value.ticketTypes.length; i++) {
      const ticket = formValue.value.ticketTypes[i]
      const currentStep = i + 2 // +1 for event creation, +1 for current index
      
      // IMPORTANT: Recalculate saleStartTime for EACH ticket to ensure it's always in future
      // This accounts for time spent waiting for MetaMask confirmations
      // Use 2 minutes (120s) buffer to ensure transaction has time to be mined
      const currentSaleStartTime = Math.floor(Date.now() / 1000) + 120
      
      // CRITICAL: Validate this ticket's sale time is still valid
      // If user is too slow, we need to abort early before wasting gas
      const timeRemaining = saleEndTime - currentSaleStartTime
      
      if (timeRemaining <= 0) {
        throw new Error(
          `⚠️ TIMEOUT: Thời gian bán vé đã hết!\n\n` +
          `Bạn đã chờ quá lâu giữa các lần xác nhận MetaMask.\n` +
          `Thời gian kết thúc bán vé: ${new Date(saleEndTime * 1000).toLocaleString('vi-VN')}\n` +
          `Thời gian hiện tại + 2 phút: ${new Date(currentSaleStartTime * 1000).toLocaleString('vi-VN')}\n\n` +
          `✓ Giải pháp: Chọn thời gian sự kiện xa hơn (ít nhất ${Math.ceil((120 - timeRemaining + 3600) / 3600)} giờ nữa) và thử lại.`
        )
      }
      
      if (timeRemaining < 300) { // Less than 5 minutes remaining
        window.$message?.warning(
          `⚠️ Cảnh báo: Chỉ còn ${Math.floor(timeRemaining / 60)} phút cho thời gian bán vé!\n` +
          `Vui lòng xác nhận MetaMask NGAY để tránh thất bại.`
        )
      }
      
      console.log(`Creating ticket type ${i + 1}/${totalTicketTypes}:`, {
        ticketIndex: i,
        eventId,
        name: ticket.name,
        price: ticket.price,
        maxSupply: ticket.maxSupply,
        currentTime: Math.floor(Date.now() / 1000),
        saleStartTime: currentSaleStartTime,
        saleEndTime,
        eventStartTime: startTimeStamp,
        saleStartISO: new Date(currentSaleStartTime * 1000).toISOString(),
        saleEndISO: new Date(saleEndTime * 1000).toISOString(),
        timeUntilSaleStart: `${currentSaleStartTime - Math.floor(Date.now() / 1000)}s`,
        saleDuration: `${((saleEndTime - currentSaleStartTime) / 3600).toFixed(2)} hours`,
        timeRemaining: `${Math.floor(timeRemaining / 60)} minutes ${timeRemaining % 60} seconds`
      })
      
      window.$message?.info(` [${currentStep}/${totalConfirmations}] Đang tạo "${ticket.name}" - Vui lòng xác nhận trên MetaMask...`)
      
      // Estimate gas for ticket creation
      let ticketGas
      try {
        ticketGas = await contract.createTicketType.estimateGas(
          eventId,
          ticket.name,
          ethers.parseEther(ticket.price.toString()),
          ticket.maxSupply,
          currentSaleStartTime,
          saleEndTime
        )
        console.log(`Estimated gas for ticket ${i + 1}:`, ticketGas.toString())
      } catch (gasError) {
        console.error(`Ticket ${i + 1} gas estimation failed:`, gasError)
        console.error('Failed parameters:', {
          eventId,
          name: ticket.name,
          price: ethers.parseEther(ticket.price.toString()).toString(),
          maxSupply: ticket.maxSupply,
          saleStartTime: currentSaleStartTime,
          saleEndTime,
          timeDiff: saleEndTime - currentSaleStartTime
        })
        
        if (gasError.message?.includes('Invalid sale time range')) {
          throw new Error(
            `❌ Thời gian bán vé không hợp lệ cho "${ticket.name}"!\n\n` +
            `Smart contract từ chối vì: saleEndTime (${saleEndTime}) <= saleStartTime (${currentSaleStartTime})\n` +
            `Vui lòng chọn thời gian sự kiện xa hơn và thử lại.`
          )
        } else if (gasError.message?.includes('Sale must end before event')) {
          throw new Error(`Lỗi: Thời gian kết thúc bán vé (${new Date(saleEndTime * 1000).toLocaleString()}) phải trước khi sự kiện bắt đầu (${new Date(startTimeStamp * 1000).toLocaleString()}).`)
        }
        throw new Error(`Không thể tạo vé "${ticket.name}": ` + (gasError.shortMessage || gasError.message))
      }
      
      const ticketGasLimit = ticketGas * 150n / 100n
      
      const createTicketTx = await contract.createTicketType(
        eventId,
        ticket.name,
        ethers.parseEther(ticket.price.toString()),
        ticket.maxSupply,
        currentSaleStartTime,
        saleEndTime,
        {
          gasLimit: ticketGasLimit
        }
      )
      
      window.$message?.info(` Đang chờ xác nhận giao dịch "${ticket.name}"...`)
      const ticketReceipt = await createTicketTx.wait()
      console.log(`Ticket ${i + 1} created successfully. Block:`, ticketReceipt.blockNumber)
      window.$message?.success(` [${currentStep}/${totalConfirmations}] Đã tạo loại vé: ${ticket.name}`)
    }

    // Step 3: Sync to backend database
    window.$message?.info('Đang đồng bộ với database...')
    
    try {
      console.log('=== SYNC TO BACKEND ===')
      console.log('Event ID:', eventId)
      console.log('Wallet address:', walletStore.address)
      
      // Sync event
      const syncEventData = {
        eventId,
        name: formValue.value.name,
        description: formValue.value.description,
        startTime: startTimeStamp,
        endTime: endTimeStamp,
        organizer: walletStore.address,
        isActive: true,
        totalTicketsSold: 0,
        revenue: '0',
        category: formValue.value.category,
        location: formValue.value.location,
        bannerImage: formValue.value.imageUrl
      }
      
      console.log('Syncing event data:', syncEventData)
      const syncEventResponse = await api.post('/events/sync', syncEventData)
      console.log('Sync event response:', syncEventResponse.data)

      // Get ticket types from blockchain and sync
      console.log('Getting ticket type IDs from blockchain...')
      const ticketTypeIds = await contract.getEventTicketTypes(eventId)
      console.log('Ticket type IDs:', ticketTypeIds)
      
      for (const tokenId of ticketTypeIds) {
        console.log('Getting ticket type details for tokenId:', Number(tokenId))
        const ticketType = await contract.getTicketType(tokenId)
        console.log('Ticket type from blockchain:', ticketType)
        
        const syncTicketData = {
          tokenId: Number(tokenId),
          eventId,
          name: ticketType.name,
          price: ticketType.price.toString(),
          maxSupply: Number(ticketType.maxSupply),
          currentSupply: 0,
          startSaleTime: Number(ticketType.startSaleTime),
          endSaleTime: Number(ticketType.endSaleTime),
          isActive: ticketType.isActive
        }
        
        console.log('Syncing ticket type:', syncTicketData)
        const syncTicketResponse = await api.post(`/events/${eventId}/ticket-types/sync`, syncTicketData)
        console.log('Sync ticket response:', syncTicketResponse.data)
      }

      window.$message?.success('✅ Sự kiện đã được tạo thành công!')
      
      // Step 4: Upload banner image to IPFS if provided
      if (formValue.value.imageUrl && formValue.value.imageUrl.trim()) {
        try {
          window.$message?.info('📤 Đang tải ảnh banner lên IPFS...')
          console.log('Uploading banner to IPFS:', formValue.value.imageUrl)
          console.log('API endpoint:', `/events/${eventId}/upload-banner`)
          console.log('Auth token:', localStorage.getItem('authToken') ? 'Exists' : 'Missing')
          
          const uploadResponse = await api.post(`/events/${eventId}/upload-banner`, {
            imageUrl: formValue.value.imageUrl
          })
          
          if (uploadResponse.data.success) {
            window.$message?.success('✅ Ảnh banner đã được tải lên IPFS/Pinata!')
            console.log('Banner IPFS hash:', uploadResponse.data.data.ipfsHash)
            console.log('Banner IPFS URL:', uploadResponse.data.data.ipfsUrl)
          }
        } catch (uploadError) {
          console.error('Banner upload error:', uploadError)
          console.error('Error details:', {
            message: uploadError.message,
            response: uploadError.response?.data,
            status: uploadError.response?.status
          })
          window.$message?.warning('⚠️ Tải ảnh lên IPFS thất bại. Bạn có thể upload lại sau.')
        }
      }
      
      console.log('Reloading events from store...')
      // Reload events list
      await eventsStore.fetchEvents()
      console.log('Events reloaded successfully')
      
      // Redirect to manage events page
      console.log('Redirecting to /admin...')
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
      
    } catch (syncError) {
      console.error('Sync error:', syncError)
      window.$message?.warning('Sự kiện đã tạo trên blockchain nhưng chưa đồng bộ database. Vui lòng sync thủ công.')
      
      // Try to reload events anyway
      try {
        await eventsStore.fetchEvents()
      } catch (e) {
        console.error('Failed to reload events:', e)
      }
      
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    }

  } catch (error) {
    console.error('Failed to create event:', error)
    
    let errorMessage = 'Không thể tạo sự kiện'
    
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      errorMessage = ' Bạn đã từ chối giao dịch trên MetaMask. Vui lòng thử lại và xác nhận tất cả các giao dịch.'
    } else if (error.message?.includes('user rejected') || error.message?.includes('User denied')) {
      errorMessage = ' Bạn đã từ chối giao dịch trên MetaMask. Vui lòng thử lại và xác nhận tất cả các giao dịch.'
    } else if (error.message?.includes('Start time must be in future')) {
      errorMessage = ' Thời gian bắt đầu phải là tương lai. Vui lòng chọn thời gian ít nhất 2 giờ sau.'
    } else if (error.message?.includes('End time must be after start time')) {
      errorMessage = 'Thời gian kết thúc phải sau thời gian bắt đầu'
    } else if (error.message?.includes('Invalid sale time range')) {
      errorMessage = '⚠️ Thời gian bán vé không hợp lệ!\n\n' +
                    'Smart contract yêu cầu:\n' +
                    '• Thời gian kết thúc bán vé > thời gian bắt đầu bán vé\n' +
                    '• Vé ngừng bán 1 giờ trước khi sự kiện bắt đầu\n\n' +
                    '⏰ Vui lòng chọn thời gian bắt đầu sự kiện ít nhất 2 giờ sau hiện tại!'
    } else if (error.message?.includes('Sale must end before event')) {
      errorMessage = 'Lỗi cấu hình: Thời gian kết thúc bán vé phải trước khi sự kiện bắt đầu. Vui lòng chọn thời gian sự kiện xa hơn.'
    } else if (error.message?.includes('insufficient funds')) {
      errorMessage = ' Không đủ MATIC để trả gas fee. Vui lòng nạp thêm MATIC từ faucet.'
    } else if (error.message?.includes('Thời gian bắt đầu sự kiện quá gần')) {
      // Custom error from our validation
      errorMessage = error.message
    } else if (error.message?.includes('Internal JSON-RPC error')) {
      // More detailed error for RPC errors
      console.error('RPC Error Details:', error)
      errorMessage = ' Lỗi blockchain RPC:\n' +
                    '• Gas estimation failed - giao dịch sẽ thất bại\n' +
                    '• Có thể do: thời gian không hợp lệ, thiếu quyền, hoặc contract lỗi\n' +
                    '\nKiểm tra:\n' +
                    '1. Thời gian bắt đầu sự kiện ≥ 2 giờ sau hiện tại ✓\n' +
                    '2. Thời gian kết thúc > thời gian bắt đầu ✓\n' +
                    '3. Ví có đủ MATIC (≥0.05 MATIC) ✓\n' +
                    '4. Contract address đúng: ' + CONTRACT_ADDRESS.substring(0, 10) + '...'
    } else if (error.code === 'UNKNOWN_ERROR') {
      errorMessage = ' Lỗi không xác định từ blockchain:\n' +
                    '• ' + (error.message || 'Unknown error') + '\n' +
                    '\nThử:\n' +
                    '1. Kiểm tra kết nối mạng Polygon Amoy\n' +
                    '2. Refresh MetaMask và switch network\n' +
                    '3. Đảm bảo contract đã deploy: ' + CONTRACT_ADDRESS.substring(0, 10) + '...\n' +
                    '4. Kiểm tra console để xem chi tiết'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    window.$message?.error(errorMessage)
  } finally {
    loading.value = false
    console.log(' Form unlocked - Process completed')
  }
}

onMounted(async () => {
  // Fetch user info if not loaded
  if (!userStore.user) {
    await userStore.fetchUser()
  }
  
  // Debug: Log user info
  console.log('=== USER INFO DEBUG ===')
  console.log('User:', userStore.user)
  console.log('User role:', userStore.user?.role)
  console.log('Is authenticated:', userStore.isAuthenticated)
  console.log('Wallet connected:', walletStore.isConnected)
  console.log('Wallet address:', walletStore.address)

  // Set default times to future dates
  const now = new Date()
  
  // Default start time: 3 hours from now (minimum required for safe multi-ticket creation)
  const defaultStartTime = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  
  // Default end time: 6 hours from now
  const defaultEndTime = new Date(now.getTime() + 6 * 60 * 60 * 1000)
  
  // Format to datetime-local input format (YYYY-MM-DDTHH:MM)
  const formatDateTime = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  
  formValue.value.startTime = formatDateTime(defaultStartTime)
  formValue.value.endTime = formatDateTime(defaultEndTime)
})
</script>
