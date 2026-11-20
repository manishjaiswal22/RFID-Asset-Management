import React, { useState, useRef, useEffect } from 'react'
import { Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import wiproLogo from '../assets/wipro_new_logo.svg'
import wiproLogoWhite from '../assets/wipro_new_logo_white.svg'

interface HeaderProps {
  pageTitle: string
  onLogout: () => void
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()

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
    <header className="sticky top-0 z-50 h-12 sm:h-14 px-3 sm:px-5 flex items-center justify-between select-none shrink-0 bg-[#F6F5F1]/95 dark:bg-[#121212]/95 backdrop-blur-md border-b border-[#EAE7DF]/60 dark:border-[#2C2C2C]/60 transition-colors">
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        <div className="px-1 sm:px-0 py-1 sm:py-0 flex items-center shrink-0">
          <img
            src={theme === 'dark' ? wiproLogoWhite : wiproLogo}
            alt="Wipro"
            className="h-7 sm:h-8.5 w-auto object-contain"
            style={{ maxWidth: '115px' }}
          />
        </div>

        <h1 className="hidden md:block text-sm sm:text-base font-bold text-[#171717] dark:text-[#EDEDED] tracking-wider uppercase whitespace-nowrap">
          HAM Pro Asset Management System
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 sm:w-9.5 sm:h-9.5 flex items-center justify-center rounded-xl text-[#666666] dark:text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white hover:bg-[#EDEAE2] dark:hover:bg-[#252525] transition-colors cursor-pointer border border-[#EAE7DF] dark:border-[#2C2C2C] bg-white dark:bg-[#1E1E1E]"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#F5A23A]" />
          ) : (
            <Moon className="w-4 h-4 text-[#171717]" />
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-9 sm:h-9.5 flex items-center gap-2 pl-2 pr-3 rounded-xl border border-[#EAE7DF] dark:border-[#2C2C2C] bg-white dark:bg-[#1E1E1E] hover:bg-[#FAF9F6] dark:hover:bg-[#252525] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-[#F5F3EE] dark:bg-[#282828] border border-[#EAE7DF] dark:border-[#333333] flex items-center justify-center text-[#171717] dark:text-white shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[#171717] dark:text-[#EDEDED] whitespace-nowrap">
              Welcome Admin
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#99958D] shrink-0" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#1C1C1C] border border-[#EAE7DF] dark:border-[#2E2E2E] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#FAF9F6] dark:bg-[#252525] border border-[#EAE7DF]/70 dark:border-[#333333] mb-1">
                <div className="w-7 h-7 rounded-lg bg-[#F5F3EE] dark:bg-[#303030] border border-[#EAE7DF] dark:border-[#3C3C3C] flex items-center justify-center text-[#171717] dark:text-white shrink-0">
                  <User className="w-4 h-4 text-[#171717] dark:text-white" />
                </div>
                <span className="text-xs font-semibold text-[#171717] dark:text-[#EDEDED]">Admin</span>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false)
                  onLogout()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#C75A54] dark:text-[#E57373] hover:bg-[#FDF4F4] dark:hover:bg-[#2A1818] rounded-xl transition-colors cursor-pointer"
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
