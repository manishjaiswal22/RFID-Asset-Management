import React, { useState } from 'react'
import {
  LayoutDashboard,
  Layers,
  FileBarChart,
  ChevronDown,
  Users,
  Building2,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react'
import type { NavMenu } from '../types/dashboard'
import type { AuthUser } from '../types/auth'
import { TooltipRight } from './Tooltip'

interface SidebarProps {
  activeMenu: NavMenu
  setActiveMenu: (menu: NavMenu) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  currentUser?: AuthUser | null
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  setActiveMenu,
  isCollapsed,
  setIsCollapsed,
  currentUser
}) => {
  const [isMasterExpanded, setIsMasterExpanded] = useState(
    activeMenu === 'user-master' || activeMenu === 'reader-master' || activeMenu === 'store-master'
  )

  const isMasterActive =
    activeMenu === 'user-master' || activeMenu === 'reader-master' || activeMenu === 'store-master'

  const handleMasterClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false)
      setIsMasterExpanded(true)
    } else {
      setIsMasterExpanded(!isMasterExpanded)
    }
  }

  // Section-based authorization check
  const allowed = currentUser?.allowedSections || [
    'Central Dashboard',
    'Stock Room Dashboard',
    'Master',
    'User Master',
    'Stock Room Master',
    'Report'
  ]

  const canCentral = allowed.includes('Central Dashboard')
  const canStore = allowed.includes('Stock Room Dashboard')
  const canUserMaster = allowed.includes('User Master')
  const canStockroomMaster = allowed.includes('Stock Room Master')
  const canMaster =
    allowed.includes('Master') || canUserMaster || canStockroomMaster
  const canReport = allowed.includes('Report')

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-[100] flex flex-col justify-between bg-[#F6F5F1] dark:bg-[#121212] transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width] select-none border-r border-[#EAE7DF]/60 dark:border-[#2C2C2C]/60 ${
        isCollapsed ? 'w-14' : 'w-56'
      }`}
    >
      <div>
        {/* Sidebar Header / Toggle */}
        <div className="h-14 flex items-center px-2.5 border-b border-[#EAE7DF]/30 dark:border-[#2C2C2C]/30">
          <TooltipRight
            content={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-[#171717] dark:text-[#EDEDED] hover:bg-[#EDEAE2] dark:hover:bg-[#222222] transition-colors cursor-pointer"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeft className="w-5 h-5 text-[#171717] dark:text-[#EDEDED]" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-[#171717] dark:text-[#EDEDED]" />
              )}
            </button>
          </TooltipRight>

          <div
            className={`flex items-center overflow-hidden transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[120px] opacity-100 ml-2.5 pr-1'
            }`}
          >
            <span className="text-xs font-semibold text-[#99958D] dark:text-[#737373] uppercase tracking-wider whitespace-nowrap">
              Menu
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-3 mt-3">
          {/* Central Dashboard */}
          {canCentral && (
            <div className="w-full">
              <TooltipRight
                content="Central Dashboard"
                disabled={!isCollapsed}
                className="w-full"
              >
                <button
                  onClick={() => setActiveMenu('central')}
                  className={`w-full flex items-center px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer overflow-hidden ${
                    activeMenu === 'central'
                      ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white'
                      : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5 shrink-0 text-[#171717] dark:text-[#EDEDED]" />
                  <div
                    className={`overflow-hidden transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[160px] opacity-100 ml-3'
                    }`}
                  >
                    <span className="whitespace-nowrap font-medium text-sm">
                      Central Dashboard
                    </span>
                  </div>
                </button>
              </TooltipRight>
            </div>
          )}

          {/* Stock Room Dashboard */}
          {canStore && (
            <div className="w-full">
              <TooltipRight
                content="Stock Room Dashboard"
                disabled={!isCollapsed}
                className="w-full"
              >
                <button
                  onClick={() => setActiveMenu('store')}
                  className={`w-full flex items-center px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer overflow-hidden ${
                    activeMenu === 'store'
                      ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white'
                      : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-5 h-5 shrink-0 text-[#171717] dark:text-[#EDEDED]" />
                  <div
                    className={`overflow-hidden transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[160px] opacity-100 ml-3'
                    }`}
                  >
                    <span className="whitespace-nowrap font-medium text-sm">
                      Stock Room Dashboard
                    </span>
                  </div>
                </button>
              </TooltipRight>
            </div>
          )}

          {/* Master Submenu */}
          {canMaster && (
            <div className="w-full">
              <TooltipRight
                content="Master (User & Stock Room)"
                disabled={!isCollapsed}
                className="w-full"
              >
                <button
                  onClick={handleMasterClick}
                  className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer overflow-hidden ${
                    isMasterActive
                      ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white'
                      : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center min-w-0">
                    <Layers className="w-5 h-5 shrink-0 text-[#171717] dark:text-[#EDEDED]" />
                    <div
                      className={`overflow-hidden transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[120px] opacity-100 ml-3'
                      }`}
                    >
                      <span className="whitespace-nowrap font-medium text-sm">
                        Master
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#99958D] dark:text-[#737373] shrink-0 transition-[transform,opacity,max-width] duration-300 ease-in-out ${
                      isMasterExpanded ? 'rotate-180' : ''
                    } ${isCollapsed ? 'max-w-0 opacity-0 overflow-hidden ml-0' : 'max-w-4 opacity-100 ml-1'}`}
                  />
                </button>
              </TooltipRight>

              {/* Smooth Accordion Submenu */}
              <div
                className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  !isCollapsed && isMasterExpanded
                    ? 'grid-rows-[1fr] opacity-100 mt-1.5'
                    : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="ml-3 pl-3 border-l-2 border-[#EAE7DF] dark:border-[#2C2C2C] space-y-1 pb-0.5">
                    {canUserMaster && (
                      <button
                        onClick={() => setActiveMenu('user-master')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer overflow-hidden ${
                          activeMenu === 'user-master' || activeMenu === 'reader-master'
                            ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white shadow-xs'
                            : 'text-[#555555] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
                        }`}
                      >
                        <Users className="w-4 h-4 text-[#171717] dark:text-[#EDEDED] shrink-0" />
                        <span className="whitespace-nowrap truncate">User Master</span>
                      </button>
                    )}
                    {canStockroomMaster && (
                      <button
                        onClick={() => setActiveMenu('store-master')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer overflow-hidden ${
                          activeMenu === 'store-master'
                            ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white shadow-xs'
                            : 'text-[#555555] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-[#171717] dark:text-[#EDEDED] shrink-0" />
                        <span className="whitespace-nowrap truncate">Stock Room Master</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report */}
          {canReport && (
            <div className="w-full">
              <TooltipRight
                content="Report"
                disabled={!isCollapsed}
                className="w-full"
              >
                <button
                  onClick={() => setActiveMenu('report')}
                  className={`w-full flex items-center px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer overflow-hidden ${
                    activeMenu === 'report'
                      ? 'bg-[#EDEAE2] dark:bg-[#252525] text-[#171717] dark:text-white'
                      : 'text-[#666666] dark:text-[#A0A0A0] hover:bg-[#EFECE5] dark:hover:bg-[#1E1E1E] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  <FileBarChart className="w-5 h-5 shrink-0 text-[#171717] dark:text-[#EDEDED]" />
                  <div
                    className={`overflow-hidden transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[160px] opacity-100 ml-3'
                    }`}
                  >
                    <span className="whitespace-nowrap font-medium text-sm">
                      Report
                    </span>
                  </div>
                </button>
              </TooltipRight>
            </div>
          )}
        </nav>
      </div>
    </aside>
  )
}
