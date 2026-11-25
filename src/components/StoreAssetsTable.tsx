import { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import {
  Search,
  Building2,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Eye,
  Loader2
} from 'lucide-react'
import { DUMMY_STORE_RECORDS, type StoreAssetRecord } from '../data/storesData'
import { exportToExcel } from '../utils/excelExport'
import { downloadExcelExport } from '../services/exportService'
import { normalizeMove } from '../utils/moveUtils'
import { TooltipTop, TooltipBottom } from './Tooltip'
import { Toast, type ToastNotification } from './Toast'
import { useDebounce } from '../utils/useDebounce'

export type { StoreAssetRecord }
export { DUMMY_STORE_RECORDS }

export type SortField = 'storeName' | 'totalAssets' | 'totalIn' | 'totalOut'
export type SortOrder = 'asc' | 'desc'

interface StoreAssetsTableProps {
  cardsBottomOffset?: number
  selectedStoreId?: string
  onClearStoreFilter?: () => void
  onNavigateToStore?: (storeId: string) => void
  storesData?: StoreAssetRecord[]
  className?: string
  isServerSide?: boolean
  isLoading?: boolean
  totalRecordsCount?: number
  totalPagesCount?: number
  serverSearchQuery?: string
  onSearchChange?: (query: string) => void
  serverSortField?: SortField
  serverSortOrder?: SortOrder
  onSortChange?: (field: SortField) => void
  serverRowsPerPage?: number | 'all'
  onRowsPerPageChange?: (size: number | 'all') => void
  serverCurrentPage?: number
  onPageChange?: (page: number) => void
  promotedStoreId?: string | null
  promotedMove?: 'IN' | 'OUT' | null
  isAdmin?: boolean
  onExportExcel?: () => Promise<void> | void
  isExporting?: boolean
}

export default function StoreAssetsTable({
  cardsBottomOffset,
  selectedStoreId = 'all',
  onClearStoreFilter,
  onNavigateToStore,
  storesData,
  className = '',
  isServerSide = false,
  isLoading = false,
  totalRecordsCount,
  totalPagesCount,
  serverSearchQuery,
  onSearchChange,
  serverSortField,
  serverSortOrder,
  onSortChange,
  serverRowsPerPage,
  onRowsPerPageChange,
  serverCurrentPage,
  onPageChange,
  promotedStoreId,
  promotedMove,
  isAdmin = true,
  onExportExcel,
  isExporting: propIsExporting
}: StoreAssetsTableProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  // Debounce internal search for standalone / client-side filtering mode
  const debouncedInternalSearch = useDebounce(internalSearchQuery, 250)
  const [internalSortField, setInternalSortField] = useState<SortField>('totalAssets')
  const [internalSortOrder, setInternalSortOrder] = useState<SortOrder>('desc')
  const [internalRowsPerPage, setInternalRowsPerPage] = useState<number | 'all'>(10)
  const [internalCurrentPage, setInternalCurrentPage] = useState<number>(1)
  const [notification, setNotification] = useState<ToastNotification | null>(null)

  const showNotification = useCallback(
    (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
      setNotification({ type, message })
      setTimeout(() => {
        setNotification((prev) => (prev?.message === message ? null : prev))
      }, 4500)
    },
    []
  )
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [toolbarHeight, setToolbarHeight] = useState<number>(44)

  useEffect(() => {
    if (toolbarRef.current) {
      setToolbarHeight(toolbarRef.current.offsetHeight)
    }
  }, [])

  const searchQuery = isServerSide ? (serverSearchQuery ?? '') : internalSearchQuery
  const effectiveFilterQuery = isServerSide ? (serverSearchQuery ?? '') : debouncedInternalSearch
  const sortField = isServerSide ? (serverSortField ?? 'totalAssets') : internalSortField
  const sortOrder = isServerSide ? (serverSortOrder ?? 'desc') : internalSortOrder
  const rowsPerPage = isServerSide ? (serverRowsPerPage ?? 10) : internalRowsPerPage
  const currentPage = isServerSide ? (serverCurrentPage ?? 1) : internalCurrentPage

  const activeStores = storesData || DUMMY_STORE_RECORDS

  const handleSort = (field: SortField) => {
    if (isServerSide) {
      onSortChange?.(field)
    } else {
      if (sortField === field) {
        setInternalSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
      } else {
        setInternalSortField(field)
        setInternalSortOrder('desc')
      }
    }
  }

  const handleSearchChange = (val: string) => {
    if (isServerSide) {
      onSearchChange?.(val)
    } else {
      setInternalSearchQuery(val)
      setInternalCurrentPage(1)
    }
  }

  const handleRowsPerPageChange = (val: number | 'all') => {
    if (isServerSide) {
      onRowsPerPageChange?.(val)
    } else {
      setInternalRowsPerPage(val)
      setInternalCurrentPage(1)
    }
  }

  const handlePageChange = (val: number) => {
    if (isServerSide) {
      onPageChange?.(val)
    } else {
      setInternalCurrentPage(val)
    }
  }

  // Selected store record (if filtered via dropdown)
  const activeFilteredStore = useMemo(() => {
    if (!selectedStoreId || selectedStoreId === 'all') return null
    return activeStores.find((s) => s.id === selectedStoreId) || null
  }, [activeStores, selectedStoreId])

  // Filter & Sort records with tokenized, normalized, and numeric matching
  const filteredAndSortedRecords = useMemo(() => {
    return activeStores
      .filter((item) => {
        // Filter by selected store dropdown
        if (selectedStoreId && selectedStoreId !== 'all') {
          if (item.id !== selectedStoreId) return false
        }

        // Filter by text search query
        if (!effectiveFilterQuery.trim()) return true
        const rawQuery = effectiveFilterQuery.trim().toLowerCase()
        const cleanQuery = rawQuery.replace(/[^a-z0-9]/g, '')

        const nameLower = item.storeName.toLowerCase()
        const cleanName = nameLower.replace(/[^a-z0-9]/g, '')
        const keywordsLower = (item.keywords || '').toLowerCase()

        // 1. Direct or normalized match on stock room name or keywords
        if (
          nameLower.includes(rawQuery) ||
          (cleanQuery && cleanName.includes(cleanQuery)) ||
          keywordsLower.includes(rawQuery)
        ) {
          return true
        }

        // 2. Multi-word token matching (all words separated by space/hyphen match)
        const tokens = rawQuery.split(/[\s-]+/).filter(Boolean)
        if (
          tokens.length > 1 &&
          tokens.every(
            (t) =>
              nameLower.includes(t) ||
              cleanName.includes(t.replace(/[^a-z0-9]/g, '')) ||
              keywordsLower.includes(t)
          )
        ) {
          return true
        }

        // 3. Numeric matching for Total Tagged Assets, Asset Issuance, Available Assets (with/without commas)
        if (cleanQuery && /^\d+$/.test(cleanQuery)) {
          const totalAssetsStr = String(item.totalAssets)
          const totalOutStr = String(item.totalOut)
          const availableAssetsStr = String(item.totalAssets - item.totalOut)

          if (
            totalAssetsStr.includes(cleanQuery) ||
            totalOutStr.includes(cleanQuery) ||
            availableAssetsStr.includes(cleanQuery)
          ) {
            return true
          }
        }

        return false
      })
      .sort((a, b) => {
        if (sortField === 'totalIn') {
          const aVal = a.totalAssets - a.totalOut
          const bVal = b.totalAssets - b.totalOut
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }

        const aVal = a[sortField]
        const bVal = b[sortField]

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }

        return 0
      })
  }, [activeStores, selectedStoreId, effectiveFilterQuery, sortField, sortOrder])

  // Pagination
  const totalRecords = isServerSide
    ? (totalRecordsCount ?? activeStores.length)
    : filteredAndSortedRecords.length
  const isAll = rowsPerPage === 'all'
  const effectiveLimit = isAll ? Math.max(totalRecords, 1) : rowsPerPage
  const totalPages = isServerSide
    ? (totalPagesCount ?? (isAll ? 1 : Math.ceil(totalRecords / effectiveLimit) || 1))
    : (isAll ? 1 : Math.ceil(totalRecords / effectiveLimit) || 1)
  const startIndex = isAll ? 0 : (currentPage - 1) * effectiveLimit
  const paginatedRecords = isAll
    ? filteredAndSortedRecords
    : filteredAndSortedRecords.slice(startIndex, startIndex + effectiveLimit)

  const recordsToDisplay = isServerSide ? activeStores : paginatedRecords
  const displayStart = totalRecords === 0 ? 0 : startIndex + 1
  const displayEnd = isAll
    ? totalRecords
    : Math.min(startIndex + recordsToDisplay.length, totalRecords)

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

  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const prevRowPositionsRef = useRef<Map<string, number>>(new Map())
  const isInitialTableRender = useRef(true)
  const skipNextAnimationRef = useRef(false)

  // Skip table slide animation when changing page, sorting, search or rowsPerPage
  useEffect(() => {
    skipNextAnimationRef.current = true
  }, [currentPage, sortField, sortOrder, searchQuery, rowsPerPage])

  // FLIP (First, Last, Invert, Play) animation for table rows sliding to top
  useLayoutEffect(() => {
    const tbody = tbodyRef.current
    if (!tbody) return

    const rows = Array.from(
      tbody.querySelectorAll<HTMLTableRowElement>('tr[data-row-key]')
    )

    if (isInitialTableRender.current || skipNextAnimationRef.current) {
      isInitialTableRender.current = false
      skipNextAnimationRef.current = false
      prevRowPositionsRef.current.clear()
      rows.forEach((tr) => {
        const key = tr.getAttribute('data-row-key')
        if (key) {
          prevRowPositionsRef.current.set(key, tr.getBoundingClientRect().top)
        }
      })
      return
    }

    const prevPositions = prevRowPositionsRef.current
    const animations: {
      tr: HTMLTableRowElement
      deltaY: number
      isPromoted: boolean
    }[] = []

    rows.forEach((tr) => {
      const key = tr.getAttribute('data-row-key')
      if (!key) return

      const newTop = tr.getBoundingClientRect().top
      const oldTop = prevPositions.get(key)

      if (oldTop !== undefined) {
        const deltaY = oldTop - newTop
        if (Math.abs(deltaY) > 1) {
          const isPromoted = deltaY > 0 && tr.getAttribute('data-row-index') === '0'
          animations.push({ tr, deltaY, isPromoted })
        }
      } else {
        if (tr.getAttribute('data-row-index') === '0') {
          const rowHeight = tr.getBoundingClientRect().height || 42
          animations.push({ tr, deltaY: -rowHeight, isPromoted: true })
        }
      }
    })

    prevRowPositionsRef.current.clear()
    rows.forEach((tr) => {
      const key = tr.getAttribute('data-row-key')
      if (key) {
        prevRowPositionsRef.current.set(key, tr.getBoundingClientRect().top)
      }
    })

    if (animations.length === 0) return

    // 1. INVERT
    animations.forEach(({ tr, deltaY, isPromoted }) => {
      tr.style.transform = `translateY(${deltaY}px)`
      tr.style.transition = 'none'
      if (isPromoted) {
        tr.style.position = 'relative'
        tr.style.zIndex = '30'
        tr.classList.add('row-sliding-promoted')
      } else {
        tr.style.position = 'relative'
        tr.style.zIndex = '1'
      }
    })

    void tbody.offsetHeight

    // 2. PLAY
    const rafId = requestAnimationFrame(() => {
      animations.forEach(({ tr, isPromoted }) => {
        if (isPromoted) {
          tr.style.transition =
            'transform 650ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 650ms ease'
        } else {
          tr.style.transition = 'transform 550ms cubic-bezier(0.16, 1, 0.3, 1)'
        }
        tr.style.transform = 'translateY(0px)'
      })
    })

    // 3. CLEAN UP
    const cleanupTimer = setTimeout(() => {
      animations.forEach(({ tr }) => {
        tr.style.transform = ''
        tr.style.transition = ''
        tr.style.position = ''
        tr.style.zIndex = ''
        tr.classList.remove('row-sliding-promoted')
      })
    }, 700)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(cleanupTimer)
    }
  }, [recordsToDisplay])

  const [internalIsExporting, setInternalIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const isExporting = propIsExporting ?? internalIsExporting

  const hasData = isServerSide
    ? (totalRecordsCount !== undefined ? totalRecordsCount > 0 : (storesData && storesData.length > 0))
    : (filteredAndSortedRecords && filteredAndSortedRecords.length > 0)

  const handleExportExcel = async () => {
    if (!hasData) return

    if (onExportExcel) {
      await onExportExcel()
      return
    }

    if (isServerSide) {
      if (!isAdmin) {
        showNotification('error', 'You are not authorized to export this data.')
        return
      }
      setInternalIsExporting(true)
      setExportProgress(10)
      try {
        const parsedId =
          selectedStoreId && selectedStoreId !== 'all'
            ? parseInt(selectedStoreId.replace(/^stock-/, ''), 10)
            : NaN
        const targetStockroomId = !Number.isNaN(parsedId) && parsedId > 0 ? parsedId : null

        await downloadExcelExport(
          1,
          targetStockroomId,
          (percent) => {
            setExportProgress(percent)
          },
          activeFilteredStore?.storeName
        )
        showNotification('success', 'Central Dashboard exported to Excel successfully!')
      } catch (err: any) {
        console.warn('CentralDashboard: backend Excel export failed', err)
        showNotification('error', err.message || 'Failed to export Excel file.')
      } finally {
        setTimeout(() => {
          setInternalIsExporting(false)
          setExportProgress(0)
        }, 500)
      }
      return
    }

    const recordsToExport = activeStores
    if (!recordsToExport || recordsToExport.length === 0) {
      showNotification('warning', 'No data to export')
      return
    }
    setInternalIsExporting(true)
    setExportProgress(25)
    setTimeout(() => {
      setExportProgress(75)
      const headers = ['Stock Room', 'Total Tagged Assets', 'Asset Issuance', 'Available Assets']
      const rows = recordsToExport.map((r) => [
        r.storeName,
        r.totalAssets,
        r.totalOut,
        r.totalAssets - r.totalOut
      ])
      exportToExcel(
        headers,
        rows,
        `stock_room_assets_${new Date().toISOString().slice(0, 10)}.xlsx`,
        'Stock Rooms'
      )
      setExportProgress(100)
      showNotification('success', `Exported ${rows.length} stock rooms to Excel.`)
      setTimeout(() => {
        setInternalIsExporting(false)
        setExportProgress(0)
      }, 500)
    }, 200)
  }

  return (
    <>
      <Toast notification={notification} onClose={() => setNotification(null)} />
      <div
        className={`w-full bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#EAE7DF] dark:border-[#2C2C2C] sm:overflow-visible overflow-hidden flex flex-col ${className}`}
      >
      {/* Table Toolbar Header (Sticky below cards) */}
      <div
        ref={toolbarRef}
        style={{
          top: cardsBottomOffset !== undefined ? `${cardsBottomOffset}px` : undefined
        }}
        className={`px-3 py-1.5 sm:px-4 sm:py-2 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6] dark:bg-[#232323] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 ${
          cardsBottomOffset !== undefined ? 'sticky z-25' : 'lg:sticky lg:top-[213px] lg:z-15'
        } rounded-t-2xl`}
      >
        {/* Left: Search input & Active Stock Room Filter Badge */}
        <div className="flex items-center gap-2 flex-1 max-w-lg flex-wrap sm:flex-nowrap">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#99958D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search stock room, tagged assets, issuance, available..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-8 pl-8 pr-7 text-xs bg-white dark:bg-[#181818] rounded-xl border border-[#EAE7DF] dark:border-[#333333] outline-none focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20 text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#99958D] hover:text-[#171717] dark:hover:text-white p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Active Filter Indicator Tag */}
          {activeFilteredStore && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-[#00a8e7]/10 text-[#00a8e7] text-[11px] font-semibold border border-[#00a8e7]/20 shrink-0">
              <span className="truncate max-w-[140px] sm:max-w-[200px]" title={activeFilteredStore.storeName}>
                {activeFilteredStore.storeName}
              </span>
              {onClearStoreFilter && (
                <TooltipTop content="Show all stock rooms">
                  <button
                    type="button"
                    onClick={onClearStoreFilter}
                    className="p-0.5 rounded-full hover:bg-[#00a8e7]/20 transition-colors cursor-pointer"
                    aria-label="Show all stock rooms"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </TooltipTop>
              )}
            </div>
          )}
        </div>

        {/* Right: Rows Selector and Export Button */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#666666] dark:text-[#A0A0A0]">
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                const val = e.target.value
                handleRowsPerPageChange(val === 'all' ? 'all' : Number(val))
              }}
              className="h-8 px-2 text-xs bg-white dark:bg-[#181818] border border-[#EAE7DF] dark:border-[#333333] rounded-xl text-[#171717] dark:text-[#EDEDED] outline-none cursor-pointer focus:border-[#1D63ED]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value="all">All</option>
            </select>
          </div>

          <TooltipBottom
            content={
              !isAdmin
                ? 'Admin access required to export'
                : !hasData
                ? 'No data available to export'
                : isExporting
                ? `Exporting... ${exportProgress}%`
                : 'Export Central Dashboard to Excel (.xlsx)'
            }
          >
            <button
              type="button"
              disabled={!hasData || isExporting || !isAdmin}
              onClick={handleExportExcel}
              className="relative overflow-hidden flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-[#00875A] hover:bg-[#00704A] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#00875A] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs select-none"
            >
              {/* Animated background progress fill inside the button itself */}
              {isExporting && (
                <div
                  className="absolute inset-y-0 left-0 bg-[#006644] transition-all duration-200 ease-out z-0"
                  style={{ width: `${exportProgress}%` }}
                />
              )}

              {/* Crisp bottom progress line */}
              {isExporting && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/25 z-0">
                  <div
                    className="h-full bg-white transition-all duration-200 ease-out"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              )}

              <span className="relative z-10 flex items-center gap-1.5">
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>Exporting... {exportProgress > 0 ? `${exportProgress}%` : ''}</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                    <span>Export to Excel</span>
                  </>
                )}
              </span>
            </button>
          </TooltipBottom>
        </div>
      </div>

      {/* Table Container */}
      <div className="relative w-full sm:overflow-visible overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full text-left border-collapse select-none">
          {/* Table Header: Sticky below toolbar */}
          <thead
            style={{
              top: cardsBottomOffset !== undefined ? `${cardsBottomOffset + toolbarHeight}px` : undefined
            }}
            className={`border-b border-[#EAE7DF] dark:border-[#2C2C2C] shadow-2xs ${
              cardsBottomOffset !== undefined ? 'sticky z-20' : 'lg:sticky lg:top-[258px] lg:z-10'
            }`}
          >
            <tr className="bg-[#F4F7FB] dark:bg-[#252830]">
              {/* Column 1: Stock Room */}
              <th
                onClick={() => handleSort('storeName')}
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors min-w-[260px] sm:min-w-[320px] bg-[#F4F7FB] dark:bg-[#252830]"
              >
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                  <span>Stock Room</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </div>
              </th>

              {/* Column 2: Total Tagged Assets */}
              <th
                onClick={() => handleSort('totalAssets')}
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase text-right cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors bg-[#F4F7FB] dark:bg-[#252830]"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Total Tagged Assets</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </div>
              </th>

              {/* Column 3: Asset Issuance */}
              <th
                onClick={() => handleSort('totalOut')}
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase text-right cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors bg-[#F4F7FB] dark:bg-[#252830]"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Asset Issuance</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </div>
              </th>

              {/* Column 4: Available Assets */}
              <th
                onClick={() => handleSort('totalIn')}
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase text-right cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors bg-[#F4F7FB] dark:bg-[#252830]"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Available Assets</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </div>
              </th>
            </tr>
          </thead>

          {/* Scrollable Table Body */}
          <tbody
            ref={tbodyRef}
            className={`divide-y divide-[#EAE7DF]/60 dark:divide-[#2C2C2C] text-xs transition-opacity duration-200 ${
              isLoading ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {recordsToDisplay.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#99958D]">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-[#1D63ED]" />
                      <span className="font-medium text-xs">Loading records from server...</span>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-xs">No matching stock room records found.</p>
                      {selectedStoreId !== 'all' && onClearStoreFilter && (
                        <button
                          type="button"
                          onClick={onClearStoreFilter}
                          className="mt-2 text-xs text-[#00a8e7] hover:underline cursor-pointer"
                        >
                          Clear stock room filter and show all records
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ) : (
              recordsToDisplay.map((record, idx) => {
                const isTopRow = idx === 0
                const rawMove =
                  record.move ||
                  record.lastMove ||
                  (isTopRow ? promotedMove : undefined)
                const moveDirection = normalizeMove(rawMove)
                const isMoveOut = moveDirection === 'OUT'
                const isMoveIn = moveDirection === 'IN'
                const isPromoted =
                  isTopRow && (promotedStoreId === record.id || record.lastMove !== undefined)

                // Only the latest data at the first position of the table keeps green or red bg;
                // other rows use the previous odd/even alternating colors
                const rowBgClass = isTopRow && (isMoveOut || isMoveIn)
                  ? isMoveOut
                    ? 'bg-[#FEF2F2] dark:bg-[#451A1A]/30 hover:bg-[#FEE2E2] dark:hover:bg-[#451A1A]/45'
                    : 'bg-[#ECFDF5] dark:bg-[#064E3B]/25 hover:bg-[#D1FAE5] dark:hover:bg-[#064E3B]/40'
                  : idx % 2 === 0
                  ? 'bg-white dark:bg-[#1E1E1E]'
                  : 'bg-[#F9F8F5] dark:bg-[#181818]'

                const rowBorderClass = isTopRow && (isMoveOut || isMoveIn)
                  ? isMoveOut
                    ? 'border-[#FECACA]/60 dark:border-[#7F1D1D]/40'
                    : 'border-[#A7F3D0]/60 dark:border-[#047857]/40'
                  : 'border-[#EAE7DF]/40 dark:border-[#2C2C2C]/40'

                const promotionClass = isPromoted
                  ? isMoveOut
                    ? 'row-promoted-active-red'
                    : 'row-promoted-active-green'
                  : ''

                return (
                  <tr
                    key={record.id}
                    data-row-key={record.id}
                    data-row-index={idx}
                    onClick={() => onNavigateToStore?.(record.id)}
                    className={`group transition-colors border-b ${rowBorderClass} ${
                      promotionClass || rowBgClass
                    } ${
                      !isTopRow
                        ? 'hover:bg-[#F0F6FF]/70 dark:hover:bg-[#1E293B]/70'
                        : ''
                    } ${onNavigateToStore ? 'cursor-pointer' : ''}`}
                  >
                  {/* Column 1: Stock Room (Clean text matching dropdown exactly) with View action */}
                  <td className="py-2 px-3 sm:px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#171717] dark:text-[#EDEDED] text-xs group-hover:text-[#1D63ED] dark:group-hover:text-[#60A5FA] transition-colors">
                        {record.storeName}
                      </span>
                      {onNavigateToStore && (
                        <TooltipTop
                          content={
                            <span className="flex items-center gap-1">
                              <span>View Stock Room Details</span>
                              <ArrowUpRight className="w-3 h-3 text-[#38BDF8] stroke-[2.5]" />
                            </span>
                          }
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onNavigateToStore(record.id)
                            }}
                            aria-label={`View ${record.storeName} in Stock Room Dashboard`}
                            className="p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-[#00a8e7] dark:hover:text-[#38bdf8] hover:bg-[#EBF8FE] dark:hover:bg-[#00a8e7]/15 transition-all duration-150 cursor-pointer shrink-0 active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5 transition-transform duration-150" />
                          </button>
                        </TooltipTop>
                      )}
                    </div>
                  </td>

                  {/* Column 2: Total Tagged Assets */}
                  <td className="py-2 px-3 sm:px-4 text-right font-bold text-[#171717] dark:text-[#EDEDED] tabular-nums">
                    {record.totalAssets.toLocaleString()}
                  </td>

                  {/* Column 3: Asset Issuance */}
                  <td className="py-2 px-3 sm:px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF7ED] dark:bg-[#7C2D12]/40 text-[#EA580C] dark:text-[#FB923C] font-bold tabular-nums text-xs">
                      <ArrowUpRight className="w-3 h-3 shrink-0" />
                      {record.totalOut.toLocaleString()}
                    </span>
                  </td>

                  {/* Column 4: Available Assets (Total Tagged Assets - Asset Issuance) */}
                  <td className="py-2 px-3 sm:px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#34D399] font-bold tabular-nums text-xs">
                      <ArrowDownLeft className="w-3 h-3 shrink-0" />
                      {(record.totalAssets - record.totalOut).toLocaleString()}
                    </span>
                  </td>
                </tr>
              )
            })
          )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="px-3 py-1.5 sm:px-4 sm:py-2 border-t border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6]/80 dark:bg-[#232323] flex items-center justify-between text-xs text-[#666666] dark:text-[#A0A0A0] shrink-0">
        <div>
          <span>
            Showing{' '}
            <strong className="text-[#171717] dark:text-[#EDEDED]">
              {displayStart}
            </strong>{' '}
            to{' '}
            <strong className="text-[#171717] dark:text-[#EDEDED]">
              {displayEnd}
            </strong>{' '}
            of{' '}
            <strong className="text-[#171717] dark:text-[#EDEDED]">
              {totalRecords}
            </strong>{' '}
            records
          </span>
        </div>

        <div className="flex items-center gap-1">
          <TooltipTop content="Previous page" disabled={currentPage === 1 || isAll}>
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isAll}
              className="w-7 h-7 flex items-center justify-center rounded-xl border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </TooltipTop>

          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[#99958D] font-bold select-none">
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
                onClick={() => !isAll && handlePageChange(pageNum)}
                disabled={isAll}
                className={`min-w-7 h-7 px-2 flex items-center justify-center rounded-xl text-xs font-semibold select-none transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-bold shadow-xs'
                    : 'border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#666666] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white hover:border-[#171717]/40 dark:hover:border-white/40'
                }`}
              >
                {pageNum}
              </button>
            )
          })}

          <TooltipTop content="Next page" disabled={currentPage >= totalPages || isAll}>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || isAll}
              className="w-7 h-7 flex items-center justify-center rounded-xl border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </TooltipTop>
        </div>
      </div>
    </div>
  </>
  )
}