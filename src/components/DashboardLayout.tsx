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
    <div className="min-h-screen sm:h-screen sm:max-h-screen sm:overflow-hidden bg-[#F6F5F1] dark:bg-[#121212] text-[#171717] dark:text-[#EDEDED] flex flex-col justify-between select-none transition-colors">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div
        className={`flex-1 flex flex-col justify-between min-h-0 sm:overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? 'pl-14 sm:pl-16' : 'pl-56 sm:pl-60'
        }`}
      >
        <Header pageTitle={getPageTitle(activeMenu)} onLogout={onLogout} />

        <main className="flex-1 min-h-0 px-2.5 sm:px-4 pb-2 sm:pb-3 pt-3 sm:pt-4 flex flex-col sm:overflow-hidden">
          <div className="w-full h-full flex-1 min-h-0 rounded-2xl bg-white dark:bg-[#1C1C1C] p-3 sm:p-4 flex flex-col sm:overflow-hidden transition-colors border border-[#EAE7DF]/70 dark:border-[#262626]">
            {activeMenu === 'central' && <CentralDashboard />}
            {activeMenu === 'store' && <StoreDashboard />}
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
