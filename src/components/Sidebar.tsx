import React, { useState } from 'react'
import {
  LayoutDashboard,
  Store,
  Layers,
  FileBarChart,
  ChevronDown,
  Radio,
  Building2,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react'
import type { NavMenu } from '../types/dashboard'

interface SidebarProps {
  activeMenu: NavMenu
  setActiveMenu: (menu: NavMenu) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  setActiveMenu,
  isCollapsed,
  setIsCollapsed
}) => {
  const [isMasterExpanded, setIsMasterExpanded] = useState(
    activeMenu === 'reader-master' || activeMenu === 'store-master'
  )

  const isMasterActive =
    activeMenu === 'reader-master' || activeMenu === 'store-master'

  const handleMasterClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false)
      setIsMasterExpanded(true)
    } else {
      setIsMasterExpanded(!isMasterExpanded)
    }
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 flex flex-col justify-between bg-[#F6F5F1] dark:bg-[#121212] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-14 sm:w-16' : 'w-56 sm:w-60'
      }`}
    >
      <div>
        <div className="h-14 flex items-center justify-between px-3.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#171717] dark:text-[#EDEDED] hover:bg-[#EDEAE2] dark:hover:bg-[#222222] transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5 text-[#171717] dark:text-[#EDEDED]" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-[#171717] dark:text-[#EDEDED]" />
            )}
          </button>

          {!isCollapsed && (
            <span className="text-xs font-semibold text-[#99958D] dark:text-[#737373] uppercase tracking-wider pr-2">
              Menu
            </span>
          )}
        </div>

        <nav className="p-2 space-y-3.5 sm:space-y-4 mt-3 sm:mt-4">
          <div className="relative group">
            <button
              onClick={() => setActiveMenu('central')}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeMenu === 'central'
                  ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white'
                  : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0 text-[#171717] dark:text-[#EDEDED]" />
              {!isCollapsed && <span>Central Dashboard</span>}
            </button>
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-3 py-1.5 bg-[#171717] text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                Central Dashboard
              </div>
            )}
          </div>

          <div className="relative group">
            <button
              onClick={() => setActiveMenu('store')}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeMenu === 'store'
                  ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white'
                  : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Store className="w-5 h-5 shrink-0 text-[#171717] dark:text-[#EDEDED]" />
              {!isCollapsed && <span>Store Dashboard</span>}
            </button>
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-3 py-1.5 bg-[#171717] text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                Store Dashboard
              </div>
            )}
          </div>

          <div className="relative group">
            <button
              onClick={handleMasterClick}
              className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isMasterActive
                  ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white'
                  : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 shrink-0 text-[#171717] dark:text-[#EDEDED]" />
                {!isCollapsed && <span>Master</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#99958D] dark:text-[#737373] transition-transform duration-200 ${
                    isMasterExpanded ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-3 py-1.5 bg-[#171717] text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                Master (Reader & Store)
              </div>
            )}

            {!isCollapsed && isMasterExpanded && (
              <div className="ml-3 pl-3 border-l border-[#EAE7DF] dark:border-[#2C2C2C] mt-2 space-y-1.5">
                <button
                  onClick={() => setActiveMenu('reader-master')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeMenu === 'reader-master'
                      ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white'
                      : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-[#666666] dark:text-[#A0A0A0]" />
                  <span>Reader Master</span>
                </button>
                <button
                  onClick={() => setActiveMenu('store-master')}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeMenu === 'store-master'
                      ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white'
                      : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#666666] dark:text-[#A0A0A0]" />
                  <span>Store Master</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative group">
            <button
              onClick={() => setActiveMenu('report')}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeMenu === 'report'
                  ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white'
                  : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <FileBarChart className="w-5 h-5 shrink-0 text-[#171717] dark:text-[#EDEDED]" />
              {!isCollapsed && <span>Report</span>}
            </button>
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-3 py-1.5 bg-[#171717] text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                Report
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  )
}
