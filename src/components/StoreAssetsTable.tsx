import { useState, useMemo } from 'react'
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
  Eye
} from 'lucide-react'
import { DUMMY_STORE_RECORDS, type StoreAssetRecord } from '../data/storesData'
import { exportToExcel } from '../utils/excelExport'

export type { StoreAssetRecord }
export { DUMMY_STORE_RECORDS }

interface StoreAssetsTableProps {
  selectedStoreId?: string
  onClearStoreFilter?: () => void
  onNavigateToStore?: (storeId: string) => void
  storesData?: StoreAssetRecord[]
  className?: string
}

type SortField = 'storeName' | 'totalAssets' | 'totalIn' | 'totalOut'
type SortOrder = 'asc' | 'desc'

export default function StoreAssetsTable({
  selectedStoreId = 'all',
  onClearStoreFilter,
  onNavigateToStore,
  storesData,
  className = ''
}: StoreAssetsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('totalAssets')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const activeStores = storesData || DUMMY_STORE_RECORDS

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
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
        if (!searchQuery.trim()) return true
        const rawQuery = searchQuery.trim().toLowerCase()
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
  }, [activeStores, selectedStoreId, searchQuery, sortField, sortOrder])

  // Pagination
  const totalRecords = filteredAndSortedRecords.length
  const isAll = rowsPerPage === 'all'
  const effectiveLimit = isAll ? Math.max(totalRecords, 1) : rowsPerPage
  const totalPages = isAll ? 1 : Math.ceil(totalRecords / effectiveLimit) || 1
  const startIndex = isAll ? 0 : (currentPage - 1) * effectiveLimit
  const paginatedRecords = isAll
    ? filteredAndSortedRecords
    : filteredAndSortedRecords.slice(startIndex, startIndex + effectiveLimit)

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

  const handleExportExcel = () => {
    const headers = ['Stock Room', 'Total Tagged Assets', 'Asset Issuance', 'Available Assets']
    const rows = filteredAndSortedRecords.map((r) => [
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
  }

  return (
    <div
      className={`w-full bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#EAE7DF] dark:border-[#2C2C2C] lg:overflow-visible overflow-hidden flex flex-col ${className}`}
    >
      {/* Table Toolbar Header (Sticky on desktop below cards) */}
      <div className="px-3 py-1.5 sm:px-4 sm:py-2 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6] dark:bg-[#232323] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 lg:sticky lg:top-[213px] lg:z-15 rounded-t-2xl">
        {/* Left: Search input & Active Stock Room Filter Badge */}
        <div className="flex items-center gap-2 flex-1 max-w-lg flex-wrap sm:flex-nowrap">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#99958D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search stock room, tagged assets, issuance, available..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white dark:bg-[#181818] rounded-2xl border border-[#EAE7DF] dark:border-[#333333] outline-none focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20 text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all"
            />
          </div>

          {/* Active Filter Indicator Tag */}
          {activeFilteredStore && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-[#00a8e7]/10 text-[#00a8e7] text-[11px] font-semibold border border-[#00a8e7]/20 shrink-0">
              <span className="truncate max-w-[140px] sm:max-w-[200px]" title={activeFilteredStore.storeName}>
                {activeFilteredStore.storeName}
              </span>
              {onClearStoreFilter && (
                <button
                  type="button"
                  onClick={onClearStoreFilter}
                  title="Show all stock rooms"
                  className="p-0.5 rounded-full hover:bg-[#00a8e7]/20 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
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
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Export filtered records to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="relative w-full lg:overflow-visible overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full text-left border-collapse select-none">
          {/* Table Header: Sticky below toolbar on desktop */}
          <thead className="lg:sticky lg:top-[258px] lg:z-10 bg-[#F4F7FB] dark:bg-[#252830] border-b border-[#EAE7DF] dark:border-[#2C2C2C] shadow-2xs">
            <tr>
              {/* Column 1: Stock Room */}
              <th
                onClick={() => handleSort('storeName')}
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors min-w-[260px] sm:min-w-[320px]"
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
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase text-right cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Total Tagged Assets</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </div>
              </th>

              {/* Column 3: Asset Issuance */}
              <th
                onClick={() => handleSort('totalOut')}
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase text-right cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
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
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase text-right cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
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
          <tbody className="divide-y divide-[#EAE7DF]/60 dark:divide-[#2C2C2C] text-xs">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#99958D]">
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
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-[#F8FAFC] dark:hover:bg-[#252830]/60 transition-colors"
                >
                  {/* Column 1: Stock Room (Clean text matching dropdown exactly) with View action */}
                  <td className="py-2 px-3 sm:px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#171717] dark:text-[#EDEDED] text-xs">
                        {record.storeName}
                      </span>
                      {onNavigateToStore && (
                        <button
                          type="button"
                          onClick={() => onNavigateToStore(record.id)}
                          title={`View ${record.storeName} in Stock Room Dashboard`}
                          aria-label={`View ${record.storeName} in Stock Room Dashboard`}
                          className="p-1 rounded-md text-[#64748B] dark:text-[#94A3B8] hover:text-[#00a8e7] dark:hover:text-[#38bdf8] hover:bg-[#EBF8FE] dark:hover:bg-[#00a8e7]/10 transition-colors cursor-pointer shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
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
              ))
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
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isAll}
            className="w-7 h-7 flex items-center justify-center rounded-xl border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

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
                onClick={() => !isAll && setCurrentPage(pageNum)}
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

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || isAll}
            className="w-7 h-7 flex items-center justify-center rounded-xl border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}