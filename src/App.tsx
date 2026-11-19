import React, { useState, useEffect } from 'react'
import { DashboardLayout } from './components/DashboardLayout'
import { WarehouseFullBackgroundScene } from './components/WarehouseFullBackgroundScene'
import { LoginForm } from './components/LoginForm'
import { BottomCurvedFooter } from './components/BottomCurvedFooter'
import { WiproLoader } from './components/WiproLoader'
import { useTheme } from './context/ThemeContext'
import wiproLogo from './assets/wipro_new_logo.svg'
import wiproLogoWhite from './assets/wipro_new_logo_white.svg'

export const App: React.FC = () => {
  const [view, setView] = useState<'login' | 'dashboard'>('login')
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const { theme } = useTheme()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 850)
    return () => clearTimeout(timer)
  }, [])

  if (isInitialLoading) {
    return <WiproLoader />
  }

  if (view === 'dashboard') {
    return (
      <DashboardLayout
        onLogout={() => {
          setView('login')
        }}
      />
    )
  }

  return (
    <div className="h-screen max-h-screen w-full bg-[#F6F5F1] dark:bg-[#121212] text-[#171717] dark:text-[#EDEDED] flex flex-col justify-between relative select-none overflow-hidden">
      <WarehouseFullBackgroundScene />

      <header className="relative z-20 px-4 sm:px-8 lg:px-14 pt-3 sm:pt-4 pb-1 flex items-center justify-between shrink-0">
        <div className="px-1 py-1 flex items-center">
          <img
            src={theme === 'dark' ? wiproLogoWhite : wiproLogo}
            alt="Wipro"
            className="h-8 sm:h-9 w-auto object-contain"
            style={{ maxWidth: '160px' }}
          />
        </div>
      </header>

      <main className="relative z-10 flex-1 min-h-0 flex items-center justify-center lg:justify-end px-4 sm:px-8 lg:px-16 xl:px-24 py-1">
        <div className="w-full max-w-[420px] sm:max-w-[460px] my-auto">
          <LoginForm
            onLoginSuccess={() => {
              setView('dashboard')
            }}
          />
        </div>
      </main>

      <div className="relative z-20 shrink-0">
        <BottomCurvedFooter />
      </div>
    </div>
  )
}

export default App
