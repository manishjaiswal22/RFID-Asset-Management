import React, { useState, useMemo } from 'react'
import {
  User,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
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
  Power,
  Copy,
  Check,
  X
} from 'lucide-react'
import { exportToExcel } from '../utils/excelExport'

export interface UserMasterRecord {
  id: string
  userName: string
  password: string
  email: string
  contactNumber: string
  isStatus: 'Active' | 'Inactive'
  createdAt: string
  updatedAt?: string
}

const INITIAL_USERS: UserMasterRecord[] = [
  {
    id: 'usr-1',
    userName: 'manoj.sharma',
    password: 'Password@2026',
    email: 'manoj.sharma@wipro.com',
    contactNumber: '+91 98450 12345',
    isStatus: 'Active',
    createdAt: '2026-11-15 09:30:00'
  },
  {
    id: 'usr-2',
    userName: 'suresh.nair',
    password: 'Secure#Stock26',
    email: 'suresh.nair@wipro.com',
    contactNumber: '+91 98451 23456',
    isStatus: 'Active',
    createdAt: '2026-11-15 11:20:00'
  },
  {
    id: 'usr-3',
    userName: 'ananya.verma',
    password: 'Rfid!Portal99',
    email: 'ananya.verma@wipro.com',
    contactNumber: '+91 98452 34567',
    isStatus: 'Active',
    createdAt: '2026-11-16 14:15:00'
  },
  {
    id: 'usr-4',
    userName: 'vikram.patel',
    password: 'AssetTrack#2026',
    email: 'vikram.patel@wipro.com',
    contactNumber: '+91 98453 45678',
    isStatus: 'Active',
    createdAt: '2026-11-16 16:40:00'
  },
  {
    id: 'usr-5',
    userName: 'rohan.gupta',
    password: 'WiproAdmin$44',
    email: 'rohan.gupta@wipro.com',
    contactNumber: '+91 98454 56789',
    isStatus: 'Active',
    createdAt: '2026-11-17 10:10:00'
  },
  {
    id: 'usr-6',
    userName: 'pooja.mehta',
    password: 'HamPro!Lead10',
    email: 'pooja.mehta@wipro.com',
    contactNumber: '+91 98455 67890',
    isStatus: 'Active',
    createdAt: '2026-11-17 15:30:00'
  },
  {
    id: 'usr-7',
    userName: 'deepak.yadav',
    password: 'Delhi$Stock88',
    email: 'deepak.yadav@wipro.com',
    contactNumber: '+91 98456 78901',
    isStatus: 'Inactive',
    createdAt: '2026-11-18 09:20:00'
  },
  {
    id: 'usr-8',
    userName: 'kavita.reddy',
    password: 'Infospace@2026',
    email: 'kavita.reddy@wipro.com',
    contactNumber: '+91 98457 89012',
    isStatus: 'Active',
    createdAt: '2026-11-18 13:45:00'
  },
  {
    id: 'usr-9',
    userName: 'karthik.iyer',
    password: 'BlrEcity!77',
    email: 'karthik.iyer@wipro.com',
    contactNumber: '+91 98458 90123',
    isStatus: 'Active',
    createdAt: '2026-11-19 11:15:00'
  },
  {
    id: 'usr-10',
    userName: 'priyanka.joshi',
    password: 'PuneHinj#2026',
    email: 'priyanka.joshi@wipro.com',
    contactNumber: '+91 98459 01234',
    isStatus: 'Active',
    createdAt: '2026-11-19 16:50:00'
  },
  {
    id: 'usr-11',
    userName: 'sachin.deshmukh',
    password: 'Hardware@Op5',
    email: 'sachin.deshmukh@wipro.com',
    contactNumber: '+91 98460 12345',
    isStatus: 'Active',
    createdAt: '2026-11-20 09:05:00'
  },
  {
    id: 'usr-12',
    userName: 'karthik.iyer',
    password: 'Karthik!Bang26',
    email: 'karthik.iyer@wipro.com',
    contactNumber: '+91 98461 23456',
    isStatus: 'Active',
    createdAt: '2026-11-20 11:30:00'
  }
]

