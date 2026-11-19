import { useState, useMemo } from 'react'
import {
  Search,
  Store,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react'

export interface StoreAssetRecord {
  id: string
  storeCode: string
  storeName: string
  location: string
  totalAssets: number
  totalIn: number
  totalOut: number
}

export const DUMMY_STORE_RECORDS: StoreAssetRecord[] = [
  {
    id: 'store-1',
    storeCode: 'STR-001',
    storeName: 'Store 1 - Central Hub',
    location: 'Bengaluru, KA',
    totalAssets: 8420,
    totalIn: 920,
    totalOut: 480
  },
  {
    id: 'store-2',
    storeCode: 'STR-002',
    storeName: 'Store 2 - West Terminal',
    location: 'Mumbai, MH',
    totalAssets: 12850,
    totalIn: 1140,
    totalOut: 610
  },
  {
    id: 'store-3',
    storeCode: 'STR-003',
    storeName: 'Store 3 - North Depot',
    location: 'Delhi, NCR',
    totalAssets: 9640,
    totalIn: 750,
    totalOut: 390
  },
  {
    id: 'store-4',
    storeCode: 'STR-004',
    storeName: 'Store 4 - Cyber Logistics',
    location: 'Hyderabad, TS',
    totalAssets: 6780,
    totalIn: 540,
    totalOut: 290
  },
  {
    id: 'store-5',
    storeCode: 'STR-005',
    storeName: 'Store 5 - South Express',
    location: 'Chennai, TN',
    totalAssets: 5320,
    totalIn: 430,
    totalOut: 210
  },
  {
    id: 'store-6',
    storeCode: 'STR-006',
    storeName: 'Store 6 - Logistics Hub',
    location: 'Pune, MH',
    totalAssets: 4910,
    totalIn: 380,
    totalOut: 190
  },
  {
    id: 'store-7',
    storeCode: 'STR-007',
    storeName: 'Store 7 - Whitefield Gate',
    location: 'Bengaluru, KA',
    totalAssets: 7120,
    totalIn: 620,
    totalOut: 310
  },
  {
    id: 'store-8',
    storeCode: 'STR-008',
    storeName: 'Store 8 - Cyber City Center',
    location: 'Gurugram, HR',
    totalAssets: 11300,
    totalIn: 980,
    totalOut: 530
  },
  {
    id: 'store-9',
    storeCode: 'STR-009',
    storeName: 'Store 9 - East Terminal',
    location: 'Kolkata, WB',
    totalAssets: 3850,
    totalIn: 290,
    totalOut: 160
  },
  {
    id: 'store-10',
    storeCode: 'STR-010',
    storeName: 'Store 10 - North Hub',
    location: 'Lucknow, UP',
    totalAssets: 3200,
    totalIn: 240,
    totalOut: 130
  },
  {
    id: 'store-11',
    storeCode: 'STR-011',
    storeName: 'Store 11 - West Express',
    location: 'Ahmedabad, GJ',
    totalAssets: 4450,
    totalIn: 350,
    totalOut: 180
  },
  {
    id: 'store-12',
    storeCode: 'STR-012',
    storeName: 'Store 12 - Gateway Hub',
    location: 'Jaipur, RJ',
    totalAssets: 2980,
    totalIn: 210,
    totalOut: 110
  }
]

interface StoreAssetsTableProps {
  selectedStoreId?: string
  className?: string
}

type SortField = 'storeName' | 'totalAssets' | 'totalIn' | 'totalOut'
type SortOrder = 'asc' | 'desc'

export default function StoreAssetsTable({
  selectedStoreId = 'all',
  className = ''
}: StoreAssetsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('totalAssets')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Filter & Sort records
  const filteredAndSortedRecords = useMemo(() => {
    return DUMMY_STORE_RECORDS.filter((item) => {
      // Filter by selected store dropdown
      if (selectedStoreId && selectedStoreId !== 'all') {
        if (item.id !== selectedStoreId) return false
      }

      // Filter by text search query (supporting name, location, numbers with/without commas)
      if (!searchQuery.trim()) return true
      const rawQuery = searchQuery.trim().toLowerCase()
      const numericQuery = rawQuery.replace(/,/g, '')

      const totalAssetsStr = String(item.totalAssets)
      const totalAssetsLocale = item.totalAssets.toLocaleString()

      const totalInStr = String(item.totalIn)
      const totalInLocale = item.totalIn.toLocaleString()

      const totalOutStr = String(item.totalOut)
      const totalOutLocale = item.totalOut.toLocaleString()

      return (
        item.storeName.toLowerCase().includes(rawQuery) ||
        item.storeCode.toLowerCase().includes(rawQuery) ||
        item.location.toLowerCase().includes(rawQuery) ||
        totalAssetsStr.includes(numericQuery) ||
        totalAssetsLocale.toLowerCase().includes(rawQuery) ||
        totalInStr.includes(numericQuery) ||
        totalInLocale.toLowerCase().includes(rawQuery) ||
        totalOutStr.includes(numericQuery) ||
        totalOutLocale.toLowerCase().includes(rawQuery)
      )
    }).sort((a, b) => {
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
  }, [selectedStoreId, searchQuery, sortField, sortOrder])

  // Pagination
  const totalRecords = filteredAndSortedRecords.length
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedRecords = filteredAndSortedRecords.slice(
    startIndex,
    startIndex + rowsPerPage
  )

  const handleExportCSV = () => {
    const headers = ['Store Code', 'Store Name', 'Location', 'Total Assets', 'Total In', 'Total Out']
    const rows = filteredAndSortedRecords.map((r) => [
      r.storeCode,
      `"${r.storeName}"`,
      `"${r.location}"`,
      r.totalAssets,
      r.totalIn,
      r.totalOut
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `store_assets_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className={`w-full bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#EAE7DF] dark:border-[#2C2C2C] overflow-hidden flex flex-col min-h-0 ${className}`}
    >
      {/* Table Toolbar Header (Compact, Matching Reference Image) */}
      <div className="px-3 py-1.5 sm:px-4 sm:py-2 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6]/80 dark:bg-[#232323] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
        {/* Left: Search input */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#99958D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search store name, assets, in/out..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white dark:bg-[#181818] rounded-2xl border border-[#EAE7DF] dark:border-[#333333] outline-none focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20 text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all"
            />
          </div>
        </div>

        {/* Right: Rows Selector and Export Button */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#666666] dark:text-[#A0A0A0]">
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="h-7 px-1.5 py-0 text-xs bg-white dark:bg-[#181818] border border-[#EAE7DF] dark:border-[#333333] rounded-xl text-[#171717] dark:text-[#EDEDED] outline-none cursor-pointer focus:border-[#1D63ED]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Export filtered records to Excel/CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Fixed Header & Scrollable Body Table Container */}
      <div className="relative flex-1 min-h-[140px] overflow-y-auto">
        <table className="w-full text-left border-collapse select-none">
          {/* Fixed Sticky Table Header */}
          <thead className="sticky top-0 z-20 bg-[#F4F7FB] dark:bg-[#252830] border-b border-[#EAE7DF] dark:border-[#2C2C2C] shadow-2xs">
            <tr>
              {/* Column 1: Store Name */}
              <th
                onClick={() => handleSort('storeName')}
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                  <span>Store Name</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </div>
              </th>

              {/* Column 2: Total Assets */}
              <th
                onClick={() => handleSort('totalAssets')}
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase text-right cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Total Assets</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </div>
              </th>

              {/* Column 3: Total In */}
              <th
                onClick={() => handleSort('totalIn')}
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase text-right cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Total In</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </div>
              </th>

              {/* Column 4: Total Out */}
              <th
                onClick={() => handleSort('totalOut')}
                className="py-2 px-3 sm:px-4 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] tracking-wider uppercase text-right cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Total Out</span>
                  <ArrowUpDown className="w-3 h-3 text-[#94A3B8]" />
                </div>
              </th>
            </tr>
          </thead>

          {/* Scrollable Table Body */}
          <tbody className="divide-y divide-[#EAE7DF]/60 dark:divide-[#2C2C2C] text-xs">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[#99958D]">
                  No matching store records found.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-[#F8FAFC] dark:hover:bg-[#252830]/60 transition-colors"
                >
                  {/* Column 1: Store Name */}
                  <td className="py-1.5 sm:py-2 px-3 sm:px-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#171717] dark:text-[#EDEDED] truncate leading-tight">
                        {record.storeName}
                      </p>
                      <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-tight">
                        {record.location}
                      </p>
                    </div>
                  </td>

                  {/* Column 2: Total Assets */}
                  <td className="py-1.5 sm:py-2 px-3 sm:px-4 text-right font-bold text-[#171717] dark:text-[#EDEDED] tabular-nums">
                    {record.totalAssets.toLocaleString()}
                  </td>

                  {/* Column 3: Total In */}
                  <td className="py-1.5 sm:py-2 px-3 sm:px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#34D399] font-bold tabular-nums text-xs">
                      <ArrowDownLeft className="w-3 h-3 shrink-0" />
                      {record.totalIn.toLocaleString()}
                    </span>
                  </td>

                  {/* Column 4: Total Out */}
                  <td className="py-1.5 sm:py-2 px-3 sm:px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF7ED] dark:bg-[#7C2D12]/40 text-[#EA580C] dark:text-[#FB923C] font-bold tabular-nums text-xs">
                      <ArrowUpRight className="w-3 h-3 shrink-0" />
                      {record.totalOut.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer (Matching Reference Image) */}
      <div className="px-3 py-1.5 sm:px-4 sm:py-2 border-t border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6]/80 dark:bg-[#232323] flex items-center justify-between text-xs text-[#666666] dark:text-[#A0A0A0] shrink-0">
        <div>
          <span>
            Showing{' '}
            <strong className="text-[#171717] dark:text-[#EDEDED]">
              {totalRecords === 0 ? 0 : startIndex + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-[#171717] dark:text-[#EDEDED]">
              {Math.min(startIndex + rowsPerPage, totalRecords)}
            </strong>{' '}
            of{' '}
            <strong className="text-[#171717] dark:text-[#EDEDED]">
              {totalRecords}
            </strong>{' '}
            records
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-2xl border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="min-w-7 h-7 px-2 flex items-center justify-center rounded-2xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-bold text-xs select-none">
            {currentPage}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-2xl border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
