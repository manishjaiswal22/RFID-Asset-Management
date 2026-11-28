import React from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

export interface ToastNotification {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

interface ToastProps {
  notification: ToastNotification | null
  onClose?: () => void
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  if (!notification) return null

  const getStyle = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#064E3B] dark:text-[#A7F3D0] dark:border-[#059669]'
      case 'warning':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] dark:bg-[#451A03] dark:text-[#FDE68A] dark:border-[#D97706]'
      case 'info':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] dark:bg-[#1E3A8A] dark:text-[#BFDBFE] dark:border-[#2563EB]'
      case 'error':
      default:
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] dark:bg-[#451A1A] dark:text-[#FECACA] dark:border-[#DC2626]'
    }
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 shrink-0" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 shrink-0" />
      case 'info':
        return <Info className="w-4 h-4 shrink-0" />
      case 'error':
      default:
        return <XCircle className="w-4 h-4 shrink-0" />
    }
  }

  return (
    <div className="fixed top-14 sm:top-20 left-3 right-3 sm:left-auto sm:right-6 z-[9999] flex justify-center sm:justify-end animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none">
      <div
        role="alert"
        onClick={onClose}
        className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold select-none border backdrop-blur-md cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] pointer-events-auto max-w-full ${getStyle()}`}
      >
        {getIcon()}
        <span className="break-words">{notification.message}</span>
      </div>
    </div>
  )
}
