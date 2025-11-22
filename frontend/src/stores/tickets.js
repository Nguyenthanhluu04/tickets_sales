import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ethers } from 'ethers'
import { api } from './user'
import { useWalletStore } from './wallet'
import { useUserStore } from './user'

export const useTicketsStore = defineStore('tickets', () => {
  const tickets = ref([])
  const currentTicket = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchMyTickets(params = {}) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get('/tickets/my-tickets', { params })
      
      if (data.success) {
        tickets.value = data.data.data
        return data.data
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function syncTicket(transactionHash) {
    try {
      const { data } = await api.post('/tickets/sync', { transactionHash })
      return data.data
    } catch (err) {
      console.error('Failed to sync ticket:', err)
      throw err
    }
  }

  async function verifyTicket(tokenId) {
    try {
      const { data } = await api.get(`/tickets/verify/${tokenId}`)
      return data.data
    } catch (err) {
      console.error('Failed to verify ticket:', err)
      throw err
    }
  }

  async function checkInTicket(qrData, location) {
    try {
      const { data } = await api.post('/tickets/checkin', {
        qrData,
        location,
      })
      return data.data
    } catch (err) {
      console.error('Failed to check-in ticket:', err)
      throw err
    }
  }

  async function fetchTicketDetails(tokenId) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get(`/tickets/${tokenId}`)
      
      if (data.success) {
        currentTicket.value = data.data
        return data.data
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function purchaseTicket(eventId, tokenId, quantity, price) {
    loading.value = true
    error.value = null

    try {
      console.log('🎫 Starting ticket purchase...')
      console.log('Parameters:', { eventId, tokenId, quantity, price })

      const walletStore = useWalletStore()
      const userStore = useUserStore()

      if (!walletStore.isConnected) {
        throw new Error('Vui lòng kết nối ví')
      }
      console.log('✅ Wallet connected:', walletStore.address)

      if (!userStore.isAuthenticated) {
        throw new Error('Vui lòng đăng nhập')
      }
      console.log('✅ User authenticated')

      // Import contract ABI and create contract instance
      const contractArtifact = (await import('@/utils/contractABI.json')).default
      const contractABI = contractArtifact.abi || contractArtifact // Support both formats
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0xA83e898669B3BE5dc47cD860dC61dF2B67f724ea'

      console.log('📄 Contract address:', contractAddress)
      console.log('📄 ABI loaded, functions count:', Array.isArray(contractABI) ? contractABI.length : 'not array')

      // Ensure signer is properly initialized
      if (!walletStore.signer) {
        throw new Error('Signer not initialized. Please reconnect your wallet.')
      }

      // Get a fresh signer from the provider to ensure it's properly initialized
      const freshProvider = new ethers.BrowserProvider(window.ethereum)
      const freshSigner = await freshProvider.getSigner()

      console.log('🔑 Signer address:', await freshSigner.getAddress())

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        freshSigner
      )

      // Check if purchaseTicket function exists
      if (typeof contract.purchaseTicket !== 'function') {
        console.error('❌ purchaseTicket function not found in contract')
        console.log('Available functions:', Object.keys(contract))
        throw new Error('Contract function purchaseTicket not found')
      }
      console.log('✅ purchaseTicket function found')

      // Calculate total price - handle different price formats
      let pricePerTicket
      try {
        // Price could be a string, number, or BigInt
        if (typeof price === 'bigint') {
          pricePerTicket = price
        } else if (typeof price === 'string' || typeof price === 'number') {
          // Convert to BigInt (assumes price is in wei)
          pricePerTicket = BigInt(price.toString())
        } else if (price && price._isBigNumber) {
          // Handle ethers BigNumber
          pricePerTicket = BigInt(price.toString())
        } else {
          throw new Error('Invalid price format: ' + typeof price)
        }
      } catch (conversionError) {
        console.error('❌ Price conversion error:', conversionError)
        console.log('Price value:', price)
        throw new Error('Không thể chuyển đổi giá vé')
      }
      
      const totalPrice = pricePerTicket * BigInt(quantity)

      console.log('💰 Price calculation:')
      console.log('  - Price input type:', typeof price)
      console.log('  - Price input value:', price)
      console.log('  - Price per ticket (wei):', pricePerTicket.toString())
      console.log('  - Quantity:', quantity)
      console.log('  - Total price (wei):', totalPrice.toString())
      console.log('  - Total price (ETH):', ethers.formatEther(totalPrice))

      // Check wallet balance using signer's provider
      try {
        const balance = await walletStore.signer.provider.getBalance(walletStore.address)
        console.log('💵 Wallet balance:', ethers.formatEther(balance), 'ETH')
        
        if (balance < totalPrice) {
          throw new Error(`Số dư không đủ. Cần: ${ethers.formatEther(totalPrice)} MATIC, Có: ${ethers.formatEther(balance)} MATIC`)
        }
      } catch (balanceError) {
        console.warn('⚠️ Could not check balance:', balanceError.message)
        // Continue anyway - let the transaction fail if insufficient funds
      }

      console.log('🔄 Calling purchaseTicket on contract...')
      console.log('  - Token ID:', tokenId)
      console.log('  - Quantity:', quantity)
      console.log('  - Value (wei):', totalPrice.toString())

      // Call smart contract purchaseTicket function
      // The smart contract function signature is: purchaseTicket(uint256 _tokenId, uint256 _amount)
      // Call directly without spread operator to avoid "Cannot access private method" error
      const tx = await contract.purchaseTicket(
        tokenId,
        quantity,
        { value: totalPrice }
      )

      console.log('✅ Transaction sent:', tx.hash)
      console.log('⏳ Waiting for confirmation...')

      // Wait for transaction confirmation
      const receipt = await tx.wait()

      console.log('✅ Transaction confirmed!')
      console.log('Receipt:', receipt)

      // Sync ticket to backend
      console.log('🔄 Syncing ticket to backend...')
      await syncTicket(receipt.hash)
      console.log('✅ Ticket synced to backend')

      return {
        success: true,
        transactionHash: receipt.hash,
        message: 'Mua vé thành công!'
      }
    } catch (err) {
      console.error('❌ Purchase failed:', err)
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        data: err.data,
        reason: err.reason
      })
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tickets,
    currentTicket,
    loading,
    error,
    fetchMyTickets,
    syncTicket,
    verifyTicket,
    checkInTicket,
    fetchTicketDetails,
    purchaseTicket
  }
})
