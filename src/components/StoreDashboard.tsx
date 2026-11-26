import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react'
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
  ChevronRight,
  Loader2,
  Radio,
  X
} from 'lucide-react'
import StoreFilter, { type StoreItem } from './StoreFilter'
import TickerNumber from './TickerNumber'
import { downloadExcelExport } from '../services/exportService'
import { extractMoveFromJson, normalizeMove } from '../utils/moveUtils'
import { TooltipTop, TooltipBottom } from './Tooltip'
import { Toast, type ToastNotification } from './Toast'
import ConnectionStatusPill from './ConnectionStatusPill'
import { useDebounce } from '../utils/useDebounce'
import { dashboardService } from '../services/dashboardService'
import { authService } from '../services/authService'
import { signalrService } from '../services/signalrService'
import type { AuthUser } from '../types/auth'
import type { ApiStockroom } from '../types/stockroom'
import type {
  StockroomSummary,
  LatestAssetRead,
  StockroomPagination,
  StockroomMovementRow
} from '../types/stockroomDashboard'

type SortField =
  | 'movementDateTime'
  | 'assetTag'
  | 'serialNumber'
  | 'makeModel'
  | 'assetDescription'
  | 'move'
type SortOrder = 'asc' | 'desc'

interface StoreDashboardProps {
  currentUser?: AuthUser | null
  selectedStoreId?: string
  onStoreChange?: (storeId: string) => void
}

