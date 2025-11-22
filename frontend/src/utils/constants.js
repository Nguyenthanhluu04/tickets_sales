export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID) || 80002
export const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME || 'Polygon Amoy Testnet'
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://rpc-amoy.polygon.technology'
export const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'

export const CHAIN_CONFIG = {
  80002: {
    name: 'Polygon Amoy Testnet',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    explorer: 'https://amoy.polygonscan.com',
    currency: 'MATIC',
  },
  80001: {
    name: 'Polygon Mumbai Testnet (Deprecated)',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com',
    currency: 'MATIC',
  },
  137: {
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    currency: 'MATIC',
  },
}

export const EVENT_CATEGORIES = [
  { label: 'Music', value: 'Music' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Conference', value: 'Conference' },
  { label: 'Theater', value: 'Theater' },
  { label: 'Festival', value: 'Festival' },
  { label: 'Workshop', value: 'Workshop' },
  { label: 'Art', value: 'Art' },
  { label: 'Other', value: 'Other' },
]
