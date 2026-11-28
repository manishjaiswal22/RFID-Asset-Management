import React from 'react'
import vyaptiLogo from '../assets/vyapti_logo.png'
import vyaptiLogoWhite from '../assets/vyapti_logo_white.png'
import { useTheme } from '../context/ThemeContext'

export const DashboardFooter: React.FC = () => {
  const { theme } = useTheme()

  return (
    <footer className="min-h-11 sm:h-13 px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 bg-[#F6F5F1] dark:bg-[#121212] text-xs text-[#666666] dark:text-[#A0A0A0] select-none shrink-0 border-t border-[#EAE7DF]/40 dark:border-[#262626]">
      <div className="shrink-0">
        <span className="font-semibold text-[#171717] dark:text-[#EDEDED] text-[11px] sm:text-sm">
          Version 1.0.0
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        <span className="text-[11px] sm:text-sm text-[#666666] dark:text-[#A0A0A0] font-normal whitespace-nowrap truncate">
          Designed &amp; Developed by
        </span>
        <img
          src={theme === 'dark' ? vyaptiLogoWhite : vyaptiLogo}
          alt="Vyapti"
          className="h-6 sm:h-8 md:h-8.5 w-auto object-contain shrink-0"
          style={{ maxHeight: '34px' }}
        />
      </div>
    </footer>
  )
}
