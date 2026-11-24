import React, { useState, useEffect, useCallback } from 'react'
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
  Check,
  Power,
  X,
  Loader2
} from 'lucide-react'
import { exportToExcel } from '../utils/excelExport'
import { stockroomService } from '../services/stockroomService'
import { TooltipTop, TooltipBottom, TooltipLeft } from './Tooltip'
import type {
  ApiStockroomMasterRecord,
  StockroomMasterSummary,
  StockroomMasterPagination,
  StockroomSortField
} from '../types/stockroomMaster'

export const StoreMaster: React.FC = () => {
  // Master records list & API metadata
  const [records, setRecords] = useState<ApiStockroomMasterRecord[]>([])
  const [summary, setSummary] = useState<StockroomMasterSummary>({
    totalStockRooms: 0,
    activeStockRooms: 0,
    inactiveStockRooms: 0
  })
  const [pagination, setPagination] = useState<StockroomMasterPagination>({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1
  })

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  // Form input states
  const [stockroomName, setStockroomName] = useState('')
  const [stockroomEngineer, setStockroomEngineer] = useState('')
  const [stockroomLead, setStockroomLead] = useState('')
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')
  const [editingRecord, setEditingRecord] = useState<ApiStockroomMasterRecord | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Validation errors & feedback notification
  const [errors, setErrors] = useState<{
    stockroomName?: string
    stockroomEngineer?: string
    stockroomLead?: string
  }>({})
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // DataTable filtering, sorting & pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortField, setSortField] = useState<StockroomSortField>('STOCKROOM')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev))
    }, 4500)
  }

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isModalOpen])

  // Fetch stock rooms from backend API
  const fetchStockrooms = useCallback(async () => {
    setIsLoading(true)
    try {
      const numericPageSize = rowsPerPage === 'all' ? 100 : rowsPerPage
      const data = await stockroomService.getStockrooms({
        page: currentPage,
        pageSize: numericPageSize,
        sortBy: sortField,
        sortDesc: sortOrder === 'desc',
        search: debouncedSearch.trim() || undefined
      })

      setRecords(data.rows || [])
      if (data.summary) {
        setSummary(data.summary)
      }
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (err: any) {
      console.error('Failed to load stock room records', err)
      showNotification('error', err.message || 'Failed to load stock rooms.')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch])

  useEffect(() => {
    fetchStockrooms()
  }, [fetchStockrooms])

  // Form Reset
  const handleClear = () => {
    setStockroomName('')
    setStockroomEngineer('')
    setStockroomLead('')
    setStatus('Active')
    setEditingRecord(null)
    setErrors({})
  }

  const handleOpenAddModal = () => {
    handleClear()
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (isSubmitting) return
    setIsModalOpen(false)
    handleClear()
  }

  const handleEdit = (record: ApiStockroomMasterRecord) => {
    setEditingRecord(record)
    setStockroomName(record.stockroomName)
    setStockroomEngineer(record.stockroomEngineer)
    setStockroomLead(record.stockroomLead)
    setStatus(record.status)
    setErrors({})
    setIsModalOpen(true)
  }

  // Handle Form Submission (Add or Update via API)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: {
      stockroomName?: string
      stockroomEngineer?: string
      stockroomLead?: string
    } = {}

    if (!stockroomName.trim()) {
      newErrors.stockroomName = 'Stock Room name is required'
    }
    if (!stockroomEngineer.trim()) {
      newErrors.stockroomEngineer = 'Stockroom Engineer is required'
    }
    if (!stockroomLead.trim()) {
      newErrors.stockroomLead = 'Stockroom Lead is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showNotification('error', 'Please fill in all required fields.')
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      if (editingRecord) {
        // Edit existing stock room via PUT /api/stockrooms/{id}
        const res = await stockroomService.updateStockroom(editingRecord.stockroomId, {
          stockroomName: stockroomName.trim(),
          stockroomEngineer: stockroomEngineer.trim(),
          stockroomLead: stockroomLead.trim()
        })

        // If status was changed in the modal, sync via toggle-status
        if (editingRecord.status !== status) {
          try {
            await stockroomService.toggleStatus(editingRecord.stockroomId)
          } catch (statusErr) {
            console.warn('Could not update status toggle:', statusErr)
          }
        }

        showNotification('success', res.message || `Stock Room "${stockroomName.trim()}" updated successfully!`)
        setIsModalOpen(false)
        handleClear()
        await fetchStockrooms()
      } else {
        // Add new stock room via POST /api/stockrooms
        const res = await stockroomService.addStockroom({
          stockroomName: stockroomName.trim(),
          stockroomEngineer: stockroomEngineer.trim(),
          stockroomLead: stockroomLead.trim()
        })

        // If status was set to Inactive on creation, toggle it
        if (status === 'Inactive' && res.stockroomId) {
          try {
            await stockroomService.toggleStatus(res.stockroomId)
          } catch (statusErr) {
            console.warn('Could not toggle initial inactive status:', statusErr)
          }
        }

        showNotification('success', res.message || `Stock Room "${stockroomName.trim()}" created successfully!`)
        setIsModalOpen(false)
        handleClear()
        setCurrentPage(1)
        await fetchStockrooms()
      }
    } catch (err: any) {
      console.error('Failed to save stock room:', err)
      showNotification('error', err.message || 'Failed to save stock room. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Toggle Active/Inactive via PATCH /api/stockrooms/{id}/toggle-status
  const handleToggleStatus = async (record: ApiStockroomMasterRecord) => {
    setActionLoadingId(record.stockroomId)
    const previousStatus = record.status
    const newStatus = previousStatus === 'Active' ? 'Inactive' : 'Active'

    // Optimistic UI update
    setRecords((prev) =>
      prev.map((r) => (r.stockroomId === record.stockroomId ? { ...r, status: newStatus } : r))
    )
    setSummary((prev) => {
      const activeDiff = newStatus === 'Active' ? 1 : -1
      return {
        ...prev,
        activeStockRooms: Math.max(0, prev.activeStockRooms + activeDiff),
        inactiveStockRooms: Math.max(0, prev.inactiveStockRooms - activeDiff)
      }
    })

    try {
      const res = await stockroomService.toggleStatus(record.stockroomId)
      showNotification(
        'success',
        res.message || `Status updated to ${newStatus} for "${record.stockroomName}"`
      )
      await fetchStockrooms()
    } catch (err: any) {
      // Revert optimistic update
      setRecords((prev) =>
        prev.map((r) => (r.stockroomId === record.stockroomId ? { ...r, status: previousStatus } : r))
      )
      setSummary((prev) => {
        const activeDiff = previousStatus === 'Active' ? 1 : -1
        return {
          ...prev,
          activeStockRooms: Math.max(0, prev.activeStockRooms + activeDiff),
          inactiveStockRooms: Math.max(0, prev.inactiveStockRooms - activeDiff)
        }
      })
      console.error('Failed to toggle status:', err)
      showNotification('error', err.message || 'Failed to toggle status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Sorting Handler
  const handleSort = (field: StockroomSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  // Pagination calculations from server
  const totalRecords = pagination.totalRecords
  const isAll = rowsPerPage === 'all'
  const effectiveLimit = isAll ? Math.max(totalRecords, 1) : rowsPerPage
  const totalPages = pagination.totalPages
  const startIndex = isAll ? 0 : (currentPage - 1) * effectiveLimit
  const displayStart = totalRecords === 0 ? 0 : startIndex + 1
  const displayEnd = isAll
    ? totalRecords
    : Math.min(startIndex + records.length, totalRecords)

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

  // Export to Excel (.xlsx) using current table rows or fetching all
  const handleExportExcel = async () => {
    try {
      // Fetch all records for export if currently paginated
      let exportRows = records
      if (pagination.totalRecords > records.length) {
        const fullData = await stockroomService.getStockrooms({
          page: 1,
          pageSize: pagination.totalRecords,
          sortBy: sortField,
          sortDesc: sortOrder === 'desc',
          search: debouncedSearch.trim() || undefined
        })
        exportRows = fullData.rows || records
      }

      const headers = ['Stock Room ID', 'Stock Room', 'Stockroom Engineer', 'Stockroom Lead', 'Status', 'Created Date']
      const rows = exportRows.map((r) => [
        r.stockroomId,
        r.stockroomName,
        r.stockroomEngineer,
        r.stockroomLead,
        r.status,
        r.createdDate ? r.createdDate.replace('T', ' ').slice(0, 19) : '-'
      ])
      exportToExcel(
        headers,
        rows,
        `stock_room_master_${new Date().toISOString().slice(0, 10)}.xlsx`,
        'Stock Rooms'
      )
      showNotification('success', `Exported ${exportRows.length} stock rooms to Excel.`)
    } catch (err) {
      console.error('Export failed:', err)
      showNotification('error', 'Failed to export to Excel.')
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col space-y-2.5 select-none">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-[9999] animate-in fade-in slide-in-from-top-3 duration-200 shadow-2xl">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold select-none border backdrop-blur-md ${
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
            <strong className="font-bold tabular-nums">{summary.totalStockRooms}</strong>
          </div>

          <div className="h-8 px-3 rounded-xl border border-[#A7F3D0]/60 dark:border-[#059669]/30 bg-[#ECFDF5] dark:bg-[#064E3B]/30 flex items-center gap-1.5 text-xs font-semibold text-[#059669] dark:text-[#34D399]">
            <span className="w-2 h-2 rounded-full bg-[#059669] dark:bg-[#34D399]" />
            <span>Active:</span>
            <strong className="font-bold tabular-nums">{summary.activeStockRooms}</strong>
          </div>

          <div className="h-8 px-3 rounded-xl border border-[#FECACA]/60 dark:border-[#DC2626]/30 bg-[#FEF2F2] dark:bg-[#451A1A]/40 flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] dark:text-[#F87171]">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] dark:bg-[#F87171]" />
            <span>Inactive:</span>
            <strong className="font-bold tabular-nums">{summary.inactiveStockRooms}</strong>
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
                className="w-full h-8 pl-8 pr-2.5 text-xs bg-white dark:bg-[#181818] rounded-xl border border-[#EAE7DF] dark:border-[#333333] outline-none focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20 text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#99958D] hover:text-[#171717] dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
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
                className="h-8 px-2 text-xs bg-white dark:bg-[#181818] border border-[#EAE7DF] dark:border-[#333333] rounded-xl text-[#171717] dark:text-[#EDEDED] outline-none cursor-pointer focus:border-[#1D63ED]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value="all">All</option>
              </select>
            </div>

            <TooltipBottom content="Export records to Excel (.xlsx)">
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export to Excel</span>
              </button>
            </TooltipBottom>
          </div>
        </div>

        {/* Scrollable Table Body */}
        <div className="relative w-full overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse select-none text-xs">
            <thead className="bg-[#F4F7FB] dark:bg-[#252830] border-b border-[#EAE7DF] dark:border-[#2C2C2C]">
              <tr>
                <th
                  onClick={() => handleSort('STOCKROOM')}
                  className="py-2 px-3 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors min-w-[220px]"
                >
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                    <span>STOCK ROOM</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('ENGINEER')}
                  className="py-2 px-3 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors min-w-[170px]"
                >
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                    <span>STOCKROOM ENGINEER</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('LEAD')}
                  className="py-2 px-3 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors min-w-[170px]"
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                    <span>STOCKROOM LEAD</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  </div>
                </th>

                <th
                  onClick={() => handleSort('STATUS')}
                  className="py-2 px-3 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider text-center cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors w-[110px]"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>STATUS</span>
                    <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  </div>
                </th>

                <th className="py-2 px-3 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider text-right w-[100px]">
                  <span>ACTIONS</span>
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y divide-[#EAE7DF]/60 dark:divide-[#2C2C2C] ${
                isLoading ? 'opacity-50' : 'opacity-100'
              } transition-opacity duration-200`}
            >
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#99958D]">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2 py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-[#1D63ED]" />
                        <span>Loading stock rooms...</span>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-xs">No matching stock room records found.</p>
                        {debouncedSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('')
                              setDebouncedSearch('')
                            }}
                            className="mt-1.5 text-xs text-[#00a8e7] hover:underline cursor-pointer"
                          >
                            Clear search filter
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                records.map((item, idx) => (
                  <tr
                    key={item.stockroomId}
                    className={`${
                      idx % 2 === 0
                        ? 'bg-white dark:bg-[#1E1E1E]'
                        : 'bg-[#F9F8F5] dark:bg-[#181818]'
                    } hover:bg-[#F3F0E6] dark:hover:bg-[#252525] transition-colors border-b border-[#EAE7DF]/50 dark:border-[#2C2C2C]/50`}
                  >
                    {/* Stock Room */}
                    <td className="py-2 px-3">
                      <div className="font-semibold text-[#171717] dark:text-[#EDEDED] truncate" title={item.stockroomName}>
                        {item.stockroomName}
                      </div>
                    </td>

                    {/* Stockroom Engineer */}
                    <td className="py-2 px-3 font-medium text-[#171717] dark:text-[#EDEDED]">
                      <span className="truncate block" title={item.stockroomEngineer}>
                        {item.stockroomEngineer}
                      </span>
                    </td>

                    {/* Stockroom Lead */}
                    <td className="py-2 px-3 font-medium text-[#171717] dark:text-[#EDEDED]">
                      <span className="truncate block" title={item.stockroomLead}>
                        {item.stockroomLead}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <TooltipTop content={`Click to toggle status to ${item.status === 'Active' ? 'Inactive' : 'Active'}`}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          disabled={actionLoadingId === item.stockroomId}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wide border transition-all cursor-pointer disabled:opacity-50 ${
                            item.status === 'Active'
                              ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#064E3B]/40 dark:text-[#34D399] dark:border-[#059669]'
                              : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] dark:bg-[#451A1A] dark:text-[#F87171] dark:border-[#DC2626]'
                          }`}
                        >
                          {actionLoadingId === item.stockroomId ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === 'Active'
                                  ? 'bg-[#059669] dark:bg-[#34D399]'
                                  : 'bg-[#DC2626] dark:bg-[#F87171]'
                              }`}
                            />
                          )}
                          <span>{item.status}</span>
                        </button>
                      </TooltipTop>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle Status Action */}
                        <TooltipTop content={`Toggle to ${item.status === 'Active' ? 'Inactive' : 'Active'}`}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            disabled={actionLoadingId === item.stockroomId}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#059669] hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/40 transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
                            aria-label={`Toggle status to ${item.status === 'Active' ? 'Inactive' : 'Active'}`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTop>

                        {/* Edit Action */}
                        <TooltipTop align="end" content="Edit Stock Room">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1D63ED] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]/30 transition-colors cursor-pointer active:scale-95"
                            aria-label="Edit Stock Room"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTop>
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
            {/* Prev Button */}
            <TooltipTop content="Previous page" disabled={currentPage === 1 || isAll}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isAll}
                className="w-6 h-6 flex items-center justify-center rounded-lg border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </TooltipTop>

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
            <TooltipTop content="Next page" disabled={currentPage >= totalPages || isAll}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isAll}
                className="w-6 h-6 flex items-center justify-center rounded-lg border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </TooltipTop>
          </div>
        </div>
      </div>

      {/* Add / Edit Stock Room Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-2xl sm:max-w-3xl rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#EAE7DF] dark:border-[#2C2C2C] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] flex items-center justify-between bg-[#FAF9F6]/90 dark:bg-[#232323]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1D63ED]/10 dark:bg-[#1D63ED]/20 flex items-center justify-center text-[#1D63ED] dark:text-[#60A5FA]">
                  {editingRecord ? <Edit2 className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EDEDED]">
                    {editingRecord ? 'Edit Stock Room' : 'Add New Stock Room'}
                  </h3>
                  <p className="text-xs text-[#99958D] dark:text-[#888888] mt-0.5">
                    {editingRecord
                      ? `Modifying ${editingRecord.stockroomName}`
                      : 'Register a new stock room location and assign personnel.'}
                  </p>
                </div>
              </div>

              <TooltipLeft content="Close">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="p-2 rounded-xl text-[#99958D] hover:text-[#171717] dark:hover:text-white hover:bg-[#EDEAE2] dark:hover:bg-[#2C2C2C] transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </TooltipLeft>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 sm:space-y-5">
              {/* Field 1: Stock Room Name */}
              <div>
                <label className="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">
                  Stock Room Name <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#99958D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. IND-HAR-GGN-SEZ-INFOSPACE-T1-FF"
                    value={stockroomName}
                    onChange={(e) => {
                      setStockroomName(e.target.value)
                      if (errors.stockroomName) setErrors((prev) => ({ ...prev, stockroomName: undefined }))
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FAF9F6] dark:bg-[#181818] rounded-xl border outline-none text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all ${
                      errors.stockroomName
                        ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/20'
                        : 'border-[#EAE7DF] dark:border-[#333333] focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20'
                    }`}
                  />
                </div>
                {errors.stockroomName && (
                  <p className="mt-1.5 text-xs text-[#DC2626] font-medium">{errors.stockroomName}</p>
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
                      placeholder="e.g. username@wipro.com"
                      value={stockroomEngineer}
                      onChange={(e) => {
                        setStockroomEngineer(e.target.value)
                        if (errors.stockroomEngineer)
                          setErrors((prev) => ({ ...prev, stockroomEngineer: undefined }))
                      }}
                      className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FAF9F6] dark:bg-[#181818] rounded-xl border outline-none text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all ${
                        errors.stockroomEngineer
                          ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/20'
                          : 'border-[#EAE7DF] dark:border-[#333333] focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20'
                      }`}
                    />
                  </div>
                  {errors.stockroomEngineer && (
                    <p className="mt-1.5 text-xs text-[#DC2626] font-medium">
                      {errors.stockroomEngineer}
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
                      placeholder="e.g. username@wipro.com"
                      value={stockroomLead}
                      onChange={(e) => {
                        setStockroomLead(e.target.value)
                        if (errors.stockroomLead)
                          setErrors((prev) => ({ ...prev, stockroomLead: undefined }))
                      }}
                      className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#FAF9F6] dark:bg-[#181818] rounded-xl border outline-none text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all ${
                        errors.stockroomLead
                          ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/20'
                          : 'border-[#EAE7DF] dark:border-[#333333] focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20'
                      }`}
                    />
                  </div>
                  {errors.stockroomLead && (
                    <p className="mt-1.5 text-xs text-[#DC2626] font-medium">
                      {errors.stockroomLead}
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
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-[#FECACA] dark:border-[#DC2626]/40 bg-[#FEF2F2] hover:bg-[#FEE2E2] dark:bg-[#451A1A]/40 dark:hover:bg-[#451A1A]/70 text-[#DC2626] dark:text-[#F87171] text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-[#2C2C2C] dark:bg-white dark:hover:bg-[#EAE7DF] text-white dark:text-[#171717] text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingRecord ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  )}
                  <span>
                    {isSubmitting
                      ? 'Saving...'
                      : editingRecord
                        ? 'Update Stock Room'
                        : 'Save Stock Room'}
                  </span>
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
export default StoreMaster
