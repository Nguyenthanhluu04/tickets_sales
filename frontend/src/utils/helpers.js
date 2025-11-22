export function formatAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatEther(wei) {
  if (!wei) return '0'
  try {
    return (Number(wei) / 1e18).toFixed(4)
  } catch {
    return '0'
  }
}

export function parseEther(ether) {
  return BigInt(Math.floor(Number(ether) * 1e18))
}

export function truncate(str, maxLength = 50) {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
}

export function getIpfsUrl(hash) {
  if (!hash) return ''
  if (hash.startsWith('http')) return hash
  return `${import.meta.env.VITE_IPFS_GATEWAY}${hash}`
}

export function isEventUpcoming(startTime) {
  return new Date(startTime) > new Date()
}

export function isEventOngoing(startTime, endTime) {
  const now = new Date()
  return new Date(startTime) <= now && now <= new Date(endTime)
}

export function isEventPast(endTime) {
  return new Date(endTime) < new Date()
}

export function getEventStatus(startTime, endTime) {
  if (isEventUpcoming(startTime)) return 'upcoming'
  if (isEventOngoing(startTime, endTime)) return 'ongoing'
  if (isEventPast(endTime)) return 'past'
  return 'unknown'
}
