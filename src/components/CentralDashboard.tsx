import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Building2,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  Clock
} from 'lucide-react'
import TickerNumber from './TickerNumber'
import StoreFilter, { type StoreItem } from './StoreFilter'
import StoreAssetsTable, {
  type StoreAssetRecord,
  type SortField,
  type SortOrder
} from './StoreAssetsTable'
import { dashboardService } from '../services/dashboardService'
import { authService } from '../services/authService'
import { signalrService } from '../services/signalrService'
import type { AuthUser } from '../types/auth'
import type { ApiStockroom } from '../types/stockroom'
import type {
  CentralDashboardSummary,
  CentralDashboardPagination
} from '../types/centralDashboard'

interface CentralDashboardProps {
  currentUser?: AuthUser | null
  onNavigateToStore?: (storeId: string) => void
  initialSearchQuery?: string
  onSearchQueryChange?: (query: string) => void
}

export const CentralDashboard: React.FC<CentralDashboardProps> = ({
  currentUser,
  onNavigateToStore,
  initialSearchQuery = '',
  onSearchQueryChange
}) => {
  const activeUser = currentUser ?? authService.getUser()
  const isAdmin = (activeUser?.userType || '').toUpperCase() === 'ADMIN'

  const [summary, setSummary] = useState<CentralDashboardSummary>({
    totalStockRooms: 0,
    totalTaggedAssets: 0,
    assetIssuance: 0,
    availableAssets: 0
  })
  const [tableRows, setTableRows] = useState<StoreAssetRecord[]>([])
  const [pagination, setPagination] = useState<CentralDashboardPagination>({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1
  })
  const [isLoading, setIsLoading] = useState(false)
  const [apiStockrooms, setApiStockrooms] = useState<ApiStockroom[]>([])
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date())
  // Always default to 'all' so returning to Central Dashboard shows all stock rooms
  const [selectedStore, setSelectedStore] = useState('all')

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearchQuery)
  const [sortField, setSortField] = useState<SortField>('totalAssets')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const cardsRef = useRef<HTMLDivElement>(null)
  const [cardsBottomOffset, setCardsBottomOffset] = useState<number>(210)

  // Measure exact bottom position of cards container when stuck below navbar
  useEffect(() => {
    const updateOffset = () => {
      if (cardsRef.current) {
        const headerEl = document.querySelector('header')
        const headerH = headerEl ? headerEl.offsetHeight : (window.innerWidth >= 640 ? 56 : 48)
        setCardsBottomOffset(headerH + cardsRef.current.offsetHeight)
      }
    }
    updateOffset()
    const ro = new ResizeObserver(updateOffset)
    if (cardsRef.current) ro.observe(cardsRef.current)
    window.addEventListener('resize', updateOffset)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateOffset)
    }
  }, [])

  // Debounce search query to prevent rapid API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchChange = (q: string) => {
    setSearchQuery(q)
    onSearchQueryChange?.(q)
  }

  // Fetch stockrooms list for top dropdown
  useEffect(() => {
    let mounted = true
    dashboardService
      .getStockrooms()
      .then((data) => {
        if (mounted && data?.length) {
          setApiStockrooms(data)
        }
      })
      .catch((err) => {
        console.warn('CentralDashboard: Could not fetch stockrooms from API', err)
      })

    return () => {
      mounted = false
    }
  }, [])

  // Resolve selectedStore ID to numeric stockroomId for API
  const resolvedStockroomId = useMemo(() => {
    if (!selectedStore || selectedStore === 'all') return undefined
    const num = parseInt(selectedStore.replace(/^stock-/, ''), 10)
    if (!isNaN(num)) return num
    const match = apiStockrooms.find(
      (s) => s.stockroomName.toLowerCase() === selectedStore.toLowerCase()
    )
    return match?.stockroomId
  }, [selectedStore, apiStockrooms])

  // Map table SortField to API sortBy parameter
  const getSortByParam = (
    field: SortField
  ): 'TOTAL_TAGGED' | 'ASSET_ISSUANCE' | 'AVAILABLE_ASSETS' | 'STOCKROOM_NAME' => {
    switch (field) {
      case 'totalAssets':
        return 'TOTAL_TAGGED'
      case 'totalOut':
        return 'ASSET_ISSUANCE'
      case 'totalIn':
        return 'AVAILABLE_ASSETS'
      case 'storeName':
      default:
        return 'STOCKROOM_NAME'
    }
  }

  // Fetch Central Dashboard card summary & table records from API
  useEffect(() => {
    let mounted = true
    setIsLoading(true)

    const numericPageSize = rowsPerPage === 'all' ? 100 : rowsPerPage

    dashboardService
      .getCentralDashboard({
        page: currentPage,
        pageSize: numericPageSize,
        sortBy: getSortByParam(sortField),
        sortDesc: sortOrder === 'desc',
        stockroomId: resolvedStockroomId,
        search: debouncedSearch.trim() || undefined
      })
      .then((res) => {
        if (!mounted) return
        setSummary(res.summary)
        setPagination(res.pagination)
        setTableRows(
          res.rows.map((r) => ({
            id: String(r.stockroomId),
            storeCode: `SR-${r.stockroomId}`,
            storeName: r.stockroomName,
            location: r.stockroomName,
            keywords: r.stockroomName,
            totalAssets: r.totalTaggedAssets,
            totalOut: r.assetIssuance,
            totalIn: r.availableAssets
          }))
        )
      })
      .catch((err) => {
        console.error('Failed to load central dashboard data from API', err)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [
    currentPage,
    rowsPerPage,
    sortField,
    sortOrder,
    debouncedSearch,
    resolvedStockroomId
  ])

  // Listen for real-time stockroom updates over WebSockets / SignalR
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    signalrService.connect().then(() => {
      unsubscribe = signalrService.onStockroomUpdated((data) => {
        // 1. Update the 4 KPI summary cards (TickerNumber animates smoothly)
        setSummary({
          totalStockRooms: data.globalSummary.totalStockRooms,
          totalTaggedAssets: data.globalSummary.totalTaggedAssets,
          assetIssuance: data.globalSummary.assetIssuance,
          availableAssets: data.globalSummary.availableAssets
        })

        // 2. Prepend updated stockroom row to top of table (Row 1)
        setTableRows((prevRows) => {
          const numericPageSize = rowsPerPage === 'all' ? 100 : rowsPerPage
          const remaining = prevRows.filter((row) => row.id !== String(data.stockroomId))

          const updatedRow: StoreAssetRecord = {
            id: String(data.stockroomId),
            storeCode: `SR-${data.stockroomId}`,
            storeName: data.stockroomName,
            location: data.stockroomName,
            keywords: data.stockroomName,
            totalAssets: data.totalTaggedAssets,
            totalOut: data.assetIssuance,
            totalIn: data.availableAssets
          }

          // Prepend and slice to maintain exact page size
          return [updatedRow, ...remaining].slice(0, numericPageSize)
        })
      })
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [rowsPerPage])

  // Memoize stock room options for dropdown
  const stockRoomOptions: StoreItem[] = useMemo(() => {
    const list = apiStockrooms.map((s) => ({
      id: String(s.stockroomId),
      storeCode: `SR-${s.stockroomId}`,
      name: s.stockroomName,
      location: s.stockroomName,
      keywords: s.stockroomName
    }))
    return isAdmin
      ? [{ id: 'all', storeCode: '', name: 'All Stock Rooms', location: '' }, ...list]
      : list
  }, [apiStockrooms, isAdmin])

  // Clock timer
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(clockTimer)
  }, [])

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId)
    setCurrentPage(1)
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

  // 4 KPI Cards Grid
  const cards = [
    {
      id: 'stock-rooms',
      title: 'Total Stock Room',
      value: summary.totalStockRooms,
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
      value: summary.totalTaggedAssets,
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
      value: summary.assetIssuance,
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
      value: summary.availableAssets,
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
    <div className="w-full flex-1 flex flex-col space-y-2 sm:space-y-2.5">
      {/* Top Header Section & 4 KPI Cards: Sticky on desktop below navbar */}
      <div
        ref={cardsRef}
        className="sticky top-12 sm:top-14 z-30 bg-white dark:bg-[#1C1C1C] flex flex-col space-y-2 sm:space-y-2.5 pb-2 -mt-0.5 sm:-mt-1 pt-0.5 transition-colors"
      >
        {/* Top Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 sm:gap-2.5 pb-1.5 sm:pb-2 border-b border-[#EAE7DF]/60 dark:border-[#2C2C2C] shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EDEDED] tracking-tight whitespace-nowrap">
              Central Dashboard
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
              currentUser={activeUser}
              selectedStore={selectedStore}
              onStoreChange={handleStoreChange}
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
                <span
                  className={`text-xs sm:text-[13px] font-semibold ${card.titleColor} truncate tracking-normal`}
                >
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
      </div>

      {/* Stores Assets Performance Table with clean separation space */}
      <div className="flex-1 flex flex-col mt-2 sm:mt-2.5">
        <StoreAssetsTable
          cardsBottomOffset={cardsBottomOffset}
          isServerSide={true}
          isLoading={isLoading}
          selectedStoreId={selectedStore}
          onClearStoreFilter={() => {
            setSelectedStore('all')
            setCurrentPage(1)
          }}
          onNavigateToStore={onNavigateToStore}
          storesData={tableRows}
          totalRecordsCount={pagination.totalRecords}
          totalPagesCount={pagination.totalPages}
          serverSearchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          serverSortField={sortField}
          serverSortOrder={sortOrder}
          onSortChange={handleSortChange}
          serverRowsPerPage={rowsPerPage}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size)
            setCurrentPage(1)
          }}
          serverCurrentPage={currentPage}
          onPageChange={(p) => setCurrentPage(p)}
          className="w-full flex flex-col"
        />
      </div>
    </div>
  )
}
