import React, { useState, useMemo } from 'react'
import {
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  FileSpreadsheet,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Check,
  Power,
  X
} from 'lucide-react'
import { exportToExcel } from '../utils/excelExport'

export interface StockRoomMasterRecord {
  id: string
  stockRoomName: string
  stockRoomEngineer: string
  stockRoomLead: string
  status: 'Active' | 'Inactive'
  createdAt: string
  updatedAt?: string
}

const INITIAL_STOCK_ROOMS: StockRoomMasterRecord[] = [
  {
    id: 'srm-1',
    stockRoomName: 'IND-AND-VIZAG-S1-1F-NO WING-UI',
    stockRoomEngineer: 'Manoj Sharma',
    stockRoomLead: 'Suresh Nair',
    status: 'Active',
    createdAt: '2026-11-15 09:30:00'
  },
  {
    id: 'srm-2',
    stockRoomName: 'IND-DEL-GDC- NO Tower-3F-AW-U',
    stockRoomEngineer: 'Ananya Verma',
    stockRoomLead: 'Vikram Patel',
    status: 'Active',
    createdAt: '2026-11-16 11:20:00'
  },
  {
    id: 'srm-3',
    stockRoomName: 'IND-DEL-GURG-CANDOR-6F-NO Wing',
    stockRoomEngineer: 'Rohan Gupta',
    stockRoomLead: 'Vikram Patel',
    status: 'Active',
    createdAt: '2026-11-16 14:45:00'
  },
  {
    id: 'srm-4',
    stockRoomName: 'IND-Gujarat-Ahmedabad-GIFT City',
    stockRoomEngineer: 'Pooja Mehta',
    stockRoomLead: 'Amit Shah',
    status: 'Active',
    createdAt: '2026-11-17 10:15:00'
  },
  {
    id: 'srm-5',
    stockRoomName: 'IND-HAR-GGN-Alight Gurugram-T2-GF',
    stockRoomEngineer: 'Deepak Yadav',
    stockRoomLead: 'Suresh Nair',
    status: 'Inactive',
    createdAt: '2026-11-17 16:30:00'
  },
  {
    id: 'srm-6',
    stockRoomName: 'IND-HAR-GGN-SEZ INFOSPACE-T1-FF',
    stockRoomEngineer: 'Kavita Reddy',
    stockRoomLead: 'Amit Shah',
    status: 'Active',
    createdAt: '2026-11-18 09:10:00'
  },
  {
    id: 'srm-7',
    stockRoomName: 'IND-KAR-BLR-ECITY-PH1-Tower 5',
    stockRoomEngineer: 'Karthik Iyer',
    stockRoomLead: 'Priyanka Joshi',
    status: 'Active',
    createdAt: '2026-11-18 13:00:00'
  },
  {
    id: 'srm-8',
    stockRoomName: 'IND-MAH-PUN-HINJEWADI-PH2-Bldg B',
    stockRoomEngineer: 'Sachin Deshmukh',
    stockRoomLead: 'Priyanka Joshi',
    status: 'Active',
    createdAt: '2026-11-19 11:40:00'
  },
  {
    id: 'srm-9',
    stockRoomName: 'IND-TAM-CHN-SHOLINGANALLUR-SEZ',
    stockRoomEngineer: 'Ravi Chandran',
    stockRoomLead: 'Suresh Nair',
    status: 'Active',
    createdAt: '2026-11-19 15:25:00'
  },
  {
    id: 'srm-10',
    stockRoomName: 'IND-TEL-HYD-GACHIBOWLI-Tower 3',
    stockRoomEngineer: 'Naveen Kumar',
    stockRoomLead: 'Amit Shah',
    status: 'Active',
    createdAt: '2026-11-20 10:05:00'
  },
  {
    id: 'srm-11',
    stockRoomName: 'IND-KAR-BLR-KOD-S1-GF-NO WING-IV',
    stockRoomEngineer: 'Swati Pillai',
    stockRoomLead: 'Priyanka Joshi',
    status: 'Active',
    createdAt: '2026-11-20 13:40:00'
  },
  {
    id: 'srm-12',
    stockRoomName: 'IND-HAR-Gurugram-Blackstone-ONYX-2F',
    stockRoomEngineer: 'Manoj Sharma',
    stockRoomLead: 'Vikram Patel',
    status: 'Active',
    createdAt: '2026-11-20 15:15:00'
  }
]

