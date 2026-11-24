import React from 'react'

export interface BaseTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  align?: 'center' | 'start' | 'end'
  className?: string
  disabled?: boolean
}

export interface TooltipProps extends BaseTooltipProps {
  position?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * TooltipTop - Tooltip positioned directly ABOVE target element
 * Caret is attached to bottom of the pill pointing DOWN towards the element
 */
export const TooltipTop: React.FC<BaseTooltipProps> = ({
  content,
  children,
  align = 'center',
  className = '',
  disabled = false
}) => {
  if (!content || disabled) return <>{children}</>

  const alignContainer = {
    center: 'left-1/2 -translate-x-1/2 items-center',
    start: 'left-0 items-start',
    end: 'right-0 items-end'
  }[align]

  const caretAlign = {
    center: 'self-center',
    start: 'ml-3 self-start',
    end: 'mr-3 self-end'
  }[align]

  return (
    <div className={`relative inline-flex items-center group/tip-top ${className}`}>
      {children}
      <div
        role="tooltip"
        className={`pointer-events-none absolute z-[150] bottom-full mb-2 ${alignContainer} opacity-0 invisible group-hover/tip-top:opacity-100 group-hover/tip-top:visible scale-90 group-hover/tip-top:scale-100 translate-y-1 group-hover/tip-top:translate-y-0 transition-all duration-150 ease-out flex flex-col drop-shadow-xl`}
      >
        <div className="flex items-center px-2.5 py-1 rounded-lg bg-[#0F172A] dark:bg-[#1E293B] text-white text-[11px] font-semibold whitespace-nowrap shadow-2xl border border-slate-700/80 dark:border-slate-600/80 tracking-tight leading-normal">
          {content}
        </div>
        <div className={`w-2 h-2 -mt-1 rotate-45 bg-[#0F172A] dark:bg-[#1E293B] border-r border-b border-slate-700/80 dark:border-slate-600/80 shrink-0 relative z-10 ${caretAlign}`} />
      </div>
    </div>
  )
}

/**
 * TooltipBottom - Tooltip positioned directly BELOW target element
 * Caret is attached to top of the pill pointing UP towards the element
 */
export const TooltipBottom: React.FC<BaseTooltipProps> = ({
  content,
  children,
  align = 'center',
  className = '',
  disabled = false
}) => {
  if (!content || disabled) return <>{children}</>

  const alignContainer = {
    center: 'left-1/2 -translate-x-1/2 items-center',
    start: 'left-0 items-start',
    end: 'right-0 items-end'
  }[align]

  const caretAlign = {
    center: 'self-center',
    start: 'ml-3 self-start',
    end: 'mr-3 self-end'
  }[align]

  return (
    <div className={`relative inline-flex items-center group/tip-bottom ${className}`}>
      {children}
      <div
        role="tooltip"
        className={`pointer-events-none absolute z-[150] top-full mt-2 ${alignContainer} opacity-0 invisible group-hover/tip-bottom:opacity-100 group-hover/tip-bottom:visible scale-90 group-hover/tip-bottom:scale-100 -translate-y-1 group-hover/tip-bottom:translate-y-0 transition-all duration-150 ease-out flex flex-col drop-shadow-xl`}
      >
        <div className={`w-2 h-2 -mb-1 rotate-45 bg-[#0F172A] dark:bg-[#1E293B] border-l border-t border-slate-700/80 dark:border-slate-600/80 shrink-0 relative z-10 ${caretAlign}`} />
        <div className="flex items-center px-2.5 py-1 rounded-lg bg-[#0F172A] dark:bg-[#1E293B] text-white text-[11px] font-semibold whitespace-nowrap shadow-2xl border border-slate-700/80 dark:border-slate-600/80 tracking-tight leading-normal">
          {content}
        </div>
      </div>
    </div>
  )
}

/**
 * TooltipRight - Tooltip positioned to the RIGHT of target element
 * Uses flex-row so caret is on the left edge of pill pointing LEFT towards the element
 */
export const TooltipRight: React.FC<BaseTooltipProps> = ({
  content,
  children,
  align = 'center',
  className = '',
  disabled = false
}) => {
  if (!content || disabled) return <>{children}</>

  const alignClass = {
    center: 'top-1/2 -translate-y-1/2 items-center',
    start: 'top-0 items-start',
    end: 'bottom-0 items-end'
  }[align]

  return (
    <div className={`relative inline-flex items-center group/tip-right ${className}`}>
      {children}
      <div
        role="tooltip"
        className={`pointer-events-none absolute z-[150] left-full ml-2 ${alignClass} opacity-0 invisible group-hover/tip-right:opacity-100 group-hover/tip-right:visible scale-90 group-hover/tip-right:scale-100 -translate-x-1 group-hover/tip-right:translate-x-0 transition-all duration-150 ease-out flex flex-row drop-shadow-xl`}
      >
        <div className="w-2 h-2 -mr-1 rotate-45 bg-[#0F172A] dark:bg-[#1E293B] border-l border-b border-slate-700/80 dark:border-slate-600/80 shrink-0 relative z-10 self-center" />
        <div className="flex items-center px-2.5 py-1 rounded-lg bg-[#0F172A] dark:bg-[#1E293B] text-white text-[11px] font-semibold whitespace-nowrap shadow-2xl border border-slate-700/80 dark:border-slate-600/80 tracking-tight leading-normal">
          {content}
        </div>
      </div>
    </div>
  )
}

/**
 * TooltipLeft - Tooltip positioned to the LEFT of target element
 * Uses flex-row so caret is on the right edge of pill pointing RIGHT towards the element
 */
export const TooltipLeft: React.FC<BaseTooltipProps> = ({
  content,
  children,
  align = 'center',
  className = '',
  disabled = false
}) => {
  if (!content || disabled) return <>{children}</>

  const alignClass = {
    center: 'top-1/2 -translate-y-1/2 items-center',
    start: 'top-0 items-start',
    end: 'bottom-0 items-end'
  }[align]

  return (
    <div className={`relative inline-flex items-center group/tip-left ${className}`}>
      {children}
      <div
        role="tooltip"
        className={`pointer-events-none absolute z-[150] right-full mr-2 ${alignClass} opacity-0 invisible group-hover/tip-left:opacity-100 group-hover/tip-left:visible scale-90 group-hover/tip-left:scale-100 translate-x-1 group-hover/tip-left:translate-x-0 transition-all duration-150 ease-out flex flex-row drop-shadow-xl`}
      >
        <div className="flex items-center px-2.5 py-1 rounded-lg bg-[#0F172A] dark:bg-[#1E293B] text-white text-[11px] font-semibold whitespace-nowrap shadow-2xl border border-slate-700/80 dark:border-slate-600/80 tracking-tight leading-normal">
          {content}
        </div>
        <div className="w-2 h-2 -ml-1 rotate-45 bg-[#0F172A] dark:bg-[#1E293B] border-r border-t border-slate-700/80 dark:border-slate-600/80 shrink-0 relative z-10 self-center" />
      </div>
    </div>
  )
}

/**
 * Universal Tooltip component that selects the correct directional component
 */
export const Tooltip: React.FC<TooltipProps> = ({
  position = 'top',
  content,
  children,
  align = 'center',
  className = '',
  disabled = false
}) => {
  switch (position) {
    case 'top':
      return (
        <TooltipTop content={content} align={align} className={className} disabled={disabled}>
          {children}
        </TooltipTop>
      )
    case 'bottom':
      return (
        <TooltipBottom content={content} align={align} className={className} disabled={disabled}>
          {children}
        </TooltipBottom>
      )
    case 'left':
      return (
        <TooltipLeft content={content} align={align} className={className} disabled={disabled}>
          {children}
        </TooltipLeft>
      )
    case 'right':
      return (
        <TooltipRight content={content} align={align} className={className} disabled={disabled}>
          {children}
        </TooltipRight>
      )
  }
}
