import React, { useState } from 'react'
import { X } from 'lucide-react'
import type { StoreLocation } from '../types/dashboard'

interface AddStoreModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (store: Omit<StoreLocation, 'id'>) => void
}

export const AddStoreModal: React.FC<AddStoreModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [city, setCity] = useState('')
  const [manager, setManager] = useState('')
  const [activeReaders, setActiveReaders] = useState(4)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code) return
    onAdd({
      name,
      code,
      city,
      manager,
      totalAssets: 0,
      activeReaders: Number(activeReaders),
      status: 'active'
    })
    setName('')
    setCode('')
    setCity('')
    setManager('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-[22px] bg-[#FAF9F6] border border-[#EAE7DF] shadow-xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#EAE7DF]">
          <h3 className="text-base font-semibold text-[#171717]">Add Store Location</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#99958D] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1">
              Store Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pune Logistics Hub"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs text-[#171717] outline-none focus:border-[#F5A23A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1">
                Store Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="WPR-PUN-05"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs text-[#171717] outline-none focus:border-[#F5A23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Pune"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs text-[#171717] outline-none focus:border-[#F5A23A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1">
              Store Manager
            </label>
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs text-[#171717] outline-none focus:border-[#F5A23A]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1">
              Initial Readers Allocated
            </label>
            <input
              type="number"
              min={1}
              value={activeReaders}
              onChange={(e) => setActiveReaders(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs text-[#171717] outline-none focus:border-[#F5A23A]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#EAE7DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#666666] hover:bg-[#EDEAE2] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#171717] text-white hover:bg-black transition-colors cursor-pointer shadow-sm"
            >
              Save Store
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