type SortField = 'stockRoomName' | 'stockRoomEngineer' | 'stockRoomLead' | 'status' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export const StoreMaster: React.FC = () => {
  // Master records list
  const [records, setRecords] = useState<StockRoomMasterRecord[]>(INITIAL_STOCK_ROOMS)

  // Form input states
  const [stockRoomName, setStockRoomName] = useState('')
  const [stockRoomEngineer, setStockRoomEngineer] = useState('')
  const [stockRoomLead, setStockRoomLead] = useState('')
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Validation errors & feedback banner
  const [errors, setErrors] = useState<{
    stockRoomName?: string
    stockRoomEngineer?: string
    stockRoomLead?: string
  }>({})
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // DataTable filtering, sorting & pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Metrics summary
  const totalCount = records.length
  const activeCount = records.filter((r) => r.status === 'Active').length
  const inactiveCount = records.filter((r) => r.status === 'Inactive').length

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev))
    }, 3000)
  }

  // Handle Form Submission (Add or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: {
      stockRoomName?: string
      stockRoomEngineer?: string
      stockRoomLead?: string
    } = {}

    if (!stockRoomName.trim()) {
      newErrors.stockRoomName = 'Stock Room name is required'
    }
    if (!stockRoomEngineer.trim()) {
      newErrors.stockRoomEngineer = 'Stockroom Engineer is required'
    }
    if (!stockRoomLead.trim()) {
      newErrors.stockRoomLead = 'Stockroom Lead is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showNotification('error', 'Please fill in all required fields.')
      return
    }

    setErrors({})

    const nowFormatted = new Date().toISOString().replace('T', ' ').slice(0, 19)

    if (editingId) {
      // Update existing record
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                stockRoomName: stockRoomName.trim(),
                stockRoomEngineer: stockRoomEngineer.trim(),
                stockRoomLead: stockRoomLead.trim(),
                status,
                updatedAt: nowFormatted
              }
            : r
        )
      )
      showNotification('success', `Stock Room "${stockRoomName.trim()}" updated successfully!`)
      setEditingId(null)
    } else {
      // Check duplicate name
      const exists = records.some(
        (r) => r.stockRoomName.toLowerCase() === stockRoomName.trim().toLowerCase()
      )
      if (exists) {
        setErrors({ stockRoomName: 'A stock room with this name already exists' })
        showNotification('error', 'A stock room with this name already exists.')
        return
      }

      // Add new record at top
      const newRecord: StockRoomMasterRecord = {
        id: `srm-${Date.now()}`,
        stockRoomName: stockRoomName.trim(),
        stockRoomEngineer: stockRoomEngineer.trim(),
        stockRoomLead: stockRoomLead.trim(),
        status,
        createdAt: nowFormatted
      }

      setRecords((prev) => [newRecord, ...prev])
      showNotification('success', `Stock Room "${stockRoomName.trim()}" created successfully!`)
      setCurrentPage(1)
    }

    // Reset Form & close modal
    handleClear()
    setIsModalOpen(false)
  }

  const handleClear = () => {
    setStockRoomName('')
    setStockRoomEngineer('')
    setStockRoomLead('')
    setStatus('Active')
    setEditingId(null)
    setErrors({})
  }

  const handleOpenAddModal = () => {
    handleClear()
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setErrors({})
  }

  const handleEdit = (record: StockRoomMasterRecord) => {
    setEditingId(record.id)
    setStockRoomName(record.stockRoomName)
    setStockRoomEngineer(record.stockRoomEngineer)
    setStockRoomLead(record.stockRoomLead)
    setStatus(record.status)
    setErrors({})
    setIsModalOpen(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setRecords((prev) => prev.filter((r) => r.id !== id))
      if (editingId === id) handleClear()
      showNotification('success', `Stock Room "${name}" deleted.`)
    }
  }

  const handleToggleStatus = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: r.status === 'Active' ? 'Inactive' : 'Active',
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
            }
          : r
      )
    )
  }

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Filter & Sort
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.trim().toLowerCase()
        return (
          r.stockRoomName.toLowerCase().includes(q) ||
          r.stockRoomEngineer.toLowerCase().includes(q) ||
          r.stockRoomLead.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const aVal = a[sortField] || ''
        const bVal = b[sortField] || ''
        if (sortOrder === 'asc') return aVal.localeCompare(bVal)
        return bVal.localeCompare(aVal)
      })
  }, [records, searchQuery, sortField, sortOrder])

  // Pagination calculations
  const totalRecords = filteredRecords.length
  const isAll = rowsPerPage === 'all'
  const effectiveLimit = isAll ? Math.max(totalRecords, 1) : rowsPerPage
  const totalPages = isAll ? 1 : Math.ceil(totalRecords / effectiveLimit) || 1
  const startIndex = isAll ? 0 : (currentPage - 1) * effectiveLimit
  const paginatedRecords = isAll
    ? filteredRecords
    : filteredRecords.slice(startIndex, startIndex + effectiveLimit)

  // Generate numbered pages array: 1, 2, 3...
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
    const headers = ['Stock Room', 'Stockroom Engineer', 'Stockroom Lead', 'Status']
    const rows = filteredRecords.map((r) => [
      r.stockRoomName,
      r.stockRoomEngineer,
      r.stockRoomLead,
      r.status
    ])
    exportToExcel(
      headers,
      rows,
      `stock_room_master_${new Date().toISOString().slice(0, 10)}.xlsx`,
      'Stock Rooms'
    )
  }

  return (
    <div className="w-full flex-1 flex flex-col space-y-2.5 select-none">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold select-none border ${
              notification.type === 'success'
                ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#064E3B] dark:text-[#A7F3D0] dark:border-[#059669]'
                : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] dark:bg-[#451A1A] dark:text-[#FECACA] dark:border-[#DC2626]'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header & Metrics Overview */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5 pb-2 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] shrink-0">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EDEDED] tracking-tight whitespace-nowrap">
            Stock Room Master
          </h2>
        </div>

        {/* Quick KPI Count Badges & Add Button */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="h-8 px-3 rounded-xl border border-[#EAE7DF] dark:border-[#2C2C2C] bg-[#FAF9F6] dark:bg-[#202020] flex items-center gap-1.5 text-xs font-medium text-[#171717] dark:text-[#EDEDED]">
            <Building2 className="w-3.5 h-3.5 text-[#1D63ED] shrink-0" />
            <span>Total:</span>
            <strong className="font-bold tabular-nums">{totalCount}</strong>
          </div>

          <div className="h-8 px-3 rounded-xl border border-[#A7F3D0]/60 dark:border-[#059669]/30 bg-[#ECFDF5] dark:bg-[#064E3B]/30 flex items-center gap-1.5 text-xs font-semibold text-[#059669] dark:text-[#34D399]">
            <span className="w-2 h-2 rounded-full bg-[#059669] dark:bg-[#34D399]" />
            <span>Active:</span>
            <strong className="font-bold tabular-nums">{activeCount}</strong>
          </div>

          <div className="h-8 px-3 rounded-xl border border-[#FECACA]/60 dark:border-[#DC2626]/30 bg-[#FEF2F2] dark:bg-[#451A1A]/40 flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] dark:text-[#F87171]">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] dark:bg-[#F87171]" />
            <span>Inactive:</span>
            <strong className="font-bold tabular-nums">{inactiveCount}</strong>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-[#171717] hover:bg-[#2C2C2C] dark:bg-white dark:hover:bg-[#EAE7DF] text-white dark:text-[#171717] text-xs font-bold transition-all shadow-xs cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Stock Room</span>
          </button>
        </div>
      </div>

      {/* Inserted Data Table Card */}
      <div className="w-full bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#EAE7DF] dark:border-[#2C2C2C] overflow-hidden flex flex-col shadow-2xs flex-1">
        {/* Table Toolbar Header */}
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6]/80 dark:bg-[#232323] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          {/* Left: Search Input */}
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#99958D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stock room, engineer, lead, status..."
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
              className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Export filtered records to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export to Excel</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-[#1D63ED] hover:bg-[#1854CD] text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Add a new stock room"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Stock Room</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table Body */}
        <div className="relative w-full overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse select-none text-xs">
            <thead className="bg-[#F4F7FB] dark:bg-[#252830] border-b border-[#EAE7DF] dark:border-[#2C2C2C]">
              <tr>
                <th
                  onClick={() => handleSort('stockRoomName')}
                  className="py-2 px-3 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors min-w-[200px]"
                >
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                    <span>Stock Room</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('stockRoomEngineer')}
                  className="py-2 px-3 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors min-w-[140px]"
                >
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                    <span>Stockroom Engineer</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('stockRoomLead')}
                  className="py-2 px-3 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors min-w-[140px]"
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                    <span>Stockroom Lead</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('status')}
                  className="py-2 px-3 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider text-center cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors w-[100px]"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  </div>
                </th>

                <th className="py-2 px-3 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider text-right w-[90px]">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DF]/60 dark:divide-[#2C2C2C]">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#99958D]">
                    <p className="font-medium text-xs">No matching stock room records found.</p>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('')
                          setCurrentPage(1)
                        }}
                        className="mt-1.5 text-xs text-[#00a8e7] hover:underline cursor-pointer"
                      >
                        Clear search filter
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      editingId === item.id
                        ? 'bg-[#00a8e7]/10 dark:bg-[#00a8e7]/15 ring-1 ring-inset ring-[#00a8e7]/30'
                        : 'hover:bg-[#FAF9F6] dark:hover:bg-[#252525]'
                    }`}
                  >
                    {/* Stock Room */}
                    <td className="py-2 px-3">
                      <div className="font-semibold text-[#171717] dark:text-[#EDEDED]">
                        {item.stockRoomName}
                      </div>
                    </td>

                    {/* Stockroom Engineer */}
                    <td className="py-2 px-3 font-medium text-[#171717] dark:text-[#EDEDED]">
                      {item.stockRoomEngineer}
                    </td>

                    {/* Stockroom Lead */}
                    <td className="py-2 px-3 font-medium text-[#171717] dark:text-[#EDEDED]">
                      {item.stockRoomLead}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id)}
                        title={`Click to toggle status (currently ${item.status})`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wide border transition-all cursor-pointer ${
                          item.status === 'Active'
                            ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#064E3B]/40 dark:text-[#34D399] dark:border-[#059669]'
                            : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] dark:bg-[#451A1A] dark:text-[#F87171] dark:border-[#DC2626]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'Active'
                              ? 'bg-[#059669] dark:bg-[#34D399]'
                              : 'bg-[#DC2626] dark:bg-[#F87171]'
                          }`}
                        />
                        <span>{item.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id)}
                          className="p-1 rounded-md text-[#64748B] hover:text-[#059669] hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/40 transition-colors cursor-pointer"
                          title={`Toggle status to ${item.status === 'Active' ? 'Inactive' : 'Active'}`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="p-1 rounded-md text-[#64748B] hover:text-[#1D63ED] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]/30 transition-colors cursor-pointer"
                          title="Edit Stock Room"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.stockRoomName)}
                          className="p-1 rounded-md text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#451A1A]/40 transition-colors cursor-pointer"
                          title="Delete Stock Room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer with 1, 2, 3... */}
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
            {/* Prev Button */}
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

      {/* Add / Edit Stock Room Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-2xl sm:max-w-3xl rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#EAE7DF] dark:border-[#2C2C2C] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] flex items-center justify-between bg-[#FAF9F6]/90 dark:bg-[#232323]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1D63ED]/10 dark:bg-[#1D63ED]/20 flex items-center justify-center text-[#1D63ED] dark:text-[#60A5FA]">
                  {editingId ? <Edit2 className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EDEDED]">
                    {editingId ? 'Edit Stock Room' : 'Add New Stock Room'}
                  </h3>
                  <p className="text-xs text-[#99958D] dark:text-[#888888] mt-0.5">
                    {editingId
                      ? 'Modify stock room configuration & operational assignments.'
                      : 'Register a new stock room location and assign personnel.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-[#99958D] hover:text-[#171717] dark:hover:text-white hover:bg-[#EDEAE2] dark:hover:bg-[#2C2C2C] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 sm:space-y-5">
              {/* Field 1: Stock Room Name */}
              <div>
                <label className="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">
                  Stock Room <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#99958D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. IND-AND-VIZAG-S1-1F-NO WING-UI"
                    value={stockRoomName}
                    onChange={(e) => {
                      setStockRoomName(e.target.value)
                      if (errors.stockRoomName) setErrors((prev) => ({ ...prev, stockRoomName: undefined }))
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FAF9F6] dark:bg-[#181818] rounded-xl border outline-none text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all ${
                      errors.stockRoomName
                        ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/20'
                        : 'border-[#EAE7DF] dark:border-[#333333] focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20'
                    }`}
                  />
                </div>
                {errors.stockRoomName && (
                  <p className="mt-1.5 text-xs text-[#DC2626] font-medium">{errors.stockRoomName}</p>
                )}
              </div>

              {/* Field 2 & 3: Stockroom Engineer & Stockroom Lead */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">
                    Stockroom Engineer <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#99958D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Manoj Sharma"
                      value={stockRoomEngineer}
                      onChange={(e) => {
                        setStockRoomEngineer(e.target.value)
                        if (errors.stockRoomEngineer)
                          setErrors((prev) => ({ ...prev, stockRoomEngineer: undefined }))
                      }}
                      className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FAF9F6] dark:bg-[#181818] rounded-xl border outline-none text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all ${
                        errors.stockRoomEngineer
                          ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/20'
                          : 'border-[#EAE7DF] dark:border-[#333333] focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20'
                      }`}
                    />
                  </div>
                  {errors.stockRoomEngineer && (
                    <p className="mt-1.5 text-xs text-[#DC2626] font-medium">
                      {errors.stockRoomEngineer}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">
                    Stockroom Lead <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-[#99958D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Suresh Nair"
                      value={stockRoomLead}
                      onChange={(e) => {
                        setStockRoomLead(e.target.value)
                        if (errors.stockRoomLead)
                          setErrors((prev) => ({ ...prev, stockRoomLead: undefined }))
                      }}
                      className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FAF9F6] dark:bg-[#181818] rounded-xl border outline-none text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all ${
                        errors.stockRoomLead
                          ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/20'
                          : 'border-[#EAE7DF] dark:border-[#333333] focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20'
                      }`}
                    />
                  </div>
                  {errors.stockRoomLead && (
                    <p className="mt-1.5 text-xs text-[#DC2626] font-medium">
                      {errors.stockRoomLead}
                    </p>
                  )}
                </div>
              </div>

              {/* Field 4: Status */}
              <div>
                <label className="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-3 h-11">
                  <button
                    type="button"
                    onClick={() => setStatus('Active')}
                    className={`flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                      status === 'Active'
                        ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] shadow-xs dark:bg-[#064E3B] dark:text-[#34D399] dark:border-[#059669]'
                        : 'bg-[#FAF9F6] dark:bg-[#181818] text-[#666666] dark:text-[#A0A0A0] border-[#EAE7DF] dark:border-[#333333] hover:bg-[#F3F1EA]'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${status === 'Active' ? 'bg-[#059669] dark:bg-[#34D399]' : 'bg-[#99958D]'}`} />
                    <span>Active</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('Inactive')}
                    className={`flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                      status === 'Inactive'
                        ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] shadow-xs dark:bg-[#451A1A] dark:text-[#F87171] dark:border-[#DC2626]'
                        : 'bg-[#FAF9F6] dark:bg-[#181818] text-[#666666] dark:text-[#A0A0A0] border-[#EAE7DF] dark:border-[#333333] hover:bg-[#F3F1EA]'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${status === 'Inactive' ? 'bg-[#DC2626] dark:bg-[#F87171]' : 'bg-[#99958D]'}`} />
                    <span>Inactive</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE7DF]/70 dark:border-[#2C2C2C]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#666666] dark:text-[#A0A0A0] hover:text-[#171717] dark:hover:text-white hover:bg-[#FAF9F6] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-[#2C2C2C] dark:bg-white dark:hover:bg-[#EAE7DF] text-white dark:text-[#171717] text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  {editingId ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                  <span>{editingId ? 'Update Stock Room' : 'Save Stock Room'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export const StockRoomMaster = StoreMaster
