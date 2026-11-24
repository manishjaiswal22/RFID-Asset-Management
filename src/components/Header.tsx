import React, { useState, useRef, useEffect } from 'react'
import { Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { TooltipBottom } from './Tooltip'
import type { AuthUser } from '../types/auth'
import wiproLogo from '../assets/wipro_new_logo.svg'
import wiproLogoWhite from '../assets/wipro_new_logo_white.svg'

interface HeaderProps {
  pageTitle: string
  onLogout: () => void
  userName?: string
  currentUser?: AuthUser | null
}

export const Header: React.FC<HeaderProps> = ({ onLogout, userName, currentUser }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()

  const displayName = currentUser?.userName || userName || 'Admin'
  const displayRole = currentUser?.userType || 'ADMIN'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-[50] h-12 sm:h-14 pl-1.5 sm:pl-2.5 pr-2.5 sm:pr-4 flex items-center justify-between select-none shrink-0 bg-[#F6F5F1] dark:bg-[#121212] border-b border-[#EAE7DF]/60 dark:border-[#2C2C2C]/60 transition-colors">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center shrink-0">
          <img
            src={theme === 'dark' ? wiproLogoWhite : wiproLogo}
            alt="Wipro"
            className="h-7 sm:h-8.5 w-auto object-contain"
            style={{ maxWidth: '115px' }}
          />
        </div>

        <h1 className="block text-xs sm:text-sm md:text-base font-bold text-[#171717] dark:text-[#EDEDED] tracking-wider uppercase whitespace-nowrap truncate">
          HAM Pro Asset Management System
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <TooltipBottom content={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-9.5 sm:h-9.5 flex items-center justify-center rounded-xl text-[#666666] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white hover:bg-[#EDEAE2] dark:hover:bg-[#252525] transition-colors cursor-pointer border border-[#EAE7DF] dark:border-[#2C2C2C] bg-white dark:bg-[#1E1E1E]"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#F5A23A]" />
            ) : (
              <Moon className="w-4 h-4 text-[#171717]" />
            )}
          </button>
        </TooltipBottom>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-9 sm:h-9.5 flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 rounded-xl border border-[#EAE7DF] dark:border-[#2C2C2C] bg-white dark:bg-[#1E1E1E] hover:bg-[#FAF9F6] dark:hover:bg-[#252525] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-[#F5F3EE] dark:bg-[#282828] border border-[#EAE7DF] dark:border-[#333333] flex items-center justify-center text-[#171717] dark:text-white shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-semibold text-[#171717] dark:text-[#EDEDED] whitespace-nowrap">
                Welcome {displayName}
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-[#1D63ED]/10 text-[#1D63ED] dark:text-[#60A5FA] border border-[#1D63ED]/20">
                {displayRole}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#99958D] shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1C1C1C] border border-[#EAE7DF] dark:border-[#2E2E2E] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* User Profile Card */}
              <div className="p-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#252525] border border-[#EAE7DF]/70 dark:border-[#333333] mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1D63ED]/10 dark:bg-[#1D63ED]/20 border border-[#1D63ED]/30 flex items-center justify-center text-[#1D63ED] dark:text-[#60A5FA] shrink-0 font-bold text-xs uppercase">
                    {displayName.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#171717] dark:text-[#EDEDED] truncate">
                      {displayName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] font-semibold text-[#666666] dark:text-[#A0A0A0]">Type:</span>
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase tracking-wider bg-[#1D63ED]/10 text-[#1D63ED] dark:text-[#60A5FA] border border-[#1D63ED]/20">
                        {displayRole}
                      </span>
                    </div>
                  </div>
                </div>

                {currentUser?.stockroomName && (
                  <div className="mt-2 pt-2 border-t border-[#EAE7DF]/60 dark:border-[#333333]">
                    <div className="text-[9.5px] font-semibold text-[#888888] dark:text-[#777777] uppercase tracking-wider">
                      Assigned Stock Room
                    </div>
                    <div className="text-xs font-semibold text-[#171717] dark:text-[#EDEDED] truncate mt-0.5" title={currentUser.stockroomName}>
                      {currentUser.stockroomName}
                    </div>
                  </div>
                )}

                {currentUser?.email && (
                  <div className="mt-1.5 text-[11px] text-[#666666] dark:text-[#999999] truncate">
                    {currentUser.email}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false)
                  onLogout()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#DC2626] dark:text-[#F87171] hover:bg-[#FEF2F2] dark:hover:bg-[#451A1A]/30 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
