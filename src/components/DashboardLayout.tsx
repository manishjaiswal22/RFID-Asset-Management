import React, { useState } from 'react'
import type { NavMenu } from '../types/dashboard'
import type { AuthUser } from '../types/auth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { DashboardFooter } from './DashboardFooter'
import { CentralDashboard } from './CentralDashboard'
import { StoreDashboard } from './StoreDashboard'
import { UserMaster } from './UserMaster'
import { StoreMaster } from './StoreMaster'
import { ReportsView } from './ReportsView'

interface DashboardLayoutProps {
  onLogout: () => void
  currentUser?: AuthUser | null
}

const getInitialMenu = (user?: AuthUser | null): NavMenu => {
  if (!user || !user.allowedSections || user.allowedSections.length === 0) {
    return 'central'
  }
  const allowed = user.allowedSections
  if (allowed.includes('Central Dashboard')) return 'central'
  if (allowed.includes('Stock Room Dashboard')) return 'store'
  if (allowed.includes('User Master')) return 'user-master'
  if (allowed.includes('Stock Room Master')) return 'store-master'
  if (allowed.includes('Report')) return 'report'
  return 'store'
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onLogout, currentUser }) => {
  const [activeMenu, setActiveMenu] = useState<NavMenu>(() => getInitialMenu(currentUser))
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [centralSearchQuery, setCentralSearchQuery] = useState<string>('')
  const [stockRoomDashboardStoreId, setStockRoomDashboardStoreId] = useState<string>(() => {
    if (currentUser?.stockroomId) {
      return currentUser.stockroomId.toString()
    }
    return 'all'
  })

  const handleNavigateToStore = (storeId: string) => {
    setStockRoomDashboardStoreId(storeId)
    setActiveMenu('store')
  }

  const getPageTitle = (menu: NavMenu): string => {
    switch (menu) {
      case 'central':
        return 'Central Dashboard'
      case 'store':
        return 'Stock Room Dashboard'
      case 'user-master':
      case 'reader-master':
        return 'User Master'
      case 'store-master':
        return 'Stock Room Master'
      case 'report':
        return 'Report'
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F5F1] dark:bg-[#121212] text-[#171717] dark:text-[#EDEDED] flex flex-col justify-between select-none transition-colors">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        currentUser={currentUser}
      />

      <div
        className={`flex-1 flex flex-col justify-between min-h-screen transition-[padding-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[padding-left] ${
          isCollapsed ? 'pl-14' : 'pl-56'
        }`}
      >
        <Header
          pageTitle={getPageTitle(activeMenu)}
          onLogout={onLogout}
          userName={currentUser?.userName}
          currentUser={currentUser}
        />

        <main className="flex-1 px-1.5 sm:px-2.5 pb-2 sm:pb-3 pt-1.5 sm:pt-2 flex flex-col">
          <div className="w-full flex-1 rounded-2xl bg-white dark:bg-[#1C1C1C] p-3 sm:p-4 flex flex-col transition-colors border border-[#EAE7DF]/70 dark:border-[#262626] shadow-xs">
            {activeMenu === 'central' && (
              <CentralDashboard
                onNavigateToStore={handleNavigateToStore}
                initialSearchQuery={centralSearchQuery}
                onSearchQueryChange={setCentralSearchQuery}
              />
            )}
            {activeMenu === 'store' && (
              <StoreDashboard
                selectedStoreId={stockRoomDashboardStoreId}
                onStoreChange={setStockRoomDashboardStoreId}
              />
            )}
            {(activeMenu === 'user-master' || activeMenu === 'reader-master') && <UserMaster />}
            {activeMenu === 'store-master' && <StoreMaster />}
            {activeMenu === 'report' && <ReportsView />}
          </div>
        </main>

        <DashboardFooter />
      </div>
    </div>
  )
}