type SortField = 'userName' | 'email' | 'contactNumber' | 'isStatus' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export const UserMaster: React.FC = () => {
  // Master records state
  const [records, setRecords] = useState<UserMasterRecord[]>(INITIAL_USERS)

  // Form states
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [isStatus, setIsStatus] = useState<'Active' | 'Inactive'>('Active')
  const [showPassword, setShowPassword] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Copied password state for quick feedback
  const [copiedId, setCopiedId] = useState<string | null>(null)
  // Per-row revealed password map
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({})

  // Form validation errors & notifications
  const [errors, setErrors] = useState<{
    userName?: string
    password?: string
    email?: string
    contactNumber?: string
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
  const activeCount = records.filter((r) => r.isStatus === 'Active').length
  const inactiveCount = records.filter((r) => r.isStatus === 'Inactive').length

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
      userName?: string
      password?: string
      email?: string
      contactNumber?: string
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

    if (!cleanPassword) {
      newErrors.password = 'Password is required'
    } else if (cleanPassword.length < 6) {
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showNotification('error', 'Please correct the errors in the form.')
      return
    }

    setErrors({})
    const nowFormatted = new Date().toISOString().replace('T', ' ').slice(0, 19)

    if (editingId) {
      // Check duplicate username for other records
      const exists = records.some(
        (r) => r.id !== editingId && r.userName.toLowerCase() === cleanUserName.toLowerCase()
      )
      if (exists) {
        setErrors({ userName: 'A user with this username already exists' })
        showNotification('error', 'A user with this username already exists.')
        return
      }

      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                userName: cleanUserName,
                password: cleanPassword,
                email: cleanEmail,
                contactNumber: cleanContact,
                isStatus,
                updatedAt: nowFormatted
              }
            : r
        )
      )
      showNotification('success', `User "${cleanUserName}" updated successfully!`)
      handleClear()
      setIsModalOpen(false)
    } else {
      // Check duplicate username
      const exists = records.some(
        (r) => r.userName.toLowerCase() === cleanUserName.toLowerCase()
      )
      if (exists) {
        setErrors({ userName: 'A user with this username already exists' })
        showNotification('error', 'A user with this username already exists.')
        return
      }

      const newUser: UserMasterRecord = {
        id: `usr-${Date.now()}`,
        userName: cleanUserName,
        password: cleanPassword,
        email: cleanEmail,
        contactNumber: cleanContact,
        isStatus,
        createdAt: nowFormatted
      }

      setRecords((prev) => [newUser, ...prev])
      showNotification('success', `User "${cleanUserName}" created successfully!`)
      setCurrentPage(1)
      handleClear()
      setIsModalOpen(false)
    }
  }

  const handleClear = () => {
    setUserName('')
    setPassword('')
    setEmail('')
    setContactNumber('')
    setIsStatus('Active')
    setShowPassword(false)
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

  const handleEdit = (record: UserMasterRecord) => {
    setEditingId(record.id)
    setUserName(record.userName)
    setPassword(record.password)
    setEmail(record.email)
    setContactNumber(record.contactNumber)
    setIsStatus(record.isStatus)
    setErrors({})
    setIsModalOpen(true)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      setRecords((prev) => prev.filter((r) => r.id !== id))
      if (editingId === id) handleClear()
      showNotification('success', `User "${name}" deleted.`)
    }
  }

  const handleToggleStatus = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isStatus: r.isStatus === 'Active' ? 'Inactive' : 'Active',
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
            }
          : r
      )
    )
  }

  const handleCopyPassword = (id: string, pass: string) => {
    navigator.clipboard.writeText(pass)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev))
    }, 2000)
  }

  const toggleRevealRowPassword = (id: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Filtering & Sorting
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.trim().toLowerCase()
        return (
          r.userName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.contactNumber.toLowerCase().includes(q) ||
          r.isStatus.toLowerCase().includes(q)
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
    const headers = ['User Name', 'Email', 'Contact Number', 'Status']
    const rows = filteredRecords.map((r) => [
      r.userName,
      r.email,
      r.contactNumber,
      r.isStatus
    ])
    exportToExcel(
      headers,
      rows,
      `user_master_${new Date().toISOString().slice(0, 10)}.xlsx`,
      'Users'
    )
  }

  return (
    <div className="w-full flex-1 flex flex-col space-y-2.5 select-none">
      {/* Toast Notification */}
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

      {/* Page Header & Metric Pills */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5 pb-2 border-b border-[#EAE7DF]/60 dark:border-[#2C2C2C] shrink-0">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EDEDED] tracking-tight whitespace-nowrap">
            User Master
          </h2>
        </div>

        {/* Quick Metric Pills & Add User Button */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF9F6] dark:bg-[#222222] border border-[#EAE7DF] dark:border-[#2C2C2C] text-xs font-semibold text-[#171717] dark:text-[#EDEDED]">
            <User className="w-3.5 h-3.5 text-[#1D63ED]" />
            <span>Total:</span>
            <span className="font-bold">{totalCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#ECFDF5] dark:bg-[#064E3B]/40 border border-[#A7F3D0] dark:border-[#059669] text-xs font-semibold text-[#059669] dark:text-[#34D399]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-[#34D399]" />
            <span>Active:</span>
            <span className="font-bold">{activeCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FEF2F2] dark:bg-[#451A1A]/40 border border-[#FECACA] dark:border-[#DC2626] text-xs font-semibold text-[#DC2626] dark:text-[#F87171]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] dark:bg-[#F87171]" />
            <span>Inactive:</span>
            <span className="font-bold">{inactiveCount}</span>
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
        {/* Table Toolbar */}
        <div className="p-3 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#99958D] dark:text-[#737373] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search username, email, contact, status..."
              className="w-full bg-[#FAF9F6] dark:bg-[#181818] border border-[#EAE7DF] dark:border-[#333333] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] dark:placeholder-[#737373] focus:outline-hidden focus:ring-2 focus:ring-[#171717]/20 dark:focus:ring-white/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-1.5 text-xs text-[#666666] dark:text-[#A0A0A0]">
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value)
                  setRowsPerPage(val)
                  setCurrentPage(1)
                }}
                className="bg-[#FAF9F6] dark:bg-[#181818] border border-[#EAE7DF] dark:border-[#333333] rounded-lg px-2 py-1 text-xs text-[#171717] dark:text-[#EDEDED] focus:outline-hidden cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value="all">All</option>
              </select>
            </div>

            {/* Export to Excel Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-[#00875A] hover:bg-[#00704A] text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Export filtered records to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export to Excel</span>
            </button>

            {/* Add User Button */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-[#1D63ED] hover:bg-[#1854CD] text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Add a new user"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table Body */}
        <div className="relative w-full overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF9F6] dark:bg-[#232323] border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] text-[11px] font-bold text-[#666666] dark:text-[#A0A0A0] uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('userName')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1D63ED]" />
                    <span>USER NAME</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99958D]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#059669]" />
                    <span>EMAIL</span>
                    <ArrowUpDown className="w-3 h-3 text-[#99958D]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('contactNumber')}
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
                  onClick={() => handleSort('isStatus')}
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
            <tbody className="divide-y divide-[#EAE7DF]/50 dark:divide-[#2C2C2C] text-xs">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#99958D] dark:text-[#737373]">
                    No user records match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FAF9F6]/80 dark:hover:bg-[#252525]/50 transition-colors"
                  >
                    {/* User Name */}
                    <td className="py-2 px-3 font-semibold text-[#171717] dark:text-[#EDEDED] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1D63ED]/10 dark:bg-[#1D63ED]/20 text-[#1D63ED] flex items-center justify-center text-[10px] font-bold uppercase">
                          {item.userName.slice(0, 2)}
                        </div>
                        <span>{item.userName}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-2 px-3 text-[#555555] dark:text-[#B0B0B0] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-[#99958D] shrink-0" />
                        <span className="font-mono text-[11.5px]">{item.email}</span>
                      </div>
                    </td>

                    {/* Contact Number */}
                    <td className="py-2 px-3 text-[#555555] dark:text-[#B0B0B0] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#99958D] shrink-0" />
                        <span className="font-mono text-[11.5px] tabular-nums">{item.contactNumber}</span>
                      </div>
                    </td>

                    {/* Password (Masked with toggle reveal & copy) */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11.5px] text-[#171717] dark:text-[#EDEDED] bg-[#FAF9F6] dark:bg-[#181818] px-2 py-0.5 rounded-md border border-[#EAE7DF] dark:border-[#333333]">
                          {revealedPasswords[item.id] ? item.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleRevealRowPassword(item.id)}
                          className="p-1 rounded text-[#99958D] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                          title={revealedPasswords[item.id] ? 'Hide password' : 'Show password'}
                        >
                          {revealedPasswords[item.id] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyPassword(item.id, item.password)}
                          className="p-1 rounded text-[#99958D] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                          title="Copy password to clipboard"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3 h-3 text-[#059669]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wide border transition-all cursor-pointer ${
                          item.isStatus === 'Active'
                            ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#064E3B]/40 dark:text-[#34D399] dark:border-[#059669]'
                            : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] dark:bg-[#451A1A] dark:text-[#F87171] dark:border-[#DC2626]'
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isStatus === 'Active'
                              ? 'bg-[#059669] dark:bg-[#34D399]'
                              : 'bg-[#DC2626] dark:bg-[#F87171]'
                          }`}
                        />
                        <span>{item.isStatus}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id)}
                          className="p-1 rounded-md text-[#64748B] hover:text-[#059669] hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/40 transition-colors cursor-pointer"
                          title={`Toggle status to ${item.isStatus === 'Active' ? 'Inactive' : 'Active'}`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="p-1 rounded-md text-[#64748B] hover:text-[#1D63ED] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]/30 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.userName)}
                          className="p-1 rounded-md text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#451A1A]/40 transition-colors cursor-pointer"
                          title="Delete User"
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
                {isAll
                  ? totalRecords
                  : Math.min(startIndex + (effectiveLimit as number), totalRecords)}
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
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-[11px] text-[#99958D] font-bold select-none"
                  >
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
              disabled={currentPage === totalPages || isAll}
              className="w-6 h-6 flex items-center justify-center rounded-lg border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit User Modal */}
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
                  {editingId ? <Edit2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EDEDED]">
                    {editingId ? 'Edit User Credentials & Details' : 'Add New User'}
                  </h3>
                  <p className="text-xs text-[#99958D] dark:text-[#888888] mt-0.5">
                    {editingId
                      ? 'Modify credentials, contact info, and active status.'
                      : 'Create a new user account with system credentials.'}
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
                      placeholder="e.g. rohan.gupta"
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
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#EDEDED] uppercase tracking-wider mb-1.5">
                    Password <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#99958D] dark:text-[#737373] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                      }}
                      placeholder="••••••••"
                      className={`w-full bg-[#FAF9F6] dark:bg-[#181818] border rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D] dark:placeholder-[#737373] focus:outline-hidden focus:ring-2 focus:ring-[#171717]/20 dark:focus:ring-white/20 transition-all ${
                        errors.password
                          ? 'border-[#DC2626] dark:border-[#DC2626]'
                          : 'border-[#EAE7DF] dark:border-[#333333] focus:border-[#171717] dark:focus:border-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99958D] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* [EMAIL] & [CONTACT_NUMBER] */}
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
                      placeholder="e.g. user@wipro.com"
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
                      placeholder="e.g. +91 98450 12345"
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

              {/* [IS_STATUS] */}
              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#EDEDED] uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-3 h-11">
                  <button
                    type="button"
                    onClick={() => setIsStatus('Active')}
                    className={`flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                      isStatus === 'Active'
                        ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] shadow-xs dark:bg-[#064E3B] dark:text-[#34D399] dark:border-[#059669]'
                        : 'bg-[#FAF9F6] dark:bg-[#181818] text-[#666666] dark:text-[#A0A0A0] border-[#EAE7DF] dark:border-[#333333] hover:bg-[#F3F1EA]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669] dark:bg-[#34D399]" />
                    <span>Active</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStatus('Inactive')}
                    className={`flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                      isStatus === 'Inactive'
                        ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] shadow-xs dark:bg-[#451A1A] dark:text-[#F87171] dark:border-[#DC2626]'
                        : 'bg-[#FAF9F6] dark:bg-[#181818] text-[#666666] dark:text-[#A0A0A0] border-[#EAE7DF] dark:border-[#333333] hover:bg-[#F3F1EA]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] dark:bg-[#F87171]" />
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
                  {editingId ? (
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
    </div>
  )
}

export default UserMaster