export const StoreDashboard: React.FC<StoreDashboardProps> = ({
  currentUser,
  selectedStoreId = 'all',
  onStoreChange
}) => {
  const activeUser = currentUser ?? authService.getUser()
  const isAdmin = (activeUser?.userType || '').toUpperCase() === 'ADMIN'

  const getInitialStore = () => {
    if (selectedStoreId && selectedStoreId !== 'all') {
      return selectedStoreId
    }
    if (activeUser?.stockroomId) {
      return String(activeUser.stockroomId)
    }
    return isAdmin ? 'all' : ''
  }

  const [selectedStore, setSelectedStore] = useState<string>(getInitialStore)
  const [apiStockrooms, setApiStockrooms] = useState<ApiStockroom[]>([])
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date())

  const [summary, setSummary] = useState<StockroomSummary | null>(null)
  const [latestRead, setLatestRead] = useState<LatestAssetRead | null>(null)
  const [pagination, setPagination] = useState<StockroomPagination>({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 1
  })
  const [movementRows, setMovementRows] = useState<StockroomMovementRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [notification, setNotification] = useState<ToastNotification | null>(null)
  const [realtimeRefreshTick, setRealtimeRefreshTick] = useState<number>(0)
  const [isBlinking, setIsBlinking] = useState(false)
  const [blinkMove, setBlinkMove] = useState<'IN' | 'OUT' | null>(null)
  const [blinkSecondsLeft, setBlinkSecondsLeft] = useState(0)
  const prevAssetSignatureRef = useRef<string | null>(null)
  const blinkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Table FLIP Animation & Row Promotion References
  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const prevRowPositionsRef = useRef<Map<string, number>>(new Map())
  const isInitialTableRender = useRef(true)
  const skipNextAnimationRef = useRef(false)
  const promotedRowKeyRef = useRef<string | null>(null)
  const [recentlyPromotedKey, setRecentlyPromotedKey] = useState<string | null>(null)
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerBlink = useCallback((move?: string) => {
    const targetMove = (move || 'IN').trim().toUpperCase()
    if (targetMove !== 'IN' && targetMove !== 'OUT') return

    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current)
    }

    setBlinkMove(targetMove as 'IN' | 'OUT')
    setIsBlinking(true)
    setBlinkSecondsLeft(15)

    blinkIntervalRef.current = setInterval(() => {
      setBlinkSecondsLeft((prev) => {
        if (prev <= 1) {
          if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current)
          setIsBlinking(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // Cleanup blink timer and highlight timer on unmount
  useEffect(() => {
    return () => {
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current)
      }
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  const showNotification = useCallback(
    (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
      setNotification({ type, message })
      setTimeout(() => {
        setNotification((prev) => (prev?.message === message ? null : prev))
      }, 4500)
    },
    []
  )

  // DataTable Filtering, Sorting & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  // Debounce movement records table search by 300ms
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [sortField, setSortField] = useState<SortField>('movementDateTime')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const cardsRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [cardsBottomOffset, setCardsBottomOffset] = useState<number>(200)
  const [toolbarHeight, setToolbarHeight] = useState<number>(44)

  // Measure exact bottom position of cards container when stuck below navbar
  useEffect(() => {
    const updateOffset = () => {
      if (cardsRef.current) {
        const headerEl = document.querySelector('header')
        const headerH = headerEl ? headerEl.offsetHeight : (window.innerWidth >= 640 ? 56 : 48)
        setCardsBottomOffset(headerH + cardsRef.current.offsetHeight)
      }
      if (toolbarRef.current) {
        setToolbarHeight(toolbarRef.current.offsetHeight)
      }
    }
    updateOffset()
    const ro = new ResizeObserver(updateOffset)
    if (cardsRef.current) ro.observe(cardsRef.current)
    if (toolbarRef.current) ro.observe(toolbarRef.current)
    window.addEventListener('resize', updateOffset)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateOffset)
    }
  }, [])

  // Reset to first page when debounced search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  // Fetch stockrooms for top dropdown
  useEffect(() => {
    let mounted = true
    dashboardService
      .getStockrooms()
      .then((data) => {
        if (mounted && data?.length) {
          setApiStockrooms(data)
          if (!isAdmin && (!selectedStore || selectedStore === 'all')) {
            const assigned = activeUser?.stockroomId
              ? String(activeUser.stockroomId)
              : String(data[0].stockroomId)
            setSelectedStore(assigned)
            onStoreChange?.(assigned)
          }
        }
      })
      .catch((err) => {
        console.warn('StoreDashboard: Could not fetch stockrooms from API', err)
      })

    return () => {
      mounted = false
    }
  }, [isAdmin, activeUser?.stockroomId, selectedStore, onStoreChange])

  // Keep selectedStore in sync with prop changes (e.g. when navigated from Central Dashboard)
  useEffect(() => {
    if (selectedStoreId && selectedStoreId !== selectedStore) {
      if (!isAdmin && selectedStoreId === 'all') {
        const assigned = activeUser?.stockroomId
          ? String(activeUser.stockroomId)
          : (apiStockrooms[0] ? String(apiStockrooms[0].stockroomId) : '')
        if (assigned && assigned !== selectedStore) {
          setSelectedStore(assigned)
        }
        return
      }
      setSelectedStore(selectedStoreId)
      setSummary(null)
      setCurrentPage(1)
    }
  }, [selectedStoreId, selectedStore, isAdmin, activeUser?.stockroomId, apiStockrooms])

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId)
    setSummary(null)
    setCurrentPage(1)
    onStoreChange?.(storeId)
  }

  // Clock interval
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(clockTimer)
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

  // Resolve selected stockroom's display name for export filename
  const resolvedStockroomName = useMemo(() => {
    if (!selectedStore || selectedStore === 'all') return undefined
    const num = parseInt(selectedStore.replace(/^stock-/, ''), 10)
    if (!isNaN(num)) {
      const match = apiStockrooms.find((s) => s.stockroomId === num)
      return match?.stockroomName
    }
    const match = apiStockrooms.find(
      (s) => s.stockroomName.toLowerCase() === selectedStore.toLowerCase()
    )
    return match?.stockroomName
  }, [selectedStore, apiStockrooms])

  // Fetch stockroom dashboard data (cards, latest read, movements) from API
  useEffect(() => {
    let mounted = true
    const controller = new AbortController()
    setIsLoading(true)

    const numericPageSize = rowsPerPage === 'all' ? 100 : rowsPerPage

    dashboardService
      .getStockroomDashboard(
        {
          stockroomId: resolvedStockroomId,
          page: currentPage,
          pageSize: numericPageSize,
          search: debouncedSearch.trim() || undefined,
          sortBy: sortField,
          sortDesc: sortOrder === 'desc'
        },
        controller.signal
      )
      .then((res) => {
        if (!mounted) return
        setSummary(res.summary)
        setLatestRead(res.latestAssetRead)
        setPagination(res.pagination)
        setMovementRows(res.rows)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        console.error('Failed to load stockroom dashboard data from API', err)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
      controller.abort()
    }
  }, [
    resolvedStockroomId,
    currentPage,
    rowsPerPage,
    sortField,
    sortOrder,
    debouncedSearch,
    realtimeRefreshTick
  ])

  // Listen for real-time asset scans over WebSockets / SignalR
  useEffect(() => {
    let unsubscribeScanned: (() => void) | undefined
    let unsubscribeRefreshed: (() => void) | undefined

    signalrService.connect().then(() => {
      if (resolvedStockroomId) {
        signalrService.joinStockroom(resolvedStockroomId)
      }

      unsubscribeScanned = signalrService.onAssetScanned((data) => {
        // If a specific stockroom is selected and does not match, ignore
        if (resolvedStockroomId && data.stockroomId !== resolvedStockroomId) {
          return
        }

        // Extract move directly from payload (root move, asset.move, action, or status)
        const moveDirection: 'IN' | 'OUT' =
          extractMoveFromJson(data) ||
          extractMoveFromJson(data.asset) ||
          normalizeMove(data.asset?.move) ||
          'IN'

        // 1. Update the Hero Card (Latest Asset Read)
        setLatestRead({
          assetId: data.asset.assetId,
          assetTag: data.asset.assetTag,
          serialNumber: data.asset.serialNumber,
          makeModel: data.asset.makeModel,
          assetType: data.asset.assetType || '',
          subAssetType: data.asset.subAssetType || '',
          assetDescription: data.asset.assetDescription,
          stockroomName: data.stockroomName,
          assetState: data.asset.assetState || '',
          serviceRequest: data.asset.serviceRequest || '',
          rfidEpc: data.asset.rfidEpc,
          move: moveDirection,
          movementDateTime: data.asset.movementDateTime
        })

        // Always trigger 15s ambient shadow glow when a new WebSocket patch is received
        triggerBlink(moveDirection)

        // 2. Update KPI Summary counters
        setSummary((prev) => {
          if (!prev) return null
          if (!resolvedStockroomId && data.globalSummary) {
            return {
              ...prev,
              totalTaggedAssets: data.globalSummary.totalTaggedAssets,
              assetIssuance: data.globalSummary.assetIssuance,
              availableAssets: data.globalSummary.availableAssets
            }
          }
          return {
            ...prev,
            totalTaggedAssets: data.stockroomSummary.totalTaggedAssets,
            assetIssuance: data.stockroomSummary.assetIssuance,
            availableAssets: data.stockroomSummary.availableAssets
          }
        })

        // 3. Prepend to Movement Rows at Row 1 and trigger FLIP slide-up animation
        const rowIdentifier =
          data.asset.rfidEpc || data.asset.assetTag || String(data.asset.assetId)

        promotedRowKeyRef.current = rowIdentifier
        setRecentlyPromotedKey(rowIdentifier)

        if (highlightTimerRef.current) {
          clearTimeout(highlightTimerRef.current)
        }
        highlightTimerRef.current = setTimeout(() => {
          setRecentlyPromotedKey(null)
        }, 4500)

        setMovementRows((prevRows) => {
          const numericPageSize = rowsPerPage === 'all' ? 100 : rowsPerPage
          const remaining = prevRows.filter((r) => {
            const rKey = r.rfidEpc || r.assetTag || String(r.assetId)
            return rKey !== rowIdentifier
          })

          const newRow: StockroomMovementRow = {
            assetId: data.asset.assetId,
            movementDateTime: data.asset.movementDateTime,
            assetTag: data.asset.assetTag,
            serialNumber: data.asset.serialNumber,
            makeModel: data.asset.makeModel,
            assetDescription: data.asset.assetDescription,
            assetType: data.asset.assetType || '',
            subAssetType: data.asset.subAssetType || '',
            assetState: data.asset.assetState || '',
            rfidEpc: data.asset.rfidEpc,
            move: moveDirection
          }

          return [newRow, ...remaining].slice(0, numericPageSize)
        })

        // Update pagination totals without a disruptive immediate HTTP fetch that would wipe out the prepended row
        setPagination((prev) =>
          prev
            ? {
                ...prev,
                totalRecords: prev.totalRecords + 1
              }
            : prev
        )
      })

      // 4. On Undo / Rollback event: refresh data automatically
      unsubscribeRefreshed = signalrService.onDashboardRefreshed(() => {
        setRealtimeRefreshTick((prev) => prev + 1)
      })
    })

    return () => {
      if (unsubscribeScanned) unsubscribeScanned()
      if (unsubscribeRefreshed) unsubscribeRefreshed()
      if (resolvedStockroomId) {
        signalrService.leaveStockroom(resolvedStockroomId)
      }
    }
  }, [resolvedStockroomId, rowsPerPage, triggerBlink])

  // Only trigger shadow effect when data actually changes (never on initial page load)
  useEffect(() => {
    if (!latestRead || !latestRead.move) {
      return
    }

    const currentSignature = `${latestRead.rfidEpc || ''}_${latestRead.assetTag || ''}_${latestRead.movementDateTime || ''}_${latestRead.move || ''}`

    if (prevAssetSignatureRef.current === null) {
      // First initial load: save current signature, do not trigger shadow effect
      prevAssetSignatureRef.current = currentSignature
      return
    }

    if (prevAssetSignatureRef.current !== currentSignature) {
      // Data actually changed: update signature and trigger 15-second ambient shadow glow
      prevAssetSignatureRef.current = currentSignature
      triggerBlink(latestRead.move)
    }
  }, [latestRead, triggerBlink])

  // Options for StoreFilter
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

  // Current selected stock room name for display
  const currentStockroomName = useMemo(() => {
    const summaryName = summary?.stockroomName
    if (selectedStore === 'all') {
      return summaryName || (isAdmin ? 'All Stock Rooms' : 'Stock Room')
    }
    const found = stockRoomOptions.find(
      (s) =>
        s.id === selectedStore ||
        s.id === `stock-${selectedStore}` ||
        `stock-${s.id}` === selectedStore ||
        s.name.toLowerCase() === selectedStore.toLowerCase()
    )
    if (found) return found.name
    if (summaryName) return summaryName
    return isLoading ? 'Loading...' : 'Select Stock Room'
  }, [selectedStore, stockRoomOptions, summary, isLoading, isAdmin])

  // Skip table slide animation when changing page, sorting, filter or store
  useEffect(() => {
    skipNextAnimationRef.current = true
  }, [currentPage, sortField, sortOrder, debouncedSearch, selectedStore, rowsPerPage])

  // Handle toggling Move (IN <-> OUT) for any row, sliding it smoothly to the top of the table
  const handleRowMoveToggle = useCallback(
    (row: StockroomMovementRow) => {
      const currentMove = (row.move || 'IN').trim().toUpperCase()
      const newMove: 'IN' | 'OUT' = currentMove === 'OUT' ? 'IN' : 'OUT'
      const nowIso = new Date().toISOString()
      const rowIdentifier = row.rfidEpc || row.assetTag || String(row.assetId)

      // Set recently promoted key for entrance flash highlight
      promotedRowKeyRef.current = rowIdentifier
      setRecentlyPromotedKey(rowIdentifier)

      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current)
      }
      highlightTimerRef.current = setTimeout(() => {
        setRecentlyPromotedKey(null)
      }, 4500)

      // 1. Update Hero Card (Latest Asset Read)
      setLatestRead({
        assetId: row.assetId,
        assetTag: row.assetTag,
        serialNumber: row.serialNumber,
        makeModel: row.makeModel,
        assetType: row.assetType || '',
        subAssetType: row.subAssetType || '',
        assetDescription: row.assetDescription || '',
        stockroomName: currentStockroomName,
        assetState: row.assetState || (newMove === 'IN' ? 'In stock' : 'Issued'),
        serviceRequest: '',
        rfidEpc: row.rfidEpc || '',
        move: newMove,
        movementDateTime: nowIso
      })

      // 2. Trigger 15-second ambient shadow glow on Hero Card
      triggerBlink(newMove)

      // 3. Prepend this row to index 0 of movementRows
      setMovementRows((prevRows) => {
        const numericPageSize = rowsPerPage === 'all' ? 100 : rowsPerPage
        const remaining = prevRows.filter((r) => {
          const rKey = r.rfidEpc || r.assetTag || String(r.assetId)
          return rKey !== rowIdentifier
        })

        const updatedRow: StockroomMovementRow = {
          ...row,
          move: newMove,
          movementDateTime: nowIso,
          assetState: row.assetState || (newMove === 'IN' ? 'In stock' : 'Issued')
        }

        return [updatedRow, ...remaining].slice(0, numericPageSize)
      })
    },
    [currentStockroomName, rowsPerPage, triggerBlink]
  )

  // FLIP (First, Last, Invert, Play) animation for table rows sliding to top
  useLayoutEffect(() => {
    const tbody = tbodyRef.current
    if (!tbody) return

    const rows = Array.from(
      tbody.querySelectorAll<HTMLTableRowElement>('tr[data-row-key]')
    )

    // On first mount or when sorting/filtering/paging, record positions without animation
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
        // Brand new row appearing at the top (e.g. from websocket patch for an asset not previously on page)
        if (tr.getAttribute('data-row-index') === '0') {
          const rowHeight = tr.getBoundingClientRect().height || 42
          animations.push({ tr, deltaY: -rowHeight, isPromoted: true })
        }
      }
    })

    // Save current positions for next render
    prevRowPositionsRef.current.clear()
    rows.forEach((tr) => {
      const key = tr.getAttribute('data-row-key')
      if (key) {
        prevRowPositionsRef.current.set(key, tr.getBoundingClientRect().top)
      }
    })

    if (animations.length === 0) return

    // 1. INVERT: Apply inverted translate immediately (before next paint)
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

    // Force synchronous layout reflow so the browser commits the inverted positions
    void tbody.offsetHeight

    // 2. PLAY: Animate smoothly to natural position (translateY(0))
    const rafId = requestAnimationFrame(() => {
      animations.forEach(({ tr, isPromoted }) => {
        if (isPromoted) {
          // Smooth floating slide-up with spring ease
          tr.style.transition =
            'transform 650ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 650ms ease'
        } else {
          // Displaced rows slide down smoothly
          tr.style.transition = 'transform 550ms cubic-bezier(0.16, 1, 0.3, 1)'
        }
        tr.style.transform = 'translateY(0px)'
      })
    })

    // 3. CLEAN UP: Clean up inline styles after transition completes
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
  }, [movementRows])

  const kpiCards = [
    {
      id: 'stockroom',
      title: 'Stock Room',
      isText: true,
      textValue: summary?.stockroomName || currentStockroomName,
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
      value: summary?.totalTaggedAssets ?? 0,
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
      value: summary?.assetIssuance ?? 0,
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
      value: summary?.availableAssets ?? 0,
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

  // Currently inspected asset for Latest Asset Read Card (always the latest RFID read)
  const activeAsset = latestRead

  const activeStockroomName =
    activeAsset?.stockroomName || summary?.stockroomName || currentStockroomName
  const activeServiceRequest = activeAsset?.serviceRequest || '-'

  const getAssetStateBadge = (state?: string) => {
    const s = (state || 'InStock').toLowerCase()
    if (s.includes('retire')) {
      return 'bg-[#FFF1F2] dark:bg-[#4C0519]/40 text-[#E11D48] dark:text-[#FB7185] border border-[#FFE4E6] dark:border-[#881337]'
    }
    if (s.includes('stock') || s.includes('avail')) {
      return 'bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#059669]'
    }
    if (s.includes('use') || s.includes('assign') || s.includes('alloc')) {
      return 'bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 text-[#1D63ED] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#1D4ED8]'
    }
    if (s.includes('repair') || s.includes('damag') || s.includes('fault')) {
      return 'bg-[#FEF2F2] dark:bg-[#451A1A]/40 text-[#DC2626] dark:text-[#F87171] border border-[#FECACA] dark:border-[#DC2626]'
    }
    return 'bg-[#F1F5F9] dark:bg-[#334155]/40 text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#475569]'
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  // Pagination calculations
  const totalRecords = pagination.totalRecords
  const hasData = totalRecords > 0 || movementRows.length > 0
  const isAll = rowsPerPage === 'all'
  const effectiveLimit = isAll ? Math.max(totalRecords, 1) : rowsPerPage
  const totalPages = pagination.totalPages
  const startIndex = isAll ? 0 : (currentPage - 1) * effectiveLimit
  const displayStart = totalRecords === 0 ? 0 : startIndex + 1
  const displayEnd = isAll
    ? totalRecords
    : Math.min(startIndex + movementRows.length, totalRecords)

  // Live movement counts for footer (Total IN and Total OUT)
  const movementTotals = useMemo(() => {
    const inCount = movementRows.filter((m) => m.move === 'IN').length
    const outCount = movementRows.filter((m) => m.move === 'OUT').length
    return { inCount, outCount }
  }, [movementRows])

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
        pages.push(
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        )
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages
        )
      }
    }
    return pages
  }

  // Export to Excel (.xlsx) via backend API (status=2)
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const handleExportExcel = async () => {
    if (!hasData) return
    setIsExportingExcel(true)
    setExportProgress(10)
    try {
      // - Admin + "All Stock Rooms" → undefined (exports all)
      // - Admin + specific stockroom → resolvedStockroomId
      // - Normal stockroom user → undefined (backend resolves assigned stockroom_id from JWT)
      const targetStockroomId =
        isAdmin && selectedStore && selectedStore !== 'all' ? resolvedStockroomId : undefined

      await downloadExcelExport(
        2,
        targetStockroomId,
        (percent) => {
          setExportProgress(percent)
        },
        resolvedStockroomName
      )
      showNotification('success', 'Stock Room Dashboard exported to Excel successfully!')
    } catch (err: any) {
      console.warn('StoreDashboard: backend Excel export failed', err)
      showNotification('error', err.message || 'Failed to export Excel file.')
    } finally {
      setTimeout(() => {
        setIsExportingExcel(false)
        setExportProgress(0)
      }, 500)
    }
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

  const formatMovementDateTime = (dt?: string) => {
    if (!dt) return { dateStr: '-', timeStr: '-' }
    const clean = dt.replace('T', ' ')
    const parts = clean.split(' ')
    const dateStr = parts[0] || '-'
    const timeStr = parts[1] ? parts[1].split('.')[0] : '-'
    return { dateStr, timeStr }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev))
    }, 1800)
  }

  // Choose icon based on assetType and makeModel
  const getDeviceIcon = (type?: string, model: string = '') => {
    const lower = ((type || '') + ' ' + model).toLowerCase()
    if (lower.includes('wyse') || lower.includes('client')) {
      return (
        <HardDrive className="w-5 h-5 text-[#1D63ED] dark:text-[#60A5FA]" />
      )
    }
    if (lower.includes('laptop') || lower.includes('chromebook')) {
      return <Laptop className="w-5 h-5 text-[#1D63ED] dark:text-[#60A5FA]" />
    }
    if (
      lower.includes('desktop') ||
      lower.includes('pc') ||
      lower.includes('box')
    ) {
      return <Monitor className="w-5 h-5 text-[#1D63ED] dark:text-[#60A5FA]" />
    }
    return <Tag className="w-5 h-5 text-[#1D63ED] dark:text-[#60A5FA]" />
  }

  return (
    <div className="w-full flex-1 flex flex-col space-y-2.5 sm:space-y-3 select-none">
      {/* Toast Notification */}
      <Toast notification={notification} onClose={() => setNotification(null)} />

      {/* Top Header Section & 4 KPI Cards: Sticky below navbar */}
      <div
        ref={cardsRef}
        className="sticky top-12 sm:top-14 z-30 bg-white dark:bg-[#1C1C1C] flex flex-col space-y-2.5 sm:space-y-3 pb-2 -mt-0.5 sm:-mt-1 pt-0.5 transition-colors"
      >
        {/* Top Header Section (Live Pill, Time Pill, Stock Room Filter) */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 sm:gap-2.5 pb-1.5 sm:pb-2 border-b border-[#EAE7DF]/60 dark:border-[#2C2C2C] shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#EDEDED] tracking-tight whitespace-nowrap">
              Stock Room Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Live / WebSocket Connection Status Pill */}
            <ConnectionStatusPill />

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
                <span
                  className={`text-xs sm:text-[13px] font-semibold ${card.titleColor} truncate tracking-normal`}
                >
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

      {/* Main Content Area: Latest Asset Read (Full Width) + Movements Table Below */}
      <div className="w-full flex flex-col space-y-3 sm:space-y-3.5">
        {/* Full Width Dedicated Container: Latest Asset Read Card */}
        <div
          className={`w-full bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#EAE7DF] dark:border-[#2C2C2C] p-3 sm:p-4 flex flex-col shadow-2xs transition-shadow duration-500 ${
            isBlinking && blinkMove === 'IN'
              ? 'animate-shadow-blink-green'
              : isBlinking && blinkMove === 'OUT'
              ? 'animate-shadow-blink-red'
              : ''
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] shrink-0">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isBlinking
                    ? blinkMove === 'OUT'
                      ? 'bg-[#EF4444]'
                      : 'bg-[#10B981]'
                    : activeAsset?.move === 'OUT'
                    ? 'bg-[#EF4444]'
                    : 'bg-[#10B981]'
                } animate-ping`}
              />
              <h3 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#EDEDED]">
                Latest Asset Read
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {isBlinking && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all ${
                    blinkMove === 'OUT'
                      ? 'bg-[#FEF2F2] dark:bg-[#451A1A] text-[#DC2626] dark:text-[#F87171] border border-[#FECACA] dark:border-[#7F1D1D]'
                      : 'bg-[#ECFDF5] dark:bg-[#064E3B] text-[#059669] dark:text-[#34D399] border border-[#A7F3D0] dark:border-[#047857]'
                  }`}
                >
                  {blinkMove} Alert • {blinkSecondsLeft}s
                </span>
              )}
              <span className="text-[10.5px] text-[#99958D] dark:text-[#888888] font-medium">
                Read on EPC detection
              </span>
            </div>
          </div>

          {/* Unified, Well-Organized Asset Details Grid */}
          {!activeAsset ? (
            <div className="py-8 text-center text-xs text-[#99958D]">
              <p className="font-medium">
                No recent RFID asset reads recorded for this stock room.
              </p>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
              {/* Tile 1: Device Identity, IDs & Hardware Identifiers */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#242424] border border-[#EAE7DF]/80 dark:border-[#2F2F2F] transition-all hover:border-[#00a8e7]/30 flex flex-col justify-between">
                {/* Header row: Device icon, Make/Model, Asset ID, Type, Move */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#EAE7DF] dark:border-[#333333] flex items-center justify-center shrink-0 shadow-2xs">
                      {getDeviceIcon(activeAsset.assetType, activeAsset.makeModel)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4
                          className="font-bold text-[#171717] dark:text-[#EDEDED] text-xs sm:text-[13px] leading-snug truncate"
                          title={activeAsset.makeModel}
                        >
                          {activeAsset.makeModel}
                        </h4>
                        {activeAsset.assetId && (
                          <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-[#1C1C1C] border border-[#EAE7DF] dark:border-[#333] text-[9.5px] font-mono font-semibold text-[#64748B] dark:text-[#94A3B8]">
                            ID #{activeAsset.assetId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                        <span className="font-semibold text-[#171717] dark:text-[#D1D5DB]">
                          {activeAsset.assetType}
                        </span>
                        {activeAsset.subAssetType && activeAsset.subAssetType !== activeAsset.assetType && (
                          <>
                            <span>•</span>
                            <span>{activeAsset.subAssetType}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Move Status Badge - OUT is RED, IN is GREEN */}
                  <div className="shrink-0">
                    <TooltipTop content="Click to replay 15s blink alert">
                      <button
                        type="button"
                        onClick={() => triggerBlink(activeAsset.move)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold tracking-wider shrink-0 shadow-xs inline-flex items-center gap-1 cursor-pointer transition-transform active:scale-95 ${
                          activeAsset.move === 'OUT'
                            ? 'bg-[#DC2626] text-white shadow-2xs hover:bg-[#B91C1C]'
                            : 'bg-[#059669] text-white shadow-2xs hover:bg-[#047857]'
                        }`}
                        title="Click to replay 15s blink alert"
                      >
                        {activeAsset.move === 'OUT' ? (
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                        <span>{activeAsset.move}</span>
                      </button>
                    </TooltipTop>
                  </div>
                </div>

                {/* 4 Key Identifier Badges: Asset Tag, Serial Number, RFID EPC, Asset Description */}
                <div className="mt-2.5 pt-2 border-t border-[#EAE7DF]/70 dark:border-[#2C2C2C] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* 1. Asset Tag */}
                  <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-white dark:bg-[#1C1C1C] border border-[#EAE7DF]/70 dark:border-[#303030]">
                    <div className="min-w-0 pr-1">
                      <p className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">
                        Asset Tag
                      </p>
                      <p
                        className="font-mono font-bold text-[#171717] dark:text-[#EDEDED] text-xs truncate"
                        title={activeAsset.assetTag}
                      >
                        {activeAsset.assetTag || '-'}
                      </p>
                    </div>
                    {activeAsset.assetTag && (
                      <TooltipTop content="Copy Asset Tag">
                        <button
                          type="button"
                          onClick={() => handleCopy(activeAsset.assetTag, 'tag')}
                          className="p-1 text-[#94A3B8] hover:text-[#1D63ED] rounded transition-colors cursor-pointer shrink-0"
                          aria-label="Copy Asset Tag"
                        >
                          {copiedKey === 'tag' ? (
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </TooltipTop>
                    )}
                  </div>

                  {/* 2. Serial Number */}
                  <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-white dark:bg-[#1C1C1C] border border-[#EAE7DF]/70 dark:border-[#303030]">
                    <div className="min-w-0 pr-1">
                      <p className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">
                        Serial Number
                      </p>
                      <p
                        className="font-mono font-bold text-[#171717] dark:text-[#EDEDED] text-xs truncate"
                        title={activeAsset.serialNumber}
                      >
                        {activeAsset.serialNumber || '-'}
                      </p>
                    </div>
                    {activeAsset.serialNumber && (
                      <TooltipTop content="Copy Serial Number">
                        <button
                          type="button"
                          onClick={() => handleCopy(activeAsset.serialNumber, 'serial')}
                          className="p-1 text-[#94A3B8] hover:text-[#1D63ED] rounded transition-colors cursor-pointer shrink-0"
                          aria-label="Copy Serial Number"
                        >
                          {copiedKey === 'serial' ? (
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </TooltipTop>
                    )}
                  </div>

                  {/* 3. RFID EPC */}
                  <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-white dark:bg-[#1C1C1C] border border-[#EAE7DF]/70 dark:border-[#303030]">
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 text-[#00a8e7]" />
                        <p className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">
                          RFID EPC
                        </p>
                      </div>
                      <p
                        className="font-mono font-bold text-[#00a8e7] dark:text-[#38bdf8] text-xs truncate tracking-tight"
                        title={activeAsset.rfidEpc}
                      >
                        {activeAsset.rfidEpc || '-'}
                      </p>
                    </div>
                    {activeAsset.rfidEpc && (
                      <TooltipTop content="Copy RFID EPC">
                        <button
                          type="button"
                          onClick={() => handleCopy(activeAsset.rfidEpc, 'epc')}
                          className="p-1 text-[#94A3B8] hover:text-[#00a8e7] rounded transition-colors cursor-pointer shrink-0"
                          aria-label="Copy RFID EPC"
                        >
                          {copiedKey === 'epc' ? (
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </TooltipTop>
                    )}
                  </div>

                  {/* 4. Asset Description */}
                  <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-white dark:bg-[#1C1C1C] border border-[#EAE7DF]/70 dark:border-[#303030]">
                    <div className="min-w-0 pr-1">
                      <p className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">
                        Asset Description
                      </p>
                      <p
                        className="font-bold text-[#1D63ED] dark:text-[#60A5FA] text-xs truncate"
                        title={activeAsset.assetDescription}
                      >
                        {activeAsset.assetDescription || '-'}
                      </p>
                    </div>
                    {activeAsset.assetDescription && (
                      <TooltipTop content="Copy Asset Description">
                        <button
                          type="button"
                          onClick={() => handleCopy(activeAsset.assetDescription, 'desc')}
                          className="p-1 text-[#94A3B8] hover:text-[#1D63ED] rounded transition-colors cursor-pointer shrink-0"
                          aria-label="Copy Asset Description"
                        >
                          {copiedKey === 'desc' ? (
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </TooltipTop>
                    )}
                  </div>
                </div>
              </div>

              {/* Tile 2: Operational, Location & Movement Details */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#242424] border border-[#EAE7DF]/80 dark:border-[#2F2F2F] transition-all hover:border-[#00a8e7]/30 flex flex-col justify-between gap-2.5">
                {/* Section 1: Stockroom */}
                <div className="pb-2 border-b border-[#EAE7DF]/70 dark:border-[#2F2F2F]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-[#00a8e7] shrink-0" />
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                      Stockroom
                    </span>
                  </div>
                  <p
                    className="font-bold text-[#171717] dark:text-[#EDEDED] text-xs sm:text-[13px] break-words leading-tight"
                    title={activeStockroomName}
                  >
                    {activeStockroomName}
                  </p>
                </div>

                {/* Section 2: Asset State & Service Request */}
                <div className="py-1 border-b border-[#EAE7DF]/70 dark:border-[#2F2F2F]">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Asset State
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-bold text-xs ${getAssetStateBadge(activeAsset.assetState)}`}>
                        {activeAsset.assetState || 'InStock'}
                      </span>
                    </div>

                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Service Request (RITM)
                      </p>
                      <div className="flex items-center justify-between gap-1 pt-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-[#00a8e7] shrink-0" />
                          <span
                            className="font-mono font-bold text-[#171717] dark:text-[#EDEDED] text-xs truncate"
                            title={activeServiceRequest}
                          >
                            {activeServiceRequest}
                          </span>
                        </div>
                        {activeServiceRequest && activeServiceRequest !== '-' && (
                          <TooltipTop content="Copy Service Request">
                            <button
                              type="button"
                              onClick={() => handleCopy(activeServiceRequest, 'ritm')}
                              className="p-1 text-[#94A3B8] hover:text-[#00a8e7] rounded transition-colors cursor-pointer shrink-0"
                              aria-label="Copy Service Request"
                            >
                              {copiedKey === 'ritm' ? (
                                <Check className="w-3 h-3 text-[#10B981]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </TooltipTop>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Movement & Movement Date-Time */}
                <div className="pt-0.5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Movement
                      </p>
                      <div
                        className={`flex items-center gap-1 font-bold text-xs ${
                          activeAsset.move === 'OUT'
                            ? 'text-[#DC2626]'
                            : 'text-[#059669]'
                        }`}
                      >
                        {activeAsset.move === 'OUT' ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#DC2626] stroke-[2.5]" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669] stroke-[2.5]" />
                        )}
                        <span>{activeAsset.move}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1">
                        Movement Date-Time
                      </p>
                      <div className="flex items-center gap-1 font-bold text-[#171717] dark:text-[#EDEDED] text-xs tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-[#F5A23A] shrink-0" />
                        <span>
                          {activeAsset.movementDateTime
                            ? activeAsset.movementDateTime
                                .replace('T', ' ')
                                .slice(0, 19)
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Full Div: Asset Movements DataTable Card */}
        <div className="w-full bg-white dark:bg-[#1E1E1E] rounded-2xl border border-[#EAE7DF] dark:border-[#2C2C2C] flex flex-col justify-between shadow-2xs sm:overflow-visible overflow-hidden">
          {/* Table Toolbar Header (Sticky below cards) */}
          <div
            ref={toolbarRef}
            style={{ top: `${cardsBottomOffset}px` }}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6]/80 dark:bg-[#232323] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0 sticky z-25 rounded-t-2xl"
          >
            {/* Left: Search input */}
            <div className="flex items-center gap-2 flex-1 max-w-sm">
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

              <TooltipBottom
                content={
                  !hasData
                    ? 'No data available to export'
                    : isExportingExcel
                    ? `Exporting... ${exportProgress}%`
                    : 'Export Stock Room Dashboard to Excel (.xlsx)'
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

          {/* Table Container */}
          <div className="w-full sm:overflow-visible overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full table-fixed text-left border-collapse select-none text-xs">
              <thead
                style={{ top: `${cardsBottomOffset + toolbarHeight}px` }}
                className="sticky z-20 border-b border-[#EAE7DF] dark:border-[#2C2C2C] shadow-2xs"
              >
                <tr className="bg-[#F4F7FB] dark:bg-[#252830]">
                  <th
                    onClick={() => handleSort('movementDateTime')}
                    className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider w-[18%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors bg-[#F4F7FB] dark:bg-[#252830]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Date-Time</span>
                      <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('assetTag')}
                    className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider w-[15%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors bg-[#F4F7FB] dark:bg-[#252830]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Asset Tag</span>
                      <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('serialNumber')}
                    className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider w-[15%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors bg-[#F4F7FB] dark:bg-[#252830]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Serial No</span>
                      <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('makeModel')}
                    className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider w-[22%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors bg-[#F4F7FB] dark:bg-[#252830]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Make / Model</span>
                      <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('assetDescription')}
                    className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider w-[20%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors bg-[#F4F7FB] dark:bg-[#252830]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Asset Description</span>
                      <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('move')}
                    className="py-1.5 px-2 text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider text-center w-[10%] cursor-pointer hover:text-[#171717] dark:hover:text-white transition-colors bg-[#F4F7FB] dark:bg-[#252830]"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Move</span>
                      <ArrowUpDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody
                ref={tbodyRef}
                className={`divide-y divide-[#EAE7DF]/60 dark:divide-[#2C2C2C] transition-opacity duration-200 ${
                  isLoading ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {movementRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#99958D]">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-4">
                          <Loader2 className="w-4 h-4 animate-spin text-[#1D63ED]" />
                          <span className="font-medium text-xs">
                            Loading movement records...
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium text-xs">
                            No matching movement records found.
                          </p>
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
                        </>
                      )}
                    </td>
                  </tr>
                ) : (
                  movementRows.map((item, idx) => {
                    const { dateStr, timeStr } = formatMovementDateTime(
                      item.movementDateTime
                    )
                    const isTopRow = idx === 0
                    const itemMove = normalizeMove(item.move) || 'IN'
                    const isMoveOut = itemMove === 'OUT'
                    const rowKey = item.rfidEpc || item.assetTag || String(item.assetId)
                    const isPromoted = recentlyPromotedKey === rowKey

                    // Only the latest record at index 0 keeps green or red bg; all other rows use odd/even colors
                    const rowBgClass = isTopRow
                      ? isMoveOut
                        ? 'bg-[#FEF2F2] dark:bg-[#451A1A]/30 hover:bg-[#FEE2E2] dark:hover:bg-[#451A1A]/45'
                        : 'bg-[#ECFDF5] dark:bg-[#064E3B]/25 hover:bg-[#D1FAE5] dark:hover:bg-[#064E3B]/40'
                      : idx % 2 === 0
                      ? 'bg-white dark:bg-[#1E1E1E] hover:bg-[#F3F0E6] dark:hover:bg-[#252525]'
                      : 'bg-[#F9F8F5] dark:bg-[#181818] hover:bg-[#F3F0E6] dark:hover:bg-[#252525]'

                    const rowBorderClass = isTopRow
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
                        key={rowKey}
                        data-row-key={rowKey}
                        data-row-index={idx}
                        className={`group transition-colors border-b ${rowBorderClass} ${
                          promotionClass || rowBgClass
                        }`}
                      >
                        {/* Date-Time */}
                        <td className="py-1 px-2.5 whitespace-nowrap leading-tight">
                          <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal mb-0.5">
                            {dateStr}
                          </div>
                          <div className="font-bold text-[#171717] dark:text-[#EDEDED] tabular-nums text-xs">
                            {timeStr}
                          </div>
                        </td>

                        {/* Asset Tag */}
                        <td className="py-1 px-2.5 font-bold text-[#1D63ED] dark:text-[#60A5FA] tabular-nums text-xs whitespace-nowrap">
                          {item.assetTag}
                        </td>

                        {/* Serial No */}
                        <td className="py-1 px-2.5 font-medium text-[#171717] dark:text-[#EDEDED] text-xs whitespace-nowrap">
                          {item.serialNumber}
                        </td>

                        {/* Make / Model */}
                        <td className="py-1 px-2.5 font-medium text-[#171717] dark:text-[#EDEDED] text-xs">
                          <div
                            className="truncate max-w-[130px] sm:max-w-[150px]"
                            title={item.makeModel}
                          >
                            {item.makeModel}
                          </div>
                        </td>

                        {/* Asset Description */}
                        <td className="py-1 px-2.5 text-[#475569] dark:text-[#94A3B8] text-xs font-medium">
                          <div
                            className="truncate max-w-[130px] sm:max-w-[160px]"
                            title={
                              item.assetDescription ||
                              item.subAssetType ||
                              item.assetType
                            }
                          >
                            {item.assetDescription ||
                              item.subAssetType ||
                              item.assetType}
                          </div>
                        </td>

                        {/* Move (Badge inside uniform row background) */}
                        <td className="py-1 px-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleRowMoveToggle(item)}
                            title="Click to toggle IN/OUT status and slide row to top"
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-2xs ${
                              isMoveOut
                                ? 'bg-[#FEE2E2] dark:bg-[#7F1D1D] text-[#DC2626] dark:text-[#FCA5A5] border border-[#FECACA] dark:border-[#991B1B]/50 hover:bg-[#FCD8D8]'
                                : 'bg-[#D1FAE5] dark:bg-[#065F46] text-[#059669] dark:text-[#6EE7B7] border border-[#A7F3D0] dark:border-[#047857]/50 hover:bg-[#A7F3D0]'
                            }`}
                          >
                            {isMoveOut ? (
                              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                            ) : (
                              <ArrowDownLeft className="w-3 h-3 stroke-[2.5]" />
                            )}
                            <span>{itemMove}</span>
                          </button>
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
              {/* Previous Button */}
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
              <TooltipTop content="Next page" disabled={currentPage >= totalPages || isAll}>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages || isAll}
                  className="w-6 h-6 flex items-center justify-center rounded-lg border border-[#EAE7DF] dark:border-[#333333] bg-white dark:bg-[#181818] text-[#171717] dark:text-[#EDEDED] hover:bg-[#171717] hover:text-white dark:hover:bg-white dark:hover:text-[#171717] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </TooltipTop>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
