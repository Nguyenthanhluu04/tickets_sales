import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ethers } from 'ethers'

export const useWalletStore = defineStore('wallet', () => {
  const address = ref('')
  const chainId = ref(null)
  const isConnected = ref(false)
  const provider = ref(null)
  const signer = ref(null)

  const shortAddress = computed(() => {
    if (!address.value) return ''
    return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
  })

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed')
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await browserProvider.send('eth_requestAccounts', [])
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const network = await browserProvider.getNetwork()
      const walletSigner = await browserProvider.getSigner()

      address.value = accounts[0].toLowerCase()
      chainId.value = Number(network.chainId)
      provider.value = browserProvider
      signer.value = walletSigner
      isConnected.value = true

      // Save to localStorage
      localStorage.setItem('walletConnected', 'true')
      localStorage.setItem('walletAddress', address.value)

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return { address: address.value, chainId: chainId.value }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  async function disconnectWallet() {
    address.value = ''
    chainId.value = null
    isConnected.value = false
    provider.value = null
    signer.value = null

    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAddress')

    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      address.value = accounts[0].toLowerCase()
      localStorage.setItem('walletAddress', address.value)
    }
  }

  function handleChainChanged() {
    window.location.reload()
  }

  async function switchChain(targetChainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added, add it
        throw new Error('Please add this network to MetaMask')
      }
      throw error
    }
  }

  async function signMessage(message) {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }
    if (!isConnected.value) {
      throw new Error('Wallet not connected')
    }
    try {
      // Use the provider to get a fresh signer
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      const walletSigner = await browserProvider.getSigner()
      return await walletSigner.signMessage(message)
    } catch (error) {
      console.error('Failed to sign message:', error)
      throw error
    }
  }

  // Auto-connect on page load
  async function autoConnect() {
    const wasConnected = localStorage.getItem('walletConnected')
    if (wasConnected === 'true') {
      try {
        await connectWallet()
      } catch (error) {
        console.error('Auto-connect failed:', error)
      }
    }
  }

  return {
    address,
    chainId,
    isConnected,
    provider,
    signer,
    shortAddress,
    connectWallet,
    disconnectWallet,
    switchChain,
    signMessage,
    autoConnect,
  }
})
