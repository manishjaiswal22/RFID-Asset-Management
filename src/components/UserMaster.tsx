import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  User,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Plus,
  Search,
  FileSpreadsheet,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Power,
  Copy,
  Check,
  X,
  Building2,
  Shield,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { exportToExcel } from '../utils/excelExport'
import { userService } from '../services/userService'
import { authService } from '../services/authService'
import { dashboardService } from '../services/dashboardService'
import { searchService } from '../services/searchService'
import { TooltipTop, TooltipBottom, TooltipLeft } from './Tooltip'
import { Toast, type ToastNotification } from './Toast'
import type {
  ApiUserRecord,
  UserSummary,
  UserPagination,
  UserSortField,
  CreateUserPayload,
  UpdateUserPayload
} from '../types/userMaster'
import type { ApiStockroom } from '../types/stockroom'
import { filterStockrooms } from '../utils/stockroomSearch'
import { DUMMY_STORE_RECORDS } from '../data/storesData'
import { useDebounce } from '../utils/useDebounce'

export type { ApiUserRecord as UserMasterRecord }

export const UserMaster: React.FC = () => {
  // Master records state from live API
  const [records, setRecords] = useState<ApiUserRecord[]>([])
  const [summary, setSummary] = useState<UserSummary>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  })
  const [pagination, setPagination] = useState<UserPagination>({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stockrooms, setStockrooms] = useState<ApiStockroom[]>([])

  // Form states
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [userType, setUserType] = useState<'ADMIN' | 'STOCKROOM'>('STOCKROOM')
  const [stockroomId, setStockroomId] = useState<number | ''>('')
  const [isStatus, setIsStatus] = useState<'Active' | 'Inactive'>('Active')
  const [showPassword, setShowPassword] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Delete confirmation dialog state
  const [deletingUser, setDeletingUser] = useState<ApiUserRecord | null>(null)

  // Searchable stock room dropdown state in modal
  const [isStockroomDropdownOpen, setIsStockroomDropdownOpen] = useState(false)
  const [stockroomFilterQuery, setStockroomFilterQuery] = useState('')
  // Debounce modal stock room filter to prevent typing freeze & duplicate queries
  const debouncedStockroomFilter = useDebounce(stockroomFilterQuery, 250)
  const isDebouncingStockrooms =
    stockroomFilterQuery.trim() !== debouncedStockroomFilter.trim() &&
    stockroomFilterQuery.trim().length > 0
  const [stockroomSuggestions, setStockroomSuggestions] = useState<ApiStockroom[] | null>(null)
  const [isSearchingStockrooms, setIsSearchingStockrooms] = useState(false)
  const stockroomAbortControllerRef = useRef<AbortController | null>(null)
  const stockroomDropdownRef = useRef<HTMLDivElement>(null)

  // Copied password state for quick feedback
  const [copiedId, setCopiedId] = useState<number | null>(null)
  // Per-row revealed password map
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({})
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  // Form validation errors & notifications
  const [errors, setErrors] = useState<{
    userName?: string
    password?: string
    email?: string
    contactNumber?: string
    stockroomId?: string
  }>({})
  const [notification, setNotification] = useState<ToastNotification | null>(null)

  // DataTable filtering, sorting & pagination
  const [searchQuery, setSearchQuery] = useState('')
  // Debounce search query to prevent excessive API requests
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [sortField, setSortField] = useState<UserSortField>('USER_NAME')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const hasData = records.length > 0 && (pagination.totalRecords > 0 || records.length > 0)

  const showNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev))
    }, 4500)
  }, [])

  // Reset pagination on search query change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  // Prevent background scrolling when modal or delete confirmation is open
  useEffect(() => {
    if (isModalOpen || deletingUser) {
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
  }, [isModalOpen, deletingUser])

  // Live suggestions from GET /api/search/suggestions?q={q}&limit=10 using debounced query
  useEffect(() => {
    if (!isStockroomDropdownOpen || !debouncedStockroomFilter.trim()) {
      setStockroomSuggestions(null)
      setIsSearchingStockrooms(false)
      if (stockroomAbortControllerRef.current) {
        stockroomAbortControllerRef.current.abort()
      }
      return
    }

    const trimmed = debouncedStockroomFilter.trim()
    setIsSearchingStockrooms(true)

    if (stockroomAbortControllerRef.current) {
      stockroomAbortControllerRef.current.abort()
    }
    const controller = new AbortController()
    stockroomAbortControllerRef.current = controller
    let active = true

    const fetchSuggestions = async () => {
      try {
        const res = await searchService.getSuggestions(
          trimmed,
          10,
          stockrooms,
          controller.signal
        )
        if (!active) return
        if (res && res.length > 0) {
          setStockroomSuggestions(res)
        } else {
          setStockroomSuggestions(null)
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && active) {
          console.warn('UserMaster: suggestions API failed, falling back to client filter', err)
          setStockroomSuggestions(null)
        }
      } finally {
        if (active) {
          setIsSearchingStockrooms(false)
        }
      }
    }

    fetchSuggestions()

    return () => {
      active = false
      controller.abort()
    }
  }, [debouncedStockroomFilter, isStockroomDropdownOpen, stockrooms])

  // Filter stockrooms for searchable dropdown: use suggestions if available, else client-side tokenized & alias search
  const filteredStockrooms = useMemo(() => {
    if (stockroomSuggestions && stockroomSuggestions.length > 0) {
      return stockroomSuggestions
    }
    return filterStockrooms(stockrooms, debouncedStockroomFilter)
  }, [stockroomSuggestions, stockrooms, debouncedStockroomFilter])

  // Click outside to close searchable stockroom dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        stockroomDropdownRef.current &&
        !stockroomDropdownRef.current.contains(e.target as Node)
      ) {
        setIsStockroomDropdownOpen(false)
      }
    }
    if (isStockroomDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isStockroomDropdownOpen])

  // Fetch stockrooms for dropdown once on mount (with dummy fallback)
  useEffect(() => {
    let mounted = true
    dashboardService
      .getStockrooms()
      .then((data) => {
        if (!mounted) return
        if (data?.length) {
          setStockrooms(data)
        } else {
          setStockrooms(
            DUMMY_STORE_RECORDS.map((d) => ({
              stockroomId: parseInt(d.id.replace('stock-', ''), 10) || 1,
              stockroomName: d.storeName
            }))
          )
        }
      })
      .catch((err) => {
        if (!mounted) return
        console.warn('Could not load stockrooms for User Master modal, falling back to dummy stores:', err)
        setStockrooms(
          DUMMY_STORE_RECORDS.map((d) => ({
            stockroomId: parseInt(d.id.replace('stock-', ''), 10) || 1,
            stockroomName: d.storeName
          }))
        )
      })

    return () => {
      mounted = false
    }
  }, [])

  // Fetch users from API (GET /api/users)
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const pageSize = rowsPerPage === 'all' ? 100 : rowsPerPage
      const res = await userService.getUsers({
        page: currentPage,
        pageSize,
        sortBy: sortField,
        sortDesc: sortOrder === 'desc',
        search: debouncedSearch.trim() || undefined
      })

      setRecords(res.rows || [])
      setSummary(res.summary || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 })
      setPagination(res.pagination || { page: 1, pageSize, totalRecords: 0, totalPages: 1 })
    } catch (err: any) {
      console.error('Error fetching users:', err)
      showNotification('error', err?.message || 'Failed to fetch users from server.')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, showNotification])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Handle Form Submission (Add or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: {
      userName?: string
      password?: string
      email?: string
      contactNumber?: string
      stockroomId?: string
    } = {}

    const cleanUserName = userName.trim()
    const cleanPassword = password.trim()
    const cleanEmail = email.trim()
    const cleanContact = contactNumber.trim()

    if (!cleanUserName) {
      newErrors.userName = 'User Name is required'
    } else if (cleanUserName.length < 3) {
      newErrors.userName = 'User Name must be at least 3 characters'
    }

    // Password rules: required on create (min 6 chars), optional on update
    if (!editingId) {
      if (!cleanPassword) {
        newErrors.password = 'Password is required'
      } else if (cleanPassword.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }
    } else if (cleanPassword && cleanPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!cleanEmail) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!cleanContact) {
      newErrors.contactNumber = 'Contact number is required'
    } else if (!/^[0-9+\s\-()]{7,20}$/.test(cleanContact)) {
      newErrors.contactNumber = 'Please enter a valid contact number'
    }

    if (userType === 'STOCKROOM' && !stockroomId) {
      newErrors.stockroomId = 'Please select an assigned stockroom'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showNotification('error', 'Please correct the errors in the form.')
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      if (editingId) {
        // Update user (PUT /api/users/{id})
        const payload: UpdateUserPayload = {
          userName: cleanUserName,
          password: cleanPassword, // Empty string retains existing password
          email: cleanEmail,
          contactNumber: cleanContact,
          userType,
          stockroomId: userType === 'STOCKROOM' ? Number(stockroomId) : null
        }
        const res = await userService.updateUser(editingId, payload)
        showNotification('success', res.message || `User "${cleanUserName}" updated successfully!`)
        handleClear()
        setIsModalOpen(false)
        await fetchUsers()
      } else {
        // Create user (POST /api/users)
        const payload: CreateUserPayload = {
          userName: cleanUserName,
          password: cleanPassword,
          email: cleanEmail,
          contactNumber: cleanContact,
          userType,
          stockroomId: userType === 'STOCKROOM' ? Number(stockroomId) : null
        }
        const res = await userService.createUser(payload)
        showNotification('success', res.message || `User "${cleanUserName}" created successfully!`)
        handleClear()
        setIsModalOpen(false)
        setCurrentPage(1)
        await fetchUsers()
      }
    } catch (err: any) {
      console.error('Error saving user:', err)
      showNotification('error', err?.message || 'Failed to save user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    setUserName('')
    setPassword('')
    setEmail('')
    setContactNumber('')
    setUserType('STOCKROOM')
    setStockroomId('')
    setIsStatus('Active')
    setShowPassword(false)
    setEditingId(null)
    setErrors({})
    setIsStockroomDropdownOpen(false)
    setStockroomFilterQuery('')
  }

  const handleOpenAddModal = () => {
    handleClear()
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    handleClear()
  }

  const handleEdit = (record: ApiUserRecord) => {
    setEditingId(record.userId)
    setUserName(record.userName || '')
    setPassword('') // Leave empty to retain existing password
    setEmail(record.email || '')
    setContactNumber(record.contactNumber || '')
    setUserType(record.userType || 'STOCKROOM')
    setStockroomId(record.stockroomId || '')
    setIsStatus(record.status || 'Active')
    setErrors({})
    setIsStockroomDropdownOpen(false)
    setStockroomFilterQuery('')
    setIsModalOpen(true)
  }

  const handleDelete = (item: ApiUserRecord) => {
    const currentUser = authService.getUser()
    const isSelf =
      currentUser &&
      (item.userId === currentUser.userId ||
        item.userName.toLowerCase() === currentUser.userName?.toLowerCase())

    if (isSelf) {
      showNotification('error', 'You cannot delete your own logged-in account.')
      return
    }

    setDeletingUser(item)
  }

  const confirmDeleteUser = async () => {
    if (!deletingUser) return
    const { userId, userName } = deletingUser
    setActionLoadingId(userId)
    try {
      const res = await userService.deleteUser(userId)
      showNotification('success', res.message || `User "${userName}" deleted successfully.`)
      if (editingId === userId) handleClear()
      setDeletingUser(null)
      await fetchUsers()
    } catch (err: any) {
      console.error('Error deleting user:', err)
      showNotification('error', err?.message || `Failed to delete user "${userName}".`)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleToggleStatus = async (item: ApiUserRecord) => {
    const currentUser = authService.getUser()
    const isSelf =
      currentUser &&
      (item.userId === currentUser.userId ||
        item.userName.toLowerCase() === currentUser.userName?.toLowerCase())

    if (isSelf) {
      showNotification('error', 'You cannot deactivate your own logged-in account.')
      return
    }

    setActionLoadingId(item.userId)
    const previousStatus = item.status
    const newStatus = previousStatus === 'Active' ? 'Inactive' : 'Active'

    // Optimistic UI update
    setRecords((prev) =>
      prev.map((u) => (u.userId === item.userId ? { ...u, status: newStatus } : u))
    )
    setSummary((prev) => {
      const activeDiff = newStatus === 'Active' ? 1 : -1
      return {
        ...prev,
        activeUsers: Math.max(0, prev.activeUsers + activeDiff),
        inactiveUsers: Math.max(0, prev.inactiveUsers - activeDiff)
      }
    })

    try {
      const res = await userService.toggleStatus(item.userId)
      showNotification(
        'success',
        res.message || `User "${item.userName}" status updated to ${newStatus}.`
      )
      await fetchUsers()
    } catch (err: any) {
      // Revert optimistic update
      setRecords((prev) =>
        prev.map((u) => (u.userId === item.userId ? { ...u, status: previousStatus } : u))
      )
      setSummary((prev) => {
        const activeDiff = previousStatus === 'Active' ? 1 : -1
        return {
          ...prev,
          activeUsers: Math.max(0, prev.activeUsers + activeDiff),
          inactiveUsers: Math.max(0, prev.inactiveUsers - activeDiff)
        }
      })
      console.error('Error toggling status:', err)
      showNotification('error', err?.message || 'Failed to toggle status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCopyPassword = (id: number, pass?: string) => {
    if (!pass) return
    navigator.clipboard.writeText(pass)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev))
    }, 2000)
  }

  const toggleRevealRowPassword = (id: number) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Sorting Handler
  const handleSort = (field: UserSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  // Pagination calculations
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

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (!hasData) {
      showNotification('warning', 'No data to export')
      return
    }
    setIsExportingExcel(true)
    setExportProgress(25)
    setTimeout(() => {
      setExportProgress(75)
      const headers = ['User Name', 'User Type', 'Stock Room', 'Email', 'Contact Number', 'Status']
      const rows = records.map((r) => [
        r.userName,
        r.userType || '-',
        r.stockroomName || '-',
        r.email || '-',
        r.contactNumber || '-',
        r.status
      ])
      exportToExcel(
        headers,
        rows,
        `user_master_${new Date().toISOString().slice(0, 10)}.xlsx`,
        'Users'
      )
      setExportProgress(100)
      showNotification('success', `Exported ${records.length} users to Excel.`)
      setTimeout(() => {
        setIsExportingExcel(false)
        setExportProgress(0)
      }, 500)
    }, 200)
  }

  return (
    <div className="w-full flex-1 flex flex-col space-y-2.5 select-none">
      {/* Toast Notification */}
      <Toast notification={notification} onClose={() => setNotification(null)} />

      {/* Page Header & Metric Pills */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5 pb-2 border-b border-[#EAE7DF]/60 dark:border-[#2C2C2C] shrink-0">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EDEDED] tracking-tight whitespace-nowrap">
            User Master
          </h2>
        </div>

        {/* Quick Metric Pills & Add User Button */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="h-8 flex items-center gap-1.5 px-3 rounded-xl bg-[#FAF9F6] dark:bg-[#222222] border border-[#EAE7DF] dark:border-[#2C2C2C] text-xs font-semibold text-[#171717] dark:text-[#EDEDED]">
            <User className="w-3.5 h-3.5 text-[#1D63ED]" />
            <span>Total:</span>
            <span className="font-bold">{summary.totalUsers}</span>
          </div>
          <div className="h-8 flex items-center gap-1.5 px-3 rounded-xl bg-[#ECFDF5] dark:bg-[#064E3B]/40 border border-[#A7F3D0] dark:border-[#059669] text-xs font-semibold text-[#059669] dark:text-[#34D399]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-[#34D399]" />
            <span>Active:</span>
            <span className="font-bold">{summary.activeUsers}</span>
          </div>
          <div className="h-8 flex items-center gap-1.5 px-3 rounded-xl bg-[#FEF2F2] dark:bg-[#451A1A]/40 border border-[#FECACA] dark:border-[#DC2626] text-xs font-semibold text-[#DC2626] dark:text-[#F87171]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] dark:bg-[#F87171]" />
            <span>Inactive:</span>
            <span className="font-bold">{summary.inactiveUsers}</span>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-[#171717] hover:bg-[#2C2C2C] dark:bg-white dark:hover:bg-[#EAE7DF] text-white dark:text-[#171717] text-xs font-bold transition-all shadow-xs cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Inserted Records DataTable Card */}
      <div className="w-full flex-1 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#EAE7DF]/70 dark:border-[#262626] shadow-xs flex flex-col overflow-hidden">
        {/* Table Toolbar Header */}
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6]/80 dark:bg-[#232323] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          {/* Left: Search Input */}
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#99958D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search username, email, contact, stockroom..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-8 pl-8 pr-7 text-xs bg-white dark:bg-[#181818] rounded-xl border border-[#EAE7DF] dark:border-[#333333] outline-none focus:border-[#1D63ED] focus:ring-1 focus:ring-[#1D63ED]/20 text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setCurrentPage(1)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#99958D] hover:text-[#171717] dark:hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
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
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value)
                  setRowsPerPage(val)
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

            {/* Export to Excel Button */}
            <TooltipBottom
              content={
                !hasData
                  ? 'No data available to export'
                  : isExportingExcel
                  ? `Exporting... ${exportProgress}%`
                  : 'Export records to Excel (.xlsx)'
              }
            >
              <button
                type="button"
                disabled={!hasData || isExportingExcel}
                onClick={handleExportExcel}
                className="relative overflow-hidden flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-[#00875A] hover:bg-[#00704A] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#00875A] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs select-none"
              >
                {/* Animated background progress fill inside the button itself */}
                {isExportingExcel && (
                  <div
                    className="absolute inset-y-0 left-0 bg-[#006644] transition-all duration-200 ease-out z-0"
                    style={{ width: `${exportProgress}%` }}
                  />
                )}

                {/* Crisp bottom progress line */}
                {isExportingExcel && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/25 z-0">
                    <div
                      className="h-full bg-white transition-all duration-200 ease-out"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                  {isExportingExcel ? (
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

        {/* Scrollable Table Body */}
        <div className="relative w-full overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF9F6] dark:bg-[#232323] border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] text-[11px] font-bold text-[#666666] dark:text-[#A0A0A0] uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('USER_NAME')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1D63ED]" />
                    <span>USER NAME</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99958D]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('USER_TYPE')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>ROLE / TYPE</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99958D]" />
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#00a8e7]" />
                    <span>STOCK ROOM</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('EMAIL')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#059669]" />
                    <span>EMAIL</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99958D]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('CONTACT_NUMBER')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>CONTACT NUMBER</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99958D]" />
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>PASSWORD</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('STATUS')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>STATUS</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99958D]" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">
                  <span>ACTIONS</span>
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y divide-[#EAE7DF]/50 dark:divide-[#2C2C2C] text-xs transition-opacity duration-200 ${
                isLoading ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-xs text-[#99958D] dark:text-[#737373]"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2 py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-[#1D63ED]" />
                        <span>Loading user records...</span>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">No user records match your criteria.</p>
                        {debouncedSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('')
                            }}
                            className="mt-2 text-xs text-[#00a8e7] hover:underline cursor-pointer"
                          >
                            Clear search filter
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                records.map((item, idx) => {
                  const currentUser = authService.getUser()
                  const isSelf = Boolean(
                    currentUser &&
                      (item.userId === currentUser.userId ||
                        item.userName.toLowerCase() === currentUser.userName?.toLowerCase())
                  )

                  return (
                  <tr
                    key={item.userId}
                    className={`${
                      idx % 2 === 0
                        ? 'bg-white dark:bg-[#1E1E1E]'
                        : 'bg-[#F9F8F5] dark:bg-[#181818]'
                    } hover:bg-[#F3F0E6] dark:hover:bg-[#252525] transition-colors border-b border-[#EAE7DF]/50 dark:border-[#2C2C2C]/50`}
                  >
                    {/* User Name */}
                    <td className="py-2 px-3 font-semibold text-[#171717] dark:text-[#EDEDED] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1D63ED]/10 dark:bg-[#1D63ED]/20 text-[#1D63ED] flex items-center justify-center text-[10px] font-bold uppercase">
                          {item.userName.slice(0, 2)}
                        </div>
                        <span className="font-bold">{item.userName}</span>
                      </div>
                    </td>

                    {/* Role / Type Badge */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wide border ${
                          item.userType === 'ADMIN'
                            ? 'bg-[#F3E8FF] dark:bg-[#581C87]/30 text-[#7C3AED] dark:text-[#C084FC] border-[#E9D5FF] dark:border-[#7C3AED]'
                            : 'bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#1D63ED] dark:text-[#60A5FA] border-[#DBEAFE] dark:border-[#1D63ED]'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        <span>{item.userType || 'STOCKROOM'}</span>
                      </span>
                    </td>

                    {/* Stock Room */}
                    <td className="py-2 px-3 text-[#555555] dark:text-[#B0B0B0] whitespace-nowrap">
                      {item.stockroomName ? (
                        <div className="flex items-center gap-1.5 max-w-[200px]" title={item.stockroomName}>
                          <Building2 className="w-3.5 h-3.5 text-[#00a8e7] shrink-0" />
                          <span className="truncate font-medium text-[11.5px]">{item.stockroomName}</span>
                        </div>
                      ) : (
                        <span className="text-[#99958D] text-xs font-mono">-</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="py-2 px-3 text-[#555555] dark:text-[#B0B0B0] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-[#99958D] shrink-0" />
                        <span className="font-mono text-[11.5px]">{item.email || '-'}</span>
                      </div>
                    </td>

                    {/* Contact Number */}
                    <td className="py-2 px-3 text-[#555555] dark:text-[#B0B0B0] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#99958D] shrink-0" />
                        <span className="font-mono text-[11.5px] tabular-nums">
                          {item.contactNumber || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Password (Masked with toggle reveal & copy) */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11.5px] text-[#171717] dark:text-[#EDEDED] bg-[#FAF9F6] dark:bg-[#181818] px-2 py-0.5 rounded-md border border-[#EAE7DF] dark:border-[#333333]">
                          {revealedPasswords[item.userId] ? item.password || '••••••••' : '••••••••'}
                        </span>
                        <TooltipTop content={revealedPasswords[item.userId] ? 'Hide password' : 'Show password'}>
                          <button
                            type="button"
                            onClick={() => toggleRevealRowPassword(item.userId)}
                            className="p-1 rounded text-[#99958D] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer active:scale-95"
                            aria-label={revealedPasswords[item.userId] ? 'Hide password' : 'Show password'}
                          >
                            {revealedPasswords[item.userId] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </TooltipTop>

                        <TooltipTop content={copiedId === item.userId ? 'Copied!' : 'Copy password'}>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(item.userId, item.password)}
                            className="p-1 rounded text-[#99958D] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                            aria-label="Copy password to clipboard"
                          >
                            {copiedId === item.userId ? (
                              <Check className="w-3 h-3 text-[#059669]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </TooltipTop>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <TooltipTop
                        content={
                          isSelf
                            ? 'You cannot deactivate your own logged-in account'
                            : `Click to toggle status to ${item.status === 'Active' ? 'Inactive' : 'Active'}`
                        }
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          disabled={isSelf || actionLoadingId === item.userId}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wide border transition-all ${
                            isSelf
                              ? 'opacity-80 cursor-not-allowed bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#064E3B]/40 dark:text-[#34D399] dark:border-[#059669]'
                              : item.status === 'Active'
                                ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#064E3B]/40 dark:text-[#34D399] dark:border-[#059669] cursor-pointer'
                                : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] dark:bg-[#451A1A] dark:text-[#F87171] dark:border-[#DC2626] cursor-pointer'
                          }`}
                        >
                          {actionLoadingId === item.userId ? (
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
                        <TooltipTop
                          content={
                            isSelf
                              ? 'You cannot deactivate your own account'
                              : `Toggle status to ${item.status === 'Active' ? 'Inactive' : 'Active'}`
                          }
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            disabled={isSelf || actionLoadingId === item.userId}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSelf
                                ? 'text-[#A0A0A0] opacity-40 cursor-not-allowed'
                                : 'text-[#64748B] hover:text-[#059669] hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/40 cursor-pointer active:scale-95'
                            }`}
                            aria-label={
                              isSelf
                                ? 'You cannot deactivate your own account'
                                : `Toggle status to ${item.status === 'Active' ? 'Inactive' : 'Active'}`
                            }
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTop>

                        {/* Edit Action */}
                        <TooltipTop content="Edit User">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1D63ED] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]/30 transition-colors cursor-pointer active:scale-95"
                            aria-label="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTop>

                        {/* Delete Action */}
                        <TooltipTop
                          align="end"
                          content={isSelf ? 'You cannot delete your own account' : 'Delete User'}
                        >
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={isSelf || actionLoadingId === item.userId}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSelf
                                ? 'text-[#A0A0A0] opacity-40 cursor-not-allowed'
                                : 'text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#451A1A]/40 cursor-pointer active:scale-95'
                            }`}
                            aria-label={isSelf ? 'You cannot delete your own account' : 'Delete User'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTop>
                      </div>
                    </td>
                  </tr>
                )
              })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-3 py-1.5 border-t border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6]/80 dark:bg-[#232323] flex items-center justify-between text-[11px] sm:text-xs text-[#666666] dark:text-[#A0A0A0] shrink-0">
          <div>
            <span>
              Showing{' '}
              <strong className="text-[#171717] dark:text-[#EDEDED]">
                {totalRecords === 0 ? 0 : displayStart}
              </strong>{' '}
              to{' '}
              <strong className="text-[#171717] dark:text-[#EDEDED]">{displayEnd}</strong> of{' '}
              <strong className="text-[#171717] dark:text-[#EDEDED]">{totalRecords}</strong> records
            </span>
          </div>

          <div className="flex items-center gap-1">
            <TooltipTop content="Previous page" disabled={currentPage === 1 || isAll}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isAll}
                className="w-7 h-7 flex items-center justify-center rounded-xl border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </TooltipTop>

            {getPageNumbers().map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-[#99958D]">
                    ...
                  </span>
                )
              }
              const isActive = currentPage === pageNum
              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => !isAll && setCurrentPage(Number(pageNum))}
                  disabled={isAll}
                  className={`min-w-7 h-7 px-2 flex items-center justify-center rounded-xl text-xs font-semibold select-none transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]'
                      : 'border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#F3F1EA] dark:hover:bg-[#2C2C2C]'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <TooltipTop content="Next page" disabled={currentPage >= totalPages || isAll}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isAll}
                className="w-7 h-7 flex items-center justify-center rounded-xl border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </TooltipTop>
          </div>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-2xl sm:max-w-3xl rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#EAE7DF] dark:border-[#2C2C2C] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] flex items-center justify-between bg-[#FAF9F6]/90 dark:bg-[#232323] sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1D63ED]/10 dark:bg-[#1D63ED]/20 flex items-center justify-center text-[#1D63ED] dark:text-[#60A5FA]">
                  {editingId ? <Edit2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EDEDED]">
                    {editingId ? 'Edit User Credentials & Details' : 'Add New User'}
                  </h3>
                  <p className="text-xs text-[#99958D] dark:text-[#888888] mt-0.5">
                    {editingId
                      ? 'Modify credentials, role, contact info, and assigned stockroom.'
                      : 'Create a new user account with system credentials and assigned stockroom.'}
                  </p>
                </div>
              </div>

              <TooltipLeft content="Close">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-[#99958D] hover:text-[#171717] dark:hover:text-white hover:bg-[#EDEAE2] dark:hover:bg-[#2C2C2C] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </TooltipLeft>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 sm:space-y-5">
              {/* Row 1: User Type & Stock Room Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181818] border border-[#EAE7DF] dark:border-[#2F2F2F]">
                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#EDEDED] uppercase tracking-wider mb-1.5">
                    User Role / Type <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 h-10">
                    <button
                      type="button"
                      onClick={() => setUserType('STOCKROOM')}
                      className={`flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        userType === 'STOCKROOM'
                          ? 'bg-[#1D63ED] text-white border-[#1D63ED] shadow-xs'
                          : 'bg-white dark:bg-[#222] text-[#666] dark:text-[#AAA] border-[#EAE7DF] dark:border-[#333]'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>STOCKROOM</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('ADMIN')
                        setStockroomId('')
                        if (errors.stockroomId) setErrors((prev) => ({ ...prev, stockroomId: undefined }))
                      }}
                      className={`flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        userType === 'ADMIN'
                          ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs'
                          : 'bg-white dark:bg-[#222] text-[#666] dark:text-[#AAA] border-[#EAE7DF] dark:border-[#333]'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>ADMIN</span>
                    </button>
                  </div>
                </div>

                {/* Searchable Stock Room Dropdown (active when userType === STOCKROOM) */}
                <div ref={stockroomDropdownRef} className="relative">
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#EDEDED] uppercase tracking-wider mb-1.5">
                    Assigned Stock Room {userType === 'STOCKROOM' && <span className="text-[#DC2626]">*</span>}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      disabled={userType === 'ADMIN'}
                      onClick={() => {
                        if (userType !== 'ADMIN') {
                          setIsStockroomDropdownOpen(!isStockroomDropdownOpen)
                          setStockroomFilterQuery('')
                        }
                      }}
                      className={`w-full bg-white dark:bg-[#222] border rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-left flex items-center justify-between transition-all ${
                        userType === 'ADMIN'
                          ? 'opacity-50 cursor-not-allowed border-[#EAE7DF] dark:border-[#333333]'
                          : 'cursor-pointer hover:border-[#171717]/40 dark:hover:border-white/40'
                      } ${
                        errors.stockroomId
                          ? 'border-[#DC2626] dark:border-[#DC2626]'
                          : isStockroomDropdownOpen
                          ? 'border-[#171717] dark:border-white ring-2 ring-[#171717]/10 dark:ring-white/10'
                          : 'border-[#EAE7DF] dark:border-[#333333]'
                      }`}
                    >
                      <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99958D] dark:text-[#737373] pointer-events-none" />
                      {(() => {
                        const selectedStockroom = stockrooms.find(
                          (s) => Number(s.stockroomId) === Number(stockroomId)
                        )
                        return (
                          <span
                            className={`truncate ${
                              selectedStockroom
                                ? 'text-[#171717] dark:text-[#EDEDED] font-semibold'
                                : 'text-[#99958D] dark:text-[#737373]'
                            }`}
                          >
                            {userType === 'ADMIN'
                              ? 'Not Applicable (Admin)'
                              : selectedStockroom
                              ? selectedStockroom.stockroomName
                              : 'Select Stock Room...'}
                          </span>
                        )
                      })()}
                      <ChevronDown
                        className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#99958D] transition-transform duration-200 pointer-events-none ${
                          isStockroomDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Clear selection button */}
                    {userType !== 'ADMIN' && stockroomId && !isStockroomDropdownOpen && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setStockroomId('')
                        }}
                        className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[#EAE7DF] dark:hover:bg-[#333] text-[#99958D] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                        title="Clear stock room"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {errors.stockroomId && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">{errors.stockroomId}</p>
                  )}

                  {/* Dropdown Menu with Search Input */}
                  {isStockroomDropdownOpen && userType !== 'ADMIN' && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#1E1E1E] border border-[#EAE7DF] dark:border-[#2C2C2C] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* Search Input */}
                      <div className="p-2 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6] dark:bg-[#232323]">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-[#99958D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search stock room name..."
                            value={stockroomFilterQuery}
                            onChange={(e) => setStockroomFilterQuery(e.target.value)}
                            className="w-full h-8 pl-8 pr-7 text-xs bg-white dark:bg-[#181818] border border-[#EAE7DF] dark:border-[#333333] rounded-xl text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] focus:outline-hidden focus:border-[#171717] dark:focus:border-white transition-colors"
                          />
                          {isSearchingStockrooms || isDebouncingStockrooms ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#99958D] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          ) : stockroomFilterQuery ? (
                            <button
                              type="button"
                              onClick={() => setStockroomFilterQuery('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#99958D] hover:text-[#171717] dark:hover:text-white p-0.5 cursor-pointer"
                              title="Clear search"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {/* Stockroom List */}
                      <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5 [scrollbar-width:thin]">
                        {filteredStockrooms.length === 0 ? (
                          <div className="py-4 px-3 text-center text-xs text-[#99958D] font-medium">
                            No matching stock rooms found
                          </div>
                        ) : (
                          filteredStockrooms.map((s) => {
                            const isSelected = Number(s.stockroomId) === Number(stockroomId)
                            return (
                              <button
                                key={s.stockroomId}
                                type="button"
                                onClick={() => {
                                  setStockroomId(s.stockroomId)
                                  setStockrooms((prev) => {
                                    if (!prev.some((item) => Number(item.stockroomId) === Number(s.stockroomId))) {
                                      return [...prev, s]
                                    }
                                    return prev
                                  })
                                  setIsStockroomDropdownOpen(false)
                                  setStockroomFilterQuery('')
                                  if (errors.stockroomId) {
                                    setErrors((prev) => ({ ...prev, stockroomId: undefined }))
                                  }
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#1D63ED]/10 text-[#1D63ED] dark:text-[#60A5FA]'
                                    : 'text-[#171717] dark:text-[#EDEDED] hover:bg-[#F3F1EA] dark:hover:bg-[#2C2C2C]'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Building2
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      isSelected
                                        ? 'text-[#1D63ED] dark:text-[#60A5FA]'
                                        : 'text-[#99958D]'
                                    }`}
                                  />
                                  <span className="truncate">{s.stockroomName}</span>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-[#1D63ED] dark:text-[#60A5FA] shrink-0 ml-2" />
                                )}
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: User Name & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* [USER_NAME] */}
                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#EDEDED] uppercase tracking-wider mb-1.5">
                    User Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99958D] dark:text-[#737373] pointer-events-none" />
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value)
                        if (errors.userName) setErrors((prev) => ({ ...prev, userName: undefined }))
                      }}
                      placeholder="e.g. username"
                      className={`w-full bg-[#FAF9F6] dark:bg-[#181818] border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] dark:placeholder-[#737373] focus:outline-hidden focus:ring-2 focus:ring-[#171717]/20 dark:focus:ring-white/20 transition-all ${
                        errors.userName
                          ? 'border-[#DC2626] dark:border-[#DC2626]'
                          : 'border-[#EAE7DF] dark:border-[#333333] focus:border-[#171717] dark:focus:border-white'
                      }`}
                    />
                  </div>
                  {errors.userName && (
                    <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{errors.userName}</p>
                  )}
                </div>

                {/* [PASSWORD] */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#171717] dark:text-[#EDEDED] uppercase tracking-wider">
                      Password {!editingId && <span className="text-[#DC2626]">*</span>}
                    </label>
                    {editingId && (
                      <span className="text-[10.5px] text-[#99958D] dark:text-[#888]">
                        Optional on edit
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99958D] dark:text-[#737373] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                      }}
                      placeholder={editingId ? 'Leave empty to keep existing password' : '•••••••• (min. 6 characters)'}
                      className={`w-full bg-[#FAF9F6] dark:bg-[#181818] border rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] dark:placeholder-[#737373] focus:outline-hidden focus:ring-2 focus:ring-[#171717]/20 dark:focus:ring-white/20 transition-all ${
                        errors.password
                          ? 'border-[#DC2626] dark:border-[#DC2626]'
                          : 'border-[#EAE7DF] dark:border-[#333333] focus:border-[#171717] dark:focus:border-white'
                      }`}
                    />
                    <TooltipLeft content={showPassword ? 'Hide password' : 'Show password'}>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99958D] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </TooltipLeft>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Email & Contact Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* [EMAIL] */}
                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#EDEDED] uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99958D] dark:text-[#737373] pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                      }}
                      placeholder="e.g. username@wipro.com"
                      className={`w-full bg-[#FAF9F6] dark:bg-[#181818] border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] dark:placeholder-[#737373] focus:outline-hidden focus:ring-2 focus:ring-[#171717]/20 dark:focus:ring-white/20 transition-all ${
                        errors.email
                          ? 'border-[#DC2626] dark:border-[#DC2626]'
                          : 'border-[#EAE7DF] dark:border-[#333333] focus:border-[#171717] dark:focus:border-white'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{errors.email}</p>
                  )}
                </div>

                {/* [CONTACT_NUMBER] */}
                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#EDEDED] uppercase tracking-wider mb-1.5">
                    Contact Number <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99958D] dark:text-[#737373] pointer-events-none" />
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => {
                        setContactNumber(e.target.value)
                        if (errors.contactNumber)
                          setErrors((prev) => ({ ...prev, contactNumber: undefined }))
                      }}
                      placeholder="e.g. +91 98461 23456"
                      className={`w-full bg-[#FAF9F6] dark:bg-[#181818] border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] dark:placeholder-[#737373] focus:outline-hidden focus:ring-2 focus:ring-[#171717]/20 dark:focus:ring-white/20 transition-all ${
                        errors.contactNumber
                          ? 'border-[#DC2626] dark:border-[#DC2626]'
                          : 'border-[#EAE7DF] dark:border-[#333333] focus:border-[#171717] dark:focus:border-white'
                      }`}
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 4: Status Indicator (informative) */}
              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#EDEDED] uppercase tracking-wider mb-1.5">
                  Initial Account Status
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181818] border border-[#EAE7DF] dark:border-[#333]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669] dark:bg-[#34D399]" />
                  <span className="text-xs font-semibold text-[#059669] dark:text-[#34D399]">
                    {editingId ? isStatus : 'Active by default upon creation'}
                  </span>
                  <span className="text-[11px] text-[#99958D] dark:text-[#777] ml-auto">
                    (Can be toggled anytime from the table)
                  </span>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE7DF]/70 dark:border-[#2C2C2C]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-[#FECACA] dark:border-[#DC2626]/40 bg-[#FEF2F2] hover:bg-[#FEE2E2] dark:bg-[#451A1A]/40 dark:hover:bg-[#451A1A]/70 text-[#DC2626] dark:text-[#F87171] text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-[#2C2C2C] dark:bg-white dark:hover:bg-[#EAE7DF] text-white dark:text-[#171717] text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : editingId ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Update User</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Save User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setDeletingUser(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E1E1E] border border-[#EAE7DF] dark:border-[#2C2C2C] shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-150 flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#171717] dark:text-[#EDEDED]">
                  Delete User?
                </h3>
                <p className="text-xs text-[#666666] dark:text-[#A0A0A0] mt-1.5 leading-relaxed">
                  Are you sure you want to permanently delete user{' '}
                  <strong className="text-[#171717] dark:text-[#EDEDED]">
                    "{deletingUser.userName}"
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[#EAE7DF]/70 dark:border-[#2C2C2C]">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={actionLoadingId === deletingUser.userId}
                className="px-4 py-2 rounded-xl border border-[#FECACA] dark:border-[#DC2626]/40 bg-[#FEF2F2] hover:bg-[#FEE2E2] dark:bg-[#451A1A]/40 dark:hover:bg-[#451A1A]/70 text-[#DC2626] dark:text-[#F87171] text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={actionLoadingId === deletingUser.userId}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === deletingUser.userId ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {actionLoadingId === deletingUser.userId ? 'Deleting...' : 'Delete User'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMaster
