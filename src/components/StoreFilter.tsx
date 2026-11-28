import { useState, useEffect, useRef, useMemo } from 'react'
import { Building2, Search, ChevronDown, Check, X, Loader2 } from 'lucide-react'
import { DUMMY_STORE_RECORDS } from '../data/storesData'
import { dashboardService } from '../services/dashboardService'
import { authService } from '../services/authService'
import { searchService } from '../services/searchService'
import type { AuthUser } from '../types/auth'
import { TooltipBottom } from './Tooltip'
import { matchStockroomSearch } from '../utils/stockroomSearch'
import { useDebounce } from '../utils/useDebounce'

export interface StoreItem {
  id: string
  storeCode: string
  name: string
  location?: string
  keywords?: string
}

const DUMMY_STORES: StoreItem[] = [
  { id: 'all', storeCode: '', name: 'All Stock Rooms', location: '', keywords: 'all stock rooms' },
  ...DUMMY_STORE_RECORDS.map((s) => ({
    id: s.id,
    storeCode: s.storeCode,
    name: s.storeName,
    location: s.location,
    keywords: s.keywords
  }))
]

interface StoreFilterProps {
  currentUser?: AuthUser | null
  selectedStore?: string
  defaultStore?: string
  onStoreChange?: (storeId: string) => void
  stores?: StoreItem[]
  className?: string
}

/**
 * StoreFilter Component
 * Standalone, reusable dropdown component for selecting a stock room with tokenized search.
 */
