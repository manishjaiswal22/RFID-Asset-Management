import React, { useState } from 'react'
import { X } from 'lucide-react'
import type { RFIDReader } from '../types/dashboard'

interface AddReaderModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (reader: Omit<RFIDReader, 'id' | 'lastSync'>) => void
}

export const AddReaderModal: React.FC<AddReaderModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [name, setName] = useState('')
  const [model, setModel] = useState('Zebra FX9600')
  const [ipAddress, setIpAddress] = useState('')
  const [zone, setZone] = useState('Inbound Gate 01')
  const [antennaCount, setAntennaCount] = useState(4)
  const [status, setStatus] = useState<'online' | 'offline'>('online')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !ipAddress) return
    onAdd({
      name,
      model,
      ipAddress,
      zone,
      antennaCount: Number(antennaCount),
      status
    })
    setName('')
    setIpAddress('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-[22px] bg-[#FAF9F6] border border-[#EAE7DF] shadow-xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#EAE7DF]">
          <h3 className="text-base font-semibold text-[#171717]">Add RFID Reader</h3>
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
              Reader Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main Gate Portal A"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs text-[#171717] outline-none focus:border-[#F5A23A]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1">
              Reader Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs text-[#171717] outline-none focus:border-[#F5A23A] cursor-pointer"
            >
              <option value="Zebra FX9600">Zebra FX9600 (Fixed)</option>
              <option value="Impinj Speedway R420">Impinj Speedway R420</option>
              <option value="Alien ALR-F800">Alien ALR-F800 Enterprise</option>
              <option value="Zebra TC26 Handheld">Zebra TC26 (Handheld Terminal)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1">
              IP Address
            </label>
            <input
              type="text"
              required
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="192.168.1.120"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs text-[#171717] outline-none focus:border-[#F5A23A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1">
                Zone / Dock
              </label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="Inbound Dock 01"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs text-[#171717] outline-none focus:border-[#F5A23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1">
                Antennas
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={antennaCount}
                onChange={(e) => setAntennaCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs text-[#171717] outline-none focus:border-[#F5A23A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'online' | 'offline')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE7DF] text-xs text-[#171717] outline-none focus:border-[#F5A23A] cursor-pointer"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
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
              Save Reader
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
