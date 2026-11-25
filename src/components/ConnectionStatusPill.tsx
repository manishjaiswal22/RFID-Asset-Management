import React, { useState, useEffect } from 'react'
import { signalrService } from '../services/signalrService'

interface ConnectionStatusPillProps {
  isConnected?: boolean
  className?: string
}

export const ConnectionStatusPill: React.FC<ConnectionStatusPillProps> = ({
  isConnected: propIsConnected,
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(() =>
    propIsConnected !== undefined ? propIsConnected : signalrService.isConnected()
  )

  useEffect(() => {
    if (propIsConnected !== undefined) {
      setIsConnected(propIsConnected)
      return
    }

    const unsubscribe = signalrService.onConnectionChange((connected) => {
      setIsConnected(connected)
    })

    return () => {
      unsubscribe()
    }
  }, [propIsConnected])

  return (
    <div
      title={
        isConnected
          ? 'WebSocket is connected (Live updates active)'
          : 'WebSocket is disconnected (Connecting...)'
      }
      className={`h-8 flex items-center gap-1.5 px-3 rounded-2xl border text-xs font-bold tracking-wide select-none transition-all duration-300 ${
        isConnected
          ? 'border-[#5D9273]/30 bg-[#5D9273]/10 dark:bg-[#5D9273]/20 text-[#2E7D32] dark:text-[#4ADE80]'
          : 'border-[#F59E0B]/30 bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20 text-[#D97706] dark:text-[#FBBF24]'
      } ${className}`}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          isConnected
            ? 'bg-[#2E7D32] dark:bg-[#4ADE80] animate-pulse'
            : 'bg-[#D97706] dark:bg-[#FBBF24] animate-pulse'
        }`}
      />
      <span>{isConnected ? 'Connected' : 'Connecting'}</span>
    </div>
  )
}

export default ConnectionStatusPill