export default function StoreFilter({
  currentUser,
  selectedStore: controlledStore,
  defaultStore,
  onStoreChange,
  stores: externalStores,
  className = ''
}: StoreFilterProps) {
  const activeUser = currentUser ?? authService.getUser()
  const isAdmin = (activeUser?.userType || '').toUpperCase() === 'ADMIN'

  const computedDefaultStore = defaultStore !== undefined ? defaultStore : (isAdmin ? 'all' : '')
  const [internalStore, setInternalStore] = useState(computedDefaultStore)
  const [selectedStoreCache, setSelectedStoreCache] = useState<Record<string, StoreItem>>({})
  const [searchQuery, setSearchQuery] = useState('')
  // Debounce search query by 250ms to prevent rapid keystroke queries & re-render thrashing
  const debouncedSearch = useDebounce(searchQuery, 250)
  const [isOpen, setIsOpen] = useState(false)
  const [apiStores, setApiStores] = useState<StoreItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<StoreItem[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only fetch if externalStores is not explicitly provided with custom data
    if (externalStores && externalStores !== DUMMY_STORES && externalStores.length > 0) {
      return
    }

    let mounted = true
    setIsLoading(true)
    dashboardService
      .getStockrooms()
      .then((data) => {
        if (mounted && data?.length) {
          const mapped: StoreItem[] = [
            ...(isAdmin ? [{ id: 'all', storeCode: '', name: 'All Stock Rooms', location: '' }] : []),
            ...data.map((item) => ({
              id: String(item.stockroomId),
              storeCode: `SR-${item.stockroomId}`,
              name: item.stockroomName,
              location: item.stockroomName,
              keywords: item.stockroomName
            }))
          ]
          setApiStores(mapped)
        }
      })
      .catch((err) => {
        console.warn('StoreFilter: Could not fetch stockrooms from API', err)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [externalStores, isAdmin])

  const rawStores =
    externalStores && externalStores !== DUMMY_STORES && externalStores.length > 0
      ? externalStores
      : apiStores.length > 0
        ? apiStores
        : DUMMY_STORES

  // For non-admin (e.g. user type), strictly filter out "All Stock Rooms" / id: 'all'
  const stores = useMemo(() => {
    if (isAdmin) {
      return rawStores
    }
    return rawStores.filter((s) => s.id !== 'all' && s.name.toLowerCase() !== 'all stock rooms')
  }, [rawStores, isAdmin])

  const isMatch = (store: StoreItem, targetId?: string) => {
    if (!targetId) return false
    if (store.id === targetId) return true
    if (targetId !== 'all') {
      if (store.id === `stock-${targetId}` || `stock-${store.id}` === targetId) return true
      if (store.name.toLowerCase() === targetId.toLowerCase()) return true
    }
    return false
  }

  const currentStoreId = controlledStore !== undefined ? controlledStore : internalStore
  const currentStore =
    stores.find((s) => isMatch(s, currentStoreId)) ||
    selectedStoreCache[currentStoreId] ||
    stores[0] || {
      id: isAdmin ? 'all' : '',
      storeCode: '',
      name: isAdmin ? 'All Stock Rooms' : 'Stock Room',
      location: ''
    }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (storeOrId: StoreItem | string) => {
    const storeId = typeof storeOrId === 'string' ? storeOrId : storeOrId.id
    if (!isAdmin && storeId === 'all') return

    if (typeof storeOrId === 'object') {
      setSelectedStoreCache((prev) => ({
        ...prev,
        [storeOrId.id]: storeOrId
      }))
    }

    if (controlledStore === undefined) {
      setInternalStore(storeId)
    }
    setIsOpen(false)
    setSearchQuery('')
    if (onStoreChange) {
      onStoreChange(storeId)
    }
  }

  // Check if debounce is currently pending (user is actively typing)
  const isDebouncing = searchQuery.trim() !== debouncedSearch.trim() && searchQuery.trim().length > 0

  // Live suggestions from GET /api/search/suggestions?q={q}&limit=10
  useEffect(() => {
    if (!isOpen || !debouncedSearch.trim()) {
      setSuggestions(null)
      setIsSearching(false)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      return
    }

    const trimmed = debouncedSearch.trim()
    setIsSearching(true)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller
    let active = true

    const fetchSuggestions = async () => {
      try {
        const existingStockrooms = stores.map((s) => ({
          stockroomId: Number(s.id) || 0,
          stockroomName: s.name
        }))

        const res = await searchService.getSuggestions(
          trimmed,
          10,
          existingStockrooms,
          controller.signal
        )

        if (!active) return

        if (res && res.length > 0) {
          const mapped: StoreItem[] = res.map((item) => ({
            id: String(item.stockroomId),
            storeCode: `SR-${item.stockroomId}`,
            name: item.stockroomName,
            location: item.stockroomName,
            keywords: item.stockroomName
          }))
          setSuggestions(mapped)
        } else {
          setSuggestions([])
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && active) {
          console.warn('StoreFilter: suggestions API failed, falling back to client filter', err)
          setSuggestions(null)
        }
      } finally {
        if (active) {
          setIsSearching(false)
        }
      }
    }

    fetchSuggestions()

    return () => {
      active = false
      controller.abort()
    }
  }, [debouncedSearch, isOpen, stores])

  // Display stores: use live suggestions if available, else fallback to client-side tokenized & alias-aware search
  const displayStores = useMemo(() => {
    if (suggestions && suggestions.length > 0) {
      if (isAdmin && matchStockroomSearch('All Stock Rooms', debouncedSearch)) {
        return [{ id: 'all', storeCode: '', name: 'All Stock Rooms', location: '' }, ...suggestions]
      }
      return suggestions
    }

    return stores.filter((s) => {
      if (s.id === 'all') return isAdmin
      return matchStockroomSearch(s.name, debouncedSearch, s.keywords, s.storeCode || s.id)
    })
  }, [suggestions, stores, isAdmin, debouncedSearch])

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={currentStore.name}
        className="w-full sm:w-auto h-8 px-3 bg-white dark:bg-[#1E1E1E] border border-[#EAE7DF] dark:border-[#2C2C2C] hover:border-[#D5D0C6] dark:hover:border-[#383838] rounded-2xl flex items-center justify-between gap-2 text-xs font-semibold text-[#171717] dark:text-[#EDEDED] transition-all cursor-pointer sm:min-w-[190px] max-w-full sm:max-w-[340px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 truncate">
          <Building2 className="w-3.5 h-3.5 text-[#00a8e7] shrink-0" />
          <span className="truncate text-xs">{currentStore.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isAdmin && currentStore.id !== 'all' && (
            <TooltipBottom content="Reset to All Stock Rooms">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelect('all')
                }}
                className="p-0.5 rounded-full hover:bg-[#EAE7DF] dark:hover:bg-[#333333] text-[#99958D] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Reset to All Stock Rooms"
              >
                <X className="w-3 h-3" />
              </span>
            </TooltipBottom>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#99958D] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Stock Room Dropdown Menu (Wider to display full stock room names cleanly, safe on mobile) */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto right-0 mt-1.5 w-full sm:w-96 min-w-[250px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1C1C1C] border border-[#EAE7DF] dark:border-[#2C2C2C] rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
          {/* Search Box */}
          <div className="p-2.5 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6] dark:bg-[#232323]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#99958D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stock room name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-[#181818] rounded-2xl border border-[#EAE7DF] dark:border-[#333333] outline-none focus:border-[#00a8e7] focus:ring-1 focus:ring-[#00a8e7]/20 transition-all text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D]"
                autoFocus
              />
              {isSearching || isDebouncing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00a8e7] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#99958D] hover:text-[#171717] dark:hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Stock Room List */}
          <div className="max-h-60 overflow-y-auto py-1" role="listbox">
            {isLoading && stores.length <= 1 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-[#99958D] font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00a8e7]" />
                <span>Loading stock rooms...</span>
              </div>
            ) : displayStores.length === 0 ? (
              <p className="px-3 py-3 text-xs text-[#99958D] font-medium text-center">
                No matching stock rooms found
              </p>
            ) : (
              displayStores.map((store) => {
                const isSelected = isMatch(store, currentStore.id) || isMatch(store, currentStoreId)
                return (
                  <button
                    key={store.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(store)}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#00a8e7]/10 text-[#00a8e7] font-semibold'
                        : 'text-[#555555] dark:text-[#A0A0A0] hover:bg-[#FAF9F6] dark:hover:bg-[#252525] hover:text-[#171717] dark:hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-[#171717] dark:text-[#EDEDED] truncate text-xs">
                        {store.name}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#00a8e7] shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { StoreFilter }
