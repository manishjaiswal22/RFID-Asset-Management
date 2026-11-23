import React, { useState, useEffect, useMemo } from 'react'
import {
  Clock,
  Building2,
  Tag,
  Laptop,
  Monitor,
  HardDrive,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Copy,
  Check,
  Search,
  FileSpreadsheet,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import StoreFilter, { type StoreItem } from './StoreFilter'
import TickerNumber from './TickerNumber'
import { DUMMY_STORE_RECORDS, type StoreAssetRecord } from '../data/storesData'
import { INITIAL_MOVEMENTS, type AssetMovement } from '../data/movementsData'
import { exportToExcel } from '../utils/excelExport'

type SortField = 'dateTime' | 'assetTag' | 'serialNo' | 'makeModel' | 'assetDescription' | 'move'
type SortOrder = 'asc' | 'desc'

interface StoreDashboardProps {
  selectedStoreId?: string
  onStoreChange?: (storeId: string) => void
}

export const StoreDashboard: React.FC<StoreDashboardProps> = ({
  selectedStoreId = 'stock-1',
  onStoreChange
}) => {
  const [selectedStore, setSelectedStore] = useState<string>(selectedStoreId)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Keep selectedStore in sync with prop changes (e.g. when navigated from Central Dashboard)
  useEffect(() => {
    if (selectedStoreId) {
      setSelectedStore(selectedStoreId)
    }
  }, [selectedStoreId])

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId)
    onStoreChange?.(storeId)
  }
  const [storeRecords, setStoreRecords] = useState<StoreAssetRecord[]>(DUMMY_STORE_RECORDS)
  const [movements] = useState<AssetMovement[]>(INITIAL_MOVEMENTS)
  const [selectedReadId, setSelectedReadId] = useState<string>(INITIAL_MOVEMENTS[0].id)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Clock interval
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(clockTimer)
  }, [])

  // Periodic background simulated ticker updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStoreRecords((prev) => {
        const targetIndex = Math.floor(Math.random() * prev.length)
        const assetInc = Math.random() > 0.4 ? 1 : 0
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

  // Live KPI metrics (Total Tagged Assets, Asset Issuance, Available Assets)
  const metrics = useMemo(() => {
    const activeRecords =
      selectedStore && selectedStore !== 'all'
        ? storeRecords.filter((s) => s.id === selectedStore)
        : storeRecords

    const totalAssets = activeRecords.reduce((sum, s) => sum + s.totalAssets, 0)
    const totalOut = activeRecords.reduce((sum, s) => sum + s.totalOut, 0)
    const totalIn = totalAssets - totalOut

    return {
      totalAssets,
      totalOut,
      totalIn
    }
  }, [storeRecords, selectedStore])

  // Options for StoreFilter
  const stockRoomOptions: StoreItem[] = useMemo(
    () => [
      { id: 'all', storeCode: '', name: 'All Stock Rooms', location: '' },
      ...DUMMY_STORE_RECORDS.map((s) => ({
        id: s.id,
        storeCode: s.storeCode,
        name: s.storeName,
        location: s.location,
        keywords: s.keywords
      }))
    ],
    []
  )

  // Current selected stock room name for display
  const currentStockroomName = useMemo(() => {
    if (selectedStore === 'all') {
      return 'All Stock Rooms'
    }
    const found = DUMMY_STORE_RECORDS.find((s) => s.id === selectedStore)
    return found ? found.storeName : DUMMY_STORE_RECORDS[0]?.storeName || 'All Stock Rooms'
  }, [selectedStore])

  const kpiCards = [
    {
      id: 'stockroom',
      title: 'Stock Room',
      isText: true,
      textValue: currentStockroomName,
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

  // Filter movements if a specific stockroom is chosen
  const displayedMovements = useMemo(() => {
    if (selectedStore === 'all') return movements
    return movements.map((m) => ({
      ...m,
      stockroom: currentStockroomName,
      lastSeenLocation: currentStockroomName
    }))
  }, [movements, selectedStore, currentStockroomName])

  // Currently inspected read for Left Card
  const selectedRead = useMemo(() => {
    const found = displayedMovements.find((m) => m.id === selectedReadId)
    return found || displayedMovements[0]
  }, [displayedMovements, selectedReadId])

  // DataTable Filtering, Sorting & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('dateTime')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Filter & Sort movements
  const filteredAndSortedMovements = useMemo(() => {
    return displayedMovements
      .filter((item) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.trim().toLowerCase()
        return (
          item.dateTime.toLowerCase().includes(q) ||
          item.assetTag.toLowerCase().includes(q) ||
          item.serialNo.toLowerCase().includes(q) ||
          item.makeModel.toLowerCase().includes(q) ||
          (item.assetDescription || '').toLowerCase().includes(q) ||
          item.move.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const aVal = a[sortField] || ''
        const bVal = b[sortField] || ''
        if (sortOrder === 'asc') {
          return aVal.localeCompare(bVal)
        }
        return bVal.localeCompare(aVal)
      })
  }, [displayedMovements, searchQuery, sortField, sortOrder])

  // Pagination calculations
  const totalRecords = filteredAndSortedMovements.length
  const isAll = rowsPerPage === 'all'
  const effectiveLimit = isAll ? Math.max(totalRecords, 1) : rowsPerPage
  const totalPages = isAll ? 1 : Math.ceil(totalRecords / effectiveLimit) || 1
  const startIndex = isAll ? 0 : (currentPage - 1) * effectiveLimit
  const paginatedMovements = isAll
    ? filteredAndSortedMovements
    : filteredAndSortedMovements.slice(startIndex, startIndex + effectiveLimit)

  // Live movement counts for footer (Total IN and Total OUT)
  const movementTotals = useMemo(() => {
    const inCount = filteredAndSortedMovements.filter((m) => m.move === 'IN').length
    const outCount = filteredAndSortedMovements.filter((m) => m.move === 'OUT').length
    return { inCount, outCount }
  }, [filteredAndSortedMovements])

  // Helper to generate numbered page array (e.g. [1, 2, 3, 4, 5] or [1, 2, 3, '...', 10])
  const getPageNumbers = () => {
    if (isAll || totalPages <= 1) return [1]
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const headers = ['Date-Time', 'Asset Tag', 'Serial No', 'Make / Model', 'Asset Description', 'Move', 'Stockroom']
    const rows = filteredAndSortedMovements.map((r) => [
      r.dateTime,
      r.assetTag,
      r.serialNo,
      r.makeModel,
      r.assetDescription || r.subType || r.assetType,
      r.move,
      r.stockroom
    ])
    exportToExcel(
      headers,
      rows,
      `asset_movements_${new Date().toISOString().slice(0, 10)}.xlsx`,
      'Asset Movements'
    )
  }

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

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev))
    }, 1800)
  }

  // Choose icon based on assetType and makeModel
  const getDeviceIcon = (type: string, model: string = '') => {
    const lower = (type + ' ' + model).toLowerCase()
    if (lower.includes('wyse') || lower.includes('client')) {
      return <HardDrive className="w-5 h-5 text-[#1D63ED] dark:text-[#60A5FA]" />
    }
    if (lower.includes('laptop') || lower.includes('chromebook')) {
      return <Laptop className="w-5 h-5 text-[#1D63ED] dark:text-[#60A5FA]" />
    }
    if (lower.includes('desktop') || lower.includes('pc') || lower.includes('box')) {
      return <Monitor className="w-5 h-5 text-[#1D63ED] dark:text-[#60A5FA]" />
    }
    return <Tag className="w-5 h-5 text-[#1D63ED] dark:text-[#60A5FA]" />
  }

  return (
    <div className="w-full flex-1 flex flex-col space-y-2.5 sm:space-y-3 select-none">
      {/* Top Header Section & 4 KPI Cards: Sticky on desktop (lg:), scrolls naturally on smaller screens */}
      <div className="lg:sticky lg:top-14 lg:z-20 bg-white dark:bg-[#1C1C1C] flex flex-col space-y-2.5 sm:space-y-3 pb-2 -mt-0.5 sm:-mt-1 pt-0.5 transition-colors">
        {/* Top Header Section (Live Pill, Time Pill, Stock Room Filter) */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 sm:gap-2.5 pb-1.5 sm:pb-2 border-b border-[#EAE7DF]/60 dark:border-[#2C2C2C] shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EDEDED] tracking-tight whitespace-nowrap">
              Stock Room Dashboard
            </h2>
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
              onStoreChange={handleStoreChange}
              stores={stockRoomOptions}
            />
          </div>
        </div>

        {/* 4 KPI Cards Grid (Stock Room, Total Tagged Assets, Asset Issuance, Available Assets) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
          {kpiCards.map((card) => (
            <div
              key={card.id}
              className={`group relative overflow-hidden rounded-2xl p-3 sm:p-3.5 ${card.bgClass} border ${card.borderClass} hover:border-transparent hover:-translate-y-0.5 transition-all duration-300 select-none flex items-center justify-between min-h-[80px] sm:min-h-[88px] cursor-pointer`}
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

              {/* Left: Title & Value/Text */}
              <div className="relative z-10 flex flex-col justify-between space-y-0.5 sm:space-y-1 min-w-0 pr-1">
                <span className={`text-xs sm:text-[13px] font-semibold ${card.titleColor} truncate tracking-normal`}>
                  {card.title}
                </span>
                {card.isText ? (
                  <div
                    className="text-xs sm:text-[13px] lg:text-sm font-bold text-[#171717] dark:text-[#EDEDED] tracking-tight line-clamp-2 leading-snug break-words"
                    title={card.textValue}
                  >
                    {card.textValue}
                  </div>
                ) : (
                  <div className="text-2xl sm:text-[26px] font-bold text-[#171717] dark:text-[#EDEDED] tracking-tight">
                    <TickerNumber value={card.value || 0} />
                  </div>
                )}
              </div>

              {/* Right: Big Icon (No Background, No Border) */}
              <div className="relative z-10 shrink-0 pl-2 flex items-center justify-center">
                {card.icon}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Section: Full Div Latest Asset Read Card, followed below by Movements Table */}
      <div className="w-full flex flex-col space-y-3 sm:space-y-3.5">
        {/* Full Div: Latest Asset Read Card */}
        <div className="w-full bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#EAE7DF] dark:border-[#2C2C2C] p-3 sm:p-4 flex flex-col shadow-2xs">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <h3 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#EDEDED]">
                Latest Asset Read
              </h3>
            </div>
            <span className="text-[10.5px] text-[#99958D] dark:text-[#888888] font-medium">
              Read on EPC detection
            </span>
          </div>

          {/* Unified, Well-Organized Asset Details Grid (2 Columns on md/lg for full width) */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
            {/* Tile 1: Device Identity & Key Identifiers */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#242424] border border-[#EAE7DF]/80 dark:border-[#2F2F2F] transition-all hover:border-[#00a8e7]/30">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#EAE7DF] dark:border-[#333333] flex items-center justify-center shrink-0 shadow-2xs">
                      {getDeviceIcon(selectedRead.assetType, selectedRead.makeModel)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-[#171717] dark:text-[#EDEDED] text-xs sm:text-[13px] leading-snug truncate" title={selectedRead.makeModel}>
                        {selectedRead.makeModel}
                      </h4>
                      <span className="inline-block text-[10px] sm:text-[10.5px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                        {selectedRead.subType || selectedRead.assetType}
                      </span>
                    </div>
                  </div>

                  {/* Move Status Badge - OUT is RED, IN is GREEN */}
                  <div className="shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold tracking-wider shrink-0 shadow-xs inline-flex items-center gap-1 ${selectedRead.move === 'OUT'
                          ? 'bg-[#DC2626] text-white shadow-2xs'
                          : 'bg-[#059669] text-white shadow-2xs'
                        }`}
                    >
                      {selectedRead.move === 'OUT' ? (
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      <span>{selectedRead.move}</span>
                    </span>
                  </div>
                </div>

                {/* Asset Description & Serial Badges Row */}
                <div className="mt-2 pt-2 border-t border-[#EAE7DF]/70 dark:border-[#2C2C2C] grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-white dark:bg-[#1C1C1C] border border-[#EAE7DF]/70 dark:border-[#303030]">
                    <div className="min-w-0 pr-1">
                      <p className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">
                        Asset Description
                      </p>
                      <p
                        className="font-bold text-[#1D63ED] dark:text-[#60A5FA] text-xs truncate"
                        title={selectedRead.assetDescription || 'Wyse 5470 Thin Client'}
                      >
                        {selectedRead.assetDescription || 'Wyse 5470 Thin Client'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedRead.assetDescription || 'Wyse 5470 Thin Client', 'desc')}
                      title="Copy Asset Description"
                      className="p-1 text-[#94A3B8] hover:text-[#1D63ED] rounded transition-colors cursor-pointer shrink-0"
                    >
                      {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-white dark:bg-[#1C1C1C] border border-[#EAE7DF]/70 dark:border-[#303030]">
                    <div className="min-w-0 pr-1">
                      <p className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">
                        Serial Number
                      </p>
                      <p className="font-bold text-[#171717] dark:text-[#EDEDED] text-xs truncate" title={selectedRead.serialNo}>
                        {selectedRead.serialNo}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedRead.serialNo, 'serial')}
                      title="Copy Serial Number"
                      className="p-1 text-[#94A3B8] hover:text-[#1D63ED] rounded transition-colors cursor-pointer shrink-0"
                    >
                      {copiedKey === 'serial' ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tile 2: Operational, Location & Movement Details (Equal Spaced & Divided) */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#242424] border border-[#EAE7DF]/80 dark:border-[#2F2F2F] transition-all hover:border-[#00a8e7]/30 flex flex-col divide-y divide-[#EAE7DF]/70 dark:divide-[#2F2F2F] gap-2">
                {/* Section 1: Stockroom */}
                <div className="pb-1.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#00a8e7] shrink-0" />
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                      Stockroom
                    </span>
                  </div>
                  <p className="font-bold text-[#171717] dark:text-[#EDEDED] text-xs sm:text-[12.5px] break-words" title={selectedRead.stockroom}>
                    {selectedRead.stockroom}
                  </p>
                </div>

                {/* Section 2: Asset State & Service Request */}
                <div className="py-1.5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-0.5">
                        Asset State
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#34D399] font-bold text-xs">
                        {selectedRead.assetState}
                      </span>
                    </div>

                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-0.5">
                        Service Request (RITM)
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <FileText className="w-3.5 h-3.5 text-[#00a8e7] shrink-0" />
                        <span className="font-bold text-[#171717] dark:text-[#EDEDED] text-xs truncate">
                          {selectedRead.ritm}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Movement & Movement Date-Time */}
                <div className="pt-1.5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-0.5">
                        Movement
                      </p>
                      <div className={`flex items-center gap-1 font-bold text-xs ${selectedRead.move === 'OUT' ? 'text-[#DC2626]' : 'text-[#059669]'
                        }`}>
                        {selectedRead.move === 'OUT' ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#DC2626] stroke-[2.5]" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669] stroke-[2.5]" />
                        )}
                        <span>{selectedRead.move}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-0.5">
                        Movement Date-Time
                      </p>
                      <div className="flex items-center gap-1 font-bold text-[#171717] dark:text-[#EDEDED] text-xs tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-[#F5A23A] shrink-0" />
                        <span>{selectedRead.dateTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Full Div: Asset Movements DataTable Card (Below Latest Asset Read) */}
        <div
          className="w-full bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#EAE7DF] dark:border-[#2C2C2C] flex flex-col justify-between shadow-2xs lg:overflow-visible overflow-hidden"
        >
            {/* Table Toolbar Header (Sticky on desktop below cards) */}
            <div className="px-3 py-1.5 sm:px-3.5 sm:py-2 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6] dark:bg-[#232323] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 lg:sticky lg:top-[213px] lg:z-15 rounded-t-2xl">
              {/* Left: Search input */}
              <div className="flex items-center gap-2 flex-1 max-w-xs sm:max-w-sm">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-[#99958D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search tag, serial, model, description, move..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-white dark:bg-[#181818] rounded-xl border border-[#EAE7DF] dark:border-[#333333] outline-none focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20 text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all"
                  />
                </div>
              </div>

              {/* Right: Rows Selector and Export Button */}
              <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-[#666666] dark:text-[#A0A0A0]">
                  <span>Rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      const val = e.target.value
                      setRowsPerPage(val === 'all' ? 'all' : Number(val))
                      setCurrentPage(1)
                    }}
                    className="h-7 px-1.5 py-0 text-xs bg-white dark:bg-[#181818] border border-[#EAE7DF] dark:border-[#333333] rounded-xl text-[#171717] dark:text-[#EDEDED] outline-none cursor-pointer focus:border-[#1D63ED]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value="all">All</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-semibold transition-colors cursor-pointer"
                  title="Export filtered movements to Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export to Excel</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="w-full lg:overflow-visible overflow-x-auto [scrollbar-width:thin]">
              <table className="w-full table-fixed text-left border-collapse select-none text-xs">
                <thead className="lg:sticky lg:top-[258px] lg:z-10 bg-[#F4F7FB] dark:bg-[#252830] border-b border-[#EAE7DF] dark:border-[#2C2C2C] shadow-2xs">
                  <tr>
                    <th
                      onClick={() => handleSort('dateTime')}
                      className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider w-[18%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Date-Time</span>
                        <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('assetTag')}
                      className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider w-[15%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Asset Tag</span>
                        <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('serialNo')}
                      className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider w-[15%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Serial No</span>
                        <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('makeModel')}
                      className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider w-[22%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Make / Model</span>
                        <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('assetDescription')}
                      className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider w-[20%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Asset Description</span>
                        <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('move')}
                      className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider text-center w-[10%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Move</span>
                        <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7DF]/60 dark:divide-[#2C2C2C]">
                  {paginatedMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#99958D]">
                        <p className="font-medium text-xs">No matching movement records found.</p>
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('')
                              setCurrentPage(1)
                            }}
                            className="mt-1.5 text-xs text-[#00a8e7] hover:underline cursor-pointer"
                          >
                            Clear search query
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginatedMovements.map((item) => {
                      const isSelected = item.id === selectedRead.id

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedReadId(item.id)}
                          className={`cursor-pointer transition-colors ${isSelected
                              ? 'bg-[#00a8e7]/10 dark:bg-[#00a8e7]/15 ring-1 ring-inset ring-[#00a8e7]/30'
                              : 'hover:bg-[#FAF9F6] dark:hover:bg-[#252525]'
                            }`}
                        >
                          {/* Date-Time */}
                          <td className="py-1 px-2.5 whitespace-nowrap leading-tight">
                            <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal mb-0.5">
                              {item.date}
                            </div>
                            <div className="font-bold text-[#171717] dark:text-[#EDEDED] tabular-nums text-xs">
                              {item.time}
                            </div>
                          </td>

                          {/* Asset Tag */}
                          <td className="py-1 px-2.5 font-bold text-[#1D63ED] dark:text-[#60A5FA] tabular-nums text-xs whitespace-nowrap">
                            {item.assetTag}
                          </td>

                          {/* Serial No */}
                          <td className="py-1 px-2.5 font-medium text-[#171717] dark:text-[#EDEDED] text-xs whitespace-nowrap">
                            {item.serialNo}
                          </td>

                          {/* Make / Model */}
                          <td className="py-1 px-2.5 font-medium text-[#171717] dark:text-[#EDEDED] text-xs">
                            <div className="truncate max-w-[130px] sm:max-w-[150px]" title={item.makeModel}>
                              {item.makeModel}
                            </div>
                          </td>

                          {/* Asset Description */}
                          <td className="py-1 px-2.5 text-[#475569] dark:text-[#94A3B8] text-xs font-medium">
                            <div className="truncate max-w-[130px] sm:max-w-[160px]" title={item.assetDescription || item.subType || item.assetType}>
                              {item.assetDescription || item.subType || item.assetType}
                            </div>
                          </td>

                          {/* Move (IN / OUT badge - OUT is RED, IN is GREEN) */}
                          <td className="py-1 px-2.5 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${item.move === 'OUT'
                                  ? 'bg-[#FEF2F2] dark:bg-[#451A1A] text-[#DC2626] dark:text-[#F87171]'
                                  : 'bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#34D399]'
                                }`}
                            >
                              {item.move === 'OUT' ? (
                                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                              ) : (
                                <ArrowDownLeft className="w-3 h-3 stroke-[2.5]" />
                              )}
                              <span>{item.move}</span>
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Column Totals Bar (Green for IN, Red for OUT) */}
            <div className="px-3 py-1 border-t border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6]/80 dark:bg-[#232323] flex items-center justify-between text-xs shrink-0">
              {/* Left: Total IN (Green) */}
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-[#ECFDF5] dark:bg-[#064E3B]/40 flex items-center justify-center text-[#059669] dark:text-[#34D399] shrink-0">
                  <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                    Total IN:
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#059669] dark:text-[#34D399] tabular-nums">
                    {movementTotals.inCount}
                  </span>
                </div>
              </div>

              {/* Right: Total OUT (Red) */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                    Total OUT:
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#DC2626] dark:text-[#F87171] tabular-nums">
                    {movementTotals.outCount}
                  </span>
                </div>
                <div className="w-5 h-5 rounded-md bg-[#FEF2F2] dark:bg-[#451A1A] flex items-center justify-center text-[#DC2626] dark:text-[#F87171] shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Table Pagination Footer with Numbered Pages (1, 2, 3...) */}
            <div className="px-3 py-1.5 border-t border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6]/80 dark:bg-[#232323] flex items-center justify-between text-[11px] sm:text-xs text-[#666666] dark:text-[#A0A0A0] shrink-0">
              <div>
                <span>
                  Showing{' '}
                  <strong className="text-[#171717] dark:text-[#EDEDED]">
                    {totalRecords === 0 ? 0 : startIndex + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-[#171717] dark:text-[#EDEDED]">
                    {isAll ? totalRecords : Math.min(startIndex + (effectiveLimit as number), totalRecords)}
                  </strong>{' '}
                  of{' '}
                  <strong className="text-[#171717] dark:text-[#EDEDED]">
                    {totalRecords}
                  </strong>{' '}
                  records
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isAll}
                  className="w-6 h-6 flex items-center justify-center rounded-lg border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Numbered Page Buttons: 1, 2, 3... */}
                {getPageNumbers().map((page, idx) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1 text-[11px] text-[#99958D] font-bold select-none">
                        ...
                      </span>
                    )
                  }

                  const pageNum = Number(page)
                  const isActive = pageNum === currentPage

                  return (
                    <button
                      key={`page-${pageNum}`}
                      type="button"
                      onClick={() => !isAll && setCurrentPage(pageNum)}
                      disabled={isAll}
                      className={`min-w-6 h-6 px-1.5 flex items-center justify-center rounded-lg text-xs font-semibold select-none transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-bold shadow-xs'
                          : 'border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#666666] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white hover:border-[#171717]/40 dark:hover:border-white/40'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || isAll}
                  className="w-6 h-6 flex items-center justify-center rounded-lg border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
