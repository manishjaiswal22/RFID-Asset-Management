import React from 'react'
import vyaptiLogo from '../assets/vyapti_logo.png'
import vyaptiLogoWhite from '../assets/vyapti_logo_white.png'
import { useTheme } from '../context/ThemeContext'

export const BottomCurvedFooter: React.FC = () => {
  const { theme } = useTheme()

  return (
    <footer className="relative w-full flex items-end justify-between select-none overflow-hidden shrink-0">
      <div className="flex items-end shrink-0">
        <div className="bg-[#171717] h-12 sm:h-14 pl-4 sm:pl-8 pr-3 sm:pr-5 flex items-center shrink-0 z-10">
          <div className="flex flex-col justify-center">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide whitespace-nowrap">
              Version 1.0.0
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#99958D] font-medium hidden xs:block whitespace-nowrap">
              RFID Tag Management System
            </span>
          </div>
        </div>

        <svg
          className="h-12 sm:h-14 w-12 sm:w-20 shrink-0 fill-[#171717] block"
          viewBox="0 0 100 64"
          preserveAspectRatio="none"
        >
          <path d="M 0,0 C 50,0 50,64 100,64 L 0,64 Z" />
        </svg>
      </div>

      <div className="flex-1 h-12 sm:h-14 flex items-center justify-end px-3 sm:px-8 gap-2 sm:gap-2.5 text-[#666666] dark:text-[#A0A0A0] min-w-0">
        <span className="text-xs sm:text-sm text-[#666666] dark:text-[#A0A0A0] font-normal whitespace-nowrap">
          Designed &amp; Developed by
        </span>
        <img
          src={theme === 'dark' ? vyaptiLogoWhite : vyaptiLogo}
          alt="Vyapti"
          className="h-7 sm:h-8 md:h-8.5 w-auto object-contain shrink-0"
          style={{ maxHeight: '34px' }}
        />
      </div>
    </footer>
  )
}
