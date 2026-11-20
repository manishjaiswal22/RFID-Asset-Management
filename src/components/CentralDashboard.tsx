import React, { useState, useEffect, useMemo } from 'react'
import {
  Building2,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  Clock
} from 'lucide-react'
import TickerNumber from './TickerNumber'
import StoreFilter from './StoreFilter'
import StoreAssetsTable from './StoreAssetsTable'
import { DUMMY_STORE_RECORDS, type StoreAssetRecord } from '../data/storesData'

export const CentralDashboard: React.FC = () => {
  const [storeRecords, setStoreRecords] = useState<StoreAssetRecord[]>(DUMMY_STORE_RECORDS)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [selectedStore, setSelectedStore] = useState('all')

  // Calculate live KPI metrics directly from store records so cards and table always match 100%
  const metrics = useMemo(() => {
    const activeRecords =
      selectedStore && selectedStore !== 'all'
        ? storeRecords.filter((s) => s.id === selectedStore)
        : storeRecords

    const totalAssets = activeRecords.reduce((sum, s) => sum + s.totalAssets, 0)
    const totalOut = activeRecords.reduce((sum, s) => sum + s.totalOut, 0)
    const totalIn = totalAssets - totalOut // Available Assets = Total Tagged Assets - Asset Issuance

    return {
      totalStockRooms: selectedStore === 'all' ? storeRecords.length : 1,
      totalAssets,
      totalOut,
      totalIn
    }
  }, [storeRecords, selectedStore])

  // Memoize stock room options for dropdown directly from live storeRecords
  const stockRoomOptions = useMemo(
    () => [
      { id: 'all', storeCode: '', name: 'All Stock Rooms', location: '' },
      ...storeRecords.map((s) => ({
        id: s.id,
        storeCode: s.storeCode,
        name: s.storeName,
        location: s.location,
        keywords: s.keywords
      }))
    ],
    [storeRecords]
  )

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(clockTimer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setStoreRecords((prev) => {
        const targetIndex = Math.floor(Math.random() * prev.length)
        const assetInc = Math.floor(Math.random() * 3) + 1
        const outInc = Math.random() > 0.5 ? 1 : 0

        return prev.map((item, idx) => {
          if (idx !== targetIndex) return item
          const newAssets = item.totalAssets + assetInc
          const newOut = item.totalOut + outInc
          return {
            ...item,
            totalAssets: newAssets,
            totalOut: newOut,
            totalIn: newAssets - newOut
          }
        })
      })
    }, 4500)

    return () => clearInterval(interval)
  }, [])

  const formatDateTime = (date: Date): string => {
    const datePart = date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    const timePart = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    return `${datePart} • ${timePart}`
  }

  const cards = [
    {
      id: 'stock-rooms',
      title: 'Total Stock Room',
      value: metrics.totalStockRooms,
      icon: (
        <Building2
          className="w-9 h-9 sm:w-10 sm:h-10 text-[#1D63ED]/50 dark:text-[#60A5FA]/60"
          strokeWidth={1.8}
        />
      ),
      bgClass: 'bg-[#F0F6FF] dark:bg-[#132238]',
      borderClass: 'border-[#D8E6FC] dark:border-[#1E3A5F] hover:border-transparent',
      titleColor: 'text-[#1D63ED] dark:text-[#60A5FA]',
      waveColor: 'text-[#1D63ED] dark:text-[#60A5FA]'
    },
    {
      id: 'assets',
      title: 'Total Tagged Assets',
      value: metrics.totalAssets,
      icon: (
        <Tag
          className="w-9 h-9 sm:w-10 sm:h-10 text-[#7C3AED]/50 dark:text-[#C084FC]/60"
          strokeWidth={1.8}
        />
      ),
      bgClass: 'bg-[#F7F3FF] dark:bg-[#231A36]',
      borderClass: 'border-[#E8DEFC] dark:border-[#3A245C] hover:border-transparent',
      titleColor: 'text-[#7C3AED] dark:text-[#C084FC]',
      waveColor: 'text-[#7C3AED] dark:text-[#C084FC]'
    },
    {
      id: 'outbound',
      title: 'Asset Issuance',
      value: metrics.totalOut,
      icon: (
        <ArrowUpRight
          className="w-9 h-9 sm:w-10 sm:h-10 text-[#EA580C]/50 dark:text-[#FB923C]/60"
          strokeWidth={2}
        />
      ),
      bgClass: 'bg-[#FFF7ED] dark:bg-[#2E1A11]',
      borderClass: 'border-[#FFEDD5] dark:border-[#4B2818] hover:border-transparent',
      titleColor: 'text-[#EA580C] dark:text-[#FB923C]',
      waveColor: 'text-[#EA580C] dark:text-[#FB923C]'
    },
    {
      id: 'inbound',
      title: 'Available Assets',
      value: metrics.totalIn,
      icon: (
        <ArrowDownLeft
          className="w-9 h-9 sm:w-10 sm:h-10 text-[#059669]/50 dark:text-[#4ADE80]/60"
          strokeWidth={2}
        />
      ),
      bgClass: 'bg-[#F0FDF4] dark:bg-[#13281E]',
      borderClass: 'border-[#DCFCE7] dark:border-[#1E4432] hover:border-transparent',
      titleColor: 'text-[#059669] dark:text-[#4ADE80]',
      waveColor: 'text-[#059669] dark:text-[#4ADE80]'
    }
  ]

  return (
    <div className="w-full h-full flex flex-col space-y-1.5 sm:space-y-2 min-h-0 overflow-hidden">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pb-1 sm:pb-1.5 border-b border-[#EAE7DF]/60 dark:border-[#2C2C2C] shrink-0">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EDEDED] tracking-tight">
            Central Dashboard
          </h2>
          <p className="text-[11px] text-[#99958D] dark:text-[#888888]">
            Consolidated enterprise asset performance and real-time operational metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Live Status Pill */}
          <div className="h-8 flex items-center gap-1.5 px-3 rounded-2xl border border-[#5D9273]/30 bg-[#5D9273]/10 dark:bg-[#5D9273]/20 text-[#2E7D32] dark:text-[#4ADE80] text-xs font-bold tracking-wide select-none">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32] dark:bg-[#4ADE80] animate-pulse shrink-0" />
            <span>Live</span>
          </div>

          {/* Time Pill */}
          <div className="h-8 flex items-center gap-1.5 px-3 rounded-2xl border border-[#EAE7DF] dark:border-[#2C2C2C] bg-[#FAF9F6] dark:bg-[#202020] text-xs font-medium text-[#171717] dark:text-[#EDEDED] tabular-nums">
            <Clock className="w-3.5 h-3.5 text-[#F5A23A] shrink-0" />
            <span>{formatDateTime(currentTime)}</span>
          </div>

          {/* Stock Room Selection */}
          <StoreFilter
            selectedStore={selectedStore}
            onStoreChange={(storeId) => setSelectedStore(storeId)}
            stores={stockRoomOptions}
          />
        </div>
      </div>

      {/* 4 KPI Cards Grid (Increased Height, Rounded-2xl, Borderless Large Icons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`group relative overflow-hidden rounded-2xl p-3.5 sm:p-4 ${card.bgClass} border ${card.borderClass} hover:border-transparent hover:-translate-y-0.5 transition-all duration-300 select-none flex items-center justify-between min-h-[88px] sm:min-h-[96px] cursor-pointer`}
          >
            {/* Background Layer: Subtle Curved Wave Pattern */}
            <svg
              className={`absolute inset-0 w-full h-full pointer-events-none ${card.waveColor}`}
              viewBox="0 0 340 190"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 175 0 C 225 45, 245 125, 165 190 L 340 190 L 340 0 Z"
                fill="currentColor"
                fillOpacity="0.05"
              />
              <path
                d="M 230 0 C 275 45, 295 125, 235 190 L 340 190 L 340 0 Z"
                fill="currentColor"
                fillOpacity="0.04"
              />
              <circle
                cx="300"
                cy="35"
                r="65"
                fill="currentColor"
                fillOpacity="0.03"
              />
            </svg>

            {/* Hover Shine Effect */}
            <div
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-20"
              aria-hidden="true"
            />

            {/* Left: Title & Big Number */}
            <div className="relative z-10 flex flex-col justify-between space-y-1 min-w-0">
              <span className={`text-xs sm:text-[13px] font-semibold ${card.titleColor} truncate tracking-normal`}>
                {card.title}
              </span>
              <div className="text-2xl sm:text-[26px] font-bold text-[#171717] dark:text-[#EDEDED] tracking-tight">
                <TickerNumber value={card.value} />
              </div>
            </div>

            {/* Right: Big Icon (No Background, No Border) */}
            <div className="relative z-10 shrink-0 pl-2 flex items-center justify-center">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Stores Assets Performance Table with clean separation space */}
      <div className="flex-1 min-h-0 flex flex-col mt-2.5 sm:mt-3.5 overflow-hidden">
        <StoreAssetsTable
          selectedStoreId={selectedStore}
          onClearStoreFilter={() => setSelectedStore('all')}
          storesData={storeRecords}
          className="flex-1 min-h-0 flex flex-col"
        />
      </div>
    </div>
  )
}
