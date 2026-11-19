import { useState, useEffect, useRef } from 'react'
import { Store, Search, ChevronDown, Check } from 'lucide-react'

export interface StoreItem {
  id: string
  storeCode: string
  name: string
  location: string
}

export const DUMMY_STORES: StoreItem[] = [
  { id: 'all', storeCode: '', name: 'All Stores', location: 'All Locations' },
  { id: 'store-1', storeCode: 'STR-001', name: 'Store 1', location: 'Bengaluru, Central Hub' },
  { id: 'store-2', storeCode: 'STR-002', name: 'Store 2', location: 'Mumbai, West Warehouse' },
  { id: 'store-3', storeCode: 'STR-003', name: 'Store 3', location: 'Delhi, North Logistics' },
  { id: 'store-4', storeCode: 'STR-004', name: 'Store 4', location: 'Hyderabad, Tech Zone' },
  { id: 'store-5', storeCode: 'STR-005', name: 'Store 5', location: 'Chennai, South Terminal' },
  { id: 'store-6', storeCode: 'STR-006', name: 'Store 6', location: 'Pune, Logistics Hub' }
]

interface StoreFilterProps {
  selectedStore?: string
  defaultStore?: string
  onStoreChange?: (storeId: string) => void
  stores?: StoreItem[]
  className?: string
}

/**
 * StoreFilter Component
 * Standalone, reusable dropdown component for selecting a store with search.
 */
export default function StoreFilter({
  selectedStore: controlledStore,
  defaultStore = 'all',
  onStoreChange,
  stores = DUMMY_STORES,
  className = ''
}: StoreFilterProps) {
  const [internalStore, setInternalStore] = useState(defaultStore)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentStoreId = controlledStore !== undefined ? controlledStore : internalStore
  const currentStore = stores.find((s) => s.id === currentStoreId) || stores[0] || {
    id: 'all',
    storeCode: '',
    name: 'All Stores',
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

  const handleSelect = (storeId: string) => {
    if (controlledStore === undefined) {
      setInternalStore(storeId)
    }
    setIsOpen(false)
    setSearchQuery('')
    if (onStoreChange) {
      onStoreChange(storeId)
    }
  }

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.storeCode && s.storeCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-3 bg-white dark:bg-[#1E1E1E] border border-[#EAE7DF] dark:border-[#2C2C2C] hover:border-[#D5D0C6] dark:hover:border-[#383838] rounded-2xl flex items-center justify-between gap-2 text-xs font-semibold text-[#171717] dark:text-[#EDEDED] transition-all cursor-pointer min-w-[160px] sm:min-w-[190px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 truncate">
          <Store className="w-3.5 h-3.5 text-[#00a8e7] shrink-0" />
          <span className="truncate text-xs">{currentStore.name}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#99958D] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Store Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-[#1C1C1C] border border-[#EAE7DF] dark:border-[#2C2C2C] rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
          {/* Search Box */}
          <div className="p-2.5 border-b border-[#EAE7DF]/70 dark:border-[#2C2C2C] bg-[#FAF9F6] dark:bg-[#232323]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#99958D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search store name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-[#181818] rounded-2xl border border-[#EAE7DF] dark:border-[#333333] outline-none focus:border-[#00a8e7] focus:ring-1 focus:ring-[#00a8e7]/20 transition-all text-[#171717] dark:text-[#EDEDED] placeholder-[#99958D]"
                autoFocus
              />
            </div>
          </div>

          {/* Store List */}
          <div className="max-h-52 overflow-y-auto py-1" role="listbox">
            {filteredStores.length === 0 ? (
              <p className="px-3 py-3 text-xs text-[#99958D] font-medium text-center">
                No matching stores found
              </p>
            ) : (
              filteredStores.map((store) => {
                const isSelected = currentStoreId === store.id
                return (
                  <button
                    key={store.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(store.id)}
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
                      <p className="text-[10.5px] text-[#888888] dark:text-[#777777]">
                        {store.location}
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
