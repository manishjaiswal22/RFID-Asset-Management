import React, { useState } from 'react'
import type { NavMenu } from '../types/dashboard'
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
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<NavMenu>('central')
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [selectedStockRoomId, setSelectedStockRoomId] = useState<string>('stock-1')

  const handleNavigateToStore = (storeId: string) => {
    setSelectedStockRoomId(storeId)
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
      />

      <div
        className={`flex-1 flex flex-col justify-between min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'pl-14 sm:pl-16' : 'pl-56 sm:pl-60'
        }`}
      >
        <Header pageTitle={getPageTitle(activeMenu)} onLogout={onLogout} />

        <main className="flex-1 pl-2 sm:pl-3 pr-2.5 sm:pr-4 pb-2 sm:pb-3 pt-2.5 sm:pt-3.5 flex flex-col">
          <div className="w-full flex-1 rounded-2xl bg-white dark:bg-[#1C1C1C] p-3 sm:p-4 flex flex-col transition-colors border border-[#EAE7DF]/70 dark:border-[#262626] shadow-xs">
            {activeMenu === 'central' && <CentralDashboard onNavigateToStore={handleNavigateToStore} />}
            {activeMenu === 'store' && (
              <StoreDashboard
                selectedStoreId={selectedStockRoomId}
                onStoreChange={setSelectedStockRoomId}
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
